/**
 * LAYER 3 TESTS: the pinned 3D phone story.
 * Headless Edge here uses the laptop's graphics chip, so these check behaviour, not speed.
 */
import { expect, test, type Page } from "@playwright/test";

/** Scroll so step k (0-based) is half-way through. */
async function scrollToStep(page: Page, k: number) {
  await page.evaluate((k) => {
    const story = document.getElementById("story")!;
    const stage = story.querySelector<HTMLElement>(".story-grid")!;
    const n = story.querySelectorAll(".story-card[data-step]").length;
    const span = story.offsetHeight - stage.offsetHeight;
    const top = story.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, top + ((k + 0.5) / n) * span);
  }, k);
}

test("three.js is not part of the first download, and only loads on the home page", async ({ page }) => {
  const early: string[] = [];
  page.on("request", (r) => {
    // the site's own script files only (not Umami's)
    if (r.resourceType() === "script" && r.url().includes("/_next/")) early.push(r.url());
  });
  await page.goto("/about?layer=3");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1500);
  const found = await Promise.all(
    early.map(async (u) => ({ u, three: /webgl2/.test(await (await page.request.get(u)).text()) })),
  );
  expect(early.length, "the site's scripts were seen").toBeGreaterThan(0);
  expect(found.filter((s) => s.three).map((s) => s.u), "three.js loaded on /about").toEqual([]);
});

test("on the home page, three.js arrives only after the page has loaded", async ({ page }) => {
  const seen: { url: string; afterLoad: boolean }[] = [];
  let loaded = false;
  page.on("load", () => (loaded = true));
  page.on("response", async (r) => {
    if (r.request().resourceType() !== "script" || !r.url().includes("/_next/")) return;
    const body = await r.text().catch(() => "");
    if (/webgl2/.test(body)) seen.push({ url: r.url(), afterLoad: loaded });
  });
  await page.goto("/?layer=3");
  await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
  await expect.poll(() => seen.length, { message: "three.js file downloaded" }).toBeGreaterThan(0);
  expect(seen.every((s) => s.afterLoad), "three.js downloaded before the page finished loading").toBe(true);
});

test("3D waits for the visitor's first scroll or touch; a still phone and the first card show until then", async ({ page }) => {
  let threeLoaded = false;
  page.on("response", async (r) => {
    if (r.request().resourceType() === "script" && r.url().includes("/_next/")) {
      if (/webgl2/.test(await r.text().catch(() => ""))) threeLoaded = true;
    }
  });
  await page.goto("/");
  const cls = (await page.locator("html").getAttribute("class")) ?? "";
  test.skip(!cls.includes("can-3d"), "this computer's browser has no graphics chip, so it gets the flat phone");
  await page.waitForLoadState("load");
  await page.waitForTimeout(1500);
  await expect(page.locator(".story-3d-poster img")).toBeVisible();
  await expect(page.locator("#stop-hero .stop-intro")).toBeVisible();
  await expect(page.locator("h1")).toBeVisible();
  expect(threeLoaded, "three.js downloaded before any interaction").toBe(false);
  await page.mouse.wheel(0, 300); // first scroll
  await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
  await expect.poll(() => threeLoaded).toBe(true);
});

test("each card is pinned beside its marker on the phone, one step at a time", async ({ page }, info) => {
  test.setTimeout(120_000); // 17 steps with a pause at each
  await page.goto("/?layer=3");
  await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
  const canvas = page.locator(".story-3d-stage canvas");
  await expect(canvas).toHaveAttribute("data-running", "true");
  await expect(page.locator(".flat-phone")).toHaveCount(0); // the flat phone stepped aside

  const n = await page.locator("#story .story-card[data-step]").count();
  expect(n, "intro + bullet cards").toBeGreaterThanOrEqual(15);
  const shots = `test-results/screens/layer3-${info.project.name.replace(/\W+/g, "-")}`;
  const stage = (await page.locator(".story-grid").boundingBox())!;

  for (let k = 0; k < n; k++) {
    await scrollToStep(page, k);
    await expect(canvas).toHaveAttribute("data-current-step", String(k), { timeout: 10_000 });
    await page.waitForTimeout(900); // let the phone settle on the marker
    const card = page.locator(`#story .story-card[data-step="${k}"]`);
    await expect(card).toHaveClass(/is-active/);
    await expect(card).toBeVisible();
    // Only one card at a time
    await expect(page.locator("#story .story-card.is-active")).toHaveCount(1);
    // The card is inside the pinned stage
    const box = (await card.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(stage.x - 1);
    expect(box.x + box.width).toBeLessThanOrEqual(stage.x + stage.width + 1);
    expect(box.y + box.height).toBeLessThanOrEqual(stage.y + stage.height + 1);
    // The line from the marker to the card is showing
    await expect(page.locator(".story-leader line")).toHaveAttribute("opacity", "1");
    // Small phones: at most 3 pop-out cards
    if (info.project.name.includes("360")) {
      expect(Number(await canvas.getAttribute("data-cards"))).toBeLessThanOrEqual(3);
    }
    const id = await card.getAttribute("data-stop-id");
    await page.screenshot({ path: `${shots}/${String(k + 1).padStart(2, "0")}-${id}.png` });
  }
});

test("the counter shows the chapter and the step", async ({ page }) => {
  await page.goto("/?layer=3");
  await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
  const problemFirst = Number(await page.locator('#stop-problem [data-bullet="0"]').getAttribute("data-step"));
  await scrollToStep(page, problemFirst);
  await expect(page.locator(".story-counter")).toContainText(/02 · The problem\s+2 \/ 4/i);
});

test("rendering pauses when the story is off-screen", async ({ page }) => {
  await page.goto("/?layer=3");
  await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
  const canvas = page.locator(".story-3d-stage canvas");
  await expect(canvas).toHaveAttribute("data-running", "true");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute("data-running", "false");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(canvas).toHaveAttribute("data-running", "true");
});

test("if WebGL is unavailable, the flat phone takes over", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ baseURL });
  await ctx.addInitScript(() => {
    const proto = HTMLCanvasElement.prototype as unknown as {
      getContext: (this: HTMLCanvasElement, type: string, ...rest: unknown[]) => unknown;
    };
    const orig = proto.getContext;
    proto.getContext = function (type, ...rest) {
      if (type.includes("webgl")) return null;
      return orig.call(this, type, ...rest);
    };
  });
  const page = await ctx.newPage();
  await page.goto("/");
  await expect(page.locator("html")).not.toHaveClass(/can-3d/);
  await expect(page.locator(".flat-phone")).toBeVisible();
  await ctx.close();
});

test("no sideways scrolling with the 3D phone", async ({ page }) => {
  await page.goto("/?layer=3");
  await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
