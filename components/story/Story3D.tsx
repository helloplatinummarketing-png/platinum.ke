"use client";

/**
 * The 3D phone sits in the phone column beside the text (above it on phones).
 * Its cards fly towards the bullet points they illustrate, which light up.
 *
 * Loads the 3D phone story (Layer 3) only when:
 *  - the layer script marked this device as capable (html.can-3d), and
 *  - the visitor first scrolls, touches, moves the mouse or presses a key,
 *    or 6 seconds after the page has loaded, whichever comes first.
 * Until then a still picture of the phone (the "poster") is shown, so the
 * hero never looks empty and early taps on buttons are never slowed down.
 *
 * three.js is in a separate file (./three/scene) downloaded only then, and
 * only on the home page. If anything fails, the flat phone (Layer 2) returns.
 */
import { useEffect, useRef } from "react";
import type { Story3DStop } from "./three/scene";

type PosterImg = { src: string; srcSet?: string; sizes?: string; width: number; height: number };

const START_EVENTS = ["scroll", "pointerdown", "pointermove", "touchstart", "keydown", "wheel"] as const;
const START_AFTER_MS = 6000;

export function Story3D({
  screens,
  exampleLabel,
  poster,
}: {
  screens: Story3DStop[];
  exampleLabel: string;
  poster: PosterImg;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("can-3d")) return;

    let cancelled = false;
    let started = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let handle: { dispose: () => void } | undefined;

    const fallBack = () => {
      root.classList.remove("can-3d", "story-3d-on");
      window.dispatchEvent(new Event("story3d-failed"));
    };

    const start = async () => {
      if (started) return;
      started = true;
      removeTriggers();
      try {
        const { startStory3D } = await import("./three/scene");
        const canvas = canvasRef.current;
        if (cancelled || !canvas) return;
        const stops = Array.from(document.querySelectorAll<HTMLElement>("[data-stop]"));
        const story = document.getElementById("story");
        handle = startStory3D({
          canvas,
          stops,
          screens,
          exampleLabel,
          // Light up the bullet(s) the cards are pointing at (-1 = the whole stop)
          onLit: (stop, bullets) => {
            document.querySelectorAll(".is-lit").forEach((el) => el.classList.remove("is-lit"));
            if (stop < 0) return;
            for (const b of bullets) {
              const el = b < 0 ? stops[stop] : stops[stop].querySelector(`[data-bullet="${b}"]`);
              el?.classList.add("is-lit");
            }
          },
          // The stop's colour glows behind the phone
          onTint: (color) => story?.style.setProperty("--story-tint", color),
        });
        root.classList.add("story-3d-on");
        canvas.addEventListener("webglcontextlost", fallBack, { once: true });
      } catch {
        fallBack();
      }
    };

    const trigger = () => void start();
    const removeTriggers = () => {
      START_EVENTS.forEach((e) => window.removeEventListener(e, trigger));
      window.removeEventListener("load", onLoad);
      if (timer) clearTimeout(timer);
    };
    const onLoad = () => {
      timer = setTimeout(trigger, START_AFTER_MS);
    };

    START_EVENTS.forEach((e) => window.addEventListener(e, trigger, { passive: true, once: true }));
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    // For testing: ?layer=3 starts as soon as the page has loaded
    if (/[?&]layer=3/.test(location.search)) {
      if (document.readyState === "complete") trigger();
      else window.addEventListener("load", trigger, { once: true });
    }

    return () => {
      cancelled = true;
      removeTriggers();
      handle?.dispose();
      root.classList.remove("story-3d-on");
    };
  }, [screens, exampleLabel]);

  return (
    <div className="story-3d-stage" aria-hidden="true">
      {/* Still phone shown until the 3D phone is ready */}
      <div className="story-3d-poster">
        <div className="flat-frame">
          {/* lazy: not downloaded at all unless the 3D stage is showing */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img {...poster} alt="" className="flat-screen is-active" loading="lazy" />
        </div>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
