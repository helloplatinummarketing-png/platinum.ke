import type { Metadata } from "next";
import { seo, site } from "@/content/site";

export type PageKey = keyof typeof seo;

/** The 7 public pages: used for metadata, sitemap and tests. */
export const pages: { key: PageKey; path: `/${string}`; kicker: string }[] = [
  { key: "home", path: "/", kicker: "Websites · WhatsApp · AI visibility" },
  { key: "websites", path: "/websites", kicker: "Websites" },
  { key: "whatsapp", path: "/whatsapp-automations", kicker: "WhatsApp Automations" },
  { key: "ai", path: "/ai-visibility", kicker: "AI Visibility (GEO)" },
  { key: "pricing", path: "/pricing", kicker: "Pricing" },
  { key: "about", path: "/about", kicker: "About us" },
  { key: "contact", path: "/contact", kicker: "Free AI Visibility Check" },
];

/**
 * Title, description, canonical URL and link-preview tags for one page.
 * The 1200x630 preview image comes from that page's opengraph-image.tsx.
 */
export function pageMetadata(key: PageKey): Metadata {
  const s = seo[key];
  const path = pages.find((p) => p.key === key)!.path;
  return {
    title: s.title,
    description: s.description,
    alternates: { canonical: path },
    openGraph: {
      title: s.title,
      description: s.description,
      url: path,
      siteName: site.name,
      locale: site.locale,
      type: "website",
    },
    twitter: { card: "summary_large_image", title: s.title, description: s.description },
  };
}
