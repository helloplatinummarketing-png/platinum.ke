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

/* ---------------- Home page: the Nairobi photo story ---------------- */

/** The six Nairobi photos (public/images/nairobi/<key>.webp and <key>-m.webp). */
export type PhotoKey = "nw" | "problem" | "aerial" | "trails" | "dusk" | "kicc";

export type Photo = {
  alt: string;
  /** Size of the mobile version (-m.webp). The desktop version is 2000px wide, same shape. */
  width: number;
  height: number;
  desktopHeight: number;
  photographer: string;
  sourceUrl: `https://${string}`;
};

/** A card or label drawn in the light layer, one per step (or one per chapter). */
export type StoryVisual = { title: string; sub?: string };

export type StoryChapter = {
  id: "hero" | "problem" | "websites" | "whatsapp" | "ai" | "how" | "cta";
  /** "01" … "06"; the hero has none. */
  number?: string;
  kicker: string;
  heading: string;
  /** Part of the heading shown in the accent colour (must be inside `heading`). */
  headingAccent?: string;
  body?: string;
  /** Short line above the steps, e.g. "Watch it go up, floor by floor:" */
  intro?: string;
  /** Bullets that light up one at a time as you scroll. */
  steps?: { title?: string; text: string }[];
  /** "chips" shows the steps as small pills (AI chapter). */
  stepStyle?: "list" | "chips";
  /** One visual per step, in the same order (the test checks the counts match). */
  visuals?: StoryVisual[];
  /** AI chapter: the question types itself out, then the answer appears. */
  chat?: { question: string; answer: { before: string; strong: string; after: string } };
  /** Small price line, e.g. "Starter website · KSh 80,000". */
  priceStrip?: { label: string; price: string };
  ctas?: Link[];
  badges?: string[];
  photo: PhotoKey;
};

/** One stop in the home-page phone story (RETIRED: replaced by StoryChapter). */
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
