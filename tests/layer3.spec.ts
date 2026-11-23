/**
 * LAYER 3 TESTS: the 3D phone story.
 * Headless Edge draws WebGL in software, so these check behaviour, not speed.
 */
import { expect, test, type Page } from "@playwright/test";

const stops = ["hero", "problem", "ai", "website", "whatsapp", "how", "cta"];

async function scrollToStop(page: Page, id: string, at = 0.5) {
  await page.locator(`#stop-${id}`).evaluate((el, at) => {
    const r = el.getBoundingClientRect();
    // put a point `at` of the way through the stop on the 55% line the 3D reads
    window.scrollBy(0, r.top + r.height * at - window.innerHeight * 0.55);
  }, at);
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
  const sizes = await Promise.all(
    early.map(async (u) => (await page.request.get(u)).text().then((t) => ({ u, three: /WebGLRenderer|THREE\.WebGLRenderer|webgl2/.test(t) }))),
  );
  expect(early.length, "the site's scripts were seen").toBeGreaterThan(0);
  expect(sizes.filter((s) => s.three).map((s) => s.u), "three.js loaded on /about").toEqual([]);
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
  expect(seen.length, "three.js file downloaded").toBeGreaterThan(0);
  expect(seen.every((s) => s.afterLoad), "three.js downloaded before the page finished loading").toBe(true);
});

test("3D phone loads after the page appears and follows the story", async ({ page }, info) => {
  await page.goto("/?layer=3");
  // The page (text) is usable before the 3D arrives
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
  const canvas = page.locator(".story-3d-stage canvas");
  await expect(canvas).toHaveAttribute("data-running", "true");
  await expect(page.locator(".flat-phone")).toHaveCount(0); // the flat phone stepped aside

  const shots = `test-results/screens/layer3-${info.project.name.replace(/\W+/g, "-")}`;
  for (const [n, id] of stops.entries()) {
    await scrollToStop(page, id, id === "cta" ? 0.7 : 0.5);
    await expect(canvas).toHaveAttribute("data-stop", id, { timeout: 10_000 });
    await expect(canvas).toHaveAttribute("data-shown", id, { timeout: 10_000 });
    await page.waitForTimeout(1800); // let the cards fly out
    const cards = Number(await canvas.getAttribute("data-cards"));
    if (info.project.name.includes("360")) expect(cards, "max 3 cards on small phones").toBeLessThanOrEqual(3);
    await page.screenshot({ path: `${shots}/${n + 1}-${id}.png` });
  }
});

test("3D waits for the visitor's first scroll or touch; a still phone shows until then", async ({ page }) => {
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
  expect(threeLoaded, "three.js downloaded before any interaction").toBe(false);
  await page.mouse.wheel(0, 300); // first scroll
  await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
  await expect.poll(() => threeLoaded).toBe(true);
});

test("rendering pauses when the story is off-screen", async ({ page }) => {
  await page.goto("/?layer=3");
  await expect(page.locator("html")).toHaveClass(/story-3d-on/, { timeout: 20_000 });
  const canvas = page.locator(".story-3d-stage canvas");
  await expect(canvas).toHaveAttribute("data-running", "true");
  await page.locator("footer").scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute("data-running", "false");
  await page.locator("h1").scrollIntoViewIfNeeded();
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
