import { MOOD_LABEL, type Mood } from "@/lib/entry";
import { weekdayName, type WeekStats } from "@/lib/pattern";

// The week as a line: mood across seven nights, with each night marked by
// whether they smoked. It sits above the grid on the Sunday card and says the
// same thing the grid does in a shape the eye reads in one go.
//
// Honesty rules, same as the sentences:
// - a night that wasn't logged is a gap in the line, never a point. The line
//   breaks around it; it is not interpolated.
// - a logged night without a mood sits on the baseline as a mark, not on the
//   curve.
// - nothing is scored. The y-axis is the five faces, labelled in words.
//
// Motion: the line traces left to right once (stroke-dashoffset) and the
// points fade in with the same stagger the grid uses. Both collapse to zero
// under prefers-reduced-motion via the global rule.

const W = 700;
const H = 210;
const PAD_L = 62;
const PAD_R = 22;
const TOP = 26;
const BASE = 158; // y of mood 1
const STEP = (BASE - TOP) / 4; // per mood step
const LABEL_Y = 196;
const COL = (W - PAD_L - PAD_R) / 7;

const x = (i: number) => PAD_L + COL * (i + 0.5);
const y = (m: Mood) => BASE - (m - 1) * STEP;

type Pt = { i: number; x: number; y: number; mood: Mood; smoked: boolean };

/** Monotone cubic through the points of one unbroken run, as an SVG path. */
function runPath(pts: Pt[]): string {
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;
  const n = pts.length;
  const d = pts.map((p, k) => (k === 0 ? 0 : (p.y - pts[k - 1].y) / (p.x - pts[k - 1].x)));
  const m: number[] = new Array(n).fill(0);
  for (let k = 1; k < n - 1; k++) {
    if (d[k] * d[k + 1] <= 0) m[k] = 0;
    else m[k] = (d[k] + d[k + 1]) / 2;
  }
  m[0] = d[1];
  m[n - 1] = d[n - 1];
  let out = `M${pts[0].x},${pts[0].y}`;
  for (let k = 1; k < n; k++) {
    const a = pts[k - 1];
    const b = pts[k];
    const dx = (b.x - a.x) / 3;
    out += ` C${a.x + dx},${a.y + m[k - 1] * dx} ${b.x - dx},${b.y - m[k] * dx} ${b.x},${b.y}`;
  }
  return out;
}

export function weekCurveSummary(stats: WeekStats): string {
  const parts = stats.cells.map((c) => {
    const d = weekdayName(c.day);
    if (c.smoked === null) return `${d} not logged`;
    const m = c.mood ? MOOD_LABEL[c.mood as Mood] : "no mood";
    return `${d} ${m}, ${c.smoked ? "smoked" : "didn't smoke"}${c.goalDone ? ", did your thing" : ""}`;
  });
  return `mood across the week: ${parts.join("; ")}.`;
}

export function WeekCurve({ stats, id }: { stats: WeekStats; id?: string }) {
  const uid = id ?? stats.end.replace(/-/g, "");
  const runs: Pt[][] = [];
  let run: Pt[] = [];
  stats.cells.forEach((c, i) => {
    if (c.smoked !== null && c.mood) {
      run.push({ i, x: x(i), y: y(c.mood as Mood), mood: c.mood as Mood, smoked: c.smoked });
    } else if (run.length) {
      runs.push(run);
      run = [];
    }
  });
  if (run.length) runs.push(run);
  const onCurve = runs.flat();

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="block h-auto w-full"
      role="img"
      aria-label={weekCurveSummary(stats)}
      focusable="false"
    >
      <defs>
        <filter id={`glow-${uid}`} x="-10%" y="-40%" width="120%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <linearGradient id={`fill-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-accent)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* the five faces, as faint guides */}
      {([5, 4, 3, 2, 1] as const).map((m) => (
        <g key={m}>
          <line x1={PAD_L} x2={W - PAD_R} y1={y(m)} y2={y(m)} stroke="var(--color-line)" strokeOpacity={m === 3 ? 0.9 : 0.45} strokeDasharray={m === 3 ? undefined : "2 6"} />
          <text
            x={PAD_L - 10}
            y={y(m) + 5}
            textAnchor="end"
            fontSize="16"
            fill="var(--color-ink-faint)"
            fontFamily="inherit"
            className={m === 5 || m === 1 ? undefined : "hidden sm:block"}
          >
            {MOOD_LABEL[m]}
          </text>
        </g>
      ))}

      {/* area + line, one run per unbroken stretch of logged nights */}
      {runs.map((r, k) =>
        r.length > 1 ? (
          <g key={k}>
            <path d={`${runPath(r)} L${r[r.length - 1].x},${BASE + 2} L${r[0].x},${BASE + 2} Z`} fill={`url(#fill-${uid})`} />
            <path d={runPath(r)} fill="none" stroke="var(--color-accent)" strokeWidth="6" strokeOpacity="0.45" strokeLinecap="round" filter={`url(#glow-${uid})`} pathLength={1} className="ff-trace" />
            <path d={runPath(r)} fill="none" stroke="var(--color-accent)" strokeWidth="2.25" strokeLinecap="round" pathLength={1} className="ff-trace" />
          </g>
        ) : null,
      )}

      {/* nights */}
      <g className="ff-draw">
        {stats.cells.map((c, i) => {
          const cx = x(i);
          if (c.smoked === null) {
            return (
              <g key={c.day}>
                <circle cx={cx} cy={BASE} r="5" fill="none" stroke="var(--color-ink-faint)" strokeDasharray="2 3" />
              </g>
            );
          }
          const pt = onCurve.find((p) => p.i === i);
          const cy = pt ? pt.y : BASE;
          const col = c.smoked ? "var(--color-signpost)" : "var(--color-accent)";
          return (
            <g key={c.day}>
              <circle cx={cx} cy={cy} r="9" fill="var(--color-bg)" />
              <circle cx={cx} cy={cy} r="6.5" fill={c.smoked ? col : "var(--color-bg)"} stroke={col} strokeWidth="2.25" />
              {c.goalDone ? (
                <path d={`M${cx - 5},${LABEL_Y - 24} l3.5,3.5 l7,-7`} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              ) : null}
            </g>
          );
        })}
      </g>

      {/* day initials */}
      {stats.cells.map((c, i) => (
        <text key={c.day} x={x(i)} y={LABEL_Y} textAnchor="middle" fontSize="16" fill="var(--color-ink-faint)" fontFamily="inherit">
          {c.initial}
        </text>
      ))}
    </svg>
  );
}

export function WeekCurveKey() {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-12 text-ink-faint" aria-hidden>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full bg-signpost" /> smoked
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full border-2 border-accent" /> didn&rsquo;t
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block h-2.5 w-2.5 rounded-full border border-dashed border-ink-faint" /> not logged
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="text-accent">✓</span> did your thing
      </span>
    </p>
  );
}
