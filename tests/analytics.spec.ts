/**
 * ANALYTICS TEST: checks the 4 events reach Umami.
 * Only runs when the site was built with a (test) website ID:
 *   $env:NEXT_PUBLIC_UMAMI_WEBSITE_ID="test-id"; npm run build; $env:TEST_ANALYTICS="1"; npx playwright test analytics
 * Umami's real script is replaced by a fake, so nothing is sent anywhere.
 */
import { expect, test, type Page } from "@playwright/test";

test.skip(!process.env.TEST_ANALYTICS, "set TEST_ANALYTICS=1 (and build with a website ID) to run");

async function withFakeUmami(page: Page) {
  await page.route("https://cloud.umami.is/script.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: "window.__events=[];window.umami={track:function(e,d){window.__events.push([e,d||{}])}};",
    }),
  );
}
const events = (page: Page) =>
  page.evaluate(() => ((window as unknown as { __events?: [string, object][] }).__events ?? []).map((e) => e[0]));
/** Stop link clicks from leaving the page, so we can read the events afterwards. */
const stayOnPage = (page: Page) =>
  page.evaluate(() => window.addEventListener("click", (e) => e.preventDefault(), { capture: true }));

test("CTA click, WhatsApp click and form submit are tracked", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: true, baseURL });
  const page = await ctx.newPage();
  await withFakeUmami(page);

  await page.goto("/");
  await page.waitForFunction(() => "umami" in window && typeof (window as { __track?: unknown }).__track === "function");
  await stayOnPage(page);
  await page.locator('a[data-track="cta-click"]').first().click();
  await expect.poll(() => events(page)).toContain("cta-click");

  await page.goto("/");
  await page.waitForFunction(() => "umami" in window && typeof (window as { __track?: unknown }).__track === "function");
  await stayOnPage(page);
  await page.locator('a[data-track="whatsapp-click"]').first().click();
  await expect.poll(() => events(page)).toContain("whatsapp-click");

  // Form submit: the event fires only on success, so fake a successful server reply
  await page.route("**/api/contact", (r) => r.fulfill({ status: 200, json: { ok: true } }));
  await page.goto("/contact");
  await page.waitForFunction(() => "umami" in window && typeof (window as { __track?: unknown }).__track === "function");
  await page.locator('input[name="name"]').fill("Test Person");
  await page.locator('input[name="business"]').fill("Test Clinic");
  await page.locator('input[name="phone"]').fill("0712 345 678");
  await page.locator('input[name="email"]').fill("test@example.com");
  await page.locator('select[name="need"]').selectOption("Website");
  await page.locator('#contact-form button[type="submit"]').click();
  await expect.poll(() => events(page)).toContain("form-submit");

  await ctx.close();
});

test("booking open is tracked when a booking link exists", async () => {
  // The booking link is still "To come" in content/site.ts, so there is no
  // button to click yet. ClickToLoad sends "booking-open" on tap (components/ClickToLoad.tsx).
  test.skip(true, "booking link not set yet");
});
