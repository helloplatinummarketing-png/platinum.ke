/**
 * ANALYTICS TESTS (Umami). Umami's real script is never loaded here: a fake
 * window.umami records events, so nothing is sent anywhere.
 */
import { expect, test } from "@playwright/test";

test("CTA and WhatsApp links are marked for Umami click tracking", async ({ page }) => {
  await page.goto("/");
  expect(await page.locator('a[data-umami-event="cta-click"]').count()).toBeGreaterThan(3);
  await expect(page.locator('a[data-umami-event="whatsapp-click"]').first()).toBeVisible();
  // the old click listener is gone
  expect(await page.locator("[data-track]").count()).toBe(0);
});

test("a successful form send is tracked as form-submit", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: true, baseURL });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    (window as unknown as { __ev: string[] }).__ev = [];
    (window as unknown as { umami: object }).umami = {
      track: (e: string) => (window as unknown as { __ev: string[] }).__ev.push(e),
    };
  });
  await page.route("**/api/contact", (r) => r.fulfill({ status: 200, json: { ok: true } }));
  await page.goto("/contact");
  await page.locator('input[name="name"]').fill("Test Person");
  await page.locator('input[name="business"]').fill("Test Clinic");
  await page.locator('input[name="phone"]').fill("0712 345 678");
  await page.locator('input[name="email"]').fill("test@example.com");
  await page.locator('select[name="need"]').selectOption("Website");
  await page.locator('#contact-form button[type="submit"]').click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __ev: string[] }).__ev)).toContain("form-submit");
  await ctx.close();
});
