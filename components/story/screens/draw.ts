/**
 * PHONE SCREEN DRAWINGS (ported from docs/demo/index.html).
 *
 * Used twice, so the pictures always match the 3D phone:
 *   1. `npm run screens` draws each screen once and saves a WebP picture
 *      to public/story/ (Layer 1 and Layer 2 show these pictures).
 *   2. The 3D phone (Layer 3) draws them live onto the phone's screen.
 *
 * Text comes from content/site.ts (story[].screen). Colours here imitate
 * real apps (WhatsApp, a browser, an AI chat), so they are separate from
 * the site theme on purpose.
 *
 * KEEP THIS FILE SELF-CONTAINED (no imports): the screens script loads it
 * straight into a browser page.
 */

export const SCREEN_W = 540;
export const SCREEN_H = 1120;

export const SCREEN_COLORS = {
  green: "#25D366",
  greenInk: "#04210f",
  accent: "#7cc4ff",
  platinum: "#d9dde3",
  red: "#ff6b6b",
  redSoft: "#ff8a8a",
  star: "#f5a623",
  waHeader: "#075E54",
  waBg: "#e9e2d8",
  waMine: "#dcf8c6",
  muted: "#a9b1c1",
};

export type ScreenStop = { id: string; screen: Record<string, string | string[]> };
export type ScreenOptions = { exampleLabel: string };

const FONT = 'system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif';

/**
 * Draw one stop's screen.
 * @param t progress through the stop, 0..1. Items appear as t grows.
 *          Pictures use t = 1 (everything visible).
 */
