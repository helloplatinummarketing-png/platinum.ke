/**
 * Analytics events. One place, so switching analytics tools means editing
 * only this file. Does nothing until an analytics tool is switched on.
 *
 * Events tracked (from the brief): CTA clicks, WhatsApp clicks,
 * form submits, booking opens.
 */
export type TrackEvent = "cta-click" | "whatsapp-click" | "form-submit" | "booking-open";

type Props = Record<string, string>;

declare global {
  interface Window {
    // Set by components/Analytics.tsx (Umami) when analytics is switched on
    __track?: (event: TrackEvent, props?: Props) => void;
  }
}

export function track(event: TrackEvent, props?: Props) {
  try {
    window.__track?.(event, props);
  } catch {
    // Analytics must never break the page.
  }
}
