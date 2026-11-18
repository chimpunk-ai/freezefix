// A compact "this week at a glance" panel. Lives above the existing Sunday
// card's prose. Four number tiles + a mood sparkline + a trigger mix.
//
// Design principles for this surface (project vision + "chart with manners"):
//   - Honest > pretty. A tile shows what the log actually holds. If there's
//     not enough signal, the tile shows an em-dash and a short reason, never
//     a fake number or a motivational blank.
//   - Numbers, never adjectives. "3 of 7" not "good week".
//   - No icons that imply judgement (no checkmarks on non-smoke nights, no
//     flames for streaks). The dot stays a dot.
//   - Monotone + one accent (the sage line / amber signpost). Nothing
//     saturated; nothing that reads as a gamification layer.
//   - Mobile-first (grid-cols-2) with a comfortable laptop layout at md:.
//
// Server component. No interactivity needed; everything is read-only.

import { MIN_MOOD_SAMPLES, type WeekStats } from "@/lib/pattern";
import { TRIGGER_LABEL, type TriggerId } from "@/lib/entry";

export default function WeekInsights({ stats }: { stats: WeekStats }) {
  const { logged, smoked, cells, topTrigger, topTriggerCount, moodOnSmoke, moodOnNoSmoke, moodOnSmokeN, moodOnNoSmokeN, moodTrendText } = compute(stats);
  const nothing = logged === 0;

  return (
    <section aria-label="this week at a glance" className="mt-6">
      {/* Four tiles. Two columns on phone, four on laptop. Each tile is a
          single number + a line of context. Reads top-left to bottom-right. */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile
          label="nights logged"
          value={nothing ? "—" : `${logged}/7`}
          note={nothing ? "nothing yet" : logged === 7 ? "the whole week" : `${7 - logged} skipped`}
        />
        <Tile
          label="smoke nights"
          value={nothing ? "—" : String(smoked)}
          note={nothing ? "nothing to count" : smoked === 0 ? "no smoke logged" : `of ${logged} logged`}
          accent={smoked > 0}
        />
        <Tile
          label="top trigger"
          value={topTrigger && topTriggerCount >= 2 ? `‘${TRIGGER_LABEL[topTrigger]}’` : "—"}
          note={topTrigger && topTriggerCount >= 2 ? `${topTriggerCount} night${topTriggerCount === 1 ? "" : "s"}` : "no repeat yet"}
          small
        />
        <Tile
          label="mood pattern"
          value={moodOnSmoke !== null && moodOnNoSmoke !== null && moodOnSmokeN >= MIN_MOOD_SAMPLES && moodOnNoSmokeN >= MIN_MOOD_SAMPLES ? moodTrendText : "—"}
          note={moodOnSmoke !== null && moodOnNoSmoke !== null && moodOnSmokeN >= MIN_MOOD_SAMPLES && moodOnNoSmokeN >= MIN_MOOD_SAMPLES ? "smoke vs sober nights" : "need more nights"}
          small
        />
      </div>

      {/* Mood sparkline + trigger mix, side by side on laptop. */}
      <div className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <MoodSparkline stats={stats} />
        <TriggerMix stats={stats} />
      </div>
    </section>
  );
}

function compute(stats: WeekStats) {
  const diff =
    stats.moodOnSmoke !== null && stats.moodOnNoSmoke !== null
      ? stats.moodOnNoSmoke - stats.moodOnSmoke
      : null;
  let moodTrendText = "—";
  if (diff !== null) {
    if (Math.abs(diff) < 0.35) moodTrendText = "about even";
    else if (diff > 0) moodTrendText = "lower on smoke nights";
    else moodTrendText = "higher on smoke nights";
  }
  return {
    logged: stats.logged,
    smoked: stats.smoked,
    cells: stats.cells,
    topTrigger: stats.topTrigger,
    topTriggerCount: stats.topTriggerCount,
    moodOnSmoke: stats.moodOnSmoke,
    moodOnNoSmoke: stats.moodOnNoSmoke,
    moodOnSmokeN: stats.cells.filter((c) => c.smoked === true && c.mood !== null).length,
    moodOnNoSmokeN: stats.cells.filter((c) => c.smoked === false && c.mood !== null).length,
    moodTrendText,
  };
}

function Tile({
  label,
  value,
  note,
  accent = false,
  small = false,
}: {
  label: string;
  value: string;
  note: string;
  accent?: boolean;
  small?: boolean;
}) {
  return (
    <div className="rounded-sheet border border-line bg-card/70 p-4 md:p-5">
      <p className="text-11 uppercase tracking-[0.14em] text-ink-faint">{label}</p>
      <p
        className={[
          "mt-2 font-display leading-none text-ink",
          small ? "text-20 md:text-22" : "text-32 md:text-40",
          accent ? "text-accent" : "",
        ].join(" ")}
      >
        {value}
      </p>
      <p className="mt-2 text-12 text-ink-soft">{note}</p>
    </div>
  );
}

// 7-point mood line. Dashed for missing nights, filled for logged ones.
// Fixed viewBox so the SVG stays crisp at any size.
function MoodSparkline({ stats }: { stats: WeekStats }) {
  const W = 320;
  const H = 72;
  const pad = 8;
  const n = stats.cells.length;
  const xStep = (W - pad * 2) / (n - 1);
  // Mood range is 1-5; map to y so higher mood is up.
  const y = (m: number) => H - pad - ((m - 1) / 4) * (H - pad * 2);

  // Build a path that skips unlogged nights but draws a dotted connector.
  const segments: Array<{ from: { x: number; y: number }; to: { x: number; y: number }; dotted: boolean }> = [];
  let prev: { x: number; y: number } | null = null;
  const points: Array<{ x: number; y: number; logged: boolean }> = [];
  stats.cells.forEach((c, i) => {
    const x = pad + i * xStep;
    const logged = c.mood !== null;
    if (logged) {
      const p = { x, y: y(c.mood as number) };
      if (prev) {
        // dotted if any gap existed between prev's index and now
        const gap = Math.round((p.x - prev.x) / xStep);
        segments.push({ from: prev, to: p, dotted: gap > 1 });
      }
      points.push({ x: p.x, y: p.y, logged: true });
      prev = p;
    } else {
      points.push({ x, y: H / 2, logged: false });
    }
  });

  const hasAny = points.some((p) => p.logged);

  return (
    <div className="rounded-sheet border border-line bg-card/70 p-4 md:p-5">
      <div className="flex items-baseline justify-between">
        <p className="text-11 uppercase tracking-[0.14em] text-ink-faint">mood, 7 nights</p>
        <p className="text-12 text-ink-faint">1 (worst) &ndash; 5 (best)</p>
      </div>
      <svg
        role="img"
        aria-label={hasAny ? "Mood across the week, line chart. Missing nights are shown as dotted gaps." : "No mood logged this week."}
        viewBox={`0 0 ${W} ${H}`}
        className="mt-3 h-20 w-full"
      >
        {/* Baseline at mood 3 (the middle). */}
        <line
          x1={pad}
          x2={W - pad}
          y1={y(3)}
          y2={y(3)}
          stroke="currentColor"
          strokeOpacity={0.15}
          strokeDasharray="2 3"
          className="text-ink-faint"
        />
        {/* Line segments. */}
        {segments.map((s, i) => (
          <line
            key={i}
            x1={s.from.x}
            y1={s.from.y}
            x2={s.to.x}
            y2={s.to.y}
            stroke="currentColor"
            strokeWidth={1.75}
            strokeDasharray={s.dotted ? "3 3" : undefined}
            className="text-accent"
          />
        ))}
        {/* Points. Filled for logged, hollow for missing. */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.logged ? 3.5 : 2}
            fill={p.logged ? "currentColor" : "transparent"}
            stroke="currentColor"
            strokeWidth={p.logged ? 0 : 1.25}
            className={p.logged ? "text-accent" : "text-ink-faint"}
          />
        ))}
      </svg>
      {/* Day labels. */}
      <div className="mt-2 grid grid-cols-7 text-11 text-ink-faint">
        {stats.cells.map((c) => (
          <span key={c.day} className="text-center lowercase">{c.initial}</span>
        ))}
      </div>
    </div>
  );
}

