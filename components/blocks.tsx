/**
 * Shared page building blocks. All plain HTML/CSS: they work with
 * JavaScript switched off. All text comes in through props from
 * content/site.ts.
 */
import Link from "next/link";
import type { Faq, Link as LinkT, PricingTable } from "@/content/types";
import { ksh, kshMonthly } from "@/lib/format";
import { Icon } from "./Icon";

export function Section({
  id,
  children,
  className = "",
  labelledBy,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`py-14 sm:py-20 ${className}`}>
      <div className="container-page">{children}</div>
    </section>
  );
}

export function SectionHeading({ id, kicker, children }: { id: string; kicker?: string; children: React.ReactNode }) {
  return (
    <div className="mb-8 max-w-2xl sm:mb-10">
      {kicker && <p className="kicker">{kicker}</p>}
      <h2 id={id} className="mt-2 text-3xl font-extrabold sm:text-4xl">
        {children}
      </h2>
    </div>
  );
}

export function CtaButton({ link, variant = "primary" }: { link: LinkT; variant?: "primary" | "ghost" }) {
  return (
    <Link href={link.href} className={`btn btn-${variant}`} data-track="cta-click">
      {link.label}
    </Link>
  );
}

export function PageHero({
  kicker,
  heading,
  sub,
  cta,
}: {
  kicker?: string;
  heading: string;
  sub: string;
  cta?: LinkT;
}) {
  return (
    <section className="border-b border-line bg-[radial-gradient(ellipse_at_top_right,rgb(124_196_255/0.12),transparent_60%)]">
      <div className="container-page py-14 sm:py-24">
        {kicker && <p className="kicker">{kicker}</p>}
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl lg:text-6xl">{heading}</h1>
        <p className="mt-5 max-w-2xl text-lg text-muted sm:text-xl">{sub}</p>
        {cta && (
          <div className="mt-8">
            <CtaButton link={cta} />
          </div>
        )}
      </div>
    </section>
  );
}

/** Numbered or icon cards in a responsive grid. */
export function CardGrid({
  items,
  numbered = false,
  icon,
}: {
  items: { title: string; text?: string; note?: string }[];
  numbered?: boolean;
  icon?: string;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it, i) => (
        <li key={it.title} className="rounded-card border border-line bg-surface p-5 sm:p-6">
          <div className="flex items-start gap-3">
            {numbered ? (
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/15 font-extrabold text-accent">
                {i + 1}
              </span>
            ) : (
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-wa/15 text-wa">
                <Icon name={icon ?? "check"} size={20} />
              </span>
            )}
            <div>
              <h3 className="text-lg font-bold">{it.title}</h3>
              {it.note && <p className="mt-1 text-sm text-muted">{it.note}</p>}
              {it.text && <p className="mt-2 text-muted">{it.text}</p>}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Three tier cards for one product. `compact` is used on /pricing columns. */
export function PricingCards({ table, compact = false }: { table: PricingTable; compact?: boolean }) {
  return (
    <ul className={compact ? "grid gap-4" : "grid gap-4 md:grid-cols-3"}>
      {table.tiers.map((tier, i) => (
        <li
          key={tier.name}
          className={`flex flex-col rounded-card border bg-surface p-5 sm:p-6 ${
            i === 1 ? "border-accent/60" : "border-line"
          }`}
        >
          <h3 className="text-xl font-extrabold">{tier.name}</h3>
          <dl className="mt-3 space-y-1">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">{table.setupLabel}</dt>
              <dd className="text-2xl font-extrabold">{ksh(tier.setup)}</dd>
            </div>
            <div>
              <dt className="sr-only">{table.monthlyLabel}</dt>
              <dd className="text-muted">
                + {kshMonthly(tier.monthly)}
                {!compact && <span className="block text-xs">{table.monthlyLabel}</span>}
              </dd>
            </div>
          </dl>
          <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            {tier.includes.map((inc) => (
              <li key={inc} className="flex gap-2">
                <Icon name="check" size={18} className="mt-0.5 shrink-0 text-wa" />
                <span>{inc}</span>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** FAQ using <details>: opens and closes with no JavaScript. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="divide-y divide-line rounded-card border border-line bg-surface">
      {faqs.map((f) => (
        <details key={f.q} className="group p-5 sm:p-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
            <h3 className="text-base sm:text-lg">{f.q}</h3>
            <span aria-hidden="true" className="text-2xl leading-none text-accent group-open:rotate-45">
              +
            </span>
          </summary>
          <p className="mt-3 text-muted">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** The one clear call to action that ends every page. */
export function FinalCta({ heading, body, button }: { heading: string; body: string; button: LinkT }) {
  return (
    <section aria-labelledby="final-cta" className="py-14 sm:py-20">
      <div className="container-page">
        <div className="rounded-[28px] border border-wa/30 bg-[radial-gradient(ellipse_at_bottom_left,rgb(37_211_102/0.18),transparent_65%)] bg-surface px-5 py-12 text-center sm:px-10 sm:py-16">
          <h2 id="final-cta" className="mx-auto max-w-2xl text-3xl font-extrabold sm:text-4xl">
            {heading}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{body}</p>
          <div className="mt-8">
            <CtaButton link={button} />
          </div>
        </div>
      </div>
    </section>
  );
}
