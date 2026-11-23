/**
 * LAYER 2 TESTS: the flat phone, and which devices get it.
 */
import { expect, test, type Page } from "@playwright/test";

const htmlClass = (page: Page) => page.evaluate(() => document.documentElement.className);

test.describe("layer choice", () => {
  test("?layer=1 keeps the plain sections (no flat phone)", async ({ page }) => {
    await page.goto("/?layer=1");
    expect(await htmlClass(page)).not.toContain("story-flat");
    await expect(page.locator(".flat-phone")).toHaveCount(0);
    await expect(page.locator(".stop-picture").first()).toBeVisible();
  });

  test("reduced motion: flat phone, never 3D", async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ baseURL, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    const cls = await htmlClass(page);
    expect(cls).toContain("story-flat");
    expect(cls).toContain("reduced-motion");
    expect(cls).not.toContain("can-3d");
    await ctx.close();
  });

  for (const [name, ua] of [
    ["WhatsApp in-app browser", "Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 WhatsApp/2.24"],
    ["Facebook in-app browser", "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148 [FBAN/FBIOS;FBAV/450.0]"],
    ["Instagram in-app browser", "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36 Instagram 300.0"],
    ["Opera Mini", "Opera/9.80 (Android; Opera Mini/36.2.2254/119.132; U; id) Presto/2.12.423 Version/12.16"],
  ]) {
    test(`${name}: flat phone, never 3D`, async ({ browser, baseURL }) => {
      const ctx = await browser.newContext({ baseURL, userAgent: ua });
      const page = await ctx.newPage();
      await page.goto("/");
      const cls = await htmlClass(page);
      expect(cls).toContain("story-flat");
      expect(cls).not.toContain("can-3d");
      await ctx.close();
    });
  }

  test("low memory (under 4 GB) and Save-Data: flat phone, never 3D", async ({ browser, baseURL }) => {
    for (const init of [
      () => Object.defineProperty(navigator, "deviceMemory", { get: () => 2 }),
      () => Object.defineProperty(navigator, "connection", { get: () => ({ saveData: true }) }),
    ]) {
      const ctx = await browser.newContext({ baseURL });
      await ctx.addInitScript(init);
      const page = await ctx.newPage();
      await page.goto("/");
      const cls = await htmlClass(page);
      expect(cls).toContain("story-flat");
      expect(cls).not.toContain("can-3d");
      await ctx.close();
    }
  });
});

test.describe("flat phone", () => {
  test("shows one phone, hides the per-stop pictures, and swaps screens on scroll", async ({ page }, info) => {
    await page.goto("/?layer=2");
    const phone = page.locator(".flat-phone");
    await expect(phone).toBeVisible();
    await expect(page.locator(".stop-picture").first()).toBeHidden();
    await expect(phone).toHaveAttribute("data-active", "hero");

    const shots = `test-results/screens/layer2-${info.project.name.replace(/\W+/g, "-")}`;
    await page.screenshot({ path: `${shots}/1-hero.png` });

    const expected = ["problem", "ai", "website", "whatsapp", "how", "cta"];
    for (const [n, id] of expected.entries()) {
      await page.locator(`#stop-${id}`).evaluate((el) => {
        const r = el.getBoundingClientRect();
        // put the middle of the stop on the "active" line, 60% down the screen
        window.scrollBy(0, r.top + Math.min(r.height / 2, 200) - window.innerHeight * 0.6);
      });
      await expect(phone).toHaveAttribute("data-active", id);
      await page.waitForTimeout(600); // let the swap animation finish for the screenshot
      await page.screenshot({ path: `${shots}/${n + 2}-${id}.png` });
    }

    // The active screen is visible, and every visited screen was downloaded
    await expect(page.locator('.flat-phone .flat-screen.is-active[data-screen="cta"]')).toBeVisible();
    expect(await page.locator(".flat-phone .flat-screen").count()).toBe(7);
  });

  test("only downloads screens as they are needed", async ({ page }) => {
    await page.goto("/?layer=2");
    await expect(page.locator(".flat-phone")).toBeVisible();
    // At the top: hero + the next one only
    expect(await page.locator(".flat-phone .flat-screen").count()).toBe(2);
  });

  test("no sideways scrolling and the text stays readable", async ({ page }) => {
    await page.goto("/?layer=2");
    await expect(page.locator(".flat-phone")).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("#stop-hero a.btn-primary")).toBeVisible();
  });

  test("the page doesn't jump when the phone appears", async ({ page }) => {
    await page.goto("/?layer=2");
    const before = await page.locator("h1").boundingBox();
    await expect(page.locator(".flat-phone")).toBeVisible();
    await page.waitForTimeout(300);
    const after = await page.locator("h1").boundingBox();
    expect(Math.abs((after?.y ?? 0) - (before?.y ?? 0))).toBeLessThan(4);
  });
});
