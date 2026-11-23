/**
 * MARKERS on the phone screens: the spot each story card is pinned to.
 *
 * Positions are in the screen drawing's pixels (540 x 1120, see draw.ts),
 * so if you move something in draw.ts, move its marker here too.
 *   intro:   the stop's main card (heading, text, buttons)
 *   bullets: one marker per bullet, in the same order as story[].bullets
 */
export type Anchor = [x: number, y: number];

export const SCREEN_ANCHORS: Record<string, { intro: Anchor; bullets?: Anchor[] }> = {
  hero: { intro: [270, 925] }, // "Free AI Visibility Check" button
  problem: {
    intro: [190, 140], // "What your customer sees"
    bullets: [
      [270, 275], // search: no website
      [270, 495], // 3 missed calls
      [270, 735], // AI recommends a competitor
    ],
  },
  ai: { intro: [180, 410] }, // "Top Pick: Your Clinic"
  website: { intro: [270, 365] }, // the clinic's site
  whatsapp: {
    intro: [200, 130], // chat header
    bullets: [
      [200, 317], // reply to the missed call
      [270, 558], // booked + reminder
      [200, 704], // review request
      [150, 860], // M-Pesa payment
    ],
  },
  how: {
    intro: [110, 170], // "Your plan"
    bullets: [
      [100, 335], // step 1
      [100, 565], // step 2
      [100, 795], // step 3
    ],
  },
  cta: { intro: [270, 950] }, // "Book Your Free Check"
};

/** Marker for a step: bullet < 0 means the stop's intro card. */
export function anchorFor(stopId: string, bullet: number): Anchor {
  const a = SCREEN_ANCHORS[stopId];
  if (!a) return [270, 560];
  return bullet >= 0 && a.bullets?.[bullet] ? a.bullets[bullet] : a.intro;
}
