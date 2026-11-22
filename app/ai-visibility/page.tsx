import { CardGrid, FinalCta, PageHero, PricingCards, Section, SectionHeading } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { aiPage as p, cta, pricing, seo } from "@/content/site";
import { serviceSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("ai");

export default function AiVisibilityPage() {
  return (
    <>
      <JsonLd data={serviceSchema(pricing.ai, seo.ai.description, "/ai-visibility")} />
      <PageHero kicker="AI Visibility (GEO)" heading={p.hero.heading} sub={p.hero.sub} cta={cta.aiCheck} />

      <Section labelledBy="problem-title" className="border-b border-line">
        <h2 id="problem-title" className="sr-only">
          The problem
        </h2>
        <div className="max-w-3xl space-y-5 text-xl sm:text-2xl">
          <p className="font-bold">{p.problem[0]}</p>
          <p className="text-muted">{p.problem[1]}</p>
        </div>
      </Section>

      <Section labelledBy="do-title" className="border-b border-line">
        <SectionHeading id="do-title">{p.whatWeDoHeading}</SectionHeading>
        <CardGrid items={p.whatWeDo} numbered />
      </Section>

      <Section id="pricing" labelledBy="price-title">
        <SectionHeading id="price-title" kicker="Pricing">
          {p.pricingHeading}
        </SectionHeading>
        <PricingCards table={pricing.ai} />
      </Section>

      <FinalCta {...p.finalCta} />
    </>
  );
}
