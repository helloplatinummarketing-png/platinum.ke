import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { pages } from "@/lib/seo";

/** /sitemap.xml: the 7 public pages. */
export default function sitemap(): MetadataRoute.Sitemap {
  return pages.map((p) => ({
    url: `${site.url}${p.path === "/" ? "" : p.path}`,
    changeFrequency: "monthly",
    priority: p.path === "/" ? 1 : 0.8,
  }));
}
