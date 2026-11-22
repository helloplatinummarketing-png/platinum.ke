import Link from "next/link";
import { homeServices, socialProof } from "@/content/site";
import { Section, SectionHeading } from "@/components/blocks";
import { Icon } from "@/components/Icon";
import { ToCome } from "@/components/ToCome";

export function Services() {
  return (
    <Section id="services" labelledBy="services-title" className="border-b border-line">
      <SectionHeading id="services-title" kicker="Services">
        {homeServices.heading}
      </SectionHeading>
      <ul className="grid gap-4 md:grid-cols-3">
        {homeServices.cards.map((c) => (
          <li key={c.label} className="flex flex-col rounded-card border border-line bg-surface p-6">
            <span className="grid size-11 place-items-center rounded-xl bg-accent/15 text-accent">
              <Icon name={c.icon} />
            </span>
            <p className="kicker mt-5">{c.label}</p>
            <h3 className="mt-2 text-xl font-extrabold">{c.title}</h3>
            <p className="mt-3 flex-1 text-muted">{c.text}</p>
            <Link href={c.link.href} className="mt-5 font-bold text-accent" data-track="cta-click">
              {c.link.label} <span aria-hidden="true">→</span>
              <span className="sr-only"> about {c.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/**
 * HONESTY FIX: placeholders only. Real testimonials and real numbers go in
 * content/site.ts (socialProof) once clients approve them.
 */
export function SocialProof() {
  return (
    <Section labelledBy="proof-title" className="border-b border-line">
      <SectionHeading id="proof-title">{socialProof.heading}</SectionHeading>

      <dl className="mb-8 grid gap-3 rounded-card border border-line bg-surface p-5 sm:grid-cols-3">
        {socialProof.stats.map((s) => (
          <div key={s.label} className="text-center">
            <dd className="text-3xl font-extrabold">{s.value ?? <ToCome />}</dd>
            <dt className="mt-1 text-sm text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>

      <ul className="grid gap-4 md:grid-cols-3">
        {socialProof.testimonials.map((t, i) => (
          <li key={i} className="rounded-card border border-dashed border-line bg-surface p-6">
            {t.quote ? (
              <figure>
                <blockquote className="text-lg">“{t.quote}”</blockquote>
                <figcaption className="mt-4 text-sm text-muted">
                  {t.name}
                  {t.business && `, ${t.business}`}
                </figcaption>
              </figure>
            ) : (
              <p className="text-muted">
                <ToCome what="real client testimonial" />
              </p>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}
