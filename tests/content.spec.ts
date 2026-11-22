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

test("there are 3 tiers per product, 7 automations, 6 AI items, 4 team members, 3 values, 7 story stops", () => {
  for (const table of Object.values(content.pricing)) expect(table.tiers).toHaveLength(3);
  expect(content.whatsappPage.automations).toHaveLength(7);
  expect(content.aiPage.whatWeDo).toHaveLength(6);
  expect(content.aboutPage.team).toHaveLength(4);
  expect(content.aboutPage.values).toHaveLength(3);
  expect(content.story.map((s) => s.id)).toEqual(["hero", "problem", "ai", "website", "whatsapp", "how", "cta"]);
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

test("no invented testimonials, stats or UK contact details", () => {
  for (const t of content.socialProof.testimonials) expect(t.quote).toBeNull();
  for (const s of content.socialProof.stats) expect(s.value).toBeNull();
  expect(allText).not.toContain("07594217753");
  expect(allText).not.toMatch(/Bristol|\bUK\b/);
});

test("every page has a title and description", () => {
  for (const [page, s] of Object.entries(content.seo)) {
    expect(s.title.length, `${page} title`).toBeGreaterThan(10);
    expect(s.title.length, `${page} title length`).toBeLessThanOrEqual(70);
    expect(s.description.length, `${page} description`).toBeGreaterThan(50);
    expect(s.description.length, `${page} description length`).toBeLessThanOrEqual(170);
  }
});
