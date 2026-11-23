/**
 * POLISH: page transitions (JavaScript on, in its own browser context).
 */
import { expect, test } from "@playwright/test";

test("page fade only when moving between pages, never on the first load", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: true, baseURL, viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto("/about");
  await expect(page.locator("main .page-enter")).toHaveCount(0);
  await page.locator('header nav a[href="/pricing"]').first().click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page.locator("main .page-enter")).toHaveCount(1);
  await ctx.close();
});
