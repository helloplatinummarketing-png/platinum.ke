/**
 * LAYER 3: the 3D phone story (ported from docs/demo/index.html).
 *
 * The story is pinned and steps through cards (Story3D.tsx). For each step
 * the phone turns and zooms towards a MARKER on its screen; the page card is
 * pinned beside that marker. Between chapters (stops) the phone does a full
 * 360° flip and the screen swaps while its back faces the viewer.
 *
 * Every frame this reports the marker's position on screen (onFrame), so the
 * card and its connecting line follow the phone.
 *
 * Also from the demo, kept quieter so the cards stay the focus: pop-out 3D
 * cards at the start of each chapter (on the far side of the phone), customer
 * dots that scatter at the problem and gather afterwards, and a camera dive at
 * the end. The stop colour glows behind the phone.
 *
 * Rules: pauses when off-screen or the tab is hidden; small screens (<400px)
 * get at most 3 pop-out cards and a lower pixel ratio; reduced motion turns
 * off flips, flying cards and camera moves.
 */
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  Color,
  DirectionalLight,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from "three";
import { drawScreen, SCREEN_H, SCREEN_W, type ScreenStop } from "../screens/draw";

export type Story3DStop = ScreenStop & { popCards: { title: string; sub?: string; bullet?: number }[] };
/** One scroll step: which stop, which bullet (-1 = the stop's intro), and its marker on the screen. */
export type StoryStep = { stop: number; bullet: number; anchor: [number, number] };
/** Marker position on the canvas (px) and the phone's outline on screen (px). */
export type Marker = {
  x: number;
  y: number;
  visible: boolean;
  box: { left: number; right: number; top: number; bottom: number };
};

export type Story3DOptions = {
  canvas: HTMLCanvasElement;
  /** The #story element (used to pause when it's off-screen, and for the glow colour). */
  story: HTMLElement;
  steps: StoryStep[];
  /** Current step with fraction, from the scroll position (0 .. steps.length). */
  readStep: () => number;
  /** Same order as the stops: screen text and pop-card text from content/site.ts. */
  screens: Story3DStop[];
  exampleLabel: string;
  /** Every frame: where the marker is on the canvas (px), whether it faces the viewer, and the phone's outline. */
  onFrame?: (marker: Marker) => void;
};

/* ----------------------------- look & feel ----------------------------- */

/** Glow colour per stop (placeholder palette, from the demo's backgrounds, brightened). */
const TINT = ["#1d3b8f", "#7a1f2b", "#2b4fbf", "#1d5a8f", "#0f7a4f", "#3a3f9f", "#0f7a4f"];
/** Resting turn of the phone per stop: [y, x] radians. */
const TILT: [number, number][] = [
  [0.32, 0.06],
  [0.3, -0.04],
  [0.28, 0.05],
  [0.3, -0.04],
  [0.26, 0.05],
  [0.3, 0.02],
  [0.12, 0],
];
/** Half-width of the 360° flip around each chapter boundary, in steps. */
const FLIP_HALF = 0.3;

type Kind = "float" | "fall" | "hero" | "orbit";
type CardStyle = {
  w: number;
  h: number;
  bg: string | [string, string];
  fg: string;
  subFg?: string;
  border?: string;
  center?: boolean;
  size: number;
  subSize?: number;
  /** Where the card flies to, relative to the phone: x, y, z (x is mirrored to the far side) */
  to: [number, number, number];
  delay: number;
  kind?: Kind;
  special?: "topPick";
};

