/**
 * LAYER 3: the 3D phone story (ported from docs/demo/index.html).
 *
 * Loaded only on the home page, only on capable devices, after the page has
 * appeared (components/story/Story3D.tsx). Nothing heavy: the phone is built
 * in code (ExtrudeGeometry) and every screen and card is drawn on a canvas,
 * with text from content/site.ts.
 *
 * Scroll: the 3D follows the real text sections ([data-stop]) so copy and
 * phone always match. Between two stops the phone does a full 360° flip and
 * the screen swaps while its back faces the viewer.
 *
 * Rules: pauses when off-screen or the tab is hidden; small screens (<400px)
 * get at most 3 cards per stop and a lower pixel ratio; reduced motion turns
 * off flips, flying cards and camera moves.
 */
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
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
  Scene,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  WebGLRenderer,
} from "three";
import { drawScreen, SCREEN_H, SCREEN_W, type ScreenStop } from "../screens/draw";

export type Story3DStop = ScreenStop & { popCards: { title: string; sub?: string }[] };

export type Story3DOptions = {
  canvas: HTMLCanvasElement;
  /** The text sections, in order (elements with data-stop). */
  stops: HTMLElement[];
  /** Same order as `stops`: screen text and pop-card text from content/site.ts. */
  screens: Story3DStop[];
  exampleLabel: string;
};

/* ----------------------------- look & feel ----------------------------- */

/** Background colour per stop (placeholder palette, from the demo). */
const BG = ["#0a0f1e", "#1a0b10", "#0b1430", "#0c1626", "#06201a", "#0e1028", "#06201a"];
/** Resting tilt of the phone per stop: [y, x] radians. */
const TILT: [number, number][] = [
  [-0.35, 0.08],
  [0.3, -0.05],
  [-0.3, 0.06],
  [0.3, -0.04],
  [-0.25, 0.05],
  [0.25, 0.02],
  [0, 0],
];
/** Half-width of the 360° flip around each stop boundary, in "stops". */
const FLIP_HALF = 0.22;

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
  /** Where the card flies to, relative to the phone: x, y, z */
  to: [number, number, number];
  delay: number;
  kind?: Kind;
  special?: "topPick";
};