export function drawScreen(
  g: CanvasRenderingContext2D,
  stop: ScreenStop,
  t: number,
  opts: ScreenOptions,
): void {
  const W = SCREEN_W;
  const H = SCREEN_H;
  const C = SCREEN_COLORS;
  const s = stop.screen;
  const str = (k: string) => (typeof s[k] === "string" ? (s[k] as string) : "");
  const arr = (k: string) => (Array.isArray(s[k]) ? (s[k] as string[]) : []);
  const clamp = (x: number) => Math.max(0, Math.min(1, x));
  const A = (start: number, len = 0.08) => clamp((t - start) / len);

  const font = (px: number, w = 500) => {
    g.font = `${w} ${px}px ${FONT}`;
  };
  const rect = (x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) => {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
    g.fillStyle = fill;
    g.fill();
  };
  const wrap = (txt: string, x: number, y: number, maxW: number, lh: number) => {
    const words = txt.split(" ");
    let line = "";
    let yy = y;
    for (const word of words) {
      const test = line + word + " ";
      if (g.measureText(test).width > maxW && line) {
        g.fillText(line.trim(), x, yy);
        line = word + " ";
        yy += lh;
      } else line = test;
    }
    g.fillText(line.trim(), x, yy);
    return yy + lh;
  };
  const status = (dark: boolean) => {
    g.fillStyle = dark ? "#fff" : "#111";
    font(22, 600);
    g.fillText("9:41", 36, 52);
    g.textAlign = "right";
    g.fillText("4G  ▮▮▮", W - 36, 52);
    g.textAlign = "left";
    rect(W / 2 - 70, 24, 140, 34, 17, "#000");
  };
  const bubble = (txt: string, side: "l" | "r", y: number, bg: string, fg: string, appear: number) => {
    if (appear <= 0) return y;
    g.globalAlpha = Math.min(1, appear);
    font(26, 500);
    const maxW = 360;
    const lines: string[] = [];
    let line = "";
    for (const word of txt.split(" ")) {
      const test = line + word + " ";
      if (g.measureText(test).width > maxW && line) {
        lines.push(line.trim());
        line = word + " ";
      } else line = test;
    }
    lines.push(line.trim());
    let w = 0;
    for (const l of lines) w = Math.max(w, g.measureText(l).width);
    w += 40;
    const h = lines.length * 34 + 26;
    const x = side === "r" ? W - 30 - w : 30;
    const dy = (1 - Math.min(1, appear)) * 20;
    rect(x, y + dy, w, h, 20, bg);
    g.fillStyle = fg;
    lines.forEach((l, i) => g.fillText(l, x + 20, y + dy + 40 + i * 34));
    g.globalAlpha = 1;
    return y + h + 18;
  };
  /** Small "example" note at the bottom of screens that show a made-up business. */
  const example = (color: string) => {
    font(19, 600);
    g.fillStyle = color;
    g.textAlign = "center";
    g.fillText(opts.exampleLabel, W / 2, H - 46);
    g.textAlign = "left";
  };
  /** "L|text" or "R|text" -> side + text */
  const msg = (m: string): ["l" | "r", string] => {
    const [side, ...rest] = m.split("|");
    return [side === "R" ? "r" : "l", rest.join("|")];
  };

  g.save();
  g.clearRect(0, 0, W, H);
  g.textAlign = "left";
  g.globalAlpha = 1;

  switch (stop.id) {
    case "hero": {
      const gr = g.createLinearGradient(0, 0, 0, H);
      gr.addColorStop(0, "#141c3a");
      gr.addColorStop(1, "#060912");
      g.fillStyle = gr;
      g.fillRect(0, 0, W, H);
      status(true);
      g.fillStyle = C.platinum;
      font(30, 800);
      g.fillText(str("brand"), 60, 250);
      const colors = ["#fff", "#fff", C.accent, C.green];
      font(64, 800);
      arr("lines").forEach((l, i) => {
        g.fillStyle = colors[i] ?? "#fff";
        g.fillText(l, 60, 470 + i * 88);
      });
      rect(60, 880, W - 120, 90, 45, C.green);
      g.fillStyle = C.greenInk;
      font(30, 700);
      g.textAlign = "center";
      g.fillText(str("button"), W / 2, 937);
      g.textAlign = "left";
      break;
    }

    case "problem": {
      g.fillStyle = "#14080b";
      g.fillRect(0, 0, W, H);
      status(true);
      g.fillStyle = C.redSoft;
      font(24, 700);
      g.fillText(str("title"), 40, 140);
      let y = 180;
      g.globalAlpha = A(0.05);
      rect(30, y, W - 60, 190, 22, "#24161a");
      g.fillStyle = "#fff";
      font(26, 600);
      g.fillText(str("searchTitle"), 56, y + 56);
      g.fillStyle = C.redSoft;
      font(24, 500);
      wrap(str("searchText"), 56, y + 104, W - 120, 32);
      g.globalAlpha = 1;
      y += 220;
      g.globalAlpha = A(0.3);
      rect(30, y, W - 60, 190, 22, "#24161a");
      g.fillStyle = C.red;
      font(30, 800);
      g.fillText(str("callsTitle"), 56, y + 60);
      g.fillStyle = "#ddd";
      font(24, 500);
      wrap(str("callsText"), 56, y + 108, W - 120, 32);
      g.globalAlpha = 1;
      y += 220;
      g.globalAlpha = A(0.55);
      rect(30, y, W - 60, 240, 22, "#24161a");
      g.fillStyle = "#fff";
      font(26, 600);
      g.fillText(str("aiTitle"), 56, y + 52);
      g.fillStyle = "#aab";
      font(24, 500);
      wrap(str("aiQuestion"), 56, y + 96, W - 120, 32);
      g.fillStyle = C.redSoft;
      wrap(str("aiAnswer"), 56, y + 150, W - 120, 32);
      g.globalAlpha = 1;
      example("#b98a8f");
      break;
    }

    case "ai": {
      g.fillStyle = "#f4f6fb";
      g.fillRect(0, 0, W, H);
      status(false);
      g.fillStyle = "#111";
      font(28, 700);
      g.fillText(str("app"), 40, 130);
      let y = 190;
      y = bubble(str("question"), "r", y, "#2b6cff", "#fff", A(0.02, 0.1));
      if (t > 0.2 && t < 0.38) {
        g.fillStyle = "#bbb";
        font(40, 800);
        g.fillText("• • •", 50, y + 30);
      }
      if (t >= 0.38) {
        g.globalAlpha = A(0.38, 0.12);
        rect(30, y, W - 60, 330, 24, "#ffffff");
        g.strokeStyle = C.green;
        g.lineWidth = 4;
        g.stroke();
        g.fillStyle = C.green;
        font(20, 800);
        g.fillText(str("badge"), 56, y + 46);
        g.fillStyle = "#111";
        font(34, 800);
        g.fillText(str("business"), 56, y + 96);
        g.fillStyle = C.star;
        font(28, 700);
        g.fillText(str("rating"), 56, y + 142);
        g.fillStyle = "#444";
        font(23, 500);
        wrap(str("reason"), 56, y + 188, W - 120, 32);
        rect(56, y + 250, 200, 56, 28, C.green);
        g.fillStyle = C.greenInk;
        font(22, 700);
        g.fillText(str("button"), 96, y + 286);
        g.globalAlpha = 1;
      }
      example("#7a8194");
      break;
    }

    case "website": {
      g.fillStyle = "#fff";
      g.fillRect(0, 0, W, H);
      status(false);
      rect(24, 76, W - 48, 52, 26, "#eef1f6");
      g.fillStyle = "#555";
      font(22, 500);
      g.fillText(str("url"), 60, 110);
      rect(24, 140, (W - 48) * A(0, 0.25), 6, 3, C.green);
      g.globalAlpha = A(0.15, 0.15);
      const gr = g.createLinearGradient(0, 170, 0, 560);
      gr.addColorStop(0, "#1d3b8f");
      gr.addColorStop(1, "#4fa3ff");
      rect(24, 170, W - 48, 390, 24, gr);
      g.fillStyle = "#fff";
      font(44, 800);
      g.fillText(str("business"), 56, 300);
      font(24, 500);
      wrap(str("tagline"), 56, 350, W - 130, 32);
      rect(56, 450, 210, 64, 32, C.green);
      g.fillStyle = C.greenInk;
      font(22, 700);
      g.fillText(str("primary"), 84, 490);
      rect(282, 450, 170, 64, 32, "#fff");
      g.fillStyle = "#1d3b8f";
      g.fillText(str("secondary"), 335, 490);
      g.globalAlpha = A(0.35, 0.15);
      arr("rows").forEach((row, i) => {
        rect(24, 600 + i * 96, W - 48, 80, 18, "#f2f5fa");
        g.fillStyle = "#222";
        font(26, 600);
        g.fillText(row, 56, 600 + i * 96 + 50);
      });
      g.globalAlpha = 1;
      example("#8a90a0");
      break;
    }

    case "whatsapp": {
      g.fillStyle = C.waBg;
      g.fillRect(0, 0, W, H);
      g.fillStyle = C.waHeader;
      g.fillRect(0, 0, W, 170);
      status(true);
      g.fillStyle = "#fff";
      font(30, 700);
      g.fillText(str("chatName"), 110, 134);
      g.beginPath();
      g.arc(66, 122, 30, 0, 7);
      g.fillStyle = C.green;
      g.fill();
      let y = 200;
      g.globalAlpha = A(0);
      rect(W / 2 - 150, y, 300, 48, 24, "#fde7e7");
      g.fillStyle = "#c0392b";
      font(22, 700);
      g.textAlign = "center";
      g.fillText(str("missed"), W / 2, y + 32);
      g.textAlign = "left";
      g.globalAlpha = 1;
      y += 70;
      const starts = [0.1, 0.25, 0.4, 0.58];
      arr("messages").forEach((m, i) => {
        const [side, text] = msg(m);
        y = bubble(text, side, y, side === "r" ? C.waMine : "#fff", "#111", A(starts[i] ?? 0.6));
      });
      const a = A(0.74);
      if (a > 0) {
        g.globalAlpha = a;
        rect(30, y, W - 60, 150, 20, "#fff");
        g.fillStyle = "#2e7d32";
        font(24, 800);
        g.fillText(str("payTitle"), 56, y + 46);
        g.fillStyle = "#111";
        font(26, 600);
        g.fillText(str("payText"), 56, y + 88);
        rect(56, y + 102, 180, 36, 18, C.green);
        g.fillStyle = C.greenInk;
        font(20, 700);
        g.fillText(str("payButton"), 96, y + 127);
        g.globalAlpha = 1;
      }
      example("#7d7466");
      break;
    }

    case "how": {
      g.fillStyle = "#10132a";
      g.fillRect(0, 0, W, H);
      status(true);
      g.fillStyle = "#fff";
      font(36, 800);
      g.fillText(str("title"), 50, 170);
      arr("steps").forEach((step, i) => {
        const [title, sub] = step.split("|");
        const a = A(0.08 + i * 0.22, 0.12);
        const y = 240 + i * 230;
        g.globalAlpha = 0.35 + 0.65 * a;
        rect(36, y, W - 72, 190, 24, "#1b2045");
        g.beginPath();
        g.arc(100, y + 95, 36, 0, 7);
        g.fillStyle = a >= 1 ? C.green : "#3a4170";
        g.fill();
        g.fillStyle = C.greenInk;
        font(36, 900);
        g.textAlign = "center";
        g.fillText(a >= 1 ? "✓" : String(i + 1), 100, y + 108);
        g.textAlign = "left";
        g.fillStyle = "#fff";
        font(27, 700);
        g.fillText(title ?? "", 160, y + 84);
        g.fillStyle = C.muted;
        font(22, 500);
        g.fillText(sub ?? "", 160, y + 122);
        g.globalAlpha = 1;
      });
      break;
    }

    case "cta": {
      g.fillStyle = C.waBg;
      g.fillRect(0, 0, W, H);
      g.fillStyle = C.waHeader;
      g.fillRect(0, 0, W, 170);
      status(true);
      g.fillStyle = "#fff";
      font(30, 700);
      g.fillText(str("chatName"), 110, 134);
      g.beginPath();
      g.arc(66, 122, 30, 0, 7);
      g.fillStyle = C.platinum;
      g.fill();
      let y = 230;
      const starts = [0.05, 0.3];
      arr("messages").forEach((m, i) => {
        const [side, text] = msg(m);
        y = bubble(text, side, y, side === "r" ? C.waMine : "#fff", "#111", A(starts[i] ?? 0.4));
      });
      g.globalAlpha = A(0.5);
      rect(40, H - 220, W - 80, 100, 50, C.green);
      g.fillStyle = C.greenInk;
      font(32, 800);
      g.textAlign = "center";
      g.fillText(str("button"), W / 2, H - 158);
      g.textAlign = "left";
      g.globalAlpha = 1;
      break;
    }
  }

  g.restore();
}
