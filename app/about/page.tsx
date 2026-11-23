import Image from "next/image";
import { FinalCta, Section, SectionHeading } from "@/components/blocks";
import { ToCome } from "@/components/ToCome";
import { PhotoCredit } from "@/components/story/PhotoCredit";
import { aboutPage as p, photoNotes, photos } from "@/content/site";
import type { PhotoKey } from "@/content/types";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("about");

export default function AboutPage() {
  return (
    <>
      <section className="border-b border-line">
        <div className="container-page py-14 sm:py-24">
          <p className="kicker">About us</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold sm:text-5xl lg:text-6xl">{p.heading}</h1>
          <div className="mt-8 max-w-2xl space-y-4 text-lg text-muted">
            {p.story.map((para, i) => (
              <p key={i} className={i === 1 ? "text-xl font-bold text-ink" : ""}>
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      <Section labelledBy="team-title" className="border-b border-line">
        <SectionHeading id="team-title">{p.teamHeading}</SectionHeading>
        {/* TODO: confirm consent for name and photo (each person) before launch. */}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {p.team.map((m) => (
            <li key={m.name} className="rounded-card border border-line bg-surface p-5">
              <Image
                src={m.photo ?? "/team/placeholder.svg"}
                alt={m.photo ? `Photo of ${m.name}` : `Photo of ${m.name} to come`}
                width={160}
                height={160}
                unoptimized={!m.photo} /* the placeholder is a tiny SVG */
                className="size-20 rounded-full bg-surface-2"
              />
              <h3 className="mt-4 text-lg font-extrabold">{m.name}</h3>
              <p className="text-sm text-accent">{m.role}</p>
              <p className="mt-2 text-sm text-muted">{m.bio ?? <ToCome what="bio" />}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section labelledBy="values-title">
        <SectionHeading id="values-title">{p.valuesHeading}</SectionHeading>
        <ul className="grid gap-4 md:grid-cols-3">
          {p.values.map((v) => (
            <li key={v.title} className="rounded-card border border-line bg-surface p-6">
              <h3 className="text-xl font-extrabold">{v.title}</h3>
              <p className="mt-2 text-muted">{v.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Photo credits for the home-page story (content/site.ts → photos) */}
      <Section id="photo-credits" labelledBy="credits-title" className="border-t border-line">
        <h2 id="credits-title" className="text-xl font-extrabold">
          {photoNotes.creditsHeading}
        </h2>
        <p className="mt-2 text-sm text-muted">{photoNotes.creditsIntro}</p>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {(Object.keys(photos) as PhotoKey[]).map((k) => (
            <li key={k}>
              {photos[k].alt}: <PhotoCredit photo={k} className="text-muted" />
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">{photoNotes.illustration}.</p>
      </Section>

      <FinalCta {...p.finalCta} />
    </>
  );
}
