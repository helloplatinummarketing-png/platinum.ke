"use client";

/**
 * Runs the pinned photo story (Layers 2 and 3). Renders nothing itself.
 *
 * ONE scroll position drives the text and the visuals together:
 *  - Layer 2 (html.story-flat): invisible markers (one per chapter start and
 *    per bullet) are watched with IntersectionObserver; the last marker above
 *    the middle of the screen says which chapter and bullet are active.
 *  - Layer 3 (html.can-3d): the 3D light layer (three/city.ts) reports its
 *    smoothed scroll position every frame; the same timing functions
 *    (lib/story-timing.ts) decide the chapter and bullet.
 * Either way, applyState() updates the page: which panel shows, which bullet
 * is "on" (earlier ones "done"), which photo is up, the credit, the chapter
 * rail, the AI question/answer, and the dashed line to the active visual.
 */
import { useEffect } from "react";
import type { PhotoKey } from "@/content/types";
import { track, type TrackEvent } from "@/lib/track";
import { AI_ANSWER_AT, AI_TYPE_END, PANEL_RANGES, PHOTO_FILTERS, stepAt } from "@/lib/story-timing";
import type { CityChapter, LeadTarget } from "./three/city";

type Props = {
  chapters: (CityChapter & { photo: PhotoKey })[];
  bgPhotos: PhotoKey[];
  aiQuestion: string;
  aiTopPick: { badge: string; title: string };
  towerSign: string;
};

const ease = (x: number) => {
  x = Math.max(0, Math.min(1, x));
  return x * x * (3 - 2 * x);
};

