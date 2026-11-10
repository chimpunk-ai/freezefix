// Render the weekly mirror card as an Instagram-portrait PNG.
//
// The Cal AI research doc flagged the Sunday card as our viral asset —
// the thing a creator can film a user tapping, the thing users can post to
// Threads with a one-line caption. For that to exist, the card has to leave
// the app as an image.
//
// Design rules this follows (drawn from the vision doc):
//   - No fake data in the render. What the live card sees is what the PNG
//     gets. If a mood correlation is withheld in the UI (<3 samples per
//     side, enforced in lib/pattern), it stays withheld here too.
//   - Pet-name only. The user can swap to a generic "fix user" with a toggle
//     before sharing. Redacted shares keep the week shape and drop nothing
//     else — the fact that one user had a four-smoke week is not private;
//     their pet-name attached to it might be.
//   - No logo on the card itself. A one-line attribution at the foot
//     ("fix · sunday") is enough — the brand is quiet.
//   - Warm-black #12100E ground, warm-sage #9CAF88 and signpost amber
//     #F0A868 for accents, matching the app. Inter + Newsreader via system
//     sans / system serif fallbacks when the font isn't loaded in the canvas
//     context.
//
// This module is pure canvas: no new npm deps, no server call, no Cloudflare
// Worker involvement. The image is generated in the browser and either
// shared via navigator.share or saved to disk via a blob URL.
//
// It is designed to work when invoked from a user click. Modern browsers
// gate canvas.toBlob and Web Share behind user activation, so the caller
// should wire it to an onClick, not an effect.

import { MOOD_LABEL, TRIGGER_LABEL, type Mood } from "./entry";
import { goalSentence, type WeekStats } from "./pattern";

/** The one aspect this module supports. 1080x1350 is the IG portrait slot
 *  and the shape most creators film against. */
export const SHARE_WIDTH = 1080;
export const SHARE_HEIGHT = 1350;

/** Warm palette, mirrored from app/globals.css. If those tokens ever drift,
 *  the PNG drifts too — the vision asks for exactly these three. */
const COLORS = {
  bg: "#12100E",
  card: "#1B1815",
  line: "#332C25",
  ink: "#F2EDE6",
  inkSoft: "#C9BEB1",
  inkFaint: "#94897C",
  accent: "#9CAF88",
  accentTint: "rgba(156, 175, 136, 0.12)",
  signpost: "#F0A868",
  frost: "#D8927A",
  frostTint: "rgba(216, 146, 122, 0.12)",
} as const;

export type ShareOptions = {
  name: string;
  stats: WeekStats;
  /** True = swap pet-name for a generic "fix user" in the title line. */
  redactName?: boolean;
  /** Override if you want a smaller export (devicePixelRatio sized); defaults
   *  to 1 because the canvas constants are already poster-sized. */
  scale?: number;
};

function isReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, line: number): number {
  const words = text.split(/\s+/);
  let row = "";
  let cursor = y;
  for (const w of words) {
    const test = row ? `${row} ${w}` : w;
    if (ctx.measureText(test).width > max && row) {
      ctx.fillText(row, x, cursor);
      row = w;
      cursor += line;
    } else {
      row = test;
    }
  }
  if (row) ctx.fillText(row, x, cursor);
  return cursor;
}

function dateRange(startISO: string, endISO: string): string {
  const fmt = (iso: string): string => {
    const [y, m, d] = iso.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toLowerCase();
  };
  return `${fmt(startISO)} – ${fmt(endISO)}`;
}

/** Draw the whole card. Returns the final canvas. The caller can then
 *  toBlob() it for sharing or downloading. */
