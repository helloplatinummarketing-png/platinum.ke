/**
 * Shapes for everything in content/site.ts.
 * If you edit site.ts and break one of these shapes, `npm run build`
 * (and your editor) will show a red error telling you which field is wrong.
 *
 * A value of `null` means "To come": the site shows a clear "To come" label
 * instead of inventing anything.
 */

export type Href = `/${string}` | `https://${string}` | `mailto:${string}` | `tel:${string}`;

export type Link = { label: string; href: Href };

/** A price in Kenyan Shillings. `plus: true` shows "KSh 250,000+". */
export type Ksh = { kes: number; plus?: boolean };

export type Faq = { q: string; a: string };

export type Seo = { title: string; description: string };

export type PricingTier = {
  name: string;
  includes: string[];
  setup: Ksh;
  monthly: Ksh;
  /** Column headings differ slightly per product, so they live on the table. */
};

export type PricingTable = {
  product: string;
  setupLabel: string;
  monthlyLabel: string;
  tiers: PricingTier[];
};

export type Contact = {
  /** e.g. "+254 7XX XXX XXX". null = To come */
  phoneDisplay: string | null;
  /** Digits only, with country code, e.g. "2547XXXXXXXX". Used for tel: links. */
  phoneDigits: string | null;
  /** Digits only, with country code, no "+". Used for wa.me links. */
  whatsappDigits: string | null;
  whatsappMessage: string;
  email: string | null;
  /** Calendly or Cal.com link. */
  bookingUrl: `https://${string}` | null;
  location: string;
  locationNote: string;
  /** What the Google Map searches for. */
  mapQuery: string;
};

/** One stop in the home-page phone story. */
export type StoryStop = {
  id: "hero" | "problem" | "ai" | "website" | "whatsapp" | "how" | "cta";
  kicker: string;
  heading: string;
  body?: string;
  bullets?: { title?: string; text: string }[];
  ctas?: Link[];
  /** Short alt text for the picture of this phone screen. */
  screenAlt: string;
  /** Text drawn on the phone screen. Keys depend on the stop (see screens). */
  screen: Record<string, string | string[]>;
  /**
   * Text on the 3D cards that pop out of the phone at this stop.
   * `bullet`: which bullet (0 = first) the card illustrates. The card flies
   * towards that bullet and the bullet lights up. Leave it out for cards
   * that belong to the stop as a whole.
   */
  popCards: { title: string; sub?: string; bullet?: number }[];
};
