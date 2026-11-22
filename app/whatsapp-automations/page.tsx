import { CardGrid, FaqList, FinalCta, PageHero, PricingCards, Section, SectionHeading } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { ToCome } from "@/components/ToCome";
import { cta, pricing, seo, whatsappPage as p } from "@/content/site";
import { faqSchema, serviceSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("whatsapp");

export default function WhatsAppPage() {
  return (
    <>
      <JsonLd
        data={[serviceSchema(pricing.whatsapp, seo.whatsapp.description, "/whatsapp-automations"), faqSchema(p.faqs)]}
      />
      <PageHero kicker="WhatsApp Automations" heading={p.hero.heading} sub={p.hero.sub} cta={cta.book} />

      <Section labelledBy="problem-title" className="border-b border-line">
        <h2 id="problem-title" className="sr-only">
          The problem
        </h2>
        <div className="max-w-3xl space-y-5 text-xl sm:text-2xl">
          <p className="font-bold">{p.problem[0]}</p>
          <p className="text-muted">{p.problem[1]}</p>
        </div>
      </Section>

      <Section labelledBy="auto-title" className="border-b border-line">
        <SectionHeading id="auto-title" kicker="7 automations">
          {p.automationsHeading}
        </SectionHeading>
        <CardGrid items={p.automations} numbered />
      </Section>

      <Section id="pricing" labelledBy="price-title" className="border-b border-line">
        <SectionHeading id="price-title" kicker="Pricing">
          {p.pricingHeading}
        </SectionHeading>
        <PricingCards table={pricing.whatsapp} />
        <p className="mt-6 max-w-3xl text-sm text-muted">
          {p.toolCost.before}
          {p.toolCost.figure ?? <ToCome what="updated cost" />}
          {p.toolCost.after}
        </p>
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
