"use client";

/**
 * LAYER 2 of the home-page story: one flat phone (drawn in CSS) that swaps
 * its screen as the reader scrolls past each stop.
 *
 * Shows only when the layer script added "story-flat" to <html>.
 * Data-friendly: only the current and next screens are downloaded.
 * Reduced motion: screens fade, no tilt.
 */
import { useEffect, useRef, useState } from "react";

export type FlatScreen = {
  id: string;
  img: { src: string; srcSet?: string; sizes?: string; width: number; height: number };
};

export function FlatPhone({ screens }: { screens: FlatScreen[] }) {
  const [on, setOn] = useState(false);
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(2); // how many screens to download so far
  const frame = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  // Turn on (unless the 3D phone is taking over), and follow which stop is in the middle of the screen
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("story-flat")) return;
    // If the 3D phone fails to load, step back in
    const onFail = () => setOn(true);
    window.addEventListener("story3d-failed", onFail);
    // Wait one frame before switching on, so React isn't updating during the first render
    if (!root.classList.contains("can-3d")) requestAnimationFrame(() => setOn(true));
    const stops = Array.from(document.querySelectorAll<HTMLElement>("[data-stop]"));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = Number((e.target as HTMLElement).dataset.stop);
          setActive(i);
          setMounted((m) => Math.max(m, i + 2));
        }
      },
      // A thin line 60% down the screen: whichever stop crosses it is "active"
      { rootMargin: "-60% 0px -40% 0px" },
    );
    stops.forEach((s) => io.observe(s));
    return () => {
      io.disconnect();
      window.removeEventListener("story3d-failed", onFail);
    };
  }, []);

  // A small tilt each time the screen changes (skipped for reduced motion)
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (document.documentElement.classList.contains("reduced-motion")) return;
    frame.current?.animate?.(
      [
        { transform: "rotateY(0deg) scale(1)" },
        { transform: "rotateY(-14deg) scale(0.96)" },
        { transform: "rotateY(0deg) scale(1)" },
      ],
      { duration: 550, easing: "cubic-bezier(.2,.7,.2,1)" },
    );
  }, [active]);

  if (!on) return null;

  return (
    <div className="flat-phone" aria-hidden="true" data-active={screens[active]?.id}>
      <div ref={frame} className="flat-frame">
        {screens.slice(0, mounted).map((s, i) => (
          // Plain <img>: props come from next/image's getImageProps (already optimised)
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.id}
            {...s.img}
            alt=""
            decoding="async"
            className={`flat-screen${i === active ? " is-active" : ""}`}
            data-screen={s.id}
          />
        ))}
      </div>
      <ol className="flat-dots">
        {screens.map((s, i) => (
          <li key={s.id} className={i === active ? "on" : undefined} />
        ))}
      </ol>
    </div>
  );
}
