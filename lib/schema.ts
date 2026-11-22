/**
 * Schema markup (JSON-LD): invisible code that tells Google and AI tools
 * what the business is, what it sells and for how much. "Practice what we
 * preach" (brief, section 4). Built from content/site.ts only.
 */
import { contact, site } from "@/content/site";
import type { Faq, PricingTable } from "@/content/types";

const ORG_ID = `${site.url}/#organization`;
const kenya = { "@type": "Country", name: "Kenya" };

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService", // a kind of LocalBusiness
    "@id": ORG_ID,
    name: site.name,
    url: site.url,
    logo: `${site.url}/brand/platinum-logo.png`,
    image: `${site.url}/brand/platinum-logo.png`,
    description: site.brandMessage,
    slogan: site.tagline,
    address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
    areaServed: kenya,
    currenciesAccepted: "KES",
    priceRange: "KSh 25,000 – KSh 250,000+",
    // Only real details. Added automatically once filled in content/site.ts.
    ...(contact.phoneDigits ? { telephone: `+${contact.phoneDigits}` } : {}),
    ...(contact.email ? { email: contact.email } : {}),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    inLanguage: "en-KE",
    publisher: { "@id": ORG_ID },
  };
}

/** One Service with an Offer per tier (setup price + monthly price, in KES). */
export function serviceSchema(table: PricingTable, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: table.product,
    serviceType: table.product,
    description,
    url: `${site.url}${path}`,
    provider: { "@id": ORG_ID },
    areaServed: kenya,
    offers: table.tiers.map((t) => ({
      "@type": "Offer",
      name: `${table.product}: ${t.name}`,
      description: t.includes.join(", "),
      priceCurrency: "KES",
      ...(t.setup.plus ? {} : { price: t.setup.kes }),
      priceSpecification: [
        {
          "@type": "PriceSpecification",
          name: table.setupLabel,
          priceCurrency: "KES",
          ...(t.setup.plus ? { minPrice: t.setup.kes } : { price: t.setup.kes }),
        },
        {
          "@type": "UnitPriceSpecification",
          name: table.monthlyLabel,
          priceCurrency: "KES",
          price: t.monthly.kes,
          unitCode: "MON",
          unitText: "month",
        },
      ],
      url: `${site.url}${path}#pricing`,
    })),
  };
}

export function faqSchema(faqs: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
