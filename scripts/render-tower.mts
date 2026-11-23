/**
 * npm run tower
 *
 * Makes the still picture of the lit tower used by Layer 2 of the home story
 * (public/images/nairobi/tower-lit.png, under 60 KB), drawn by the same
 * three.js code as the 3D story (components/story/three/city.ts).
 *
 * Needs the site running: npm run build, then npx next start -p 3300 in
 * another window. Uses the Microsoft Edge already on this computer.
 */
import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const MAX = 60 * 1024;
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage();

let bytes = Buffer.alloc(0);
for (const [w, h, q] of [
  [360, 520, 12],
  [360, 520, 20],
  [300, 440, 16],
  [260, 380, 20],
]) {
  await page.goto(`http://localhost:3300/?layer=2&tower-snapshot=1&w=${w}&h=${h}&q=${q}`);
  const url = await page.waitForFunction(() => (window as unknown as { __towerPng?: string }).__towerPng, null, {
    timeout: 20_000,
  });
  bytes = Buffer.from(String(await url.jsonValue()).split(",")[1], "base64");
  console.log(`${w} x ${h} (colour step ${q}): ${(bytes.length / 1024).toFixed(1)} KB`);
  if (bytes.length <= MAX) break;
}
await writeFile(new URL("../public/images/nairobi/tower-lit.png", import.meta.url), bytes);
console.log(`saved public/images/nairobi/tower-lit.png (${(bytes.length / 1024).toFixed(1)} KB)${bytes.length > MAX ? "  <-- OVER 60 KB" : ""}`);
await browser.close();
