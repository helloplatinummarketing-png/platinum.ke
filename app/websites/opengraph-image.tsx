// Link-preview image for this page (1200x630). Design: lib/og.tsx
import { ogContentType, ogSize, renderOg } from "@/lib/og";
import { seo } from "@/content/site";

export const alt = seo.websites.title;
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOg("websites");
}
