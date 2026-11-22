import { CardGrid, FaqList, FinalCta, PageHero, PricingCards, Section, SectionHeading } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { cta, pricing, seo, websitesPage as p } from "@/content/site";
import { faqSchema, serviceSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("websites");

export default function WebsitesPage() {
  return (
    <>
      <JsonLd data={[serviceSchema(pricing.websites, seo.websites.description, "/websites"), faqSchema(p.faqs)]} />
      <PageHero kicker="Websites" heading={p.hero.heading} sub={p.hero.sub} cta={cta.book} />

      <Section labelledBy="get-title" className="border-b border-line">
        <SectionHeading id="get-title">{p.whatYouGet.heading}</SectionHeading>
        <CardGrid items={p.whatYouGet.items} />
      </Section>

      <Section id="pricing" labelledBy="price-title" className="border-b border-line">
        <SectionHeading id="price-title" kicker="Pricing">
          {p.pricingHeading}
        </SectionHeading>
        <PricingCards table={pricing.websites} />
        <p className="mt-6 max-w-3xl text-sm text-muted">{p.pricingNote}</p>
      </Section>

      <Section labelledBy="faq-title">
        <SectionHeading id="faq-title" kicker="FAQ">
          Questions
        </SectionHeading>
        <FaqList faqs={p.faqs} />
      </Section>

      <FinalCta {...p.finalCta} />
    </>
  );
}
