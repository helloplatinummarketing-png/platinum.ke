/**
 * LAYER 1 TESTS: every page must work with JavaScript switched off.
 * (The projects in playwright.config.ts turn JavaScript off.)
 */
import { expect, test } from "@playwright/test";
import { seo } from "../content/site";

const pages = [
  { path: "/", seo: seo.home },
  { path: "/websites", seo: seo.websites },
  { path: "/whatsapp-automations", seo: seo.whatsapp },
  { path: "/ai-visibility", seo: seo.ai },
  { path: "/pricing", seo: seo.pricing },
  { path: "/about", seo: seo.about },
  { path: "/contact", seo: seo.contact },
];

for (const pg of pages) {
  test(`${pg.path} renders with JavaScript off`, async ({ page }, info) => {
    const res = await page.goto(pg.path);
    expect(res?.status()).toBe(200);

    await expect(page).toHaveTitle(pg.seo.title);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();

    // Header, footer and WhatsApp button are on every page
    await expect(page.locator("header")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
    await expect(page.locator('[data-umami-event="whatsapp-click"]').first()).toBeVisible();

    // A clear CTA to the contact page (the contact page has the form button instead)
    if (pg.path === "/contact") {
      await expect(page.locator('form[action="/api/contact"] button[type="submit"]')).toBeVisible();
    } else {
      await expect(page.locator('main a[href="/contact"]').last()).toBeVisible();
    }

    // No sideways scrolling, even at 320px
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, "page is wider than the screen").toBeLessThanOrEqual(0);

    // Every image has alt text (empty alt only for decorative images inside labelled links)
    const missingAlt = await page.locator("img:not([alt])").count();
    expect(missingAlt).toBe(0);

    // Full-page screenshot for review
    const name = pg.path === "/" ? "home" : pg.path.slice(1);
    await page.screenshot({
      path: `test-results/screens/${info.project.name.replace(/\W+/g, "-")}/${name}.png`,
      fullPage: true,
    });
  });
}

test("every internal link works", async ({ page, request }) => {
  const links = new Set<string>();
  for (const pg of pages) {
    await page.goto(pg.path);
    const hrefs = await page.locator('a[href^="/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href")!));
    hrefs.forEach((h) => links.add(h));
  }
  const broken: string[] = [];
  for (const href of links) {
    const [path, hash] = href.split("#");
    const res = await request.get(path || "/");
    if (res.status() !== 200) broken.push(`${href} -> ${res.status()}`);
    if (hash) {
      await page.goto(path || "/");
      if ((await page.locator(`#${hash}`).count()) === 0) broken.push(`${href} -> missing #${hash}`);
    }
  }
  expect(broken, broken.join("\n")).toEqual([]);
});