/** Pop-out card styles per stop (by position). The TEXT comes from content (story[].popCards). */
const CARD_STYLES: Record<string, CardStyle[]> = {
  problem: [
    { w: 2.6, h: 0.8, bg: "#2a1216", fg: "#ff8a8a", subFg: "#ddd", border: "#ff6b6b", size: 36, subSize: 26, to: [1.9, 1.4, 0.8], delay: 0.0, kind: "fall" },
    { w: 2.4, h: 0.8, bg: "#2a1216", fg: "#ff6b6b", subFg: "#ddd", border: "#ff6b6b", size: 40, subSize: 26, to: [2.1, 0.2, 1.0], delay: 0.12, kind: "fall" },
    { w: 2.6, h: 0.8, bg: "#2a1216", fg: "#ff8a8a", subFg: "#ddd", border: "#ff6b6b", size: 32, subSize: 26, to: [1.8, -1.1, 0.9], delay: 0.24, kind: "fall" },
  ],
  ai: [
    { w: 2.8, h: 0.75, bg: "#2b6cff", fg: "#fff", size: 32, to: [1.8, 1.6, 0.8], delay: 0.0 },
    { w: 2.6, h: 1.6, bg: "#ffffff", fg: "#111", subFg: "#555", border: "#25D366", size: 64, subSize: 28, to: [1.6, -0.6, 1.4], delay: 0.15, kind: "hero", special: "topPick" },
  ],
  website: [
    { w: 2.4, h: 1.1, bg: ["#1d3b8f", "#4fa3ff"], fg: "#fff", subFg: "#fff", size: 56, subSize: 28, to: [1.9, 1.5, 0.9], delay: 0.0 },
    { w: 1.7, h: 0.6, bg: "#25D366", fg: "#04210f", center: true, size: 40, to: [2.0, 0.4, 1.2], delay: 0.08 },
    { w: 2.0, h: 0.8, bg: "#ffffff", fg: "#111", subFg: "#666", size: 34, subSize: 24, to: [1.9, -0.6, 0.8], delay: 0.16 },
    { w: 2.0, h: 0.8, bg: "#ffffff", fg: "#f5a623", subFg: "#666", size: 34, subSize: 24, to: [1.6, -1.6, 1.1], delay: 0.24 },
    { w: 1.7, h: 0.6, bg: "#1d3b8f", fg: "#fff", center: true, size: 38, to: [0.4, -2.3, 1.3], delay: 0.32 },
  ],
  whatsapp: [
    { w: 2.2, h: 0.6, bg: "#fde7e7", fg: "#c0392b", center: true, size: 34, to: [1.9, 1.7, 0.8], delay: 0.0, kind: "orbit" },
    { w: 2.8, h: 0.8, bg: "#ffffff", fg: "#111", subFg: "#111", size: 30, subSize: 30, to: [2.0, 0.8, 1.0], delay: 0.08, kind: "orbit" },
    { w: 2.6, h: 0.8, bg: "#dcf8c6", fg: "#111", subFg: "#355", size: 34, subSize: 26, to: [1.9, -0.2, 1.2], delay: 0.16, kind: "orbit" },
    { w: 2.4, h: 0.7, bg: "#ffffff", fg: "#f5a623", size: 34, to: [1.8, -1.1, 0.9], delay: 0.24, kind: "orbit" },
    { w: 2.3, h: 0.8, bg: "#ffffff", fg: "#2e7d32", subFg: "#111", size: 30, subSize: 26, to: [1.6, -2.0, 1.1], delay: 0.32, kind: "orbit" },
  ],
  how: [
    { w: 2.0, h: 0.8, bg: "#1b2045", fg: "#fff", subFg: "#a9b1c1", border: "#7cc4ff", size: 38, subSize: 24, to: [1.9, 1.3, 0.9], delay: 0.0 },
    { w: 2.0, h: 0.8, bg: "#1b2045", fg: "#fff", subFg: "#a9b1c1", border: "#7cc4ff", size: 38, subSize: 24, to: [2.1, 0.1, 1.1], delay: 0.12 },
    { w: 2.0, h: 0.8, bg: "#1b2045", fg: "#25D366", subFg: "#a9b1c1", border: "#25D366", size: 38, subSize: 24, to: [1.9, -1.1, 1.3], delay: 0.24 },
  ],
  cta: [{ w: 2.8, h: 0.7, bg: "#25D366", fg: "#04210f", center: true, size: 40, to: [0, -2.4, 1.4], delay: 0.2, kind: "hero" }],
};

/* ------------------------------- helpers ------------------------------- */