export function StoryController({ chapters, bgPhotos, aiQuestion, aiTopPick, towerSign }: Props) {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("story-flat")) return; // Layer 1: nothing to do
    const story = document.getElementById("story");
    const pin = story?.querySelector<HTMLElement>(".story-pin");
    if (!story || !pin) return;

    /* ---------- Elements ---------- */
    const q = <T extends Element>(sel: string) => Array.from(story.querySelectorAll<T>(sel));
    const panels = q<HTMLElement>(".ch-copy[data-panel]");
    const stepLists = chapters.map((c) => q<HTMLElement>(`#ch-${c.id} .ch-step`));
    const bgs = bgPhotos.map((k) => story.querySelector<HTMLElement>(`.story-bg[data-photo="${k}"]`)!);
    const credits = q<HTMLElement>(".story-credit");
    const rail = q<HTMLElement>(".story-rail li");
    const aiIdx = chapters.findIndex((c) => c.id === "ai");
    const aiQ = story.querySelector<HTMLElement>(".ch-q");
    const aiA = story.querySelector<HTMLElement>(".ch-a");
    const lead = story.querySelector<SVGSVGElement>(".story-lead");
    const leadPath = lead?.querySelector("path");
    const leadDot = lead?.querySelector("circle");
    const loader = story.querySelector<HTMLElement>(".story-loader");
    const bgOf = (ci: number) => bgPhotos.indexOf(chapters[ci].photo);

    /* ---------- Photos: hero first, the rest after first paint ---------- */
    const loadPhotos = () => {
      story.querySelectorAll<HTMLElement>("[data-srcset]").forEach((el) => {
        el.setAttribute("srcset", el.dataset.srcset!);
        el.removeAttribute("data-srcset");
      });
      story.querySelectorAll<HTMLImageElement>("img[data-src]").forEach((el) => {
        el.src = el.dataset.src!;
        el.removeAttribute("data-src");
      });
    };
    requestAnimationFrame(() => requestAnimationFrame(loadPhotos));

    /* ---------- Shared page update ---------- */
    let lastCh = -1;
    const reached = new Set<number>();
    const setSteps = (ci: number, k: number) => {
      stepLists[ci]?.forEach((li, j) => {
        li.classList.toggle("on", j === k);
        li.classList.toggle("done", k >= 0 && j < k);
      });
    };
    const setChapter = (ci: number) => {
      if (ci === lastCh) return;
      lastCh = ci;
      story.dataset.ch = String(ci);
      rail.forEach((li, j) => li.classList.toggle("on", j === ci));
      const b = bgOf(ci);
      credits.forEach((c, j) => c.classList.toggle("on", j === b));
      // Analytics: how far people scroll (story-ch-01 … story-ch-06)
      if (ci > 0 && !reached.has(ci)) {
        reached.add(ci);
        track(`story-ch-0${ci}` as TrackEvent);
      }
    };
    const showPanel = (n: number) => panels.forEach((el, i) => el.classList.toggle("show", i === n));
    const setAi = (typed: number, answered: boolean) => {
      if (aiQ) {
        const text = aiQuestion.slice(0, typed) + (typed < aiQuestion.length && typed > 0 ? "▍" : "");
        if (aiQ.textContent !== text) aiQ.textContent = text || " ";
      }
      aiA?.classList.toggle("show", answered);
    };
    const hideLead = () => {
      if (lead) lead.style.opacity = "0";
    };

    /* ---------- LAYER 2: markers + IntersectionObserver ---------- */
    const markers = q<HTMLElement>("[data-mark-ch]");
    let layer2On = true;
    const applyMarkers = () => {
      if (!layer2On) return;
      const line = window.innerHeight / 2;
      let ci = 0;
      let k = chapters[0].steps > 0 ? 0 : -1;
      for (const m of markers) {
        if (m.getBoundingClientRect().top <= line) {
          ci = Number(m.dataset.markCh);
          k = Number(m.dataset.markStep);
        } else break;
      }
      setChapter(ci);
      showPanel(ci);
      bgs.forEach((el, j) => el.classList.toggle("on", j === bgOf(ci)));
      bgs.forEach((el) => (el.style.filter = ""));
      setSteps(ci, k);
      if (ci === aiIdx) setAi(aiQuestion.length, true);
      else if (ci > aiIdx) setAi(aiQuestion.length, true);
      hideLead();
    };
    const io = new IntersectionObserver(applyMarkers, { rootMargin: "-50% 0px -50% 0px" });
    markers.forEach((m) => io.observe(m));
    applyMarkers();

    /* ---------- LAYER 3: the 3D light layer ---------- */
    let handle: { dispose: () => void } | undefined;
    let cancelled = false;
    const readProgress = () => {
      const r = story.getBoundingClientRect();
      const span = Math.max(1, r.height - pin.offsetHeight);
      return Math.max(0, Math.min(1, -r.top / span));
    };

    const applyFrame = (p: number, ci: number, lt: number, target: LeadTarget | null) => {
      setChapter(ci);
      // Panels: shown inside their range (gaps are the photo cross-fades)
      panels.forEach((el, i) => el.classList.toggle("show", p >= PANEL_RANGES[i][0] && p <= PANEL_RANGES[i][1]));
      // Photos: cross-fade near the end of each chapter, gentle zoom 1.02 → 1.07
      const reduced = root.classList.contains("reduced-motion");
      const next = Math.min(chapters.length - 1, ci + 1);
      const mix = ease((lt - 0.85) / 0.15);
      bgs.forEach((el, i) => {
        let o = 0;
        if (i === bgOf(ci)) o += 1 - (bgOf(next) !== i ? mix : 0);
        if (i === bgOf(next) && bgOf(next) !== bgOf(ci)) o += mix;
        el.style.opacity = o.toFixed(3);
        if (o > 0) {
          const z = reduced ? 1.02 : 1.02 + 0.05 * lt;
          const x = reduced ? 0 : (i % 2 ? -1 : 1) * 0.8 * lt;
          el.style.transform = `scale(${z.toFixed(4)}) translateX(${x.toFixed(2)}%)`;
          el.style.filter = PHOTO_FILTERS[ci];
        }
      });
      // Bullets: same timing as the visuals
      const c = chapters[ci];
      setSteps(ci, c.steps ? stepAt(lt, c.steps, c.chips) : -1);
      // AI: the question types itself out, then the answer appears with the lock
      if (ci === aiIdx) setAi(Math.floor(aiQuestion.length * ease(lt / AI_TYPE_END)), lt >= AI_ANSWER_AT);
      else setAi(ci > aiIdx ? aiQuestion.length : 0, ci > aiIdx);
      // Dashed line from the active bullet to its visual (desktop only)
      drawLead(target);
    };

    const drawLead = (t: LeadTarget | null) => {
      if (!lead || !leadPath || !leadDot || !t || t.a < 0.05 || window.innerWidth < 760) return hideLead();
      const from = t.target === "answer" ? aiA : stepLists[t.ch]?.[t.k];
      if (!from) return hideLead();
      const pr = lead.getBoundingClientRect();
      const b = from.getBoundingClientRect();
      const x1 = b.right - pr.left + 8;
      const y1 = b.top - pr.top + b.height / 2;
      const { x: x2, y: y2 } = t;
      leadPath.setAttribute("d", `M${x1},${y1} C${x1 + 80},${y1} ${x2 - 80},${y2} ${x2},${y2}`);
      leadDot.setAttribute("cx", String(x2));
      leadDot.setAttribute("cy", String(y2));
      lead.style.opacity = String(t.a);
    };

    const fallBack = () => {
      root.classList.remove("can-3d", "story-3d-on");
      layer2On = true;
      bgs.forEach((el) => {
        el.style.opacity = "";
        el.style.transform = "";
        el.style.filter = "";
      });
      loader?.classList.add("done");
      applyMarkers();
    };

    let pct = 0;
    let timer: ReturnType<typeof setInterval> | undefined;
    const startLoader = () => {
      const label = loader?.querySelector("b");
      timer = setInterval(() => {
        pct = Math.min(100, pct + (root.classList.contains("story-3d-on") ? 6 : 2));
        if (label) label.textContent = `${pct}%`;
        if (pct >= 100) {
          clearInterval(timer);
          setTimeout(() => loader?.classList.add("done"), 150);
        }
      }, 30);
    };

    const start3d = async () => {
      try {
        const { startCity } = await import("./three/city");
        if (cancelled) return;
        const canvas = story.querySelector<HTMLCanvasElement>(".story-city")!;
        layer2On = false;
        handle = startCity({
          canvas,
          story,
          chapters,
          aiTopPick,
          towerSign,
          readProgress,
          onFrame: (f) => applyFrame(f.p, f.ci, f.lt, f.lead),
        });
        root.classList.add("story-3d-on");
        canvas.addEventListener("webglcontextlost", fallBack, { once: true });
        // Leave Layer 2's photo classes to the 3D loop from now on
        bgs.forEach((el) => el.classList.remove("on"));
      } catch {
        fallBack();
      }
    };

    // For `npm run tower`: draw the lit tower once and hand the picture to the script
    if (/[?&]tower-snapshot/.test(location.search)) {
      void import("./three/city").then(({ snapshotTower }) => {
        const c = document.createElement("canvas");
        c.width = Number(new URLSearchParams(location.search).get("w") ?? 300);
        c.height = Number(new URLSearchParams(location.search).get("h") ?? 440);
        snapshotTower(c, towerSign);
        // Copy to a 2D canvas and round colours to fewer shades, so the PNG stays small
        const out = document.createElement("canvas");
        out.width = c.width;
        out.height = c.height;
        const g = out.getContext("2d")!;
        g.drawImage(c, 0, 0);
        const step = Number(new URLSearchParams(location.search).get("q") ?? 12);
        const img = g.getImageData(0, 0, out.width, out.height);
        for (let i = 0; i < img.data.length; i++) img.data[i] = Math.min(255, Math.round(img.data[i] / step) * step);
        g.putImageData(img, 0, 0);
        (window as unknown as { __towerPng?: string }).__towerPng = out.toDataURL("image/png");
      });
    }

    /*
     * Start the 3D on the visitor's first scroll, touch, mouse move or key
     * press (or 6 seconds after the page has loaded). Until then the story
     * runs as Layer 2 (photos, bullets, still tower), so the first view is
     * fast. The "city lights" loader shows only while the 3D starts.
     */
    const START_EVENTS = ["scroll", "wheel", "touchstart", "pointerdown", "pointermove", "keydown"] as const;
    let started = false;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    const trigger = () => {
      if (started) return;
      started = true;
      START_EVENTS.forEach((e) => window.removeEventListener(e, trigger));
      if (idleTimer) clearTimeout(idleTimer);
      loader?.classList.add("show");
      startLoader();
      // Never keep the loader up for long, even on a slow connection
      setTimeout(() => loader?.classList.add("done"), 2500);
      void start3d();
    };
    const onLoad = () => {
      idleTimer = setTimeout(trigger, 6000);
    };
    if (root.classList.contains("can-3d")) {
      START_EVENTS.forEach((e) => window.addEventListener(e, trigger, { passive: true }));
      if (document.readyState === "complete") onLoad();
      else window.addEventListener("load", onLoad, { once: true });
      // For testing: ?layer=3 starts as soon as the page has loaded
      if (/[?&]layer=3/.test(location.search)) {
        if (document.readyState === "complete") trigger();
        else window.addEventListener("load", trigger, { once: true });
      }
    }

    return () => {
      cancelled = true;
      io.disconnect();
      START_EVENTS.forEach((e) => window.removeEventListener(e, trigger));
      window.removeEventListener("load", onLoad);
      window.removeEventListener("load", trigger);
      if (idleTimer) clearTimeout(idleTimer);
      if (timer) clearInterval(timer);
      handle?.dispose();
      root.classList.remove("story-3d-on");
    };
  }, [chapters, bgPhotos, aiQuestion, aiTopPick, towerSign]);

  return null;
}
