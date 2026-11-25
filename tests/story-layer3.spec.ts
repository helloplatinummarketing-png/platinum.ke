/**
 * PHOTO STORY, LAYERS 2 AND 3 (JavaScript on; runs in the "js" projects).
 */
import { expect, test, type Page } from "@playwright/test";
import { photoStory } from "../content/site";
import { CHAPTER_STARTS, stepStartP } from "../lib/story-timing";

/** Scroll so the story is at position p (0..1). */
async function scrollToP(page: Page, p: number) {
  await page.evaluate((p) => {
    const story = document.getElementById("story")!;
    const pin = story.querySelector<HTMLElement>(".story-pin")!;
    const top = story.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + p * (story.offsetHeight - pin.offsetHeight));
  }, p);
}

/** A point safely inside step k of chapter ci (just after it starts). */
function stepPoint(ci: number, k: number) {
  const ch = photoStory[ci];
  const n = ch.steps?.length ?? 0;
  const chips = ch.stepStyle === "chips";
  const start = k < 0 ? CHAPTER_STARTS[ci] : stepStartP(ci, k, n, chips);
  const end = k + 1 < n ? stepStartP(ci, k + 1, n, chips) : CHAPTER_STARTS[ci + 1];
  return start + (end - start) * 0.55;
}

const shotDir = (name: string) => `test-results/screens/story-${name.replace(/\W+/g, "-")}`;

/* ------------------------------- Layer 2 ------------------------------- */

test.describe("Layer 2: photo cross-fade, bullets lit by scroll markers, still tower", () => {
  test("each chapter shows its panel and photo; bullets light in turn", async ({ page }, info) => {
    test.setTimeout(120_000);
    await page.goto("/?layer=2");
    await expect(page.locator("html")).toHaveClass(/story-flat/);
    await expect(page.locator("html")).not.toHaveClass(/can-3d/);

    for (const [ci, ch] of photoStory.entries()) {
      const n = ch.steps?.length ?? 0;
      const chips = ch.stepStyle === "chips";
      const ks = n === 0 ? [-1] : chips ? [-1, ...Array.from({ length: n }, (_, k) => k)] : Array.from({ length: n }, (_, k) => k);
      for (const k of ks) {
        await scrollToP(page, stepPoint(ci, k));
        const panel = page.locator(`.ch-copy[data-panel="${ci}"]`);
        await expect(panel).toHaveClass(/show/);
        await expect(page.locator(".ch-copy.show")).toHaveCount(1);
        await expect(page.locator(`.story-bg[data-photo="${ch.photo}"]`)).toHaveClass(/on/);
        await expect(page.locator(".story-credit")).toHaveCount(0); // no photo credits on the site
        if (k >= 0) {
          await expect(page.locator(`#ch-${ch.id} .ch-step[data-step="${k}"]`)).toHaveClass(/\bon\b/);
          if (k > 0) await expect(page.locator(`#ch-${ch.id} .ch-step[data-step="${k - 1}"]`)).toHaveClass(/done/);
        }
      }
      await page.waitForTimeout(900); // let the photo finish fading for the screenshot
      await page.screenshot({ path: `${shotDir(`layer2-${info.project.name}`)}/${String(ci).padStart(2, "0")}-${ch.id}.png` });
    }
  });

  test("the still tower appears from chapter 02", async ({ page }) => {
    await page.goto("/?layer=2");
    const tower = page.locator(".story-tower");
    await expect(tower).toHaveCSS("opacity", "0");
    await scrollToP(page, stepPoint(2, 0));
    await expect(tower).toHaveCSS("opacity", "1");
    await expect.poll(() => tower.evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  });

  test("reduced motion gets Layer 2, never 3D", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ baseURL, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    const cls = (await page.locator("html").getAttribute("class")) ?? "";
    expect(cls).toContain("story-flat");
    expect(cls).not.toContain("can-3d");
    await ctx.close();
  });
});

/* ------------------------------- Layer 3 ------------------------------- */

