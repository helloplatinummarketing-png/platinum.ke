/**
 * npm run screens
 *
 * Draws each phone screen (components/story/screens/draw.ts) with the text
 * from content/site.ts, and saves it as a small WebP picture in
 * public/story/<stop-id>.webp. Run it again after changing any phone text.
 *
 * Uses the Microsoft Edge already installed on this computer (no download).
 */
import { chromium } from "@playwright/test";
import ts from "typescript";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { story, site } from "../content/site.ts";

type DrawApi = {
  drawScreen: typeof import("../components/story/screens/draw.ts").drawScreen;
  SCREEN_W: number;
  SCREEN_H: number;
};

const MAX_BYTES = 40 * 1024; // brief: each picture under 40 KB
const SCALE = 0.75; // 540x1120 drawing -> 405x840 picture

const drawSrc = await readFile(new URL("../components/story/screens/draw.ts", import.meta.url), "utf8");
const js = ts
  .transpileModule(drawSrc, {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext },
  })
  .outputText.replace(/^export /gm, "");

const outDir = new URL("../public/story/", import.meta.url);
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage();
await page.setContent("<!doctype html><title>screens</title>");
await page.addScriptTag({
  content: `${js}\nwindow.__draw = { drawScreen, SCREEN_W, SCREEN_H };`,
});

for (const stop of story) {
  let quality = 0.85;
  let bytes = Buffer.alloc(0);
  while (quality >= 0.4) {
    const dataUrl: string = await page.evaluate(
      ({ stop, label, scale, quality }) => {
        const d = (window as unknown as { __draw: DrawApi }).__draw;
        const big = document.createElement("canvas");
        big.width = d.SCREEN_W;
        big.height = d.SCREEN_H;
        d.drawScreen(big.getContext("2d")!, stop, 1, { exampleLabel: label });
        const out = document.createElement("canvas");
        out.width = Math.round(d.SCREEN_W * scale);
        out.height = Math.round(d.SCREEN_H * scale);
        const og = out.getContext("2d")!;
        og.imageSmoothingQuality = "high";
        og.drawImage(big, 0, 0, out.width, out.height);
        return out.toDataURL("image/webp", quality);
      },
      { stop: { id: stop.id, screen: stop.screen }, label: site.exampleLabel, scale: SCALE, quality },
    );
    bytes = Buffer.from(dataUrl.split(",")[1], "base64");
    if (bytes.length <= MAX_BYTES) break;
    quality -= 0.1;
  }
  await writeFile(new URL(`${stop.id}.webp`, outDir), bytes);
  const kb = (bytes.length / 1024).toFixed(1);
  const flag = bytes.length > MAX_BYTES ? "  <-- OVER 40 KB" : "";
  console.log(`public/story/${stop.id}.webp  ${kb} KB  (quality ${quality.toFixed(2)})${flag}`);
}

await browser.close();
