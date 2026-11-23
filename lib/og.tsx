/**
 * Link-preview pictures (1200x630), the image WhatsApp, Facebook and X show
 * when someone shares a link. Generated once at build time, one per page,
 * from the page's title in content/site.ts. Colours from the placeholder theme.
 *
 * Font: Inter (@fontsource/inter, OFL licence), used only here at build time.
 * The website itself still uses the phone's own system font.
 */
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { seo, site } from "@/content/site";
import { pages, type PageKey } from "./seo";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

/** Read the logo and fonts once and cache them, so the images are made at build time. */
async function assets() {
  "use cache";
  // Paths written out in full, so the build only packs these three files
  const [logo, regular, bold] = await Promise.all([
    readFile(join(process.cwd(), "public", "brand", "platinum-logo.png")),
    readFile(join(process.cwd(), "node_modules", "@fontsource", "inter", "files", "inter-latin-500-normal.woff")),
    readFile(join(process.cwd(), "node_modules", "@fontsource", "inter", "files", "inter-latin-800-normal.woff")),
  ]);
  return { logo: logo.toString("base64"), regular: regular.toString("base64"), bold: bold.toString("base64") };
}

export async function renderOg(key: PageKey) {
  const page = pages.find((p) => p.key === key)!;
  // Short title: the part before " | " (home: the part after, since the logo already says Platinum)
  const parts = seo[key].title.split(" | ");
  const title = key === "home" && parts[1] ? parts[1] : parts[0];
  const a = await assets();

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
          fontFamily: "Inter",
          color: "#f3f5f8",
          // night navy with a warm "city lights" glow, like the home story
          background:
            "radial-gradient(circle at 88% 100%, rgba(255,181,71,0.35) 0%, rgba(255,181,71,0) 45%), linear-gradient(135deg, #050913 0%, #0c1328 60%, #06201a 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${a.logo}`}
            width={84}
            height={84}
            style={{ borderRadius: 18, background: "#fff" }}
            alt=""
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: 5 }}>PLATINUM</div>
            <div style={{ fontSize: 22, fontWeight: 500, color: "#a9b1c1" }}>Marketing Agency · Nairobi</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#ffb547", letterSpacing: 4, textTransform: "uppercase" }}>
            {page.kicker}
          </div>
          <div
            style={{
              fontSize: title.length > 45 ? 62 : 74,
              fontWeight: 800,
              lineHeight: 1.08,
              letterSpacing: -1.5,
              marginTop: 14,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 500, color: "#a9b1c1" }}>{site.tagline}</div>
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
    {
      ...ogSize,
      fonts: [
        { name: "Inter", data: Buffer.from(a.regular, "base64"), weight: 500, style: "normal" },
        { name: "Inter", data: Buffer.from(a.bold, "base64"), weight: 800, style: "normal" },
      ],
    },
  );
}
