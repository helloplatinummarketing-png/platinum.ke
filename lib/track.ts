/**
 * Analytics events (Umami Cloud).
 *
 * Clicks on links are tracked by Umami itself: any element with
 * data-umami-event="…" (CTA buttons, WhatsApp buttons) is counted on click.
 * Events that aren't clicks go through track() below:
 *   form-submit, booking-open, story-ch-01 … story-ch-06 (how far people scroll the home story).
 * Does nothing until analytics is switched on (NEXT_PUBLIC_UMAMI_WEBSITE_ID).
 */
export type TrackEvent =
  | "cta-click"
  | "whatsapp-click"
  | "form-submit"
  | "booking-open"
  | `story-ch-0${1 | 2 | 3 | 4 | 5 | 6}`;

type Props = Record<string, string>;

declare global {
  interface Window {
    umami?: { track: (event: string, data?: Props) => void };
  }
}

export function track(event: TrackEvent, props?: Props) {
  try {
    window.umami?.track(event, props);
  } catch {
    // Analytics must never break the page.
  }
}