/** Card styles per stop. The TEXT comes from content (story[].popCards). */
const CARD_STYLES: Record<string, CardStyle[]> = {
  problem: [
    { w: 2.4, h: 0.8, bg: "#2a1216", fg: "#ff6b6b", subFg: "#ddd", border: "#ff6b6b", size: 40, subSize: 26, to: [-1.9, 1.3, 1.2], delay: 0.05, kind: "fall" },
    { w: 2.6, h: 0.8, bg: "#2a1216", fg: "#ff8a8a", subFg: "#ddd", border: "#ff6b6b", size: 36, subSize: 26, to: [1.9, 0.5, 1.0], delay: 0.2, kind: "fall" },
    { w: 2.6, h: 0.8, bg: "#2a1216", fg: "#ff8a8a", subFg: "#ddd", border: "#ff6b6b", size: 32, subSize: 26, to: [-1.6, -1.2, 1.4], delay: 0.35, kind: "fall" },
  ],
  ai: [
    { w: 2.8, h: 0.75, bg: "#2b6cff", fg: "#fff", size: 32, to: [-2.0, 1.5, 0.9], delay: 0.05 },
    { w: 2.6, h: 1.6, bg: "#ffffff", fg: "#111", subFg: "#555", border: "#25D366", size: 64, subSize: 28, to: [-1.3, -0.4, 2.6], delay: 0.25, kind: "hero", special: "topPick" },
  ],
  website: [
    { w: 2.4, h: 1.1, bg: ["#1d3b8f", "#4fa3ff"], fg: "#fff", subFg: "#fff", size: 56, subSize: 28, to: [-2.1, 1.4, 1.0], delay: 0.05 },
    { w: 1.7, h: 0.6, bg: "#25D366", fg: "#04210f", center: true, size: 40, to: [2.0, 1.3, 1.4], delay: 0.15 },
    { w: 2.0, h: 0.8, bg: "#ffffff", fg: "#111", subFg: "#666", size: 34, subSize: 24, to: [2.2, -0.4, 0.9], delay: 0.25 },
    { w: 2.0, h: 0.8, bg: "#ffffff", fg: "#f5a623", subFg: "#666", size: 34, subSize: 24, to: [-2.2, -0.6, 1.3], delay: 0.35 },
    { w: 1.7, h: 0.6, bg: "#1d3b8f", fg: "#fff", center: true, size: 38, to: [0.2, -2.3, 1.6], delay: 0.45 },
  ],
  whatsapp: [
    { w: 2.2, h: 0.6, bg: "#fde7e7", fg: "#c0392b", center: true, size: 34, to: [-2.0, 1.8, 0.8], delay: 0.0, kind: "orbit" },
    { w: 2.8, h: 0.8, bg: "#ffffff", fg: "#111", subFg: "#111", size: 30, subSize: 30, to: [2.1, 1.2, 1.2], delay: 0.12, kind: "orbit" },
    { w: 2.6, h: 0.8, bg: "#dcf8c6", fg: "#111", subFg: "#355", size: 34, subSize: 26, to: [-2.2, 0.2, 1.5], delay: 0.26, kind: "orbit" },
    { w: 2.4, h: 0.7, bg: "#ffffff", fg: "#f5a623", size: 34, to: [2.2, -0.8, 1.0], delay: 0.4, kind: "orbit" },
    { w: 2.3, h: 0.8, bg: "#ffffff", fg: "#2e7d32", subFg: "#111", size: 30, subSize: 26, to: [-1.6, -1.8, 1.3], delay: 0.54, kind: "orbit" },
  ],
  how: [
    { w: 2.0, h: 0.8, bg: "#1b2045", fg: "#fff", subFg: "#a9b1c1", border: "#7cc4ff", size: 38, subSize: 24, to: [-2.3, 1.3, 1.0], delay: 0.05 },
    { w: 2.0, h: 0.8, bg: "#1b2045", fg: "#fff", subFg: "#a9b1c1", border: "#7cc4ff", size: 38, subSize: 24, to: [2.3, 0.2, 1.2], delay: 0.25 },
    { w: 2.0, h: 0.8, bg: "#1b2045", fg: "#25D366", subFg: "#a9b1c1", border: "#25D366", size: 38, subSize: 24, to: [-2.0, -1.3, 1.4], delay: 0.45 },
  ],
  cta: [{ w: 2.8, h: 0.7, bg: "#25D366", fg: "#04210f", center: true, size: 40, to: [0, -2.5, 2.2], delay: 0.3, kind: "hero" }],
};

/* ------------------------------- helpers ------------------------------- */

