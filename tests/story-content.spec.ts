/**
 * PHOTO STORY CONTENT TESTS (no browser): chapters, bullets ↔ visuals, photos, budget.
 */
import { expect, test } from "@playwright/test";
import { existsSync, statSync } from "node:fs";
import { aiTopPick, photos, photoStory, pricing } from "../content/site";
import { ksh } from "../lib/format";

test("seven chapters, in the change order's order", () => {
  expect(photoStory.map((c) => c.id)).toEqual(["hero", "problem", "websites", "whatsapp", "ai", "how", "cta"]);
  expect(photoStory.map((c) => c.photo)).toEqual(["nw", "problem", "aerial", "trails", "dusk", "kicc", "kicc"]);
  expect(photoStory.map((c) => c.number ?? "")).toEqual(["", "01", "02", "03", "04", "05", "06"]);
});

test("each chapter's bullet count matches its number of visuals", () => {
  for (const ch of photoStory) {
    expect(ch.visuals?.length ?? 0, `${ch.id}: visuals`).toBe(ch.steps?.length ?? 0);
  }
  // The counts from the change order
  const count = (id: string) => photoStory.find((c) => c.id === id)!.steps!.length;
  expect(count("problem")).toBe(3);
  expect(count("websites")).toBe(6);
  expect(count("whatsapp")).toBe(4);
  expect(count("ai")).toBe(4);
  expect(count("how")).toBe(3);
});

test("copy from the change order is in place", () => {
  const byId = (id: string) => photoStory.find((c) => c.id === id)!;
  expect(byId("websites").intro).toBe("Watch it go up, floor by floor:");
  expect(byId("how").heading).toBe("Three steps to the brightest building on the street");
  expect(byId("ai").chat?.question).toBe("Who is the best dentist in Westlands?");
  expect(byId("ai").steps!.map((s) => s.text)).toEqual([
    "Google Business Profile",
    "Directory listings",
    "Fresh reviews",
    "FAQ + schema on your site",
  ]);
  expect(JSON.stringify(byId("whatsapp").visuals)).toContain("KSh 2,500 (example)");
  expect(aiTopPick.title).toContain("★ 4.9");
});

test("price strips match the pricing tables", () => {
  const byId = (id: string) => photoStory.find((c) => c.id === id)!;
  expect(byId("websites").priceStrip).toEqual({ label: "Starter website", price: ksh(pricing.websites.tiers[0].setup) });
  expect(byId("whatsapp").priceStrip?.price).toBe(`${ksh(pricing.whatsapp.tiers[0].setup)} setup`);
  expect(byId("ai").priceStrip?.price).toBe(`${ksh(pricing.ai.tiers[0].setup)} setup`);
  expect(byId("websites").priceStrip?.price).toBe("KSh 80,000");
  expect(byId("whatsapp").priceStrip?.price).toBe("KSh 30,000 setup");
  expect(byId("ai").priceStrip?.price).toBe("KSh 25,000 setup");
});

test("every photo exists in both sizes, with credits, alt text and no faces/logos note", () => {
  for (const [key, p] of Object.entries(photos)) {
    for (const f of [`${key}.webp`, `${key}-m.webp`]) {
      expect(existsSync(`public/images/nairobi/${f}`), f).toBe(true);
    }
    expect(p.alt.length).toBeGreaterThan(15);
    expect(p.photographer.length).toBeGreaterThan(2);
    expect(p.sourceUrl).toMatch(/^https:\/\/unsplash\.com\/photos\//);
  }
});

test("photo budget on phones: 600 KB in total, hero 60 KB or less", () => {
  const kb = (f: string) => statSync(`public/images/nairobi/${f}`).size / 1024;
  const total = Object.keys(photos).reduce((n, k) => n + kb(`${k}-m.webp`), 0);
  expect(total, `mobile photos total ${total.toFixed(1)} KB`).toBeLessThanOrEqual(600);
  expect(kb("nw-m.webp"), "hero photo").toBeLessThanOrEqual(60);
});
