/**
 * LAYER 3: the 3D phone story (ported from docs/demo/index.html).
 *
 * The phone lives in its own column BESIDE the text (on phones: above it),
 * on a transparent canvas, so it's part of the page rather than a backdrop.
 * Cards fly out of the phone towards the bullet point they illustrate, and
 * that bullet lights up (onLit). The stop's colour becomes a glow behind the
 * phone (onTint).
 *
 * Loaded only on the home page, only on capable devices, on the visitor's
 * first interaction (components/story/Story3D.tsx). Nothing heavy: the phone
 * is built in code and every screen and card is drawn on a canvas, with text
 * from content/site.ts.
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
  Vector3,
  WebGLRenderer,
} from "three";
import { drawScreen, SCREEN_H, SCREEN_W, type ScreenStop } from "../screens/draw";

export type Story3DStop = ScreenStop & { popCards: { title: string; sub?: string; bullet?: number }[] };

export type Story3DOptions = {
  canvas: HTMLCanvasElement;
  /** The text sections, in order (elements with data-stop). */
  stops: HTMLElement[];
  /** Same order as `stops`: screen text and pop-card text from content/site.ts. */
  screens: Story3DStop[];
  exampleLabel: string;
  /** Called when the lit-up bullets change: stop index, bullet indexes (-1 = the whole stop). */
  onLit?: (stop: number, bullets: number[]) => void;
  /** Called every frame with the current glow colour (CSS colour string). */
  onTint?: (color: string) => void;
};

/* ----------------------------- look & feel ----------------------------- */

/** Glow colour per stop (placeholder palette, from the demo's backgrounds, brightened). */
const TINT = ["#1d3b8f", "#7a1f2b", "#2b4fbf", "#1d5a8f", "#0f7a4f", "#3a3f9f", "#0f7a4f"];
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
  /** Where the card flies to, relative to the phone: x, y, z (used when it has no bullet) */
  to: [number, number, number];
  delay: number;
  kind?: Kind;
  special?: "topPick";
};

