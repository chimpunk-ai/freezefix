// Bisect level 4: drawing + helpers back; sundayCardBlob stays no-op.
// If this fails Workers Builds, the problem is in drawSundayCard / roundRect
// / wrap / dateRange. If it passes, the problem is specifically in
// sundayCardBlob (document.createElement + canvas.toBlob).

import { MOOD_LABEL, TRIGGER_LABEL, type Mood } from "./entry";
import { goalSentence, type WeekStats } from "./pattern";

export const SHARE_WIDTH = 1080;
export const SHARE_HEIGHT = 1350;

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
  redactName?: boolean;
  scale?: number;
};

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
  return `${fmt(startISO)} - ${fmt(endISO)}`;
}

export function drawSundayCard(canvas: HTMLCanvasElement, opts: ShareOptions): HTMLCanvasElement {
  const scale = opts.scale ?? 1;
  const W = SHARE_WIDTH * scale;
  const H = SHARE_HEIGHT * scale;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(scale, scale);

  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);

  const g = ctx.createRadialGradient(SHARE_WIDTH * 0.25, SHARE_HEIGHT * 0.1, 0, SHARE_WIDTH * 0.25, SHARE_HEIGHT * 0.1, 900);
  g.addColorStop(0, "rgba(156, 175, 136, 0.07)");
  g.addColorStop(1, "rgba(156, 175, 136, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, SHARE_WIDTH, SHARE_HEIGHT);

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

  ctx.fillStyle = COLORS.inkFaint;
  ctx.font = "600 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`THE WEEK - ${dateRange(opts.stats.start, opts.stats.end).toUpperCase()}`, padX, cursorY);
  cursorY += 54;

  const who = opts.redactName ? "fix user" : opts.name.trim() || "you";
  ctx.fillStyle = COLORS.ink;
  ctx.font = "400 68px Newsreader, Georgia, serif";
  ctx.fillText(`${who}, here is your week`, padX, cursorY);
  cursorY += 68;

  ctx.fillStyle = COLORS.inkSoft;
  ctx.font = "400 30px Inter, system-ui, sans-serif";
  const lineHeight = 44;
  for (const s of opts.stats.sentences) {
    cursorY += 18;
    cursorY = wrap(ctx, s, padX, cursorY, cardW - 112, lineHeight) + lineHeight;
  }

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
    const symbol = c.smoked === null ? "-" : c.smoked ? "o" : "+";
    ctx.fillText(symbol, x + cellW / 2, cellY + cellH / 2 + 14);

    if (mood !== null) {
      ctx.font = "500 18px Inter, system-ui, sans-serif";
      ctx.fillText(MOOD_LABEL[mood], x + cellW / 2, cellY + cellH - 18);
    }
  });
  ctx.textAlign = "left";
  cursorY = cellY + cellH + 44;

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

  if (opts.stats.observation) {
    ctx.fillStyle = COLORS.signpost;
    ctx.font = "500 22px Inter, system-ui, sans-serif";
    wrap(ctx, opts.stats.observation, padX, cursorY, cardW - 112, 30);
    cursorY += 40;
  }

  ctx.fillStyle = COLORS.inkFaint;
  ctx.font = "500 22px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("fix - the sunday card", SHARE_WIDTH / 2, SHARE_HEIGHT - 62);
  ctx.font = "400 18px Inter, system-ui, sans-serif";
  ctx.fillText("getfreezefix.com", SHARE_WIDTH / 2, SHARE_HEIGHT - 30);

  return canvas;
}

export function canShareImages(): boolean {
  return false;
}

export async function sundayCardBlob(_opts: ShareOptions): Promise<Blob | null> {
  return null;
}

export async function shareSundayCard(_opts: ShareOptions): Promise<boolean> {
  return false;
}

export async function downloadSundayCard(_opts: ShareOptions): Promise<boolean> {
  return false;
}
