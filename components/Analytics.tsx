"use client";

/**
 * Umami Cloud analytics (free "Hobby" plan, no cookies, so no cookie banner).
 *
 * Switched on only when NEXT_PUBLIC_UMAMI_WEBSITE_ID is set (in .env.local or
 * Vercel). Counts visits only on the live domain (data-domains), never on
 * localhost. Respects the browser's "Do Not Track" setting.
 *
 * Custom events (lib/track.ts): cta-click, whatsapp-click, form-submit, booking-open.
 */
import Script from "next/script";
import { useEffect } from "react";

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Record<string, string>) => void };
  }
}

export function Analytics({ websiteId, domain }: { websiteId?: string; domain: string }) {
  useEffect(() => {
    if (!websiteId) return;
    window.__track = (event, props) => window.umami?.track(event, props);
    return () => {
      window.__track = undefined;
    };
  }, [websiteId]);

  if (!websiteId) return null;
  return (
    <Script
      src="https://cloud.umami.is/script.js"
      data-website-id={websiteId}
      data-domains={domain}
      data-do-not-track="true"
      strategy="lazyOnload"
    />
  );
}
