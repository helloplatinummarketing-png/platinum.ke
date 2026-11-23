/**
 * LAYER 3 light layer for the Nairobi photo story (ported from docs/demo-v2/photo-story.js).
 *
 * Drawn on a transparent canvas over the real photos:
 *  - a glass tower labelled "YOUR BUSINESS" (an illustration, never a real
 *    building) that rises, lights up floor by floor and attracts customers
 *  - one visual per bullet (cards, feature tags, rings, tiles), text from content/site.ts
 *  - customer dots, the AI beam, gold sparks
 *
 * This file only draws. Every frame it reports the smoothed scroll position
 * and where the active visual is (onFrame), and StoryController updates the
 * page (panels, lit bullets, photos, the dashed line) from the same numbers.
 *
 * Rules: home page only; pauses when the story is off-screen or the tab is
 * hidden; phones render at 30 fps with fewer dots; reduced motion turns off
 * the zoom, flying cards and beam sweep (the tower is shown lit).
 */
import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  ConeGeometry,
  DoubleSide,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  RingGeometry,
  Scene,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  WebGLRenderer,
} from "three";
import { AI_ANSWER_AT, CHAPTER_STARTS, chapterAt, stepAt, stepLocal } from "@/lib/story-timing";

export type CityChapter = { id: string; steps: number; chips: boolean; visuals: { title: string; sub?: string }[] };

/** Where the active visual is, so the page can draw a line to it (canvas px). */
export type LeadTarget = { ch: number; k: number; x: number; y: number; a: number; target: "step" | "answer" };

export type CityFrame = { p: number; ci: number; lt: number; lead: LeadTarget | null };

export type CityOptions = {
  canvas: HTMLCanvasElement;
  /** The #story element: used to pause when it's off-screen. */
  story: HTMLElement;
  chapters: CityChapter[];
  aiTopPick: { badge: string; title: string };
  towerSign: string;
  /** Raw scroll position 0..1 through the story. */
  readProgress: () => number;
  onFrame: (f: CityFrame) => void;
};

const FONT = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const ease = (x: number) => {
  x = clamp(x, 0, 1);
  return x * x * (3 - 2 * x);
};
const band = (p: number, a: number, b: number, f: number) => ease((p - a) / f) * (1 - ease((p - b) / f));
const rand = (a: number, b: number) => a + Math.random() * (b - a);

type Line = [text: string, weight: number, colour: string, size: number];

/* ------------------------------ drawing helpers ------------------------------ */

function canvasTex(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  draw(c.getContext("2d")!, w, h);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function dotTex(color: string) {
  return canvasTex(64, 64, (g) => {
    const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)");
    gr.addColorStop(0.3, color);
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
  });
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
  g.fillStyle = fill;
  g.fill();
}

/* --------------------------- the tower (shared) --------------------------- */

const FLOORS = 12;
const FH = 0.46;
const TW = 1.5;
const TOP = FLOORS * FH;

function buildTower(sign: string) {
  const tower = new Group();
  const floorMats: MeshBasicMaterial[] = [];
  const edgeMat = new LineBasicMaterial({ color: 0x7cc4ff, transparent: true, opacity: 0 });
  for (let f = 0; f < FLOORS; f++) {
    const geo = new BoxGeometry(TW, FH * 0.86, TW);
    const m = new MeshBasicMaterial({ color: 0xffc56b, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false });
    floorMats.push(m);
    const mesh = new Mesh(geo, m);
    mesh.position.y = f * FH + FH / 2;
    tower.add(mesh);
    const e = new LineSegments(new EdgesGeometry(geo), edgeMat);
    e.position.y = mesh.position.y;
    tower.add(e);
  }
  const crown = new Mesh(new TorusGeometry(1.15, 0.05, 8, 64), new MeshBasicMaterial({ color: 0x25d366, transparent: true, opacity: 0 }));
  crown.rotation.x = Math.PI / 2;
  crown.position.y = TOP + 0.25;
  tower.add(crown);
  const label = new Sprite(
    new SpriteMaterial({
      map: canvasTex(512, 120, (g, w, h) => {
        roundRect(g, 4, 4, w - 8, h - 8, 50, "rgba(4,33,15,.9)");
        g.fillStyle = "#25D366";
        g.font = `800 54px ${FONT}`;
        g.textAlign = "center";
        g.fillText(sign, w / 2, 80);
      }),
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }),
  );
  label.scale.set(3.0, 0.7, 1);
  label.position.y = TOP + 1.0;
  tower.add(label);
  const baseGlow = new Mesh(
    new PlaneGeometry(6, 6),
    new MeshBasicMaterial({ map: dotTex("rgba(255,190,90,0.6)"), transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }),
  );
  baseGlow.rotation.x = -Math.PI / 2;
  tower.add(baseGlow);
  return { tower, floorMats, edgeMat, crown, label, baseGlow };
}

