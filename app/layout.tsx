import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { Analytics } from "@/components/Analytics";
import { Header } from "@/components/Header";
import { JsonLd } from "@/components/JsonLd";
import { TrackClicks } from "@/components/TrackClicks";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { seo, site } from "@/content/site";
import { organizationSchema } from "@/lib/schema";
import "./globals.css";

// No web fonts: the theme uses the phone's own system font (fast, no download).

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: seo.home.title, template: "%s" },
  description: seo.home.description,
  applicationName: site.name,
  // Each page sets its own title, description, canonical and preview tags (lib/seo.ts).
};

export const viewport: Viewport = {
  themeColor: "#0a0f1e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-KE">
      <body className="flex min-h-dvh flex-col bg-bg text-ink antialiased">
        {/* Business details for Google and AI tools, on every page */}
        <JsonLd data={organizationSchema()} />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppFloat />
        <TrackClicks />
        <Analytics
          websiteId={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || undefined}
          domain={new URL(site.url).hostname}
        />
      </body>
    </html>
  );
}
