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