const FONT = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => {
  x = clamp01(x);
  return x * x * (3 - 2 * x);
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

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
  const { canvas, stops, screens } = o;
  const reducedMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.outputColorSpace = SRGBColorSpace;

  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 11);
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
  const screenGeo = track(new ShapeGeometry(roundedShape(sw, sh, R - 0.08), 16));
  const uv = screenGeo.attributes.uv;
  const pos = screenGeo.attributes.position;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) + sw / 2) / sw, (pos.getY(i) + sh / 2) / sh);
  const screenMat = track(new MeshBasicMaterial({ map: screenTex, transparent: true }));
  const screenMesh = new Mesh(screenGeo, screenMat);
  screenMesh.position.z = D / 2 + 0.056;

  const phone = new Group();
  phone.add(body, glass, screenMesh);
  scene.add(phone);

  /* ---- Customer dots ---- */
  const N = 140;
  const dotGeo = track(new BufferGeometry());
  const dotPos = new Float32Array(N * 3);
  const seeds = Array.from({ length: N }, () => ({
    a: Math.random() * Math.PI * 2,
    y: (Math.random() - 0.5) * 6,
    r: 3 + Math.random() * 3.5,
    s: 0.2 + Math.random() * 0.5,
  }));
  dotGeo.setAttribute("position", new BufferAttribute(dotPos, 3));
  const dotMat = track(new PointsMaterial({ color: 0x25d366, size: 0.09, transparent: true, opacity: 0.8, depthWrite: false }));
  scene.add(new Points(dotGeo, dotMat));

  /* ---- Pop-out cards (each stop's cards are drawn the first time that stop is near) ---- */
  const smallScreen = () => canvas.clientWidth < 400;
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

  /* ---- Pixel ratio, size ---- */
  let lastW = 0;
  let lastH = 0;
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, w < 400 ? 1.25 : 1.5));
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  };

  /* ---- Scroll position -> (stop, progress within stop) ---- */
  const readScroll = () => {
    const line = window.innerHeight * 0.55;
    const first = stops[0].getBoundingClientRect();
    if (line < first.top) return 0;
    for (let i = 0; i < stops.length; i++) {
      const r = stops[i].getBoundingClientRect();
      if (line >= r.top && line < r.bottom) return i + (line - r.top) / r.height;
    }
    return stops.length - 0.0001;
  };

  /* ---- Animation loop ---- */
  let raf = 0;
  let running = false;
  let inView = true;
  let t0: number | null = null;
  let cur = readScroll();
  let prev = cur;
  let vel = 0;
  let lastKey = "";
  const c1 = new Color();
  const c2 = new Color();

  const frame = (time: number) => {
    raf = requestAnimationFrame(frame);
    if (t0 === null) t0 = time;
    resize();

    const reduced = reducedMQ.matches;
    const target = readScroll();
    cur += (target - cur) * (reduced ? 1 : 0.08);
    vel += ((cur - prev) * 60 - vel) * 0.1;
    prev = cur;

    const T = time * 0.001;
    const mobile = camera.aspect < 0.9;
    const si = Math.min(stops.length - 1, Math.floor(cur));
    const lt = clamp01(cur - si);

    // 360° flip around each stop boundary; the screen swaps while its back faces you
    let flip = 0;
    let shown = si;
    if (!reduced) {
      for (let k = 1; k < stops.length; k++) {
        const d = cur - k;
        if (Math.abs(d) < FLIP_HALF) {
          const f = ease((d + FLIP_HALF) / (2 * FLIP_HALF));
          flip = f * Math.PI * 2;
          shown = f < 0.5 ? k - 1 : k;
        }
      }
    }
    const showLt = shown === si ? lt : 1;
    // Redraw the phone screen only at 16 steps per stop (each redraw costs time)
    const key = `${shown}:${Math.round(showLt * 16)}`;
    if (key !== lastKey) {
      lastKey = key;
      drawScreen(sg, screens[shown], reduced ? 1 : showLt, { exampleLabel: o.exampleLabel });
      screenTex.needsUpdate = true;
    }

    // Phone pose
    const intro = reduced ? 1 : easeOut((time - t0) / 1400); // spin in on load
    const tilt = TILT[si] ?? [0, 0];
    const sway = reduced ? 0 : 1;
    const shake = !reduced && si === 1 ? Math.sin(T * 40) * 0.03 * Math.sin(Math.PI * Math.min(1, lt * 1.4)) : 0;
    const dive = !reduced && si === stops.length - 1 ? ease((lt - 0.15) / 0.6) : 0;
    phone.rotation.set(
      tilt[1] + Math.sin(T * 0.8) * 0.04 * sway,
      tilt[0] + flip + Math.sin(T * 0.5) * 0.08 * sway + (1 - intro) * Math.PI * 2,
      shake + (reduced ? 0 : Math.max(-0.2, Math.min(0.2, vel * 0.8))),
    );
    // During the final dive the phone stays on the right, clear of the text
    const px = mobile ? 0 : 2.3 * (1 - dive * 0.12);
    const py = (mobile ? 1.5 : 0) + Math.sin(T) * 0.08 * sway - (1 - intro) * 6;
    phone.position.set(px, py, 0);
    phone.scale.setScalar((mobile ? 0.74 : 1.08) * (1 + 0.12 * Math.sin(Math.PI * (flip / (Math.PI * 2)))));
    camera.position.set(dive * (mobile ? 0 : 0.6), 0, (mobile ? 11.5 : 10.5) - dive * (mobile ? 2.5 : 2.4));
    camera.lookAt(px * dive * 0.45, py * dive * 0.5, 0);

    // Background colour drifts towards the next stop's colour
    const next = Math.min(BG.length - 1, si + 1);
    c1.set(BG[si] ?? BG[0]);
    c2.set(BG[next]);
    c1.lerp(c2, ease((lt - 0.7) / 0.3));
    scene.background = c1;

    // Pop-out cards
    const ms = mobile ? 0.55 : 1;
    const maxCards = smallScreen() ? 3 : 99;
    let visibleCards = 0;
    // Draw this stop's cards (and get the next stop's ready) only when needed
    if (!reduced) {
      buildCards(si);
      if (lt > 0.6 && si + 1 < screens.length) buildCards(si + 1);
    }
    pops.forEach((list, s) => {
      if (!list) return;
      for (const p of list) {
        const { mesh, mat, style } = p;
        const hide = reduced || s !== si || p.index >= maxCards || (mobile && s === stops.length - 1);
        if (hide) {
          mesh.visible = false;
          continue;
        }
        const aIn = easeOut((lt - 0.06 - style.delay * 0.6) / 0.22);
        const aOut = ease((lt - 0.8) / 0.14);
        const a = aIn * (1 - aOut);
        mesh.visible = a > 0.01;
        if (!mesh.visible) continue;
        visibleCards++;

        const [baseX, oy, baseZ] = style.to;
        let ox = baseX;
        let oz = baseZ;
        if (style.kind === "orbit") {
          // messages circle around the phone as you scroll through the stop
          const ang = lt * Math.PI * 0.9;
          const nx = ox * Math.cos(ang) - oz * Math.sin(ang) * 0.6;
          const nz = oz * Math.cos(ang) + ox * Math.sin(ang) * 0.35;
          ox = nx;
          oz = Math.max(0.4, nz);
        }
        let tx = phone.position.x + ox * ms * (mobile ? 1.05 : 1);
        const ty = phone.position.y + oy * ms + (mobile ? -0.2 : 0);
        const tz = oz * (mobile ? 0.9 : 1);
        if (mobile) tx = Math.max(-1.9, Math.min(1.9, tx));
        const bob = Math.sin(T * 1.3 + p.seed) * 0.08;
        const sx = phone.position.x;
        const sy = phone.position.y;
        const sz = 0.3;
        let x = sx + (tx - sx) * aIn;
        let y = sy + (ty - sy) * aIn + bob;
        let z = sz + (tz - sz) * aIn;
        if (style.kind === "fall") {
          y -= aOut * aOut * 5;
          z += aOut;
          mesh.rotation.z = aOut * (p.seed > 3 ? 1 : -1) * 1.2;
        } else {
          z -= aOut * 1.5;
          mesh.rotation.z = Math.sin(T * 0.7 + p.seed) * 0.05;
        }
        if (style.kind === "hero") z += Math.sin(T * 1.1) * 0.15;
        x = Math.max(-6, Math.min(6, x));
        mesh.position.set(x, y, z);
        mesh.rotation.y = (1 - aIn) * Math.PI * 0.9 + Math.sin(T * 0.6 + p.seed) * 0.12;
        mesh.rotation.x = (1 - aIn) * 0.4;
        mesh.scale.setScalar(ms * (0.3 + 0.7 * aIn) * (style.kind === "hero" ? 1.1 : 1));
        mat.opacity = a;
      }
    });

    // Customer dots: blown away by the problem, then gathering round the phone
    const gather = si === 1 ? -0.6 * ease(lt * 1.5) : si === 0 ? 0 : Math.min(1, (si - 1) / 5 + lt / 5);
    dotMat.color.set(si === 1 ? 0xff6b6b : 0x25d366);
    dotMat.opacity = si === 1 ? 0.55 : 0.9;
    dotMat.size = mobile ? 0.07 : 0.1;
    const spin = reduced ? 0 : 1;
    for (let q = 0; q < N; q++) {
      const sd = seeds[q];
      const ang = sd.a + T * sd.s * (si === 1 ? 1.2 : 0.35) * spin;
      const r = sd.r * (1 - 0.55 * gather) + (si === 1 ? 3 * ease(lt) : 0);
      dotPos[q * 3] = px + Math.cos(ang) * r;
      dotPos[q * 3 + 1] = py * 0.5 + sd.y * (1 - 0.4 * gather);
      dotPos[q * 3 + 2] = Math.sin(ang) * r - 1.5;
    }
    dotGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    canvas.dataset.stop = screens[si]?.id ?? "";
    canvas.dataset.shown = screens[shown]?.id ?? "";
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
  io.observe(canvas.parentElement ?? canvas);
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