/** Card styles per stop (by position). The TEXT comes from content (story[].popCards). */
const CARD_STYLES: Record<string, CardStyle[]> = {
  problem: [
    { w: 2.6, h: 0.8, bg: "#2a1216", fg: "#ff8a8a", subFg: "#ddd", border: "#ff6b6b", size: 36, subSize: 26, to: [-1.9, 1.3, 1.2], delay: 0.05, kind: "fall" },
    { w: 2.4, h: 0.8, bg: "#2a1216", fg: "#ff6b6b", subFg: "#ddd", border: "#ff6b6b", size: 40, subSize: 26, to: [1.9, 0.5, 1.0], delay: 0.2, kind: "fall" },
    { w: 2.6, h: 0.8, bg: "#2a1216", fg: "#ff8a8a", subFg: "#ddd", border: "#ff6b6b", size: 32, subSize: 26, to: [-1.6, -1.2, 1.4], delay: 0.35, kind: "fall" },
  ],
  ai: [
    { w: 2.8, h: 0.75, bg: "#2b6cff", fg: "#fff", size: 32, to: [-1.6, 1.6, 0.9], delay: 0.05 },
    { w: 2.6, h: 1.6, bg: "#ffffff", fg: "#111", subFg: "#555", border: "#25D366", size: 64, subSize: 28, to: [-1.2, -0.5, 2.2], delay: 0.25, kind: "hero", special: "topPick" },
  ],
  website: [
    { w: 2.4, h: 1.1, bg: ["#1d3b8f", "#4fa3ff"], fg: "#fff", subFg: "#fff", size: 56, subSize: 28, to: [-1.9, 1.4, 1.0], delay: 0.05 },
    { w: 1.7, h: 0.6, bg: "#25D366", fg: "#04210f", center: true, size: 40, to: [1.6, 1.5, 1.4], delay: 0.15 },
    { w: 2.0, h: 0.8, bg: "#ffffff", fg: "#111", subFg: "#666", size: 34, subSize: 24, to: [1.7, -0.4, 0.9], delay: 0.25 },
    { w: 2.0, h: 0.8, bg: "#ffffff", fg: "#f5a623", subFg: "#666", size: 34, subSize: 24, to: [-2.0, -0.6, 1.3], delay: 0.35 },
    { w: 1.7, h: 0.6, bg: "#1d3b8f", fg: "#fff", center: true, size: 38, to: [0.2, -2.2, 1.6], delay: 0.45 },
  ],
  whatsapp: [
    { w: 2.2, h: 0.6, bg: "#fde7e7", fg: "#c0392b", center: true, size: 34, to: [-2.0, 1.8, 0.8], delay: 0.0, kind: "orbit" },
    { w: 2.8, h: 0.8, bg: "#ffffff", fg: "#111", subFg: "#111", size: 30, subSize: 30, to: [1.8, 1.2, 1.2], delay: 0.12, kind: "orbit" },
    { w: 2.6, h: 0.8, bg: "#dcf8c6", fg: "#111", subFg: "#355", size: 34, subSize: 26, to: [-2.0, 0.2, 1.5], delay: 0.26, kind: "orbit" },
    { w: 2.4, h: 0.7, bg: "#ffffff", fg: "#f5a623", size: 34, to: [1.9, -0.8, 1.0], delay: 0.4, kind: "orbit" },
    { w: 2.3, h: 0.8, bg: "#ffffff", fg: "#2e7d32", subFg: "#111", size: 30, subSize: 26, to: [-1.6, -1.8, 1.3], delay: 0.54, kind: "orbit" },
  ],
  how: [
    { w: 2.0, h: 0.8, bg: "#1b2045", fg: "#fff", subFg: "#a9b1c1", border: "#7cc4ff", size: 38, subSize: 24, to: [-2.0, 1.3, 1.0], delay: 0.05 },
    { w: 2.0, h: 0.8, bg: "#1b2045", fg: "#fff", subFg: "#a9b1c1", border: "#7cc4ff", size: 38, subSize: 24, to: [2.0, 0.2, 1.2], delay: 0.25 },
    { w: 2.0, h: 0.8, bg: "#1b2045", fg: "#25D366", subFg: "#a9b1c1", border: "#25D366", size: 38, subSize: 24, to: [-2.0, -1.3, 1.4], delay: 0.45 },
  ],
  cta: [{ w: 2.8, h: 0.7, bg: "#25D366", fg: "#04210f", center: true, size: 40, to: [0, -2.2, 1.8], delay: 0.3, kind: "hero" }],
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
  const dotMat = track(new PointsMaterial({ color: 0x25d366, size: 0.08, transparent: true, opacity: 0.8, depthWrite: false }));
  scene.add(new Points(dotGeo, dotMat));

  /* ---- Pop-out cards (each stop's cards are drawn the first time that stop is near) ---- */
  type Pop = { mesh: Mesh; mat: MeshBasicMaterial; style: CardStyle; seed: number; index: number; bullet?: number };
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
      return { mesh, mat, style, seed: Math.random() * 6, index, bullet: text.bullet };
    });
    pops[s] = list;
    return list;
  };

  /* ---- Bullets in the text (cards fly to them) ---- */
  const bulletEls: HTMLElement[][] = stops.map((s) => Array.from(s.querySelectorAll<HTMLElement>("[data-bullet]")));

  /** Screen point -> point in the 3D world on the plane z. */
  const tmpV = new Vector3();
  const tmpDir = new Vector3();
  let rect = canvas.getBoundingClientRect();
  const worldAt = (clientX: number, clientY: number, z: number): [number, number] => {
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
    tmpV.set(nx, ny, 0.5).unproject(camera);
    tmpDir.copy(tmpV).sub(camera.position).normalize();
    const t = (z - camera.position.z) / tmpDir.z;
    return [camera.position.x + tmpDir.x * t, camera.position.y + tmpDir.y * t];
  };

  /* ---- Size: fit the phone and its cards inside the column ---- */
  let lastW = 0;
  let lastH = 0;
  let baseDist = 9;
  let mobile = false;
  let small = false;
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    rect = canvas.getBoundingClientRect();
    if (w === lastW && h === lastH) return;
    lastW = w;
    lastH = h;
    mobile = window.innerWidth < 768;
    small = w < 400;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5));
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
    // Visible height needed: the phone at ~75% of the column height, and enough width for cards
    const needH = H / (mobile ? 0.8 : 0.7);
    const needW = mobile ? 6.6 : 6.2;
    const visH = Math.max(needH, needW / camera.aspect);
    baseDist = visH / (2 * TAN);
  };

  /* ---- Scroll position -> (stop, progress within stop) ---- */
  const readScroll = () => {
    const line = window.innerHeight * (mobile ? 0.72 : 0.55);
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
  let cur = 0;
  let prev = 0;
  let vel = 0;
  let lastKey = "";
  let lastLit = "";
  const c1 = new Color();
  const c2 = new Color();

  const frame = (time: number) => {
    raf = requestAnimationFrame(frame);
    if (t0 === null) {
      t0 = time;
      resize();
      cur = prev = readScroll();
    }
    resize();

    const reduced = reducedMQ.matches;
    const target = readScroll();
    cur += (target - cur) * (reduced ? 1 : 0.08);
    vel += ((cur - prev) * 60 - vel) * 0.1;
    prev = cur;

    const T = time * 0.001;
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

    // Phone pose: slightly right of centre on desktop, leaving room for cards towards the text
    const intro = reduced ? 1 : easeOut((time - t0) / 1400); // spin in
    const tilt = TILT[si] ?? [0, 0];
    const sway = reduced ? 0 : 1;
    const shake = !reduced && si === 1 ? Math.sin(T * 40) * 0.03 * Math.sin(Math.PI * Math.min(1, lt * 1.4)) : 0;
    const dive = !reduced && si === stops.length - 1 ? ease((lt - 0.15) / 0.6) : 0;
    phone.rotation.set(
      tilt[1] + Math.sin(T * 0.8) * 0.04 * sway,
      tilt[0] + flip + Math.sin(T * 0.5) * 0.08 * sway + (1 - intro) * Math.PI * 2,
      shake + (reduced ? 0 : clamp(vel * 0.8, -0.2, 0.2)),
    );
    const px = mobile ? 0 : 0.7;
    const py = Math.sin(T) * 0.06 * sway - (1 - intro) * 5;
    phone.position.set(px, py, 0);
    phone.scale.setScalar(1 + 0.1 * Math.sin(Math.PI * (flip / (Math.PI * 2))));
    camera.position.set(0, 0, baseDist * (1 - dive * 0.22));
    camera.lookAt(px * dive * 0.6, 0, 0);
    camera.updateMatrixWorld();

    // Glow colour drifts towards the next stop's colour
    const next = Math.min(TINT.length - 1, si + 1);
    c1.set(TINT[si] ?? TINT[0]);
    c2.set(TINT[next]);
    c1.lerp(c2, ease((lt - 0.7) / 0.3));
    o.onTint?.(`#${c1.getHexString()}`);

    // Visible edges of the column at the card plane (cards stay inside the column)
    const zPlane = 1;
    const [left, top] = worldAt(rect.left, rect.top, zPlane);
    const [right, bottom] = worldAt(rect.right, rect.bottom, zPlane);

    // Pop-out cards
    const cardScale = mobile ? 0.62 : 0.8;
    const maxCards = small ? 3 : 99;
    let visibleCards = 0;
    const lit = new Set<number>();
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

        const halfW = (style.w * cardScale) / 2;
        const halfH = (style.h * cardScale) / 2;
        let tx: number;
        let ty: number;
        const tz = style.kind === "hero" ? 1.6 : zPlane;
        const bulletEl = p.bullet !== undefined ? bulletEls[s][p.bullet] : undefined;

        if (bulletEl && !mobile) {
          // Fly to the left edge of the column, level with the bullet it illustrates
          const r = bulletEl.getBoundingClientRect();
          const [, by] = worldAt(rect.left, r.top + r.height / 2, tz);
          tx = left + halfW + 0.1;
          ty = by;
        } else {
          let [ox, oy] = style.to;
          if (style.kind === "orbit") {
            const ang = lt * Math.PI * 0.6;
            ox = style.to[0] * Math.cos(ang);
            oy = style.to[1] + Math.sin(ang + p.seed) * 0.3;
          }
          tx = px + ox * (mobile ? 0.85 : 1);
          ty = oy * (mobile ? 0.8 : 1);
        }
        tx = clamp(tx, left + halfW + 0.05, right - halfW - 0.05);
        ty = clamp(ty, bottom + halfH + 0.05, top - halfH - 0.05);

        const bob = Math.sin(T * 1.3 + p.seed) * 0.06;
        const sx = px;
        const sy = 0;
        const sz = 0.3;
        const x = sx + (tx - sx) * aIn;
        let y = sy + (ty - sy) * aIn + bob;
        let z = sz + (tz - sz) * aIn;
        if (style.kind === "fall") {
          y -= aOut * aOut * 4;
          z += aOut;
          mesh.rotation.z = aOut * (p.seed > 3 ? 1 : -1) * 1.2;
        } else {
          z -= aOut * 1.2;
          mesh.rotation.z = Math.sin(T * 0.7 + p.seed) * 0.04;
        }
        if (style.kind === "hero") z += Math.sin(T * 1.1) * 0.12;
        mesh.position.set(x, y, z);
        mesh.rotation.y = (1 - aIn) * Math.PI * 0.9 + Math.sin(T * 0.6 + p.seed) * 0.1;
        mesh.rotation.x = (1 - aIn) * 0.4;
        mesh.scale.setScalar(cardScale * (0.3 + 0.7 * aIn) * (style.kind === "hero" ? 1.1 : 1));
        mat.opacity = a;

        // Light up the matching bullet once the card has arrived
        if (a > 0.6) lit.add(p.bullet ?? -1);
      }
    });
    const litKey = `${si}:${[...lit].sort().join(",")}`;
    if (litKey !== lastLit) {
      lastLit = litKey;
      o.onLit?.(si, [...lit]);
    }

    // Customer dots: blown away by the problem, then gathering round the phone
    const gather = si === 1 ? -0.5 * ease(lt * 1.5) : si === 0 ? 0 : Math.min(1, (si - 1) / 5 + lt / 5);
    dotMat.color.set(si === 1 ? 0xff6b6b : 0x25d366);
    dotMat.opacity = si === 1 ? 0.55 : 0.85;
    dotMat.size = mobile ? 0.07 : 0.08;
    const spin = reduced ? 0 : 1;
    for (let q = 0; q < N; q++) {
      const sd = seeds[q];
      const ang = sd.a + T * sd.s * (si === 1 ? 1.2 : 0.35) * spin;
      const r = sd.r * (1 - 0.5 * gather) + (si === 1 ? 2 * ease(lt) : 0);
      dotPos[q * 3] = px + Math.cos(ang) * r;
      dotPos[q * 3 + 1] = sd.y * (1 - 0.4 * gather);
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
  io.observe(stops[0].closest("#story") ?? canvas);
  document.addEventListener("visibilitychange", update);
  update();

  return {
    dispose() {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
      o.onLit?.(-1, []);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
