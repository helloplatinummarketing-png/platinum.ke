/**
 * STEP 3 TESTS: contact form, spam protection, SEO tags, schema, sitemap.
 */
import { expect, test } from "@playwright/test";
import { validateContact, rateLimited } from "../lib/contact";
import { pages } from "../lib/seo";
import { seo } from "../content/site";

const good = {
  name: "Wanjiru Test",
  business: "Test Dental Clinic",
  phone: "+254 712 345 678",
  email: "test@example.com",
  need: "Website",
  website: "",
};

test.describe("form rules (no browser)", () => {
  test("accepts a good submission", () => {
    const r = validateContact(good);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.spam).toBe(false);
  });

  test("rejects missing or bad fields with a message for each", () => {
    const r = validateContact({ name: "", business: "x", phone: "abc", email: "nope", need: "Something else" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["business", "email", "name", "need", "phone"]);
  });

  test("marks the hidden spam-trap field as spam", () => {
    const r = validateContact({ ...good, website: "http://spam.example" });
    expect(r.ok && r.spam).toBe(true);
  });

  test("rate limit kicks in after 5 tries in 10 minutes", () => {
    const ip = `test-${Math.random()}`;
    const t = 1_000_000;
    for (let i = 0; i < 5; i++) expect(rateLimited(ip, 5, 600_000, t + i)).toBe(false);
    expect(rateLimited(ip, 5, 600_000, t + 6)).toBe(true);
    expect(rateLimited(ip, 5, 600_000, t + 700_000)).toBe(false); // window has passed
  });
});

test.describe("form endpoint", () => {
  test("bad JSON submission gets 400 with field errors", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { ...good, email: "bad" },
      headers: { "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 250)}` },
    });
    expect(res.status()).toBe(400);
    expect((await res.json()).errors.email).toBeTruthy();
  });

  test("spam submission looks successful but is not delivered", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { ...good, website: "spam" },
      headers: { "x-forwarded-for": `10.1.0.${Math.floor(Math.random() * 250)}` },
    });
    expect(res.status()).toBe(200);
  });

  test("6th submission from the same IP is blocked (429)", async ({ request }) => {
    const ip = `10.2.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) {
      const res = await request.post("/api/contact", {
        data: { ...good, website: "spam" },
        headers: { "x-forwarded-for": ip },
      });
      statuses.push(res.status());
    }
    expect(statuses.slice(0, 5)).toEqual([200, 200, 200, 200, 200]);
    expect(statuses[5]).toBe(429);
  });

  test("with JavaScript off, a bad form post goes to the error page", async ({ page }) => {
    await page.goto("/contact");
    await page.locator('input[name="name"]').fill("A");
    // Bypass browser checks to reach the server rules
    await page.evaluate(() => document.querySelector("#contact-form")?.setAttribute("novalidate", ""));
    await page.locator('#contact-form button[type="submit"]').click();
    await expect(page).toHaveURL(/\/contact\/error$/);
    await expect(page.locator("h1")).toBeVisible();
  });
});

test("with JavaScript on, form errors show on the page without leaving it", async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: true, baseURL });
  const page = await ctx.newPage();
  await page.goto("/contact");
  await page.locator('input[name="name"]').fill("Wanjiru Test");
  await page.locator('input[name="business"]').fill("Test Clinic");
  await page.locator('input[name="phone"]').fill("0712 345 678");
  await page.locator('input[name="email"]').fill("test@example.com");
  await page.locator('select[name="need"]').selectOption("Not sure");
  await page.locator('#contact-form button[type="submit"]').click();
  // No delivery is configured in tests, so the server answers "failed": the page must say so in place.
  await expect(page.locator('#contact-form [role="status"]')).toContainText(/something went wrong|Thanks/i);
  await expect(page).toHaveURL(/\/contact$/);
  await ctx.close();
});

test.describe("SEO tags", () => {
  for (const p of pages) {
    test(`${p.path} has canonical, Open Graph, Twitter tags and a 1200x630 preview image`, async ({ page, request }) => {
      await page.goto(p.path);
      const s = seo[p.key];
      const attr = (sel: string, a = "content") => page.locator(sel).first().getAttribute(a);

      expect(await attr('meta[name="description"]')).toBe(s.description);
      expect(await attr('link[rel="canonical"]', "href")).toMatch(new RegExp(`${p.path === "/" ? "/?" : p.path}$`));
      expect(await attr('meta[property="og:title"]')).toBe(s.title);
      expect(await attr('meta[property="og:description"]')).toBe(s.description);
      expect(await attr('meta[name="twitter:card"]')).toBe("summary_large_image");
      expect(await attr('meta[property="og:image:width"]')).toBe("1200");
      expect(await attr('meta[property="og:image:height"]')).toBe("630");

      const img = await attr('meta[property="og:image"]');
      const url = new URL(img!);
      const res = await request.get(url.pathname + url.search);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
      expect((await res.body()).length, "preview image under 300 KB (WhatsApp limit)").toBeLessThan(300 * 1024);
    });
  }
});

test.describe("schema markup", () => {
  const expected: Record<string, string[]> = {
    "/": ["ProfessionalService", "WebSite"],
    "/websites": ["ProfessionalService", "Service", "FAQPage"],
    "/whatsapp-automations": ["ProfessionalService", "Service", "FAQPage"],
    "/ai-visibility": ["ProfessionalService", "Service"],
    "/pricing": ["ProfessionalService", "Service"],
    "/about": ["ProfessionalService"],
    "/contact": ["ProfessionalService"],
  };
  for (const [path, types] of Object.entries(expected)) {
    test(`${path} has valid JSON-LD: ${types.join(", ")}`, async ({ page }) => {
      await page.goto(path);
      const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
      const items = blocks.flatMap((b) => {
        const parsed = JSON.parse(b); // throws if broken
        return Array.isArray(parsed) ? parsed : [parsed];
      });
      for (const it of items) expect(it["@context"]).toBe("https://schema.org");
      const found = items.map((i) => i["@type"]);
      for (const t of types) expect(found).toContain(t);
      for (const svc of items.filter((i) => i["@type"] === "Service")) {
        expect(svc.offers.length).toBe(3);
        for (const o of svc.offers) expect(o.priceCurrency).toBe("KES");
      }
    });
  }
});

test("sitemap.xml lists the 7 pages and robots.txt points to it", async ({ request }) => {
  const sm = await (await request.get("/sitemap.xml")).text();
  expect(sm.match(/<loc>/g)?.length).toBe(7);
  const rb = await (await request.get("/robots.txt")).text();
  expect(rb).toContain("Sitemap:");
  expect(rb).toContain("Disallow: /api/");
});
