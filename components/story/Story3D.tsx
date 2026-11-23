"use client";

/**
 * LAYER 3: the pinned phone story.
 *
 * Scrolling steps through "cards": each stop's intro, then each of its
 * bullets (the [data-step] elements in StoryStops). The active card is pinned
 * beside a MARKER on the phone's screen (components/story/screens/anchors.ts),
 * joined to it by a line, with a counter at the top ("02 · The problem 2 / 4").
 *
 * Card switching works from the first moment (cheap). The 3D phone itself
 * (three.js, ./three/scene) loads on the visitor's first scroll, touch, mouse
 * move or key press, or 6 seconds after the page has loaded; a still phone
 * shows until then. If 3D fails, the flat phone (Layer 2) returns.
 */
import { useEffect, useRef } from "react";
import { anchorFor } from "./screens/anchors";
import type { Marker, Story3DStop, StoryStep } from "./three/scene";

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
  const lineRef = useRef<SVGLineElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const counterRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("can-3d")) return;
    const story = document.getElementById("story");
    const stage = story?.querySelector<HTMLElement>(".story-grid");
    const canvas = canvasRef.current;
    if (!story || !stage || !canvas) return;

    /* ---------- Steps (cards) ---------- */
    const cards = Array.from(story.querySelectorAll<HTMLElement>(".story-card[data-step]")).sort(
      (a, b) => Number(a.dataset.step) - Number(b.dataset.step),
    );
    const steps: StoryStep[] = cards.map((c) => ({
      stop: Number(c.dataset.stop),
      bullet: Number(c.dataset.bullet),
      anchor: anchorFor(c.dataset.stopId ?? "", Number(c.dataset.bullet)),
    }));

    /** Scroll position -> step number with fraction (0 .. steps.length) */
    const readStep = () => {
      const r = story.getBoundingClientRect();
      const span = Math.max(1, r.height - stage.offsetHeight);
      const p = Math.max(0, Math.min(1, -r.top / span));
      return Math.min(steps.length - 0.0001, p * steps.length);
    };

    /* ---------- Card layout ---------- */
    let active = -1;
    let marker: Marker | null = null;
    const setActive = (n: number) => {
      if (n === active) return;
      cards[active]?.classList.remove("is-active");
      cards[n]?.classList.add("is-active");
      active = n;
      if (counterRef.current) counterRef.current.textContent = cards[n]?.dataset.counter ?? "";
    };

    const layout = () => {
      const s = readStep();
      // Hide the card while the phone flips between chapters
      const n = Math.floor(s);
      const flipping = marker !== null && !marker.visible;
      setActive(flipping ? -1 : n);
      const card = cards[n];
      if (!card || flipping) {
        lineRef.current?.setAttribute("opacity", "0");
        dotRef.current?.setAttribute("opacity", "0");
        return;
      }
      const W = stage.clientWidth;
      const H = stage.clientHeight;
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      const mobile = window.innerWidth < 768;
      // Before the 3D phone is ready: the still phone's spot (see .story-3d-poster in globals.css)
      const m: Marker = marker ?? {
        x: mobile ? W / 2 : W * 0.22 + 130,
        y: mobile ? H * 0.25 : H * 0.5,
        visible: true,
        box: mobile
          ? { left: W / 2 - 75, right: W / 2 + 75, top: H * 0.06, bottom: H * 0.06 + Math.min(H * 0.4, 300) }
          : { left: W * 0.22, right: W * 0.22 + 260, top: H / 2 - 270, bottom: H / 2 + 270 },
      };
      let x: number;
      let y: number;
      let lx: number;
      let ly: number;
      if (mobile) {
        // Under the phone, above the floating WhatsApp button
        x = 16;
        y = Math.min(m.box.bottom + 14, H - h - 84);
        y = Math.max(8, y);
        lx = Math.min(Math.max(m.x, x + 28), x + w - 28);
        ly = y;
      } else {
        // Just right of the phone (left if there's no room), level with the marker
        x = Math.max(m.box.right + 48, m.x + 48);
        if (x + w > W - 24) x = Math.max(24, m.box.left - 48 - w);
        y = Math.min(Math.max(m.y - h / 2, 16), H - h - 16);
        lx = x > m.x ? x : x + w;
        ly = Math.min(Math.max(m.y, y + 24), y + h - 24);
      }
      card.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
      const line = lineRef.current;
      const dot = dotRef.current;
      if (line && dot) {
        const show = marker ? "1" : "0";
        line.setAttribute("x1", String(m.x));
        line.setAttribute("y1", String(m.y));
        line.setAttribute("x2", String(lx));
        line.setAttribute("y2", String(ly));
        dot.setAttribute("cx", String(m.x));
        dot.setAttribute("cy", String(m.y));
        line.setAttribute("opacity", show);
        dot.setAttribute("opacity", show);
      }
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking || root.classList.contains("story-3d-on")) return; // the 3D loop does it when running
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        layout();
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    layout();

    /* ---------- Start the 3D phone ---------- */
    let cancelled = false;
    let started = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let handle: { dispose: () => void } | undefined;

    const fallBack = () => {
      root.classList.remove("can-3d", "story-3d-on");
      cards.forEach((c) => {
        c.classList.remove("is-active");
        c.style.transform = "";
      });
      window.dispatchEvent(new Event("story3d-failed"));
    };

    const start = async () => {
      if (started) return;
      started = true;
      removeTriggers();
      try {
        const { startStory3D } = await import("./three/scene");
        if (cancelled) return;
        handle = startStory3D({
          canvas,
          story,
          steps,
          readStep,
          screens,
          exampleLabel,
          onFrame: (mk) => {
            marker = mk;
            layout();
          },
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
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
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
      {/* Line joining the phone's marker to the active card */}
      <svg className="story-leader" width="100%" height="100%">
        <line ref={lineRef} stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" opacity="0" />
        <circle ref={dotRef} r="6" fill="none" stroke="currentColor" strokeWidth="2" opacity="0" />
      </svg>
      <p ref={counterRef} className="story-counter" />
    </div>
  );
}