const FONT = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const clamp01 = (x: number) => clamp(x, 0, 1);
const ease = (x: number) => {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function roundedShape(w: number, h: number, r: number) {
  const s = new Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

/** Draw one pop-out card onto a canvas. */
function drawCard(style: CardStyle, text: { title: string; sub?: string }, extra: { rating?: string }) {
  const c = document.createElement("canvas");
  c.width = Math.round(style.w * 200);
  c.height = Math.round(style.h * 200);
  const g = c.getContext("2d")!;
  const W = c.width;
  const H = c.height;

  roundRect(g, 4, 4, W - 8, H - 8, Math.min(style.special ? 36 : 40, H / 2 - 4));
  if (Array.isArray(style.bg)) {
    const gr = g.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, style.bg[0]);
    gr.addColorStop(1, style.bg[1]);
    g.fillStyle = gr;
  } else g.fillStyle = style.bg;
  g.fill();
  if (style.border) {
    g.strokeStyle = style.border;
    g.lineWidth = style.special ? 10 : 6;
    g.stroke();
  }

  if (style.special === "topPick") {
    // "TOP PICK: Your Clinic" -> badge + name
    const [badge, name] = text.title.includes(": ") ? text.title.split(": ") : ["", text.title];
    g.fillStyle = "#25D366";
    g.font = `900 34px ${FONT}`;
    g.fillText(badge, 40, 70);
    g.fillStyle = style.fg;
    g.font = `900 ${style.size}px ${FONT}`;
    g.fillText(name, 40, 150);
    if (extra.rating) {
      g.fillStyle = "#f5a623";
      g.font = `800 44px ${FONT}`;
      g.fillText(extra.rating, 40, 215);
    }
    if (text.sub) {
      g.fillStyle = style.subFg ?? "#555";
      g.font = `600 ${style.subSize ?? 28}px ${FONT}`;
      g.fillText(text.sub, 40, 275);
    }
    return c;
  }

  const lines: [string, number, number, string][] = [[text.title, style.size, 800, style.fg]];
  if (text.sub) lines.push([text.sub, style.subSize ?? 26, 500, style.subFg ?? style.fg]);
  const total = lines.reduce((n, l) => n + l[1] * 1.25, 0);
  let y = (H - total) / 2;
  g.textAlign = style.center ? "center" : "left";
  for (const [t, size, weight, color] of lines) {
    y += size * 1.25;
    g.font = `${weight} ${size}px ${FONT}`;
    g.fillStyle = color;
    // shrink to fit if the text is longer than the card
    const maxW = W - 68;
    const width = g.measureText(t).width;
    if (width > maxW) g.font = `${weight} ${Math.floor((size * maxW) / width)}px ${FONT}`;
    g.fillText(t, style.center ? W / 2 : 34, y - size * 0.2);
  }
  return c;
}

/* -------------------------------- scene -------------------------------- */

export function startStory3D(o: Story3DOptions): { dispose: () => void } {
  const { canvas, steps, screens } = o;
  const reducedMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0); // transparent: the page shows through

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 100);
  const TAN = Math.tan((camera.fov * Math.PI) / 360);
  camera.position.set(0, 0, 9);
  scene.add(new HemisphereLight(0xffffff, 0x223344, 2.2));
  const key = new DirectionalLight(0xffffff, 2.6);
  key.position.set(4, 6, 8);
  scene.add(key);
  const rim = new DirectionalLight(0x7cc4ff, 2.2);
  rim.position.set(-6, -2, -4);
  scene.add(rim);

  const disposables: { dispose: () => void }[] = [];
  const track = <T extends { dispose: () => void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  /* ---- Phone body, glass and screen ---- */
  const W = 2.1;
  const H = 4.3;
  const R = 0.34;
  const D = 0.16;
  const bodyGeo = track(
    new ExtrudeGeometry(roundedShape(W, H, R), {
      depth: D,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 4,
      curveSegments: 16,
    }),
  );
  bodyGeo.translate(0, 0, -D / 2);
  const body = new Mesh(bodyGeo, track(new MeshStandardMaterial({ color: 0xb9bec7, metalness: 0.85, roughness: 0.28 })));
  const glass = new Mesh(
    track(new ShapeGeometry(roundedShape(W - 0.02, H - 0.02, R - 0.01), 16)),
    track(new MeshBasicMaterial({ color: 0x05070c })),
  );
  glass.position.z = D / 2 + 0.051;

  const screenCanvas = document.createElement("canvas");
  screenCanvas.width = SCREEN_W;
  screenCanvas.height = SCREEN_H;
  const sg = screenCanvas.getContext("2d")!;
  const screenTex = track(new CanvasTexture(screenCanvas));
  screenTex.colorSpace = SRGBColorSpace;
  screenTex.anisotropy = 4;
  const sw = W - 0.16;
  const sh = H - 0.16;
  const SCREEN_Z = D / 2 + 0.056;
  const screenGeo = track(new ShapeGeometry(roundedShape(sw, sh, R - 0.08), 16));
  const uv = screenGeo.attributes.uv;
  const pos = screenGeo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + sw / 2) / sw, (pos.getY(i) + sh / 2) / sh);
  const screenMat = track(new MeshBasicMaterial({ map: screenTex, transparent: true }));
  const screenMesh = new Mesh(screenGeo, screenMat);
  screenMesh.position.z = SCREEN_Z;

  const phone = new Group();
  phone.add(body, glass, screenMesh);
  scene.add(phone);

  /** Screen drawing pixels -> point on the phone (phone's own coordinates). */
  const anchorLocal = (a: [number, number]) =>
    new Vector3((a[0] / SCREEN_W - 0.5) * sw, (0.5 - a[1] / SCREEN_H) * sh, SCREEN_Z + 0.02);

  /* ---- Marker: a glowing pulse on the screen where the card is pinned ---- */
  const markerGroup = new Group();
  const ringMat = track(new MeshBasicMaterial({ color: 0xff7a4d, transparent: true, opacity: 0.9, blending: AdditiveBlending, depthWrite: false }));
  const ring = new Mesh(track(new RingGeometry(0.1, 0.14, 40)), ringMat);
  const coreMat = track(new MeshBasicMaterial({ color: 0xffb08a, transparent: true, opacity: 1, depthWrite: false }));
  const core = new Mesh(track(new CircleGeometry(0.055, 24)), coreMat);
  markerGroup.add(ring, core);
  phone.add(markerGroup);
  const markerPos = new Vector3();

  /* ---- Customer dots ---- */
  const N = 110;
  const dotGeo = track(new BufferGeometry());
  const dotPos = new Float32Array(N * 3);
  const seeds = Array.from({ length: N }, () => ({
    a: Math.random() * Math.PI * 2,
    y: (Math.random() - 0.5) * 5,
    r: 2.2 + Math.random() * 2.2,
    s: 0.2 + Math.random() * 0.5,
  }));
  dotGeo.setAttribute("position", new BufferAttribute(dotPos, 3));
  const dotMat = track(new PointsMaterial({ color: 0x25d366, size: 0.07, transparent: true, opacity: 0.7, depthWrite: false }));
  scene.add(new Points(dotGeo, dotMat));

  /* ---- Pop-out cards (each stop's cards are drawn the first time that stop is reached) ---- */
  type Pop = { mesh: Mesh; mat: MeshBasicMaterial; style: CardStyle; seed: number; index: number };
  const pops: (Pop[] | null)[] = screens.map(() => null);
  const buildCards = (s: number): Pop[] => {
    const existing = pops[s];
    if (existing) return existing;
    const stop = screens[s];
    const styles = CARD_STYLES[stop.id] ?? [];
    const rating = typeof stop.screen.rating === "string" ? stop.screen.rating.replace(/\s+/g, " ") : undefined;
    const list = stop.popCards.slice(0, styles.length).map((text, index) => {
      const style = styles[index];
      const tex = track(new CanvasTexture(drawCard(style, text, { rating })));
      tex.colorSpace = SRGBColorSpace;
      tex.anisotropy = 4;
      const mat = track(new MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, side: DoubleSide, depthWrite: false }));
      const mesh = new Mesh(track(new PlaneGeometry(style.w, style.h)), mat);
      mesh.visible = false;
      scene.add(mesh);
      return { mesh, mat, style, seed: Math.random() * 6, index };
    });
    pops[s] = list;
    return list;
  };

  /* ---- Size: fit the phone in the pinned stage ---- */
  let lastW = 0;
  let lastH = 0;
  let visW = 8;
  let visH = 8;
  let baseDist = 9;
  let mobile = false;
  let small = false;
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    mobile = window.innerWidth < 768;
    small = w < 400;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5));
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    // Desktop: phone ~60% of the stage height. Phones: ~40% (the card sits below it).
    visH = Math.max(H / (mobile ? 0.4 : 0.6), (mobile ? 5.4 : 9) / camera.aspect);
    visW = visH * camera.aspect;
    baseDist = visH / (2 * TAN);
  };

  /* ---- Animation loop ---- */
  let raf = 0;
  let running = false;
  let inView = true;
  let t0: number | null = null;
  let cur = 0;
  let prev = 0;
  let vel = 0;
  let lastKey = "";
  const camLook = new Vector3();
  const camPos = new Vector3(0, 0, 9);
  const c1 = new Color();
  const c2 = new Color();
  const projected = new Vector3();

  const lookTarget = new Vector3();
  const cornerV = new Vector3();
  const CORNERS: [number, number][] = [
    [-W / 2, -H / 2],
    [W / 2, -H / 2],
    [-W / 2, H / 2],
    [W / 2, H / 2],
  ];

  const frame = (time: number) => {
    raf = requestAnimationFrame(frame);
    resize();
    if (t0 === null) {
      t0 = time;
      cur = prev = o.readStep();
    }

    const reduced = reducedMQ.matches;
    const target = o.readStep();
    cur += (target - cur) * (reduced ? 1 : 0.1);
    vel += ((cur - prev) * 60 - vel) * 0.1;
    prev = cur;

    const T = time * 0.001;
    const k = clamp(Math.floor(cur), 0, steps.length - 1);
    const lt = clamp01(cur - k); // progress within this step
    const step = steps[k];
    const si = step.stop;

    // Steps of this stop, to know how far through the chapter we are
    let firstOfStop = k;
    while (firstOfStop > 0 && steps[firstOfStop - 1].stop === si) firstOfStop--;
    let lastOfStop = k;
    while (lastOfStop < steps.length - 1 && steps[lastOfStop + 1].stop === si) lastOfStop++;
    const stopCount = lastOfStop - firstOfStop + 1;
    const stopT = clamp01((k - firstOfStop + lt) / stopCount);

    // 360° flip around each chapter boundary; the screen swaps while its back faces you
    let flip = 0;
    let shown = si;
    if (!reduced) {
      for (let b = 1; b < steps.length; b++) {
        if (steps[b].stop === steps[b - 1].stop) continue;
        const d = cur - b;
        if (Math.abs(d) < FLIP_HALF) {
          const f = ease((d + FLIP_HALF) / (2 * FLIP_HALF));
          flip = f * Math.PI * 2;
          shown = f < 0.5 ? steps[b - 1].stop : steps[b].stop;
        }
      }
    }
    const flipping = flip > 0.15 && flip < Math.PI * 2 - 0.15;

    // Phone screen: items appear as the chapter's cards are reached
    const screenT = shown === si ? Math.min(1, stopT * 1.15 + 0.05) : 1;
    const key = `${shown}:${Math.round(screenT * 16)}`;
    if (key !== lastKey) {
      lastKey = key;
      drawScreen(sg, screens[shown], reduced ? 1 : screenT, { exampleLabel: o.exampleLabel });
      screenTex.needsUpdate = true;
    }

    // Phone pose. Desktop: left of centre (cards sit to its right). Phones: top half.
    const intro = reduced ? 1 : easeOut((time - t0) / 1400); // spin in
    const tilt = TILT[si] ?? [0, 0];
    const sway = reduced ? 0 : 1;
    const shake = !reduced && si === 1 && step.bullet < 0 ? Math.sin(T * 40) * 0.025 * Math.sin(Math.PI * lt) : 0;
    const isLastStop = si === screens.length - 1;
    const dive = !reduced && isLastStop ? ease((stopT - 0.3) / 0.6) : 0;
    phone.rotation.set(
      tilt[1] + Math.sin(T * 0.8) * 0.03 * sway,
      tilt[0] + flip + Math.sin(T * 0.5) * 0.05 * sway + (1 - intro) * Math.PI * 2,
      shake + (reduced ? 0 : clamp(vel * 0.5, -0.12, 0.12)),
    );
    const px = mobile ? 0 : -visW * 0.2;
    const py = (mobile ? visH * 0.23 : 0) + Math.sin(T) * 0.05 * sway - (1 - intro) * 5;
    phone.position.set(px, py, 0);
    phone.scale.setScalar(1 + 0.08 * Math.sin(Math.PI * (flip / (Math.PI * 2))));
    phone.updateMatrixWorld();

    // Marker on the screen for this step
    const anchor = anchorLocal(step.anchor);
    markerGroup.position.copy(anchor);
    const pulse = 1 + 0.25 * Math.sin(T * 4);
    ring.scale.setScalar(pulse);
    ringMat.opacity = flipping ? 0 : 0.9;
    coreMat.opacity = flipping ? 0 : 1;
    markerPos.copy(anchor).applyMatrix4(phone.matrixWorld);

    // Camera: zoom towards the marker on bullet steps, dive in at the end
    const zoom = reduced ? 0 : step.bullet >= 0 ? 0.08 : 0.02;
    const tx = lerp(0, markerPos.x - px, zoom * 1.5);
    const ty = lerp(0, markerPos.y - (mobile ? visH * 0.23 : 0), zoom * 1.5);
    camPos.set(tx, ty, baseDist * (1 - zoom - dive * 0.25));
    camera.position.lerp(camPos, reduced ? 1 : 0.08);
    camLook.lerp(lookTarget.set(tx, ty, 0), reduced ? 1 : 0.08);
    camera.lookAt(camLook);
    camera.updateMatrixWorld();

    // Glow colour drifts towards the next stop's colour
    const next = Math.min(TINT.length - 1, si + 1);
    c1.set(TINT[si] ?? TINT[0]);
    c2.set(TINT[next]);
    c1.lerp(c2, ease((stopT - 0.75) / 0.25));
    o.story.style.setProperty("--story-tint", `#${c1.getHexString()}`);

    // Pop-out cards: burst out at the start of each chapter, on the far side of the phone
    const maxCards = small ? 3 : 99;
    const cardScale = mobile ? 0.5 : 0.72;
    let visibleCards = 0;
    const chapterT = clamp01((k - firstOfStop + lt) / Math.min(stopCount, 1.6)); // first ~1.6 steps
    if (!reduced) buildCards(si);
    pops.forEach((list, s) => {
      if (!list) return;
      for (const p of list) {
        const { mesh, mat, style } = p;
        if (reduced || s !== si || p.index >= maxCards || (mobile && isLastStop)) {
          mesh.visible = false;
          continue;
        }
        const aIn = easeOut((chapterT - 0.1 - style.delay) / 0.25);
        const aOut = ease((chapterT - 0.7) / 0.25);
        const a = aIn * (1 - aOut) * 0.92;
        mesh.visible = a > 0.01;
        if (!mesh.visible) continue;
        visibleCards++;

        let [ox, oy] = style.to;
        const oz = style.to[2];
        if (!mobile) ox = -Math.abs(ox); // desktop: the far side from the page cards
        if (style.kind === "orbit") {
          const ang = chapterT * Math.PI * 0.6;
          ox = ox * Math.cos(ang);
          oy = oy + Math.sin(ang + p.seed) * 0.25;
        }
        if (mobile) {
          ox *= 0.75;
          oy = oy * 0.45 + 0.4;
        }
        // Keep the card inside what the camera actually sees at the card's depth
        const halfW = (style.w * cardScale) / 2;
        const seeH = 2 * TAN * Math.max(1, camera.position.z - oz);
        const seeW = seeH * camera.aspect;
        const cx0 = camera.position.x;
        const cy0 = camera.position.y;
        const tx2 = clamp(px + ox, cx0 - seeW / 2 + halfW + 0.25, cx0 + seeW / 2 - halfW - 0.25);
        const ty2 = clamp(py + oy, cy0 - seeH / 2 + 0.5, cy0 + seeH / 2 - 0.5);
        const bob = Math.sin(T * 1.3 + p.seed) * 0.05;
        let x = px + (tx2 - px) * aIn;
        let y = py + (ty2 - py) * aIn + bob;
        let z = 0.3 + (oz - 0.3) * aIn;
        if (style.kind === "fall") {
          y -= aOut * aOut * 3;
          z += aOut * 0.6;
          mesh.rotation.z = aOut * (p.seed > 3 ? 1 : -1) * 1.1;
        } else {
          z -= aOut;
          mesh.rotation.z = Math.sin(T * 0.7 + p.seed) * 0.04;
        }
        x = clamp(x, -visW / 2, visW / 2);
        mesh.position.set(x, y, z);
        mesh.rotation.y = (1 - aIn) * Math.PI * 0.9 + Math.sin(T * 0.6 + p.seed) * 0.08;
        mesh.rotation.x = (1 - aIn) * 0.4;
        mesh.scale.setScalar(cardScale * (0.3 + 0.7 * aIn) * (style.kind === "hero" ? 1.1 : 1));
        mat.opacity = a;
      }
    });

    // Customer dots: blown away by the problem, then gathering round the phone
    const gather = si === 1 ? -0.5 * ease(stopT * 1.5) : si === 0 ? 0 : Math.min(1, (si - 1) / 5 + stopT / 5);
    dotMat.color.set(si === 1 ? 0xff6b6b : 0x25d366);
    dotMat.opacity = si === 1 ? 0.5 : 0.7;
    const spin = reduced ? 0 : 1;
    for (let q = 0; q < N; q++) {
      const sd = seeds[q];
      const ang = sd.a + T * sd.s * (si === 1 ? 1.2 : 0.35) * spin;
      const r = sd.r * (1 - 0.5 * gather) + (si === 1 ? 2 * ease(stopT) : 0);
      dotPos[q * 3] = px + Math.cos(ang) * r;
      dotPos[q * 3 + 1] = py + sd.y * (1 - 0.4 * gather) * (mobile ? 0.5 : 1);
      dotPos[q * 3 + 2] = Math.sin(ang) * r - 1.5;
    }
    dotGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);

    // Tell the page where the marker and the phone are, so the card sits just outside the phone
    const cw = canvas.clientWidth;
    const ch = canvas.clientHeight;
    const toScreen = (v: Vector3): [number, number] => {
      projected.copy(v).project(camera);
      return [(projected.x * 0.5 + 0.5) * cw, (-projected.y * 0.5 + 0.5) * ch];
    };
    const [mx, my] = toScreen(markerPos);
    let l = Infinity;
    let r = -Infinity;
    let tp = Infinity;
    let b = -Infinity;
    for (const [cx, cy] of CORNERS) {
      const [sx, sy] = toScreen(cornerV.set(cx, cy, 0).applyMatrix4(phone.matrixWorld));
      l = Math.min(l, sx);
      r = Math.max(r, sx);
      tp = Math.min(tp, sy);
      b = Math.max(b, sy);
    }
    o.onFrame?.({ x: mx, y: my, visible: !flipping && intro > 0.9, box: { left: l, right: r, top: tp, bottom: b } });
    canvas.dataset.stop = screens[si]?.id ?? "";
    canvas.dataset.shown = screens[shown]?.id ?? "";
    canvas.dataset.currentStep = String(k);
    canvas.dataset.cards = String(visibleCards); // read by the tests
  };

  /* ---- Pause when off-screen or the tab is hidden ---- */
  const update = () => {
    const should = inView && document.visibilityState === "visible";
    if (should && !running) {
      running = true;
      raf = requestAnimationFrame(frame);
    } else if (!should && running) {
      running = false;
      cancelAnimationFrame(raf);
    }
    canvas.dataset.running = String(running);
  };
  const io = new IntersectionObserver(
    (entries) => {
      inView = entries.some((e) => e.isIntersecting);
      update();
    },
    { rootMargin: "100px 0px" },
  );
  io.observe(o.story);
  document.addEventListener("visibilitychange", update);
  update();

  return {
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
