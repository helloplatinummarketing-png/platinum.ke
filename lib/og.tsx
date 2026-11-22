/**
 * Link-preview pictures (1200x630), the image WhatsApp, Facebook and X show
 * when someone shares a link. Generated once at build time, one per page,
 * from the page's title in content/site.ts. Colours from the placeholder theme.
 */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { seo, site } from "@/content/site";
import { pages, type PageKey } from "./seo";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/** Read the logo once and cache it, so the images can be made at build time. */
async function logoDataUrl() {
  "use cache";
  const logo = await readFile(join(process.cwd(), "public/brand/platinum-logo.png"));
  return `data:image/png;base64,${logo.toString("base64")}`;
}

export async function renderOg(key: PageKey) {
  const page = pages.find((p) => p.key === key)!;
  // Short title: the part before " | "
  const title = seo[key].title.split(" | ")[0];
  const logoSrc = await logoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0a0f1e 0%, #111830 60%, #06201a 100%)",
          color: "#f3f5f8",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={84} height={84} style={{ borderRadius: 18, background: "#fff" }} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 4 }}>PLATINUM</div>
            <div style={{ fontSize: 22, color: "#a9b1c1" }}>Marketing Agency · Nairobi</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, color: "#7cc4ff", letterSpacing: 4, textTransform: "uppercase" }}>
            {page.kicker}
          </div>
          <div style={{ fontSize: title.length > 45 ? 60 : 72, fontWeight: 800, lineHeight: 1.1, marginTop: 16 }}>
            {title}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 28, color: "#a9b1c1" }}>{site.tagline}</div>
          <div
            style={{
              display: "flex",
              background: "#25d366",
              color: "#04210f",
              fontSize: 26,
              fontWeight: 800,
              padding: "14px 28px",
              borderRadius: 999,
            }}
          >
            Free AI Visibility Check
          </div>
        </div>
      </div>
    ),
    { ...ogSize },
  );
}