export function drawSundayCard(canvas: HTMLCanvasElement, opts: ShareOptions): HTMLCanvasElement {
  const scale = opts.scale ?? 1;
  const W = SHARE_WIDTH * scale;
  const H = SHARE_HEIGHT * scale;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);

  // Subtle gradient highlight — matches the body gradient in globals.css,
  // just enough to keep the big dark rectangle from feeling lifeless.
  const g = ctx.createRadialGradient(SHARE_WIDTH * 0.25, SHARE_HEIGHT * 0.1, 0, SHARE_WIDTH * 0.25, SHARE_HEIGHT * 0.1, 900);
  g.addColorStop(0, "rgba(156, 175, 136, 0.07)");
  g.addColorStop(1, "rgba(156, 175, 136, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);

  // Card frame
  const margin = 80;
  const cardX = margin;
  const cardY = margin;
  const cardW = SHARE_WIDTH - margin * 2;
  const cardH = SHARE_HEIGHT - margin * 2 - 60;
  ctx.fillStyle = COLORS.card;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 2;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.stroke();

  const padX = cardX + 56;
  let cursorY = cardY + 90;

  // Date range eyebrow
  ctx.fillStyle = COLORS.inkFaint;
  ctx.font = "600 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`THE WEEK — ${dateRange(opts.stats.start, opts.stats.end).toUpperCase()}`, padX, cursorY);
  cursorY += 54;

  // Title line, pet-name or redacted
  const who = opts.redactName ? "fix user" : opts.name.trim() || "you";
  ctx.fillStyle = COLORS.ink;
  ctx.font = "400 68px Newsreader, Georgia, serif";
  ctx.fillText(`${who}, here’s your week`, padX, cursorY);
  cursorY += 68;

  // Sentences
  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = "400 30px Inter, system-ui, sans-serif";
  const lineHeight = 44;
  for (const s of opts.stats.sentences) {
    cursorY += 18;
    cursorY = wrap(ctx, s, padX, cursorY, cardW - 112, lineHeight) + lineHeight;
  }

  // Grid: 7 cells, matching the app
  cursorY += 20;
  const gridW = cardW - 112;
  const cellGap = 10;
  const cellW = (gridW - cellGap * 6) / 7;
  const cellH = cellW * 1.3;
  const cellY = cursorY;
  const weekdayInitials = ["M", "T", "W", "T", "F", "S", "S"];
  opts.stats.cells.forEach((c, i) => {
    const x = padX + i * (cellW + cellGap);
    const mood = c.mood as Mood | null;
    const tough = mood !== null && mood <= 2;
    const good = mood !== null && mood >= 4;
    let fill = COLORS.card;
    let stroke = COLORS.line;
    let textColor = COLORS.inkSoft;
    if (c.smoked === null) {
      fill = "rgba(36, 31, 26, 0.5)";
      textColor = COLORS.inkFaint;
    } else if (tough) {
      fill = COLORS.frostTint;
      stroke = "rgba(216, 146, 122, 0.3)";
      textColor = COLORS.frost;
    } else if (good) {
      fill = COLORS.accentTint;
      stroke = "rgba(156, 175, 136, 0.3)";
      textColor = COLORS.accent;
    }
    ctx.fillStyle = fill;
    roundRect(ctx, x, cellY, cellW, cellH, 14);
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    roundRect(ctx, x, cellY, cellW, cellH, 14);
    ctx.stroke();

    ctx.fillStyle = textColor;
    ctx.font = "500 24px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(weekdayInitials[i], x + cellW / 2, cellY + 36);
    ctx.font = "400 42px Inter, system-ui, sans-serif";
    const symbol = c.smoked === null ? "·" : c.smoked ? "🌿" : "☀";
    ctx.fillText(symbol, x + cellW / 2, cellY + cellH / 2 + 14);

    if (mood !== null) {
      ctx.font = "500 18px Inter, system-ui, sans-serif";
      ctx.fillText(MOOD_LABEL[mood], x + cellW / 2, cellY + cellH - 18);
    }
  });
  ctx.textAlign = "left";
  cursorY = cellY + cellH + 44;

  // Goal line
  if (opts.stats.goalLine) {
    const boxH = 92;
    ctx.fillStyle = COLORS.accentTint;
    roundRect(ctx, padX, cursorY, cardW - 112, boxH, 16);
    ctx.fill();
    ctx.strokeStyle = "rgba(156, 175, 136, 0.3)";
    ctx.lineWidth = 2;
    roundRect(ctx, padX, cursorY, cardW - 112, boxH, 16);
    ctx.stroke();
    ctx.fillStyle = COLORS.ink;
    ctx.font = "500 26px Inter, system-ui, sans-serif";
    const label = goalSentence(opts.stats.goalLine);
    wrap(ctx, label, padX + 24, cursorY + 36, cardW - 160, 36);
    cursorY += boxH + 28;
  }

  // Top trigger (if ≥ 2)
  if (opts.stats.topTrigger && opts.stats.topTriggerCount >= 2) {
    ctx.fillStyle = COLORS.inkFaint;
    ctx.font = "500 22px Inter, system-ui, sans-serif";
    ctx.fillText(
      `top trigger: ${TRIGGER_LABEL[opts.stats.topTrigger]} (x${opts.stats.topTriggerCount})`,
      padX,
      cursorY,
    );
    cursorY += 40;
  }

  // Observation if any
  if (opts.stats.observation) {
    ctx.fillStyle = COLORS.signpost;
    ctx.font = "500 22px Inter, system-ui, sans-serif";
    wrap(ctx, opts.stats.observation, padX, cursorY, cardW - 112, 30);
    cursorY += 40;
  }

  // Attribution at the foot
  ctx.fillStyle = COLORS.inkFaint;
  ctx.font = "500 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("fix · the sunday card", SHARE_WIDTH / 2, SHARE_HEIGHT - 62);
  ctx.font = "400 18px Inter, system-ui, sans-serif";
  ctx.fillText("getfreezefix.com", SHARE_WIDTH / 2, SHARE_HEIGHT - 30);

  return canvas;
}

