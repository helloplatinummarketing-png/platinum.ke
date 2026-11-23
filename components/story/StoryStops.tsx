/**
 * The home-page phone story. The same HTML serves every layer; CSS and the
 * layer script (lib/layer-script.ts) decide what shows:
 *
 * LAYER 1 (no JavaScript): seven stacked sections, each with its copy and a
 *   pre-made picture of its phone screen (public/story/<id>.webp, made by
 *   `npm run screens`).
 * LAYER 2 (html.story-flat): the per-stop pictures hide; one flat phone
 *   (FlatPhone) stays in view and swaps screens as you scroll.
 * LAYER 3 (html.can-3d): a full-screen 3D phone (Story3D) stays in view behind
 *   the text; the text scrolls over it (left on desktop, bottom card on phones).
 */
import Image, { getImageProps } from "next/image";
import { site, story } from "@/content/site";
import { CtaButton } from "@/components/blocks";
import { Icon } from "@/components/Icon";
import { FlatPhone, type FlatScreen } from "./FlatPhone";
import { Story3D } from "./Story3D";

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
  // Optimised image URLs for the Layer 2 phone (small on phones, 280px on desktop)
  const flatScreens: FlatScreen[] = story.map((s) => {
    const { props } = getImageProps({
      src: `/story/${s.id}.webp`,
      alt: "",
      width: SCREEN_PICTURE.width,
      height: SCREEN_PICTURE.height,
      sizes: "(min-width: 768px) 280px, 150px",
    });
    return {
      id: s.id,
      img: { src: props.src, srcSet: props.srcSet, sizes: props.sizes, width: SCREEN_PICTURE.width, height: SCREEN_PICTURE.height },
    };
  });

  // Text for the 3D phone's screens and pop-out cards (Layer 3)
  const screens3d = story.map((s) => ({ id: s.id, screen: s.screen, popCards: s.popCards }));

  return (
    <div id="story" className="story border-b border-line">
      {/* Layer 3 stage (hidden unless html.can-3d) */}
      <Story3D screens={screens3d} exampleLabel={site.exampleLabel} poster={flatScreens[0].img} />
      <div className="story-grid container-page">
        <div className="story-stops">
          {story.map((stop, i) => {
            const Heading = i === 0 ? "h1" : "h2";
            const headingId = `stop-${stop.id}-title`;
            const numbered = stop.id === "how";
            const isProblem = stop.id === "problem";
            return (
              <section
                key={stop.id}
                id={`stop-${stop.id}`}
                data-stop={i}
                aria-labelledby={headingId}
                className="story-stop border-b border-line last:border-b-0"
              >
                <div className="grid w-full items-center gap-10 py-14 sm:py-20 md:grid-cols-[1fr_auto] md:gap-16">
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

                  {/* Layer 1 picture (hidden in Layers 2 and 3) */}
                  <div className="stop-picture">
                    <PhonePicture id={stop.id} alt={stop.screenAlt} eager={i === 0} />
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        {/* Layer 2 phone (hidden in Layer 1) */}
        <div className="story-phone-slot">
          <FlatPhone screens={flatScreens} />
        </div>
      </div>
    </div>
  );
}
