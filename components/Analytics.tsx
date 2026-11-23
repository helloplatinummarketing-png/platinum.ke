/**
 * Umami Cloud analytics (free "Hobby" plan, no cookies, so no cookie banner).
 *
 * Switched on only when NEXT_PUBLIC_UMAMI_WEBSITE_ID is set (in .env.local or
 * Vercel). Loaded with `defer`. Counts visits only on the live domain
 * (data-domains), never on localhost, and respects "Do Not Track".
 *
 * Click events: data-umami-event="…" on links (counted by Umami itself).
 * Other events: track() in lib/track.ts.
 */
export function Analytics({ websiteId, domain }: { websiteId?: string; domain: string }) {
  if (!websiteId) return null;
  return (
    <script
      defer
      src="https://cloud.umami.is/script.js"
      data-website-id={websiteId}
      data-domains={domain}
      data-do-not-track="true"
    />
  );
}
