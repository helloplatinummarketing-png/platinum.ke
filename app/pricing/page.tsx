import Link from "next/link";
import { FinalCta, PricingCards } from "@/components/blocks";
import { JsonLd } from "@/components/JsonLd";
import { pricing, pricingPage as p, seo } from "@/content/site";
import { serviceSchema } from "@/lib/schema";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("pricing");

const columns = [
  { table: pricing.websites, href: "/websites" as const },
  { table: pricing.whatsapp, href: "/whatsapp-automations" as const },
  { table: pricing.ai, href: "/ai-visibility" as const },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema(pricing.websites, seo.websites.description, "/websites"),
          serviceSchema(pricing.whatsapp, seo.whatsapp.description, "/whatsapp-automations"),
          serviceSchema(pricing.ai, seo.ai.description, "/ai-visibility"),
        ]}
      />
      <section className="border-b border-line">
        <div className="container-page py-14 sm:py-20">
          <p className="kicker">Pricing</p>
          <h1 className="mt-3 text-4xl font-extrabold sm:text-5xl">{p.heading}</h1>
          {/* TODO: Victor to confirm notice period for "Cancel anytime". */}
          <p className="mt-4 text-lg text-muted sm:text-xl">{p.sub}</p>
        </div>
      </section>

      <div className="container-page py-10">
        <p className="rounded-card border border-wa/40 bg-wa/10 p-5 text-center text-lg font-bold">{p.bundle}</p>
      </div>

      <section aria-label="Prices for all three services" className="container-page pb-6">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-5">
          {columns.map(({ table, href }) => (
            <div key={table.product}>
              <h2 className="text-2xl font-extrabold whitespace-nowrap">{table.product}</h2>
              <Link href={href} className="mb-4 inline-block text-sm font-bold text-accent">
                Details<span className="sr-only"> about {table.product}</span> →
              </Link>
              <PricingCards table={table} compact />
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-muted">All prices are in Kenyan Shillings (KSh).</p>
      </section>

      <FinalCta {...p.finalCta} />
    </>
  );
}
