/**
 * ALL WEBSITE TEXT LIVES HERE.
 *
 * Source: docs/brief.md (Victor, 1 Nov 2026), with the honesty fixes marked
 * "HONESTY FIX". To change any words, prices, contact details or team
 * members, edit this file only. No component contains copy.
 *
 * `null` means "To come". The site then shows a yellow "To come" label.
 * Search this file for "TODO" to see everything still waiting on Victor.
 */
import type {
  Contact,
  Faq,
  Href,
  Link,
  Photo,
  PhotoKey,
  PricingTable,
  Seo,
  StoryChapter,
} from "./types";

/* ------------------------------------------------------------------ */
/* Basics                                                              */
/* ------------------------------------------------------------------ */

export const site = {
  name: "Platinum Marketing Agency",
  shortName: "Platinum",
  /**
   * The domain the previous (UK) site used, per Austin (23 Nov 2026).
   * Set NEXT_PUBLIC_SITE_URL in .env.local / Vercel to override.
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.platinummarketingagency.co.uk",
  locale: "en_KE",
  tagline: "More Customers. Less Stress. All Automated.",
  taglineAlt: "We Bring You Customers While You Run Your Business.",
  brandMessage:
    "We help Kenyan businesses get found online, capture every lead, and never miss a customer — using websites, WhatsApp automation, and AI visibility.",
  toComeLabel: "To come",
  /** Shown under example phone screens so nobody mistakes them for real clients. */
  exampleLabel: "Example screen. Not a real business.",
} as const;

export const contact: Contact = {
  // Kenyan number for calls and WhatsApp (26 Nov 2026). Email is the previous site's.
  phoneDisplay: "+254 185 587 728",
  phoneDigits: "254185587728",
  whatsappDigits: "254185587728",
  whatsappMessage: "Hi Platinum, I'd like my free AI Visibility Check.",
  email: "helloplatinummarketing@gmail.com",
  bookingUrl: "https://cal.com/platinummarketingagency/15min", // the previous site's booking link (Austin, 23 Nov 2026)
  location: "Nairobi, Kenya",
  locationNote: "No physical office. We work remotely across Kenya.",
  mapQuery: "Nairobi, Kenya",
};

/** The two CTAs every page may end with. */
export const cta = {
  book: { label: "Book Your Free Check", href: "/contact" },
  aiCheck: { label: "Get Your Free AI Check", href: "/contact" },
  headerShort: { label: "Free AI Check", href: "/contact" },
} as const satisfies Record<string, Link>;

/** The brief's bottom-of-page CTA copy, reused to end the service and About pages. */
const briefCtaCopy = {
  heading: "Ready to Get More Customers?",
  body: "Book a free 10-minute AI Visibility Check. We'll show you exactly how your business shows up on AI — and what you're missing.",
};