// Horizontal bar chart of triggers that showed up on smoke nights this week.
// Shows at most four; everything else collapses into "other".
function TriggerMix({ stats }: { stats: WeekStats }) {
  const counts = new Map<TriggerId, number>();
  for (const c of stats.cells) {
    if (c.smoked !== true) continue;
    for (const t of c.triggers) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const top = rows.slice(0, 4);
  const other = rows.slice(4).reduce((a, [, n]) => a + n, 0);
  const max = top[0]?.[1] ?? 0;
  const empty = rows.length === 0;

  return (
    <div className="rounded-sheet border border-line bg-card/70 p-4 md:p-5">
      <p className="text-11 uppercase tracking-[0.14em] text-ink-faint">what came up</p>
      {empty ? (
        <p className="mt-3 text-14 text-ink-soft">no trigger chips tapped this week.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-2.5">
          {top.map(([t, n]) => (
            <li key={t} className="flex items-center gap-3 text-14 text-ink">
              <span className="w-24 shrink-0 truncate text-ink-soft">{TRIGGER_LABEL[t]}</span>
              <span className="relative h-2 flex-1 overflow-hidden rounded-full bg-chip">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 rounded-full bg-accent/70"
                  style={{ width: `${max ? Math.max(8, Math.round((n / max) * 100)) : 0}%` }}
                />
              </span>
              <span className="w-5 shrink-0 text-right tabular-nums text-ink">{n}</span>
            </li>
          ))}
          {other > 0 ? (
            <li className="flex items-center gap-3 text-13 text-ink-faint">
              <span className="w-24 shrink-0 truncate">other</span>
              <span className="flex-1" />
              <span className="w-5 shrink-0 text-right tabular-nums">{other}</span>
            </li>
          ) : null}
        </ul>
      )}
    </div>
  );
}
