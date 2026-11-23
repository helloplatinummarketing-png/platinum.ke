/**
 * HOME PAGE STORY: real Nairobi photos + a light layer showing what Platinum does.
 * (docs/platinum-change-order-photo-story.md)
 *
 * LAYER 1 (this file, no JavaScript needed): the seven chapters stack as normal
 * sections. Each shows its photo (mobile size; lazy except the hero) above
 * its copy, with every bullet visible. No canvas, no lines.
 *
 * Layers 2 and 3 (change-order steps 3 and 4) build on the same HTML:
 * every chapter is [data-chapter] and every bullet is [data-step].
 *
 * All text comes from content/site.ts (photoStory, photos, photoNotes).
 */
import Image from "next/image";
import { photoNotes, photos, photoStory } from "@/content/site";
import type { StoryChapter } from "@/content/types";
import { CtaButton } from "@/components/blocks";
import { PhotoCredit } from "./PhotoCredit";

/** Heading with the accent words in amber (e.g. "More Customers"). */
function Heading({ ch, level }: { ch: StoryChapter; level: "h1" | "h2" }) {
  const Tag = level;
  const cls =
    level === "h1"
      ? "mt-3 text-4xl font-extrabold sm:text-5xl lg:text-6xl"
      : "mt-2 text-3xl font-extrabold sm:text-4xl";
  const parts = ch.headingAccent ? ch.heading.split(ch.headingAccent) : [ch.heading];
  return (
    <Tag id={`ch-${ch.id}-title`} className={cls}>
      {parts[0]}
      {ch.headingAccent && parts.length > 1 && <span className="text-amber">{ch.headingAccent}</span>}
      {parts[1]}
    </Tag>
  );
}

function Steps({ ch }: { ch: StoryChapter }) {
  if (!ch.steps) return null;
  const chips = ch.stepStyle === "chips";
  const dot = ch.id === "problem" ? "bg-danger" : ch.id === "whatsapp" ? "bg-wa" : "bg-amber";
  return (
    <ul role="list" className={chips ? "ch-steps mt-5 flex flex-wrap gap-2" : "ch-steps mt-5 space-y-3"} data-chips={chips || undefined}>
      {ch.steps.map((s, n) => (
        <li
          key={s.text}
          data-step={n}
          className={
            chips
              ? "ch-step relative rounded-full border border-white/15 py-1.5 pr-3 pl-7 text-sm"
              : "ch-step relative pl-7"
          }
        >
          <span
            aria-hidden="true"
            className={`ch-dot absolute rounded-full ${dot} ${
              chips ? "top-1/2 left-2.5 size-2.5 -translate-y-1/2" : "top-[0.45em] left-0 size-3"
            }`}
          />
          {s.title && <strong>{s.title} </strong>}
          <span className={s.title && ch.id !== "whatsapp" ? "block text-muted" : ""}>{s.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function PhotoStory() {
  return (
    <div id="story" className="photo-story">
      {photoStory.map((ch, i) => {
        const photo = photos[ch.photo];
        const isHero = i === 0;
        return (
          <section
            key={ch.id}
            id={`ch-${ch.id}`}
            data-chapter={i}
            data-chapter-id={ch.id}
            aria-labelledby={`ch-${ch.id}-title`}
            className="photo-ch border-b border-line"
          >
            <div className="container-page max-w-4xl py-12 sm:py-16">
              {/* Layer 1 photo (mobile size), above the copy */}
              <figure className="ch-photo">
                <Image
                  src={`/images/nairobi/${ch.photo}-m.webp`}
                  alt={photo.alt}
                  width={photo.width}
                  height={photo.height}
                  unoptimized /* already optimised WebP; served as-is */
                  loading={isHero ? "eager" : "lazy"}
                  fetchPriority={isHero ? "high" : "auto"}
                  sizes="(min-width: 896px) 864px, 100vw"
                  className="h-auto w-full rounded-card"
                />
                <figcaption className="mt-2 text-xs text-muted">
                  <PhotoCredit photo={ch.photo} />
                </figcaption>
              </figure>

              <div className="ch-copy mt-8 max-w-2xl">
                <div className="flex items-baseline gap-3">
                  {ch.number && <span className="text-4xl leading-none font-extrabold text-amber">{ch.number}</span>}
                  <p className="kicker">{ch.kicker}</p>
                </div>
                <Heading ch={ch} level={isHero ? "h1" : "h2"} />
                {ch.body && <p className="mt-4 text-lg text-muted">{ch.body}</p>}
                {ch.intro && <p className="mt-4 text-muted">{ch.intro}</p>}

                {ch.chat && (
                  <div className="ch-chat mt-5 space-y-2" data-chat>
                    <p className="ch-q ml-[12%] rounded-2xl rounded-br-sm bg-[#2b6cff] px-4 py-2 text-white">
                      {ch.chat.question}
                    </p>
                    <p className="ch-a mr-[12%] rounded-2xl rounded-bl-sm border-[3px] border-wa bg-white px-4 py-2 text-sm text-[#111]">
                      {ch.chat.answer.before}
                      <strong>{ch.chat.answer.strong}</strong>
                      {ch.chat.answer.after}
                    </p>
                  </div>
                )}

                <Steps ch={ch} />

                {ch.priceStrip && (
                  <p className="mt-5 flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5 text-sm">
                    <span>{ch.priceStrip.label}</span>
                    <b className="text-amber">{ch.priceStrip.price}</b>
                  </p>
                )}

                {ch.ctas && (
                  <div className="mt-7 flex flex-wrap gap-3">
                    {ch.ctas.map((c, n) => (
                      <CtaButton key={c.label} link={c} variant={n === 0 ? "primary" : "ghost"} />
                    ))}
                  </div>
                )}

                {ch.badges && (
                  <ul className="mt-5 flex flex-wrap gap-2" aria-label="Good to know">
                    {ch.badges.map((b) => (
                      <li key={b} className="rounded-full border border-white/20 px-3 py-1 text-xs text-muted">
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>
        );
      })}
      <p className="container-page max-w-4xl py-6 text-xs text-muted">
        {photoNotes.illustration}. {photoNotes.examples}
      </p>
    </div>
  );
}
