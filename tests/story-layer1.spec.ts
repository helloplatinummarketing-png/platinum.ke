/**
 * PHOTO STORY, LAYER 1: the home page works with JavaScript off
 * (runs in the no-JS projects in playwright.config.ts).
 */
import { expect, test } from "@playwright/test";
import { photoStory } from "../content/site";

test("all seven chapters show their photo and every bullet, with JavaScript off", async ({ page }, info) => {
  await page.goto("/");
  for (const ch of photoStory) {
    const sec = page.locator(`#ch-${ch.id}`);
    await sec.scrollIntoViewIfNeeded();
    const img = sec.locator(".ch-photo img");
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute("src", new RegExp(`/images/nairobi/${ch.photo}-m\\.webp`));
    // the photo actually loaded
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
    await expect(sec.locator("figcaption")).toHaveCount(0); // no photo credits on the site
    await expect(sec.locator(".ch-step")).toHaveCount(ch.steps?.length ?? 0);
    for (const s of await sec.locator(".ch-step").all()) await expect(s).toBeVisible();
    // no canvas or lines in Layer 1
    await expect(sec.locator("canvas, svg.story-lead")).toHaveCount(0);
  }
  await expect(page.locator("h1")).toHaveText("Your Business Deserves More Customers");
  await page.screenshot({
    path: `test-results/screens/story-layer1-${info.project.name.replace(/\W+/g, "-")}/home.png`,
    fullPage: true,
  });
});

test("nothing in the story goes off-screen (320px and up)", async ({ page }) => {
  await page.goto("/");
  const off = await page.evaluate(() => {
    const W = document.documentElement.clientWidth;
    return Array.from(document.querySelectorAll("#story *"))
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > W + 1 || r.left < -1);
      })
      .map((el) => el.className.toString().slice(0, 60));
  });
  expect(off).toEqual([]);
});

test("only the hero photo loads early; the rest are lazy", async ({ page }) => {
  await page.goto("/");
  const loading = await page.locator(".ch-photo img").evaluateAll((imgs) => imgs.map((i) => i.getAttribute("loading")));
  expect(loading[0]).toBe("eager");
  expect(loading.slice(1).every((l) => l === "lazy")).toBe(true);
});