/** Produce a Blob from the current card state. Returns null on failure
 *  (missing canvas context, blocked toBlob, unsupported browser). */
export async function sundayCardBlob(opts: ShareOptions): Promise<Blob | null> {
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  drawSundayCard(canvas, opts);
  return new Promise<Blob | null>((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), "image/png", 0.95);
    } catch {
      resolve(null);
    }
  });
}

/** True if the current browser can share files via navigator.share with a
 *  PNG payload. iOS 15+ and modern Android. Desktop Safari fakes
 *  canShare({files}) in weird ways, so we also require it to have a share
 *  button surface (user gesture). */
export function canShareImages(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") return false;
  if (!("canShare" in navigator) || typeof navigator.canShare !== "function") return false;
  try {
    const sample = new File([new Blob([], { type: "image/png" })], "sample.png", { type: "image/png" });
    return navigator.canShare({ files: [sample] });
  } catch {
    return false;
  }
}

/** Open the native share sheet with the PNG. Returns true on success. */
export async function shareSundayCard(opts: ShareOptions): Promise<boolean> {
  const blob = await sundayCardBlob(opts);
  if (!blob) return false;
  if (!canShareImages()) return false;
  try {
    const file = new File([blob], `fix-sunday-${opts.stats.end}.png`, { type: "image/png" });
    await navigator.share({
      files: [file],
      title: "my week on fix",
      text: isReducedMotion() ? "my week on fix." : "my week on fix. no email, no account, no streak.",
    });
    return true;
  } catch {
    return false;
  }
}

/** Download the PNG instead of opening the share sheet. Fallback for
 *  browsers without canShare({files}) or when the user prefers a file. */
export async function downloadSundayCard(opts: ShareOptions): Promise<boolean> {
  const blob = await sundayCardBlob(opts);
  if (!blob) return false;
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fix-sunday-${opts.stats.end}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Delay revoke so Safari has time to pull the blob out.
    window.setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch {
    return false;
  }
}
