import { MOOD_LABEL, type Mood } from "@/lib/entry";
import type { WeekStats } from "@/lib/pattern";

// The shelf as one shape: up to twelve weeks, oldest on the left. Each week
// is a bar for the nights smoked (out of seven) and a point for the average
// mood of the nights that were logged. A week with fewer than three logged
// nights is drawn thin — a dashed bar and no mood point — because the mirror
// doesn't speak for weeks it can't support. No grade, no trend line fitted
// through it; the eye can do that, and should be allowed to disagree.

const W = 700;
const H = 220;
const PAD_L = 62;
const PAD_R = 22;
const TOP = 22;
const BASE = 160;
const LABEL_Y = 198;
const THIN_MIN = 3;

function avgMood(w: WeekStats): number | null {
  const moods = w.cells.map((c) => c.mood).filter((m): m is Mood => m !== null);
  if (moods.length < THIN_MIN) return null;
  return moods.reduce((a, b) => a + b, 0) / moods.length;
}

function shortEnd(iso: string): string {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toLowerCase();
}

export function shelfTrendSummary(weeks: WeekStats[]): string {
  return (
    "the shelf, oldest first: " +
    weeks
      .map((w) => {
        const m = avgMood(w);
        return `week ending ${shortEnd(w.end)}: ${w.logged < THIN_MIN ? "thin, " : ""}smoked ${w.smoked} of 7${
          m ? `, mood around ${MOOD_LABEL[Math.round(m) as Mood]}` : ""
        }`;
      })
      .join("; ") +
    "."
  );
}

export function ShelfTrend({ weeks }: { weeks: WeekStats[] }) {
  const ws = [...weeks].sort((a, b) => (a.end < b.end ? -1 : 1));
  const n = ws.length;
  const col = (W - PAD_L - PAD_R) / Math.max(n, 4);
  const x = (i: number) => PAD_L + col * (i + 0.5);
  const barW = Math.min(28, col * 0.5);
  const yNights = (k: number) => BASE - ((BASE - TOP) * k) / 7;
  const yMood = (m: number) => BASE - ((BASE - TOP) * (m - 1)) / 4;

  const moodPts = ws.map((w, i) => ({ i, m: avgMood(w) })).filter((p): p is { i: number; m: number } => p.m !== null);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={shelfTrendSummary(ws)} focusable="false">
      {/* nights guide, left */}
      {[0, 7].map((k) => (
        <g key={k}>
          <line x1={PAD_L} x2={W - PAD_R} y1={yNights(k)} y2={yNights(k)} stroke="var(--color-line)" strokeOpacity={k === 0 ? 0.9 : 0.45} strokeDasharray={k === 0 ? undefined : "2 6"} />
          <text x={PAD_L - 10} y={yNights(k) + 5} textAnchor="end" fontSize="14" fill="var(--color-ink-faint)" fontFamily="inherit">
            {k === 0 ? "none" : "all 7"}
          </text>
        </g>
      ))}

      {/* bars: nights smoked */}
      <g className="ff-draw">
        {ws.map((w, i) => {
          const thin = w.logged < THIN_MIN;
          const h = BASE - yNights(w.smoked);
          return (
            <rect
              key={w.end}
              x={x(i) - barW / 2}
              y={BASE - Math.max(h, 2)}
              width={barW}
              height={Math.max(h, 2)}
              rx="4"
              fill={thin ? "none" : "var(--color-signpost)"}
              fillOpacity={thin ? 0 : 0.28}
              stroke={thin ? "var(--color-ink-faint)" : "var(--color-signpost)"}
              strokeOpacity={thin ? 0.8 : 0.6}
              strokeDasharray={thin ? "3 3" : undefined}
            />
          );
        })}
      </g>

      {/* mood points, joined only when adjacent weeks both have one */}
      {moodPts.map((p, k) => {
        const prev = moodPts[k - 1];
        return prev && prev.i === p.i - 1 ? (
          <line key={`l${p.i}`} x1={x(prev.i)} y1={yMood(prev.m)} x2={x(p.i)} y2={yMood(p.m)} stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" pathLength={1} className="ff-trace" />
        ) : null;
      })}
      <g className="ff-draw">
        {moodPts.map((p) => (
          <g key={`m${p.i}`}>
            <circle cx={x(p.i)} cy={yMood(p.m)} r="8" fill="var(--color-bg)" />
            <circle cx={x(p.i)} cy={yMood(p.m)} r="5.5" fill="var(--color-bg)" stroke="var(--color-accent)" strokeWidth="2.25" />
          </g>
        ))}
      </g>

      {/* week labels */}
      {ws.map((w, i) => (
        <text key={w.end} x={x(i)} y={LABEL_Y} textAnchor="middle" fontSize="14" fill="var(--color-ink-faint)" fontFamily="inherit">
          {n > 8 && i % 2 === 1 ? "" : shortEnd(w.end)}
        </text>
      ))}
    </svg>
  );
}

export function ShelfTrendKey() {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-12 text-ink-faint" aria-hidden>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm bg-signpost/40 ring-1 ring-signpost/60" /> nights smoked
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-accent" /> mood, averaged
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-sm border border-dashed border-ink-faint" /> thin week
      </span>
    </p>
  );
}
