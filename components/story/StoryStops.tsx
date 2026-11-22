/**
 * LAYER 1 of the home-page phone story: no JavaScript needed.
 * The seven stops as normal stacked sections, each with its copy and a
 * pre-made picture of the phone screen (public/story/<id>.webp, made by
 * `npm run screens`). Layers 2 and 3 are added on top of this later.
 */
import Image from "next/image";
import { story } from "@/content/site";
import { CtaButton } from "@/components/blocks";
import { Icon } from "@/components/Icon";

/** Picture size made by scripts/render-screens.mts */
export const SCREEN_PICTURE = { width: 405, height: 840 };

export function PhonePicture({ id, alt, eager = false }: { id: string; alt: string; eager?: boolean }) {
  return (
    <div className="mx-auto w-[220px] shrink-0 rounded-[2.4rem] border-[7px] border-platinum/85 bg-black p-[3px] shadow-[0_20px_60px_rgb(0_0_0/0.55)] sm:w-[260px]">
      <Image
        src={`/story/${id}.webp`}
        alt={alt}
        width={SCREEN_PICTURE.width}
        height={SCREEN_PICTURE.height}
        sizes="(min-width: 640px) 260px, 220px"
        className="h-auto w-full rounded-[2rem]"
        loading={eager ? "eager" : "lazy"}
      />
    </div>
  );
}

export function StoryStops() {
  return (
    <div id="story">
      {story.map((stop, i) => {
        const Heading = i === 0 ? "h1" : "h2";
        const headingId = `stop-${stop.id}-title`;
        const numbered = stop.id === "how";
        const isProblem = stop.id === "problem";
        return (
          <section
            key={stop.id}
            id={`stop-${stop.id}`}
            aria-labelledby={headingId}
            className="border-b border-line"
          >
            <div className="container-page grid items-center gap-10 py-14 sm:py-20 md:grid-cols-[1fr_auto] md:gap-16">
              <div className="max-w-xl">
                <p className="kicker">{stop.kicker}</p>
                <Heading
                  id={headingId}
                  className={`mt-3 font-extrabold ${
                    i === 0 ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl"
                  }`}
                >
                  {stop.heading}
                </Heading>
                {stop.body && <p className="mt-4 text-lg text-muted">{stop.body}</p>}

                {stop.bullets && (
                  <ul className="mt-6 space-y-4">
                    {stop.bullets.map((b, n) => (
                      <li key={b.text} className="flex gap-3">
                        {numbered ? (
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent/15 font-extrabold text-accent">
                            {n + 1}
                          </span>
                        ) : (
                          <span
                            className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
                              isProblem ? "bg-danger/15 text-danger" : "bg-wa/15 text-wa"
                            }`}
                          >
                            <Icon name={isProblem ? "alert" : "check"} size={16} />
                          </span>
                        )}
                        <p>
                          {b.title && <strong className="block">{b.title}</strong>}
                          <span className={b.title ? "text-muted" : ""}>{b.text}</span>
                        </p>
                      </li>
                    ))}
                  </ul>
                )}

                {stop.ctas && (
                  <div className="mt-8 flex flex-wrap gap-3">
                    {stop.ctas.map((c, n) => (
                      <CtaButton key={c.href} link={c} variant={n === 0 ? "primary" : "ghost"} />
                    ))}
                  </div>
                )}
              </div>

              <PhonePicture id={stop.id} alt={stop.screenAlt} eager={i === 0} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
