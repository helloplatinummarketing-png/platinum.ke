/**
 * HOME PAGE STORY: real Nairobi photos + a light layer showing what Platinum does.
 * (docs/platinum-change-order-photo-story.md)
 *
 * LAYER 1 (no JavaScript): the seven chapters stack as normal sections. Each
 * shows its photo (mobile size; lazy except the hero) above its copy, with
 * every bullet visible. The "stage" pieces below are hidden by CSS.
 *
 * LAYER 2 (html.story-flat) and LAYER 3 (html.can-3d): the story is pinned.
 * Photos cross-fade behind one text panel at a time; bullets light up in turn
 * (StoryController). Layer 2 shows a still picture of the lit tower; Layer 3
 * draws the light layer with three.js (three/city.ts).
 *
 * All text comes from content/site.ts (photoStory, photos, photoNotes).
 */
import Image from "next/image";
import { aiTopPick, photoNotes, photos, photoStory, towerSign } from "@/content/site";
import type { PhotoKey, StoryChapter } from "@/content/types";
import { CtaButton } from "@/components/blocks";
import { CHAPTER_STARTS, STORY_SCREENS, stepStartP } from "@/lib/story-timing";
import { PhotoCredit } from "./PhotoCredit";
import { StoryController } from "./StoryController";

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
    <ul
      role="list"
      className={chips ? "ch-steps mt-5 flex flex-wrap gap-2" : "ch-steps mt-5 space-y-3"}
      data-chips={chips || undefined}
    >
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
          <span className={s.title && ch.id !== "whatsapp" ? "ch-step-text block text-muted" : ""}>{s.text}</span>
        </li>
      ))}
    </ul>
  );
}

/** Each distinct photo once, in story order (the closing chapter reuses KICC). */
const bgPhotos: PhotoKey[] = Array.from(new Set(photoStory.map((c) => c.photo)));

/**
 * Layer 2 scroll zones: one per chapter start and per bullet, each covering
 * its stretch of the story (from p to the next zone's p). Wherever the scroll
 * lands, exactly one zone covers the middle of the screen.
 */
const markerStarts = photoStory.flatMap((ch, ci) => {
  const n = ch.steps?.length ?? 0;
  const chips = ch.stepStyle === "chips";
  const list: { ci: number; k: number; p: number }[] = [{ ci, k: chips || n === 0 ? -1 : 0, p: CHAPTER_STARTS[ci] }];
  for (let k = chips ? 0 : 1; k < n; k++) list.push({ ci, k, p: stepStartP(ci, k, n, chips) });
  return list;
});
const markers = markerStarts.map((m, i) => ({ ...m, q: markerStarts[i + 1]?.p ?? 1.02 }));

export function PhotoStory() {
  const ai = photoStory.find((c) => c.id === "ai");
  return (
    <div id="story" className="photo-story" style={{ "--story-screens": STORY_SCREENS } as React.CSSProperties}>
      {/* Layer 2 scroll markers (invisible) */}
      <div className="story-markers story-stage-only" aria-hidden="true">
        {markers.map((m) => (
          <i
            key={`${m.ci}-${m.k}`}
            data-mark-ch={m.ci}
            data-mark-step={m.k}
            style={{ "--p": m.p, "--q": m.q } as React.CSSProperties}
          />
        ))}
      </div>

      <div className="story-pin">
        {/* ---------- Stage: only in Layers 2 and 3 ---------- */}
        <div className="story-bgs story-stage-only" aria-hidden="true">
          {bgPhotos.map((key, i) => (
            <picture key={key} className="story-bg" data-photo={key}>
              {/* Desktop photo from 760px wide; phones get the -m version. Hero loads first, the rest after first paint (StoryController). */}
              <source
                media="(min-width: 760px)"
                {...(i === 0 ? { srcSet: `/images/nairobi/${key}.webp` } : { "data-srcset": `/images/nairobi/${key}.webp` })}
              />
              <img
                alt=""
                width={photos[key].width}
                height={photos[key].height}
                {...(i === 0
                  ? { src: `/images/nairobi/${key}-m.webp`, fetchPriority: "high" as const }
                  : { "data-src": `/images/nairobi/${key}-m.webp` })}
              />
            </picture>
          ))}
          <div className="story-shade" />
        </div>
        {/* Layer 2: a still picture of the lit tower (illustration) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="story-tower story-stage-only" src="/images/nairobi/tower-lit.png" alt="" aria-hidden="true" loading="lazy" width={360} height={520} />
        {/* Layer 3: the light layer */}
        <canvas className="story-city story-stage-only" aria-hidden="true" />
        <svg className="story-lead story-stage-only" aria-hidden="true">
          <path />
          <circle r="5" />
        </svg>
        <div className="story-credits story-stage-only">
          {bgPhotos.map((key) => (
            <PhotoCredit key={key} photo={key} className="story-credit" />
          ))}
        </div>
        <ol className="story-rail story-stage-only" aria-hidden="true">
          {photoStory.map((ch) => (
            <li key={ch.id}>{ch.number ?? "00"}</li>
          ))}
        </ol>
        <p className="story-tag story-stage-only">{photoNotes.illustration}</p>

        {/* ---------- The chapters (Layer 1 sections; Layers 2/3 panels) ---------- */}
        <div className="story-chapters">
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

                  <div className={`ch-copy mt-8 max-w-2xl${isHero ? " show" : ""}`} data-panel={i}>
                    <div className="flex items-baseline gap-3">
                      {ch.number && <span className="ch-num text-4xl leading-none font-extrabold text-amber">{ch.number}</span>}
                      <p className="kicker">{ch.kicker}</p>
                    </div>
                    <Heading ch={ch} level={isHero ? "h1" : "h2"} />
                    {ch.body && <p className="mt-4 text-lg text-muted">{ch.body}</p>}
                    {ch.intro && <p className="mt-4 text-muted">{ch.intro}</p>}

                    {ch.chat && (
                      <div className="ch-chat mt-5 space-y-2">
                        <p className="ch-q ml-[12%] min-h-[2.4em] rounded-2xl rounded-br-sm bg-[#2b6cff] px-4 py-2 text-white" data-text={ch.chat.question}>
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
        </div>
      </div>

      <p className="story-note container-page max-w-4xl py-6 text-xs text-muted">
        {photoNotes.illustration}. {photoNotes.examples}
      </p>

      {/* Layer 3 only: "Switching on the city lights…" while the 3D starts */}
      <div className="story-loader story-stage-only" aria-hidden="true">
        <b>0%</b>
        <span>{photoNotes.loader}</span>
      </div>

      <StoryController
        chapters={photoStory.map((c) => ({
          id: c.id,
          photo: c.photo,
          steps: c.steps?.length ?? 0,
          chips: c.stepStyle === "chips",
          visuals: c.visuals ?? [],
        }))}
        bgPhotos={bgPhotos}
        aiQuestion={ai?.chat?.question ?? ""}
        aiTopPick={aiTopPick}
        towerSign={towerSign}
      />
    </div>
  );
}