test.describe("Layer 3: the full photo story", () => {
  test("loader shows, then the light layer starts", async ({ page }) => {
    await page.goto("/?layer=3");
    await expect(page.locator(".story-loader")).toBeVisible();
    await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
    await expect(page.locator(".story-loader")).toHaveClass(/done/, { timeout: 6_000 });
    await expect(page.locator(".story-city")).toHaveAttribute("data-running", "true");
  });

  test("before the first scroll: no loader, no three.js, still tower; first scroll starts the 3D", async ({ page }) => {
    let threeLoaded = false;
    page.on("response", async (r) => {
      if (r.request().resourceType() === "script" && r.url().includes("/_next/")) {
        if (/webgl2/.test(await r.text().catch(() => ""))) threeLoaded = true;
      }
    });
    await page.goto("/");
    const cls = (await page.locator("html").getAttribute("class")) ?? "";
    test.skip(!cls.includes("can-3d"), "this browser has no graphics chip, so it gets Layer 2");
    await page.waitForLoadState("load");
    await page.waitForTimeout(1500);
    await expect(page.locator(".story-loader")).toBeHidden();
    await expect(page.locator("h1")).toBeVisible();
    expect(threeLoaded, "three.js before any interaction").toBe(false);
    // the story already works (Layer 2): scrolling lights the problem bullets
    await scrollToP(page, stepPoint(1, 1));
    await expect(page.locator("#ch-problem .ch-step[data-step='1']")).toHaveClass(/\bon\b/);
    // that scroll was the first interaction: the 3D starts
    await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
    await expect.poll(() => threeLoaded).toBe(true);
    await expect(page.locator(".story-tower")).toBeHidden();
  });

  test("the active bullet and its visual change at the same scroll point", async ({ page }, info) => {
    test.setTimeout(180_000);
    await page.goto("/?layer=3");
    await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
    const canvas = page.locator(".story-city");
    const desktop = page.viewportSize()!.width >= 760;

    for (const [ci, ch] of photoStory.entries()) {
      const n = ch.steps?.length ?? 0;
      for (let k = 0; k < n; k++) {
        await scrollToP(page, stepPoint(ci, k));
        await page.waitForTimeout(1200); // the light layer eases towards the scroll position
        await expect(canvas).toHaveAttribute("data-chapter", String(ci));
        // the page lit bullet k …
        await expect(page.locator(`#ch-${ch.id} .ch-step[data-step="${k}"]`)).toHaveClass(/\bon\b/);
        // … and the light layer shows visual k, at the same moment
        await expect(canvas).toHaveAttribute("data-visual", `${ci}:${k}`);
        // desktop: the dashed line starts at that bullet
        if (desktop) {
          const lineStartsAtBullet = await page.evaluate(
            ({ id, k }) => {
              const li = document.querySelector(`#ch-${id} .ch-step[data-step="${k}"]`)!.getBoundingClientRect();
              const lead = document.querySelector<SVGSVGElement>(".story-lead")!;
              const d = lead.querySelector("path")!.getAttribute("d") ?? "";
              const y1 = Number(d.split(",")[1]?.split(" ")[0]);
              const top = lead.getBoundingClientRect().top;
              return Math.abs(top + y1 - (li.top + li.height / 2)) < 4 && Number(lead.style.opacity) > 0.05;
            },
            { id: ch.id, k },
          );
          expect(lineStartsAtBullet, `${ch.id} bullet ${k}: line starts at the bullet`).toBe(true);
        }
      }
      // a screenshot per chapter, part-way through
      await scrollToP(page, ci === 0 ? 0.04 : CHAPTER_STARTS[ci] + (CHAPTER_STARTS[ci + 1] - CHAPTER_STARTS[ci]) * 0.6);
      await page.waitForTimeout(1300);
      await page.screenshot({ path: `${shotDir(`layer3-${info.project.name}`)}/${String(ci).padStart(2, "0")}-${ch.id}.png` });
    }
  });

  test("the AI question types itself out, then the answer appears", async ({ page }) => {
    await page.goto("/?layer=3");
    await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
    const ai = photoStory.findIndex((c) => c.id === "ai");
    const at = (lt: number) => CHAPTER_STARTS[ai] + (CHAPTER_STARTS[ai + 1] - CHAPTER_STARTS[ai]) * lt;
    await scrollToP(page, at(0.12));
    await page.waitForTimeout(1200);
    const partial = (await page.locator(".ch-q").textContent()) ?? "";
    expect(partial.length).toBeLessThan(photoStory[ai].chat!.question.length);
    await expect(page.locator(".ch-a")).not.toHaveClass(/show/);
    await scrollToP(page, at(0.47));
    await page.waitForTimeout(1500);
    await expect(page.locator(".ch-q")).toHaveText(photoStory[ai].chat!.question);
    await expect(page.locator(".ch-a")).toHaveClass(/show/);
  });

  test("phones (checked at 320px) show no lines and nothing goes off-screen", async ({ page }) => {
    test.skip(page.viewportSize()!.width >= 760, "phone rule");
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/?layer=3");
    await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
    for (let ci = 0; ci < photoStory.length; ci++) {
      await scrollToP(page, CHAPTER_STARTS[ci] + (CHAPTER_STARTS[ci + 1] - CHAPTER_STARTS[ci]) * 0.5);
      await page.waitForTimeout(700);
      const off = await page.evaluate(() => {
        const W = document.documentElement.clientWidth;
        const panel = document.querySelector(".ch-copy.show");
        if (!panel) return [];
        const r = panel.getBoundingClientRect();
        return r.left < 0 || r.right > W ? [panel.getAttribute("data-panel")] : [];
      });
      expect(off).toEqual([]);
      await expect(page.locator(".story-lead")).toBeHidden(); // no lines on phones
    }
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("phones get the -m photos, desktops the large ones; only the hero loads first", async ({ page }) => {
    await page.goto("/?layer=3");
    // in the HTML, only the hero photo has a real source
    const deferred = await page.locator(".story-bg img[data-src]").count();
    expect(deferred + (await page.locator(".story-bg img[src]").count())).toBeGreaterThanOrEqual(6);
    await expect.poll(() => page.locator(".story-bg img[data-src]").count()).toBe(0); // the rest load after first paint
    const src = await page.locator('.story-bg[data-photo="nw"] img').evaluate((i: HTMLImageElement) => i.currentSrc);
    if (page.viewportSize()!.width < 760) expect(src).toMatch(/nw-m\.webp$/);
    else expect(src).toMatch(/nw\.webp$/);
  });

  test("rendering pauses when the story is off-screen", async ({ page }) => {
    await page.goto("/?layer=3");
    await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
    const canvas = page.locator(".story-city");
    await expect(canvas).toHaveAttribute("data-running", "true");
    await page.locator("footer").scrollIntoViewIfNeeded();
    await expect(canvas).toHaveAttribute("data-running", "false");
  });

  test("analytics: one event per chapter reached (story-ch-01 … 06)", async ({ page }) => {
    await page.addInitScript(() => {
      (window as unknown as { __ev: string[] }).__ev = [];
      (window as unknown as { umami: object }).umami = {
        track: (e: string) => (window as unknown as { __ev: string[] }).__ev.push(e),
      };
    });
    await page.goto("/?layer=2");
    for (let ci = 1; ci < photoStory.length; ci++) {
      await scrollToP(page, CHAPTER_STARTS[ci] + 0.02);
      await page.waitForTimeout(250);
    }
    await scrollToP(page, 0.5); // going back doesn't count twice
    await page.waitForTimeout(250);
    const ev = await page.evaluate(() => (window as unknown as { __ev: string[] }).__ev.filter((e) => e.startsWith("story-ch")));
    expect(ev).toEqual(["story-ch-01", "story-ch-02", "story-ch-03", "story-ch-04", "story-ch-05", "story-ch-06"]);
  });

  test("three.js only on the home page, and only after the page has loaded", async ({ page }) => {
    let early = false;
    let loaded = false;
    page.on("load", () => (loaded = true));
    page.on("response", async (r) => {
      if (r.request().resourceType() !== "script" || !r.url().includes("/_next/")) return;
      if (/webgl2/.test(await r.text().catch(() => "")) && !loaded) early = true;
    });
    await page.goto("/?layer=3");
    await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
    expect(early).toBe(false);
  });
});
