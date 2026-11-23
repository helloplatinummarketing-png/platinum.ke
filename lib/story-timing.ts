/**
 * HOME PHOTO STORY TIMING (from docs/demo-v2/photo-story.js).
 *
 * One scroll position (p, 0 at the top of the story, 1 at the end) drives
 * everything: which chapter shows, which bullet is lit, which photo is up,
 * and which visual the light layer draws. Layer 2 and Layer 3 both use
 * these functions, so text and visuals always change at the same point.
 */

/** Where each chapter starts (7 chapters, then the end). */
export const CHAPTER_STARTS = [0, 0.1, 0.27, 0.43, 0.6, 0.77, 0.91, 1.0] as const;

/** When each chapter's text panel is on screen (Layer 3; gaps = cross-fades). */
export const PANEL_RANGES: readonly [number, number][] = [
  [0, 0.08],
  [0.11, 0.25],
  [0.28, 0.41],
  [0.45, 0.58],
  [0.62, 0.75],
  [0.78, 0.89],
  [0.93, 1.01],
];

/** Light touch only, so the real photos stay clear (one per chapter). */
export const PHOTO_FILTERS = [
  "none",
  "saturate(.75) brightness(.85)",
  "brightness(.9)",
  "none",
  "brightness(1.05) contrast(1.05)",
  "none",
  "brightness(.92)",
] as const;

/** Story scroll length in screen heights (the demo's 1000vh). */
export const STORY_SCREENS = 10;

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

/** Chapter index and progress through it (0..1). */
export function chapterAt(p: number): { ci: number; lt: number } {
  for (let i = 0; i < 7; i++) {
    if (p < CHAPTER_STARTS[i + 1] || i === 6) {
      return { ci: i, lt: clamp((p - CHAPTER_STARTS[i]) / (CHAPTER_STARTS[i + 1] - CHAPTER_STARTS[i]), 0, 1) };
    }
  }
  return { ci: 6, lt: 1 };
}

/**
 * Which bullet is lit at progress `lt` through a chapter with `n` bullets.
 * List chapters: the first bullet lights as the chapter starts.
 * Chips (AI chapter): nothing until half way (the question and answer come first), then -1 → 0..n-1.
 */
export function stepAt(lt: number, n: number, chips = false): number {
  if (n <= 0) return -1;
  if (chips) return lt <= 0.5 ? -1 : clamp(Math.floor(((lt - 0.5) / 0.4) * n), 0, n - 1);
  return clamp(Math.floor(((lt - 0.06) / 0.86) * n), 0, n - 1);
}

/** Progress (0..1) inside bullet k: used to fade its visual in. */
export function stepLocal(lt: number, n: number, k: number): number {
  return clamp(((lt - 0.06) / 0.86) * n - k, 0, 1);
}

/** Where (p) each bullet starts, for the Layer 2 scroll markers. */
export function stepStartP(ci: number, k: number, n: number, chips = false): number {
  const lt = chips ? 0.5 + (0.4 * k) / n + 0.001 : k === 0 ? 0 : 0.06 + (0.86 * k) / n + 0.001;
  return CHAPTER_STARTS[ci] + lt * (CHAPTER_STARTS[ci + 1] - CHAPTER_STARTS[ci]);
}

/** AI chapter: the question finishes typing at 30%, the answer appears at 42%. */
export const AI_TYPE_END = 0.3;
export const AI_ANSWER_AT = 0.42;