/**
 * Render the fully lit tower on its own, on a transparent background.
 * Used once to make the still picture for Layer 2 (scripts/render-tower.mts).
 */
export function snapshotTower(canvas: HTMLCanvasElement, sign: string) {
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(canvas.width, canvas.height, false);
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, canvas.width / canvas.height, 0.1, 100);
  camera.position.set(0, 3.6, 10.5);
  camera.lookAt(0, 3.4, 0);
  const t = buildTower(sign);
  t.tower.rotation.y = 0.6;
  t.floorMats.forEach((m, f) => {
    m.opacity = 0.58;
    m.color.setHex(f >= FLOORS - 2 ? 0x25d366 : 0xffc56b);
  });
  t.edgeMat.opacity = 0.85;
  (t.crown.material as MeshBasicMaterial).opacity = 1;
  t.label.material.opacity = 1;
  (t.baseGlow.material as MeshBasicMaterial).opacity = 0.9;
  t.baseGlow.scale.setScalar(1.6);
  scene.add(t.tower);
  renderer.render(scene, camera);
}

/* --------------------------------- scene --------------------------------- */

export function startCity(o: CityOptions): { dispose: () => void } {
  const { canvas, chapters } = o;
  const reducedMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
  const mobileInit = canvas.clientWidth < 760;

  const renderer = new WebGLRenderer({ canvas, antialias: !mobileInit, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mobileInit ? 1.25 : 1.5));
  renderer.setClearColor(0x000000, 0);
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 14);

  const disposables: { dispose: () => void }[] = [];
  const add = <T extends Mesh | Points | Sprite | Group>(obj: T) => {
    scene.add(obj);
    return obj;
  };

  /** A card drawn on a canvas: lines = [text, weight, colour, size]. */
  const card = (lines: Line[], bg: string, border: string | null, w = 560, h = 150) => {
    const tex = canvasTex(w, h, (g) => {
      roundRect(g, 4, 4, w - 8, h - 8, 32, bg);
      if (border) {
        g.strokeStyle = border;
        g.lineWidth = 6;
        g.stroke();
      }
      const total = lines.reduce((n, l) => n + l[3] * 1.25, 0);
      let y = (h - total) / 2;
      for (const [text, weight, colour, size] of lines) {
        y += size * 1.12;
        g.fillStyle = colour;
        g.font = `${weight} ${size}px ${FONT}`;
        // shrink to fit
        const max = w - 64;
        const width = g.measureText(text).width;
        if (width > max) g.font = `${weight} ${Math.floor((size * max) / width)}px ${FONT}`;
        g.fillText(text, 32, y);
      }
    });
    disposables.push(tex);
    const sp = new Sprite(new SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false }));
    sp.userData.ar = w / h;
    return add(sp);
  };
  const place = (sp: Sprite, x: number, y: number, z: number, width: number, a: number) => {
    sp.position.set(x, y, z);
    const s = 0.6 + 0.4 * a;
    sp.scale.set(width * s, (width / sp.userData.ar) * s, 1);
    sp.material.opacity = a;
    sp.visible = a > 0.005;
  };
  const byId = (id: string) => chapters.findIndex((c) => c.id === id);
  const vis = (id: string) => chapters[byId(id)]?.visuals ?? [];

  /* ---- Tower ---- */
  const T = buildTower(o.towerSign);
  add(T.tower);

  /* ---- Website features: each lights two floors and gets a tag ---- */
  const featTags = vis("websites").map((v) => card([[v.title, 800, "#04210f", 40]], "rgba(255,214,140,.96)", null, 520, 96));

  /* ---- Customers ---- */
  const N = mobileInit ? 120 : 220;
  const cArr = new Float32Array(N * 3);
  const cSeed = Array.from({ length: N }, () => ({ y: rand(-4.5, 4.5), z: rand(-2, 2), s: rand(0.04, 0.1), ph: Math.random(), a: Math.random() * 6.28 }));
  const cGeo = new BufferGeometry();
  cGeo.setAttribute("position", new BufferAttribute(cArr, 3));
  const cMat = new PointsMaterial({ size: 0.22, map: dotTex("rgba(255,235,200,0.9)"), transparent: true, opacity: 0.9, depthWrite: false, blending: AdditiveBlending });
  add(new Points(cGeo, cMat));

  /* ---- Problem: one card per pain point ---- */
  const pv = vis("problem");
  const P = [
    card([[pv[0]?.sub ?? "", 700, "#555", 30], [pv[0]?.title ?? "", 800, "#c0392b", 40]], "#ffffff", "#ff6b6b", 600, 150),
    card([[pv[1]?.title ?? "", 900, "#ff8a8a", 46], [pv[1]?.sub ?? "", 600, "#ddd", 30]], "rgba(42,18,22,.94)", "#ff6b6b", 520, 150),
    card([[pv[2]?.title ?? "", 800, "#ff8a8a", 38], [pv[2]?.sub ?? "", 600, "#ddd", 30]], "rgba(42,18,22,.94)", "#ff6b6b", 600, 150),
  ];
  const rings = Array.from({ length: 5 }, (_, r) => ({
    m: add(new Mesh(new RingGeometry(0.3, 0.38, 48), new MeshBasicMaterial({ color: 0xff5a5a, transparent: true, opacity: 0, depthWrite: false }))),
    ph: r / 5,
    dx: rand(-1.6, 1.6),
    dy: rand(-1.2, 1.2),
  }));

  /* ---- WhatsApp: one card per automation ---- */
  const wv = vis("whatsapp");
  const WA = [
    card([[wv[0]?.title ?? "", 700, "#111", 34], [wv[0]?.sub ?? "", 500, "#444", 30]], "#ffffff", null, 600, 150),
    card([[wv[1]?.title ?? "", 800, "#111", 38], [wv[1]?.sub ?? "", 500, "#355", 30]], "#dcf8c6", null, 560, 150),
    card([[wv[2]?.title ?? "", 900, "#d48806", 40], [wv[2]?.sub ?? "", 600, "#333", 30]], "#ffffff", null, 520, 150),
    card([[wv[3]?.title ?? "", 900, "#2e7d32", 34], [wv[3]?.sub ?? "", 700, "#111", 34]], "#ffffff", null, 560, 150),
  ];

  /* ---- AI: beam, Top Pick card, pulses, one small label per chip ---- */
  const beam = add(
    new Mesh(
      new ConeGeometry(1.6, 16, 32, 1, true),
      new MeshBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false, side: DoubleSide }),
    ),
  );
  const aiTag = card([[o.aiTopPick.badge, 900, "#25D366", 30], [o.aiTopPick.title, 900, "#111", 44]], "#ffffff", "#25D366", 600, 160);
  const aiPulse = add(new Mesh(new RingGeometry(1.0, 1.1, 64), new MeshBasicMaterial({ color: 0x9fd4ff, transparent: true, opacity: 0, depthWrite: false })));
  aiPulse.rotation.x = -Math.PI / 2;
  const aiChips = vis("ai").map((v) => card([[v.title, 800, "#0b2a4a", 36]], "rgba(190,228,255,.95)", null, 520, 90));

  /* ---- How it works ---- */
  const hv = vis("how");
  const HOW = [
    card([[hv[0]?.title ?? "", 800, "#fff", 40], [hv[0]?.sub ?? "", 500, "#a9b1c1", 28]], "rgba(18,24,52,.94)", "#7cc4ff"),
    card([[hv[1]?.title ?? "", 800, "#fff", 40], [hv[1]?.sub ?? "", 500, "#a9b1c1", 28]], "rgba(18,24,52,.94)", "#7cc4ff"),
    card([[hv[2]?.title ?? "", 800, "#25D366", 40], [hv[2]?.sub ?? "", 500, "#a9b1c1", 28]], "rgba(18,24,52,.94)", "#25D366"),
  ];

  /* ---- Gold sparks ---- */
  const SN = 80;
  const sArr = new Float32Array(SN * 3);
  const sSeed = Array.from({ length: SN }, () => [rand(-0.8, 0.8), rand(-0.8, 0.8), Math.random(), rand(0.15, 0.35)]);
  const sGeo = new BufferGeometry();
  sGeo.setAttribute("position", new BufferAttribute(sArr, 3));
  const sMat = new PointsMaterial({ size: 0.28, map: dotTex("rgba(255,200,70,0.95)"), transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending });
  add(new Points(sGeo, sMat));

  /* ---- Projection: visual -> canvas px (left edge of the card) ---- */
  const tmpV = new Vector3();
  const toScreen = (sp: Sprite): [number, number] => {
    tmpV.copy(sp.position).project(camera);
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    let x = ((tmpV.x + 1) / 2) * W;
    const y = ((1 - tmpV.y) / 2) * H;
    const halfWorld = sp.scale.x / 2;
    const px = (halfWorld / (Math.tan((22.5 * Math.PI) / 180) * (camera.position.z - sp.position.z) * camera.aspect)) * (W / 2);
    x -= Math.min(px, W * 0.2);
    return [x, y];
  };

  /* ---- Size ---- */
  let lw = 0;
  let lh = 0;
  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === lw && h === lh) return;
    lw = w;
    lh = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  };

  /* ---- Frame ---- */
  let raf = 0;
  let running = false;
  let inView = true;
  let cur = o.readProgress();
  let tick = 0;
  const topW = new Vector3();
  const stIdx = { problem: byId("problem"), websites: byId("websites"), whatsapp: byId("whatsapp"), ai: byId("ai"), how: byId("how") };
  const S = CHAPTER_STARTS;

  const frame = (time: number) => {
    raf = requestAnimationFrame(frame);
    resize();
    const reduced = reducedMQ.matches;
    const mobile = camera.aspect < 0.9;
    // Phones: 30 fps is plenty, and saves battery
    tick++;
    if (mobile && tick % 2 === 1) return;

    const target = o.readProgress();
    cur += (target - cur) * (reduced ? 1 : 0.08);
    const p = cur;
    const Tm = time * 0.001;
    const { ci, lt } = chapterAt(p);
    const halfW = Math.tan((22.5 * Math.PI) / 180) * 13 * camera.aspect;
    let lead: LeadTarget | null = null;

    // Tower placement and rise
    const tx = mobile ? 0 : 3.6;
    const ty = mobile ? -0.2 : -3.3;
    const ts = mobile ? 0.58 : 1;
    T.tower.position.set(tx, ty, 0);
    const rise = reduced ? (p >= S[2] ? 1 : 0) : ease((p - S[2]) / 0.05);
    T.tower.scale.set(ts, ts * Math.max(0.001, rise), ts);
    T.tower.rotation.y = reduced ? 0.6 : Tm * 0.25;
    T.edgeMat.opacity = 0.85 * rise;
    topW.set(tx, ty + TOP * ts, 0);

    // ===== 01 Problem: bullet k ↔ card k =====
    const nP = chapters[stIdx.problem]?.steps ?? 3;
    const inP = band(p, S[1] + 0.005, S[2] - 0.005, 0.02);
    const kP = stepAt(lt, nP);
    const lP = stepLocal(lt, nP, kP);
    const pX = mobile ? 0 : 3.2;
    const pW = mobile ? 3.4 : 4.2;
    P.forEach((sp, j) => {
      let a = ci === 1 ? (j < kP ? 0.35 : j === kP ? (reduced ? 1 : ease(lP / 0.25)) : 0) : 0;
      if (mobile && j !== kP) a = 0;
      const y = mobile ? 3.2 : 2.2 - j * 1.9;
      const x = mobile ? 0 : pX + (j === 1 ? 0.8 : 0);
      place(sp, x, y, 1, pW * (j === kP ? 1 : 0.85), a * inP);
      if (ci === 1 && j === kP) lead = { ch: 1, k: kP, ...pt(sp), a: a * inP, target: "step" };
    });
    rings.forEach((r) => {
      const t = (Tm * 0.6 + r.ph) % 1;
      const on = ci === 1 && kP === 1 && !reduced ? inP : 0;
      r.m.scale.setScalar(1 + t * 3);
      (r.m.material as MeshBasicMaterial).opacity = on * (1 - t) * 0.9;
      r.m.position.set((mobile ? 0 : pX + 0.8) + r.dx, (mobile ? 3.2 : 0.3) + r.dy, 0.5);
    });

    // ===== 02 Websites: feature k lights two floors and its tag =====
    const nW = chapters[stIdx.websites]?.steps ?? 6;
    const kW = stepAt(lt, nW);
    const lW = stepLocal(lt, nW, kW);
    const litFloors = ci < 2 ? 0 : ci > 2 ? FLOORS : Math.min(FLOORS, kW * 2 + Math.floor((reduced ? 1 : ease(lW / 0.5)) * 2));
    T.floorMats.forEach((m, fl) => {
      const on = fl < litFloors ? 1 : 0;
      m.opacity = (0.08 + 0.5 * on) * rise;
      m.color.setHex(fl >= FLOORS - 2 && on ? 0x25d366 : 0xffc56b);
    });
    featTags.forEach((sp, j) => {
      let a = ci === 2 ? (j < kW ? 0.55 : j === kW ? (reduced ? 1 : ease(lW / 0.3)) : 0) : 0;
      if (mobile && j !== kW) a = 0;
      const fy = ty + (j * 2 + 1) * FH * ts;
      const side = mobile ? 0 : j % 2 ? -1 : 1;
      const x = mobile ? 0 : tx + side * 2.6;
      const y = mobile ? topW.y + 0.9 : fy;
      const aa = a * band(p, S[2], S[3] - 0.005, 0.015);
      place(sp, x, y, 1.2, mobile ? 2.6 : 2.8, aa);
      if (ci === 2 && j === kW) lead = { ch: 2, k: kW, ...pt(sp), a: aa, target: "step" };
    });
    const crownOn = reduced ? (p >= S[3] - 0.03 ? 1 : 0) : ease((p - (S[3] - 0.03)) / 0.03);
    (T.crown.material as MeshBasicMaterial).opacity = crownOn;
    // On phones the sign hides while feature tags sit above the roof
    T.label.material.opacity = crownOn * (mobile && ci === 2 ? 0 : 1);
    (T.baseGlow.material as MeshBasicMaterial).opacity = 0.2 + 0.7 * ease((p - 0.3) / 0.5);
    T.baseGlow.scale.setScalar(0.6 + 1.2 * ease((p - 0.35) / 0.5));

    // Customers: drift up (hero), stream past (problem), pour into the tower (WhatsApp)
    const pull = ease((p - S[3] - 0.02) / 0.1);
    cMat.color.setHex(p < S[2] ? 0xffffff : pull > 0.5 ? 0x25d366 : 0xffe3b0);
    cMat.size = mobile ? 0.17 : 0.22;
    const motion = reduced ? 0 : 1;
    for (let i = 0; i < N; i++) {
      const s = cSeed[i];
      const k = (Tm * s.s * motion + s.ph) % 1;
      let x: number;
      let y: number;
      let z = s.z;
      if (p < S[1]) {
        x = (s.ph - 0.5) * 22 + Math.sin(Tm * 0.3 + s.a) * 0.6 * motion;
        y = ((s.y + 4.5 + Tm * s.s * 6 * motion) % 9) - 4.5;
      } else {
        x = -12 + k * 24;
        y = s.y + Math.sin(k * 6 + s.a) * 0.3;
      }
      if (pull > 0) {
        const f2 = Math.min(1, pull * (0.4 + k));
        const cx = tx + Math.cos(s.a + Tm * motion) * 0.6 * (1 - f2);
        const cy = ty + 0.3 + k * TOP * ts;
        x += (cx - x) * f2;
        y += (cy - y) * f2;
        z *= 1 - f2;
      }
      cArr[i * 3] = x;
      cArr[i * 3 + 1] = y;
      cArr[i * 3 + 2] = z;
    }
    cGeo.attributes.position.needsUpdate = true;
    cMat.opacity = 0.9 * (1 - 0.5 * ease((p - 0.88) / 0.08));

    // ===== 03 WhatsApp: automation k ↔ card k =====
    const nA = chapters[stIdx.whatsapp]?.steps ?? 4;
    const kA = stepAt(lt, nA);
    const lA = stepLocal(lt, nA, kA);
    const inA = band(p, S[3] + 0.005, S[4] - 0.005, 0.02);
    const my = topW.y - 1.3;
    const waPos: [number, number][] = mobile
      ? [[0, my], [0, my], [0, my], [0, my]]
      : [[tx - 3.2, 2.2], [tx + 2.6, 1.2], [tx - 3.0, -0.3], [tx + 2.6, -1.6]];
    WA.forEach((sp, j) => {
      let a = ci === 3 ? (j < kA ? 0.5 : j === kA ? (reduced ? 1 : ease(lA / 0.25)) : 0) : 0;
      if (mobile && j !== kA) a = 0;
      const bx = clamp(waPos[j][0], -halfW + 1.6, halfW - 1.6);
      const fly = reduced ? 1 : Math.max(a, 0.001);
      place(
        sp,
        topW.x + (bx - topW.x) * fly,
        topW.y - 1 + (waPos[j][1] - topW.y + 1) * fly + Math.sin(Tm + j) * 0.06 * motion,
        1.5,
        mobile ? 3.2 : 3.4,
        a * inA,
      );
      if (ci === 3 && j === kA) lead = { ch: 3, k: kA, ...pt(sp), a: a * inA, target: "step" };
    });

    // ===== 04 AI: beam searches, locks on; Top Pick card; one pulse + label per chip =====
    const nI = chapters[stIdx.ai]?.steps ?? 4;
    const inI = band(p, S[4], S[5], 0.02);
    const lock = reduced ? 1 : ease((lt - 0.32) / 0.1);
    const bx2 = tx + Math.sin(Tm * 1.6) * (mobile ? 2.5 : 5) * (1 - lock);
    (beam.material as MeshBasicMaterial).opacity = (reduced ? 0 : 0.22) * inI;
    beam.position.set(bx2, topW.y + 8, 0);
    beam.rotation.z = (bx2 - tx) * -0.04;
    const answerA = inI * (reduced ? (lt >= AI_ANSWER_AT ? 1 : 0) : ease((lt - 0.4) / 0.08));
    const kI = ci === 4 ? stepAt(lt, nI, true) : -1;
    // Phones: above the tower's sign (the text panel covers the lower half); one visual at a time
    const aiSlotY = topW.y + (mobile ? 1.45 : 1.9);
    place(aiTag, topW.x + (mobile ? 0 : -0.2), aiSlotY, 2, mobile ? 3.2 : 3.8, mobile && kI >= 0 ? 0 : answerA);
    const pt2 = (Tm * 0.8) % 1;
    aiPulse.position.set(tx, ty + 0.05, 0);
    aiPulse.scale.setScalar((1 + pt2 * 2.5) * ts);
    (aiPulse.material as MeshBasicMaterial).opacity = (ci === 4 && kI >= 0 && !reduced ? inI : 0) * (1 - pt2);
    aiChips.forEach((sp, j) => {
      let a = ci === 4 && kI >= 0 ? (j < kI ? 0.5 : j === kI ? 1 : 0) : 0;
      if (mobile && j !== kI) a = 0;
      const x = mobile ? 0 : tx + (j % 2 ? -2.6 : 2.6);
      const y = mobile ? aiSlotY : ty + 0.4 + j * 0.75;
      place(sp, x, y, 1.2, mobile ? 2.4 : 2.6, a * inI);
    });
    if (ci === 4) {
      if (kI >= 0) lead = { ch: 4, k: kI, ...pt(aiChips[kI]), a: inI, target: "step" };
      else if (lt >= AI_ANSWER_AT) lead = { ch: 4, k: -1, ...pt(aiTag), a: answerA, target: "answer" };
    }

    // ===== 05 How it works: step k ↔ tile k =====
    const nH = chapters[stIdx.how]?.steps ?? 3;
    const kH = stepAt(lt, nH);
    const lH = stepLocal(lt, nH, kH);
    const inH = band(p, S[5] - 0.005, S[6] - 0.005, 0.02);
    const hy = topW.y - 1.4;
    const hPos: [number, number][] = mobile ? [[0, hy], [0, hy], [0, hy]] : [[tx - 3.2, 1.6], [tx + 2.8, 0.4], [tx - 3.0, -0.9]];
    HOW.forEach((sp, j) => {
      let a = ci === 5 ? (j < kH ? 0.6 : j === kH ? (reduced ? 1 : ease(lH / 0.25)) : 0) : 0;
      if (mobile && j !== kH) a = 0;
      place(sp, hPos[j][0], hPos[j][1], 1.5, mobile ? 3.0 : 3.2, a * inH);
      if (ci === 5 && j === kH) lead = { ch: 5, k: kH, ...pt(sp), a: a * inH, target: "step" };
    });

    // ===== 06 Gold sparks from the roof =====
    sMat.opacity = ease((p - (S[5] + 0.01)) / 0.05);
    for (let q = 0; q < SN; q++) {
      const sd = sSeed[q];
      const t2 = (Tm * sd[3] * motion + sd[2]) % 1;
      sArr[q * 3] = topW.x + sd[0] * (1 + t2 * 2);
      sArr[q * 3 + 1] = topW.y + t2 * 5;
      sArr[q * 3 + 2] = sd[1] * (1 + t2 * 2);
    }
    sGeo.attributes.position.needsUpdate = true;

    // Gentle camera drift (none with reduced motion)
    camera.position.x = reduced ? 0 : Math.sin(p * 6.28) * 0.4;
    camera.position.y = reduced ? 0 : Math.cos(p * 3.14) * 0.2;
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
    renderer.render(scene, camera);

    o.onFrame({ p, ci, lt, lead });
    // read by the tests: chapter, and which bullet's visual is showing ("chapter:bullet")
    canvas.dataset.chapter = String(ci);
    const shown = lead as LeadTarget | null;
    canvas.dataset.visual = shown && shown.a > 0.05 ? `${shown.ch}:${shown.k}` : "";
  };

  /** Card position for the dashed line (must run after the card has been placed). */
  function pt(sp: Sprite) {
    camera.updateMatrixWorld();
    const [x, y] = toScreen(sp);
    return { x, y };
  }

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
      scene.traverse((obj) => {
        const m = obj as Mesh;
        m.geometry?.dispose?.();
        const mat = m.material as MeshBasicMaterial | MeshBasicMaterial[] | undefined;
        (Array.isArray(mat) ? mat : mat ? [mat] : []).forEach((x) => {
          x.map?.dispose();
          x.dispose();
        });
      });
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