export const nav: Link[] = [
  { label: "Websites", href: "/websites" },
  { label: "WhatsApp Automations", href: "/whatsapp-automations" },
  { label: "AI Visibility", href: "/ai-visibility" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footer = {
  blurb: "Websites, WhatsApp automations and AI visibility for Kenyan service businesses.",
  copyright: `© ${new Date().getFullYear()} Platinum Marketing Agency`,
};

export const whatsappFloat = {
  label: "Chat with us on WhatsApp",
  labelNoNumber: "WhatsApp number to come. Go to the contact page.",
};

/* ------------------------------------------------------------------ */
/* SEO: one title and description per page                            */
/* ------------------------------------------------------------------ */

export const seo: Record<
  "home" | "websites" | "whatsapp" | "ai" | "about" | "contact" | "pricing",
  Seo
> = {
  home: {
    title: "Platinum Marketing Agency | More Customers for Kenyan Businesses",
    description:
      "Websites, WhatsApp automations and AI visibility for Kenyan service businesses. Get found, answer every enquiry and get recommended by AI. Free AI Visibility Check.",
  },
  websites: {
    title: "Websites for Kenyan Businesses | Platinum Marketing Agency",
    description:
      "Fast, mobile-friendly websites that show up on Google and AI search and bring you customers. From KSh 80,000. Based in Nairobi.",
  },
  whatsapp: {
    title: "WhatsApp Automations for Kenyan Businesses | Platinum",
    description:
      "Missed calls answered, leads followed up, reviews collected, appointments confirmed and invoices chased with M-Pesa. All through WhatsApp. From KSh 30,000.",
  },
  ai: {
    title: "AI Visibility (GEO) for Kenyan Businesses | Platinum",
    description:
      "When customers ask ChatGPT, Google AI or Siri who to call, your business should be the answer. AI audit, Google Business Profile, listings and reviews. From KSh 25,000.",
  },
  about: {
    title: "About Us | Platinum Marketing Agency, Nairobi",
    description:
      "We help Kenyan service businesses win online with websites, WhatsApp automations and AI visibility. Meet the team.",
  },
  contact: {
    title: "Contact & Book a Free AI Visibility Check | Platinum",
    description:
      "Book a free 10-minute AI Visibility Check. We'll show you how your business shows up on AI and what you're missing. No charge, no commitment.",
  },
  pricing: {
    title: "Pricing | Websites, WhatsApp & AI Visibility in KSh | Platinum",
    description:
      "Simple, transparent pricing in Kenyan Shillings for websites, WhatsApp automations and AI visibility. No hidden fees. No long contracts.",
  },
};

/* ------------------------------------------------------------------ */
/* HOME                                                                */
/* ------------------------------------------------------------------ */

export const homeServices = {
  heading: "What we do",
  cards: [
    {
      icon: "monitor",
      label: "Websites",
      title: "Professional websites that actually bring you customers",
      text: "We build fast, mobile-friendly websites designed to show up on Google and AI search. Not just a digital business card — a lead-generating machine.",
      link: { label: "Learn More", href: "/websites" },
    },
    {
      icon: "message",
      label: "WhatsApp Automations",
      title: "Never miss a customer again",
      text: "Automated WhatsApp replies to missed calls, instant responses to enquiries, appointment reminders, review collection, quote follow-ups, and payment chasing — all running 24/7 without you lifting a finger.",
      link: { label: "Learn More", href: "/whatsapp-automations" },
    },
    {
      icon: "search",
      label: "AI Visibility (GEO)",
      title: "Get recommended by AI",
      text: "When customers ask ChatGPT, Google AI, or Siri \"Who's the best [your trade] in [your area]?\" — we make sure your business is the answer.",
      link: { label: "Learn More", href: "/ai-visibility" },
    },
  ],
} as const satisfies {
  heading: string;
  cards: readonly { icon: string; label: string; title: string; text: string; link: Link }[];
};

/**
 * End of the home page, after services and social proof. The brief's
 * "Ready to Get More Customers?" CTA is already the story's last stop, so
 * this uses the brief's other CTA line (from the Pricing page) to avoid
 * repeating the same paragraph.
 */
export const homeFinalCta = {
  heading: "Not sure which package?",
  body: "Book a free call and we'll help you figure it out.",
  button: cta.book,
};

/**
 * HONESTY FIX: testimonials and stats are placeholders. Never invent names,
 * quotes or numbers. Fill these only with real, approved client feedback.
 */
export const socialProof = {
  heading: "What Our Clients Say",
  testimonials: [
    { quote: null, name: null, business: null },
    { quote: null, name: null, business: null },
    { quote: null, name: null, business: null },
  ] as { quote: string | null; name: string | null; business: string | null }[],
  stats: [
    { label: "Businesses Served", value: null },
    { label: "Leads Captured", value: null },
    { label: "Google Reviews Generated", value: null },
  ] as { label: string; value: string | null }[],
};

/* ------------------------------------------------------------------ */
/* PRICING (shared by service pages and /pricing)                      */
/* ------------------------------------------------------------------ */

export const pricing: Record<"websites" | "whatsapp" | "ai", PricingTable> = {
  websites: {
    product: "Websites",
    setupLabel: "One-off price",
    monthlyLabel: "Monthly maintenance",
    tiers: [
      {
        name: "Starter",
        includes: ["5-page website", "Mobile-ready", "Contact form", "Google Maps", "Basic SEO"],
        setup: { kes: 80_000 },
        monthly: { kes: 5_000 },
      },
      {
        name: "Growth",
        includes: ["8-12 pages", "Blog", "Advanced SEO", "WhatsApp integration", "Google Business Profile setup"],
        setup: { kes: 150_000 },
        monthly: { kes: 10_000 },
      },
      {
        name: "Premium",
        includes: ["15+ pages", "Custom design", "Animations", "Multilingual (English/Swahili)", "Booking system", "M-Pesa integration"],
        setup: { kes: 250_000, plus: true },
        monthly: { kes: 15_000 },
      },
    ],
  },
  whatsapp: {
    product: "WhatsApp Automations",
    setupLabel: "Setup (one-off)",
    monthlyLabel: "Monthly",
    tiers: [
      {
        name: "Starter",
        includes: ["Missed Call WhatsApp-Back", "Instant Lead Response", "Review Collection"],
        setup: { kes: 30_000 },
        monthly: { kes: 15_000 },
      },
      {
        name: "Growth",
        includes: [
          "Everything in Starter",
          "Appointment Reminders",
          "No-Show Recovery",
          "Quote Follow-Up",
          // TODO: Victor to describe "Repeat Business Follow-Up" (not among the 7 automations).
          "Repeat Business Follow-Up",
        ],
        setup: { kes: 50_000 },
        monthly: { kes: 25_000 },
      },
      {
        name: "Full System",
        includes: [
          "Everything in Growth",
          "Invoice/Payment Chase with M-Pesa",
          // TODO: Victor to confirm which AI Visibility (GEO) tier is included.
          "AI Visibility (GEO)",
          "Monthly Reporting",
        ],
        setup: { kes: 80_000 },
        monthly: { kes: 40_000 },
      },
    ],
  },
  ai: {
    product: "AI Visibility",
    setupLabel: "Setup (one-off)",
    monthlyLabel: "Monthly",
    tiers: [
      {
        name: "AI Starter",
        includes: ["AI Audit", "Google Business Profile Optimisation", "10 Directory Listings", "Monthly Monitoring"],
        setup: { kes: 25_000 },
        monthly: { kes: 10_000 },
      },
      {
        name: "AI Growth",
        includes: ["Everything in Starter", "Full Directory Blitz", "Automated Review Collection", "FAQ Pages"],
        setup: { kes: 40_000 },
        monthly: { kes: 18_000 },
      },
      {
        name: "AI Full System",
        includes: ["Everything in Growth", "Schema Markup", "Full Website AI Optimisation", "Competitor Tracking"],
        setup: { kes: 60_000 },
        monthly: { kes: 28_000 },
      },
    ],
  },
};

/* ------------------------------------------------------------------ */
/* HOME: the Nairobi photo story (docs/platinum-change-order-photo-story.md) */
/* ------------------------------------------------------------------ */

/**
 * The six real Nairobi photos (public/images/nairobi/). All free under the
 * Unsplash License; credits from docs/demo-v2/PHOTO-CREDITS.md.
 * Don't replace, re-crop or add photos without asking Austin. No faces, no logos.
 */
export const photos: Record<PhotoKey, Photo> = {
  nw: {
    alt: "Nairobi skyline at night, with KICC reflected in the Uhuru Park lake",
    width: 1080,
    height: 698,
    desktopHeight: 1293,
    photographer: "Mustafa Omar",
    sourceUrl: "https://unsplash.com/photos/body-of-water-near-green-trees-during-night-time-Zkao_QBEjk8",
  },
  problem: {
    alt: "Nairobi CBD at night, seen from a rooftop",
    width: 1080,
    height: 681,
    desktopHeight: 1261,
    photographer: "Click Smith",
    sourceUrl: "https://unsplash.com/photos/a-view-of-a-city-at-night-from-the-top-of-a-building-f4QoRqqpiQU",
  },
  aerial: {
    alt: "Daytime aerial view of Nairobi's CBD",
    width: 1080,
    height: 718,
    desktopHeight: 1330,
    photographer: "Joecalih",
    sourceUrl: "https://unsplash.com/photos/white-and-black-concrete-building-under-blue-sky-during-daytime-1Uwcoo-ttjY",
  },
  trails: {
    alt: "Nairobi CBD streets at night with car light trails",
    width: 1080,
    height: 684,
    desktopHeight: 1268,
    photographer: "Click Smith",
    sourceUrl: "https://unsplash.com/photos/a-view-of-a-city-at-night-from-the-top-of-a-building-Lc9MlKlMMhI",
  },
  dusk: {
    alt: "Nairobi CBD at dusk under storm clouds",
    width: 1080,
    height: 697,
    desktopHeight: 1290,
    photographer: "Click Smith",
    sourceUrl: "https://unsplash.com/photos/a-view-of-a-city-at-night-from-the-top-of-a-building-833P7yxEHF8",
  },
  kicc: {
    alt: "Nairobi skyline with KICC by day",
    width: 1080,
    height: 810,
    desktopHeight: 1500,
    photographer: "Kenny Murgor",
    sourceUrl: "https://unsplash.com/photos/a-view-of-a-city-with-tall-buildings-vyagy6HJpVE",
  },
};

export const photoNotes = {
  /** Shown on the story (Layers 2 and 3) and under the photos (Layer 1). */
  illustration: "Real Nairobi photos · light effects and the glowing tower are illustrations",
  /** Example businesses in the story aren't real (Your Business, ★ 4.9, KSh 2,500…). */
  examples: "Example businesses, ratings and amounts in the story are illustrations, not real clients.",
  creditPrefix: "Photo:",
  creditSuffix: "/ Unsplash",
  creditsHeading: "Photo credits",
  creditsIntro: "Photos of Nairobi from Unsplash, free under the Unsplash License.",
  /** The loader shown while the 3D city story starts (Layer 3 only). */
  loader: "Switching on the city lights…",
};

/** "KSh 80,000" or "KSh 30,000 setup", read from the pricing tables so they never drift. */
const firstTier = (t: PricingTable, setupWord: boolean) =>
  `KSh ${t.tiers[0].setup.kes.toLocaleString("en-US")}${setupWord ? " setup" : ""}`;

/** WhatsApp link for the closing chapter (falls back to /contact until the number is set). */
const whatsappLink: Href = contact.whatsappDigits
  ? `https://wa.me/${contact.whatsappDigits}?text=${encodeURIComponent(contact.whatsappMessage)}`
  : "/contact";

/**
 * The seven chapters of the home-page story. Each chapter has one photo.
 * `steps` light up one at a time as you scroll; `visuals` are the matching
 * cards in the light layer (same count, same order).
 */
export const photoStory: StoryChapter[] = [
  {
    id: "hero",
    kicker: "Websites · WhatsApp · AI visibility",
    heading: "Your Business Deserves More Customers",
    headingAccent: "More Customers",
    body: "We build websites, automate your WhatsApp, and make sure AI recommends you — so customers find you first.",
    ctas: [
      { label: "Get a Free AI Visibility Check", href: "/contact" },
      { label: "See Our Services", href: "/#services" },
    ],
    badges: ["Nairobi based", "Prices in KSh", "No long contracts"],
    photo: "nw",
  },
  {
    id: "problem",
    number: "01",
    kicker: "The problem",
    heading: "Your Competitors Are Getting the Customers You're Missing",
    steps: [
      { title: "Customers can't find you online", text: "No website, or a website that doesn't show up anywhere." },
      { title: "You're missing calls and enquiries", text: "Leads come in, nobody responds fast enough, they go to someone else." },
      {
        title: "AI doesn't know you exist",
        text: "When customers ask ChatGPT or Google AI for recommendations, your name doesn't come up.",
      },
    ],
    visuals: [
      { title: "No website found for you", sub: 'Search: "dentist near me"' },
      { title: "3 missed calls", sub: "Nobody replied" },
      { title: 'AI: "Try Other Clinic"', sub: "Your competitor wins" },
    ],
    photo: "problem",
  },
  {
    id: "websites",
    number: "02",
    kicker: "Websites",
    heading: "A website that actually brings you customers",
    intro: "Watch it go up, floor by floor:",
    steps: [
      { text: "Mobile-friendly design" },
      { text: "Fast on Kenyan data" },
      { text: "Shows up on Google" },
      { text: "Ready for AI search" },
      { text: "WhatsApp click-to-chat" },
      { text: "Google Maps + contact form" },
    ],
    // Short labels beside the tower's floors
    visuals: [
      { title: "Mobile-friendly" },
      { title: "Fast on Kenyan data" },
      { title: "Shows on Google" },
      { title: "Ready for AI search" },
      { title: "WhatsApp chat button" },
      { title: "Maps + contact form" },
    ],
    priceStrip: { label: "Starter website", price: firstTier(pricing.websites, false) },
    photo: "aerial",
  },
  {
    id: "whatsapp",
    number: "03",
    kicker: "WhatsApp automations",
    heading: "Never miss a customer again",
    steps: [
      { title: "Missed call?", text: "A WhatsApp reply in 30 seconds" },
      { title: "Appointment reminders", text: "that cut no-shows" },
      { title: "Review requests", text: "after every job" },
      { title: "Payment reminders", text: "with an M-Pesa link" },
    ],
    visuals: [
      { title: "Hi! Sorry we missed your call.", sub: "How can we help?" },
      { title: "✓ Reminder: Sat 10am", sub: "Reply YES to confirm" },
      { title: "★★★★★", sub: "Thanks! Review posted" },
      { title: "M-PESA", sub: "Pay KSh 2,500 (example)" },
    ],
    priceStrip: { label: "Starter automations", price: firstTier(pricing.whatsapp, true) },
    photo: "trails",
  },
  {
    id: "ai",
    number: "04",
    kicker: "AI visibility (GEO)",
    heading: "When customers ask AI, you're the answer",
    chat: {
      question: "Who is the best dentist in Westlands?",
      answer: { before: "Top pick: ", strong: "Your Business", after: " ★ 4.9, open now, books on WhatsApp." },
    },
    steps: [
      { text: "Google Business Profile" },
      { text: "Directory listings" },
      { text: "Fresh reviews" },
      { text: "FAQ + schema on your site" },
    ],
    stepStyle: "chips",
    // Besides the "AI TOP PICK" card (aiTopPick below), each chip gets a small
    // label beside a ring pulsing from the tower's base.
    visuals: [
      { title: "Google Business Profile" },
      { title: "Directory listings" },
      { title: "Fresh reviews" },
      { title: "FAQ + schema" },
    ],
    priceStrip: { label: "AI Starter", price: firstTier(pricing.ai, true) },
    photo: "dusk",
  },
  {
    id: "how",
    number: "05",
    kicker: "How it works",
    heading: "Three steps to the brightest building on the street",
    steps: [
      {
        title: "We audit your business.",
        text: "Free AI visibility check. We test how your business shows up across AI platforms and online.",
      },
      {
        title: "We build your systems.",
        text: "Website, automations, AI visibility — whatever you need, we set it up and get it running.",
      },
      {
        title: "You get more customers.",
        text: "Leads come in automatically. Enquiries get answered instantly. You focus on doing your work.",
      },
    ],
    visuals: [
      { title: "1  We audit", sub: "Free AI visibility check" },
      { title: "2  We build", sub: "Website · WhatsApp · AI" },
      { title: "3  You grow", sub: "More customers" },
    ],
    photo: "kicc",
  },
  {
    id: "cta",
    number: "06",
    kicker: "Your turn",
    heading: "Ready to Get More Customers?",
    body: "Book a free 10-minute AI Visibility Check. We'll show you exactly how your business shows up on AI — and what you're missing.",
    ctas: [cta.book, { label: "WhatsApp us", href: whatsappLink }],
    photo: "kicc",
  },
];

/** The AI chapter's main card in the light layer. */
export const aiTopPick = { badge: "AI TOP PICK", title: "Your Business ★ 4.9" };
/** The sign on the tower (an illustration, not a real building). */
export const towerSign = "YOUR BUSINESS";

/* ------------------------------------------------------------------ */
/* WEBSITES page                                                       */
/* ------------------------------------------------------------------ */

export const websitesPage = {
  hero: {
    heading: "A Website That Actually Works For Your Business",
    sub: "Not just something that looks nice — a website that gets found, captures leads, and pays for itself.",
  },
  whatYouGet: {
    heading: "What you get",
    items: [
      { title: "Mobile-friendly design", note: "Most Kenyans browse on phones" },
      { title: "Fast loading", note: "Optimised for Kenyan internet speeds" },
      { title: "Google-optimised", note: "Shows up when people search" },
      { title: "AI-optimised", note: "Shows up when people ask ChatGPT, Gemini, etc." },
      { title: "Contact forms and WhatsApp click-to-chat" },
      { title: "Google Maps integration" },
      { title: "Professional photos and content" },
    ] as { title: string; note?: string }[],
  },
  pricingHeading: "Website packages",
  pricingNote:
    "All prices are in Kenyan Shillings. Setup is a one-off payment. Monthly maintenance covers hosting, security updates, content changes, and ongoing support.",
  faqs: [
    { q: "How long does it take to build?", a: "Starter: 1-2 weeks. Growth: 2-3 weeks. Premium: 3-5 weeks." },
    {
      q: "Do I need to provide content?",
      a: "We handle everything. We'll ask you some questions about your business and take it from there. If you have photos, great. If not, we'll sort it.",
    },
    { q: "Can I update it myself?", a: "Yes, we'll show you how. Or we handle it for you on the monthly plan." },
    {
      q: "What if I already have a website?",
      a: "We'll audit it for free and tell you honestly if it needs rebuilding or just optimising.",
    },
  ] as Faq[],
  finalCta: {
    ...briefCtaCopy,
    button: cta.book,
  },
};

/* ------------------------------------------------------------------ */
/* WHATSAPP page                                                       */
/* ------------------------------------------------------------------ */

export const whatsappPage = {
  hero: {
    heading: "Your Business, Running on Autopilot",
    sub: "Missed calls answered. Leads followed up. Reviews collected. Appointments confirmed. Invoices chased. All through WhatsApp. All automatic.",
  },
  problem: [
    "Right now, every missed call is a lost customer. Every slow reply is money walking away. Every forgotten follow-up is a deal you should have closed.",
    "What if your WhatsApp could handle all of that — instantly, 24/7, without you or your staff doing anything?",
  ],
  automationsHeading: "What each automation does",
  automations: [
    {
      title: "Missed Call WhatsApp-Back",
      text: "Customer calls, you can't answer. Within 30 seconds, they get a personalised WhatsApp message: 'Hi, sorry I missed your call. How can I help?' They reply, you don't lose them.",
    },
    {
      title: "Instant Lead Response",
      text: "Someone enquires through your website, Facebook, or Google. Within 60 seconds, they get a WhatsApp message AND an email. Before they've even finished looking at your competitor.",
    },
    {
      title: "Review Collection",
      text: "After every job, your customer gets a friendly WhatsApp asking for a Google review. No awkward conversations. Your reviews grow on autopilot.",
    },
    {
      title: "Appointment Reminders",
      text: "Customer books an appointment. They get a WhatsApp reminder 48 hours before and 2 hours before. They confirm with a simple YES reply. No-shows drop.",
    },
    {
      title: "No-Show Recovery",
      // HONESTY FIX: brief said "Most rebook on the spot". No data yet.
      // TODO: Victor to confirm, or supply real numbers.
      text: "Someone doesn't show up? Within 30 minutes, they get a WhatsApp with a rebooking link. Many rebook straight away.",
    },
    {
      title: "Quote Follow-Up",
      text: "You send a quote. On day 3, day 7, and day 14, the customer gets a follow-up WhatsApp — each one different, each one nudging them to say yes. Stops the moment they reply.",
    },
    {
      title: "Invoice & Payment Chase (with M-Pesa)",
      text: "Invoice overdue? Day 3: polite WhatsApp reminder. Day 7: firmer follow-up. Day 14: urgent chase. Includes M-Pesa payment link so they can pay right from WhatsApp.",
    },
  ],
  pricingHeading: "WhatsApp automation packages",
  /**
   * HONESTY FIX: Meta changed WhatsApp pricing in October 2026, so the old
   * "KSh 6,000-7,000/month" figure is not shown. TODO: updated tool cost.
   */
  toolCost: {
    before: "Tool costs (WhatsApp Business API, automation platform) are approximately ",
    figure: null as string | null,
    after: " on top — paid by you directly, we set it all up.",
  },
  faqs: [
    {
      q: "Do I need a special WhatsApp number?",
      // HONESTY FIX: brief said "You can use your existing business number."
      // TODO: confirm WhatsApp coexistence in Kenya
      a: "We set you up with the WhatsApp Business API. Can you keep your existing business number? Usually yes. We'll check your number during setup.",
    },
    {
      q: "Will it sound robotic?",
      // HONESTY FIX: removed "Customers won't know it's automated."
      a: "No. Every message sounds natural and comes from your business name.",
    },
    {
      q: "What if a customer needs a real person?",
      a: "The system hands over to you or your staff the moment a customer needs human help. You see everything in one inbox.",
    },
    {
      q: "Can I see what's being sent?",
      a: "Yes. Every message is logged. You get a dashboard showing every lead, every reply, every follow-up.",
    },
  ] as Faq[],
  finalCta: {
    ...briefCtaCopy,
    button: cta.book,
  },
};

/* ------------------------------------------------------------------ */
/* AI VISIBILITY page                                                  */
/* ------------------------------------------------------------------ */

export const aiPage = {
  hero: {
    heading: "When Customers Ask AI, Your Business Should Be the Answer",
    sub: "More people are asking ChatGPT, Google AI, and Siri 'Who's the best [business] near me?' We make sure they hear your name.",
  },
  problem: [
    "Try it yourself. Open ChatGPT right now and ask: 'Who is the best [your trade] in [your area]?'",
    "If your name doesn't come up — but your competitor's does — you're losing customers to AI every single day. And it's only going to get worse.",
  ],
  whatWeDoHeading: "What we do",
  whatWeDo: [
    {
      title: "AI Visibility Audit",
      text: "We test your business across every major AI platform — ChatGPT, Google Gemini, Claude, Perplexity, Siri. We find out if AI recommends you, who it recommends instead, and exactly why.",
    },
    {
      title: "Google Business Profile Optimisation",
      // HONESTY FIX: brief said "the #1 thing AI looks at", which we can't prove.
      text: "Your Google Business Profile is one of the main things AI looks at. We complete every field, write a proper description, add photos, and make it easy for AI to read.",
    },
    {
      title: "Directory Listings",
      text: "We list your business on every relevant online directory — with your name, address, and phone number exactly the same everywhere. Consistency = AI trusts you.",
    },
    {
      title: "Review Generation",
      text: "AI heavily favours businesses with lots of recent, positive reviews. Our WhatsApp automation system collects Google reviews from your customers on autopilot.",
    },
    {
      title: "Website AI Optimisation",
      text: "We add FAQ pages to your website that match exactly how people ask AI questions. We add invisible code (schema markup) that helps AI read your site like a menu.",
    },
    {
      title: "Monthly Monitoring & Reporting",
      text: "Every month, we re-test your AI visibility. You get a simple report: your score, which AI platforms recommend you, how many new reviews you got, and what we're working on next.",
    },
  ],
  pricingHeading: "AI visibility packages",
  finalCta: {
    ...briefCtaCopy,
    button: cta.aiCheck,
  },
};

/* ------------------------------------------------------------------ */
/* ABOUT page                                                          */
/* ------------------------------------------------------------------ */

export const aboutPage = {
  heading: "We Help Kenyan Businesses Win Online",
  story: [
    "Platinum Marketing Agency was built on a simple idea: most businesses lose customers they should be keeping. Missed calls go unreturned. Enquiries get forgotten. Quotes don't get followed up. And now, AI is recommending your competitors instead of you.",
    "We fix all of that.",
    "We build websites that get found. We set up WhatsApp automations that capture every lead. And we make sure that when customers ask AI who to call — your name comes up first.",
    "We work exclusively with Kenyan service businesses — dentists, salons, restaurants, garages, clinics, real estate agents, hotels, and more. We understand the market, we speak the language, and we deliver results you can measure.",
  ],
  teamHeading: "The team",
  // TODO: confirm consent for name and photo (each team member).
  // TODO: 1-line bio for each person. Photos: replace /team/placeholder.svg.
  team: [
    { name: "Victor Odhiambo", role: "Founder & Strategy", bio: null, photo: null },
    { name: "Austin", role: "Operations Lead & Developer", bio: null, photo: null },
    { name: "Samara", role: "Developer & Social Media", bio: null, photo: null },
    { name: "Ann", role: "Lead Generation & Client Communications", bio: null, photo: null },
  ] as { name: string; role: string; bio: string | null; photo: `/${string}` | null }[],
  valuesHeading: "What we believe",
  values: [
    { title: "Results, not reports", text: "We care about leads and revenue, not vanity metrics." },
    { title: "Simple systems that work", text: "We don't over-engineer. If it works, it ships." },
    { title: "Your business, our mission", text: "We succeed when you succeed. Simple as that." },
  ],
  finalCta: {
    ...briefCtaCopy,
    button: cta.book,
  },
};

/* ------------------------------------------------------------------ */
/* CONTACT page                                                        */
/* ------------------------------------------------------------------ */

export const contactPage = {
  heading: "Let's Talk About Your Business",
  sub: "Book a free 10-minute AI Visibility Check. We'll show you exactly how your business shows up on AI — and what you're missing. No charge, no commitment.",
  bookingHeading: "Book a time",
  bookingButton: "Book Your Free Check",
  whatsappHeading: "Prefer WhatsApp?",
  whatsappButton: "Chat on WhatsApp",
  emailButton: "Email us",
  formHeading: "Or send us a message",
  form: {
    name: "Your name",
    business: "Business name",
    phone: "Phone",
    email: "Email",
    need: "What do you need help with?",
    needOptions: ["Website", "WhatsApp Automations", "AI Visibility", "All of the above", "Not sure"],
    submit: "Book Your Free Check",
    sending: "Sending…",
    // Interface text (not in the brief). TODO: Victor to confirm, and add a reply time if he wants one.
    success: "Thanks! We got your message and will be in touch soon.",
    // Until form delivery is set up, every send ends here, so it gives the real ways to reach us.
    error: `Sorry, your message didn't send. Please WhatsApp us on ${contact.phoneDisplay} or email ${contact.email}.`,
    tooMany: "Too many messages from this connection. Please wait a few minutes, or use WhatsApp.",
    fixErrors: "Please check the highlighted fields.",
    backHome: "Back to the home page",
    tryAgain: "Back to the contact page",
    privacy: "We only use your details to reply to you.",
  },
  detailsHeading: "Other ways to reach us",
  mapButton: "Show map",
  mapNote: "Loads Google Maps",
  mapTitle: "Map of Nairobi, Kenya",
  bookingTitle: "Booking calendar",
};

/* ------------------------------------------------------------------ */
/* PRICING page                                                        */
/* ------------------------------------------------------------------ */

export const pricingPage = {
  heading: "Simple, Transparent Pricing",
  // TODO: Victor to confirm notice period for cancelling.
  sub: "No hidden fees. No long contracts. Cancel anytime.",
  bundle: "Get a website + any automation package together and save KSh 10,000-20,000 on setup.",
  finalCta: {
    heading: "Not sure which package?",
    body: "Book a free call and we'll help you figure it out.",
    button: cta.book,
  },
};

/* ------------------------------------------------------------------ */
/* Everything still "To come" (shown in the README and final summary)  */
/* ------------------------------------------------------------------ */

export const todos = [
  "Brand colours, fonts and final logo",
  "WhatsApp tool cost (Meta changed pricing in Oct 2026)",
  "Confirm WhatsApp coexistence (keeping an existing number) in Kenya",
  "Notice period for cancelling",
  "Description of 'Repeat Business Follow-Up'",
  "Which AI Visibility tier is in WhatsApp Full System",
  "No-Show Recovery: real rebooking numbers (or keep 'Many rebook')",
  "Contact form reply time",
  "Testimonials (3, real and approved)",
  "Stats bar numbers (real)",
  "Team bios, photos and consent",
] as const;
