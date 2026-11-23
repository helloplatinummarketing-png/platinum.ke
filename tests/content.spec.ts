/**
 * CONTENT TESTS: prices and honesty rules, checked against docs/brief.md.
 * (No browser needed.) Shapes of the content are also checked by TypeScript
 * on every `npm run build`.
 */
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import * as content from "../content/site";
import { ksh, kshMonthly } from "../lib/format";

const brief = readFileSync("docs/brief.md", "utf8");
const allText = JSON.stringify(content);

test.describe.configure({ mode: "parallel" });

test("every price appears in the brief exactly as written", () => {
  for (const table of Object.values(content.pricing)) {
    for (const tier of table.tiers) {
      expect(brief, `${table.product} ${tier.name} setup`).toContain(ksh(tier.setup));
      expect(brief, `${table.product} ${tier.name} monthly`).toContain(kshMonthly(tier.monthly));
    }
  }
});

test("there are 3 tiers per product, 7 automations, 6 AI items, 4 team members, 3 values, 7 story chapters", () => {
  for (const table of Object.values(content.pricing)) expect(table.tiers).toHaveLength(3);
  expect(content.whatsappPage.automations).toHaveLength(7);
  expect(content.aiPage.whatWeDo).toHaveLength(6);
  expect(content.aboutPage.team).toHaveLength(4);
  expect(content.aboutPage.values).toHaveLength(3);
  expect(content.photoStory).toHaveLength(7); // details in story-content.spec.ts
});

test("honesty fixes are in place", () => {
  expect(allText).not.toContain("won't know it's automated");
  expect(allText).not.toContain("Customers won't know");
  expect(allText).toContain("Every message sounds natural and comes from your business name.");
  expect(allText).toContain("Usually yes. We'll check your number during setup.");
  expect(allText).not.toContain("6,000-7,000");
  expect(allText).toContain("No long contracts. Cancel anytime.");
  expect(allText).not.toContain("Most rebook on the spot");
});

test("no invented testimonials or stats, and no UK-trades copy", () => {
  for (const t of content.socialProof.testimonials) expect(t.quote).toBeNull();
  for (const s of content.socialProof.stats) expect(s.value).toBeNull();
  expect(allText).not.toMatch(/Bristol|\bUK trades?\b|plumber|electrician/i);
});

test("contact details are the previous site's number and email, in a form Kenyan visitors can use", () => {
  // Austin's decision (23 Nov 2026): reuse the previous site's number, email and domain.
  expect(content.contact.phoneDisplay).toBe("+44 7594 217753");
  expect(content.contact.phoneDigits).toBe("447594217753"); // tel:+447594217753 works from Kenya
  expect(content.contact.whatsappDigits).toBe("447594217753"); // wa.me needs the country code, no "+" or 0
  expect(content.contact.email).toBe("helloplatinummarketing@gmail.com");
  expect(content.site.url).toBe("https://www.platinummarketingagency.co.uk");
});

test("every page has a title and description", () => {
  for (const [page, s] of Object.entries(content.seo)) {
    expect(s.title.length, `${page} title`).toBeGreaterThan(10);
    expect(s.title.length, `${page} title length`).toBeLessThanOrEqual(70);
    expect(s.description.length, `${page} description`).toBeGreaterThan(50);
    expect(s.description.length, `${page} description length`).toBeLessThanOrEqual(170);
  }
});
