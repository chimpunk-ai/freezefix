"use client";

// The graphs inside the weekly mirror.
//
// The brief asks for one thing above all: the card has to be readable in four
// seconds and honest in what it implies. So these are small, warm and literal —
// no gradients, no axis clutter, no animation that isn't the week unfolding.
//
// Every chart is an SVG-free CSS build: it renders identically in light and dark,
// it animates once on mount, and it goes completely still under
// prefers-reduced-motion. Each one carries an aria-label with the same numbers a
// sighted user reads, because the card is the product and everyone gets it.

import type { Pattern, SeriesPoint, Week } from "@/lib/patterns";

const SAGE = "#9CAF88";
const EARTH = "#B98A6B";

/** Warm earth for a hard night, sage for a good one. Never terracotta: that is the help chip. */
const MOOD_TONE: Record<number, string> = {
  1: "#B98A6B",
  2: "#C0A184",
  3: "#C9C2A6",
  4: "#B0C09A",
  5: "#9CAF88",
};

const DOW = ["M", "T", "W", "T", "F", "S", "S"];

function moodColor(mood: number | null): string {
  if (mood === null) return "rgba(156,175,136,0.25)";
  return MOOD_TONE[Math.round(mood)] ?? SAGE;
}

const CSS = `
.ffx{margin-top:22px}
.ffx-caption{font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.45;margin-bottom:10px}
.ffx-strip{display:flex;gap:6px;align-items:flex-end}
.ffx-col{flex:1 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;gap:7px}
.ffx-track{position:relative;width:100%;height:86px;border-radius:10px;background:rgba(156,175,136,0.10)}
.ffx-dot{position:absolute;left:50%;width:14px;height:14px;border-radius:999px;margin-bottom:-7px;
  animation:ffx-rise .55s cubic-bezier(.22,.61,.36,1) both}
.ffx-bar{width:100%;height:5px;border-radius:999px;animation:ffx-grow .5s cubic-bezier(.22,.61,.36,1) both}
.ffx-bar.is-smoke{background:${SAGE}}
.ffx-bar.is-clear{background:transparent;border:1px dashed rgba(156,175,136,0.55)}
.ffx-bar.is-none{background:rgba(156,175,136,0.12)}
.ffx-dow{font-size:12px;opacity:.4}
.ffx-rows{display:flex;flex-direction:column;gap:10px}
.ffx-row{display:grid;grid-template-columns:88px 1fr 34px;align-items:center;gap:10px;font-size:14px}
.ffx-rowlabel{opacity:.6;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ffx-rowtrack{height:10px;border-radius:999px;background:rgba(156,175,136,0.12);overflow:hidden}
.ffx-rowfill{display:block;height:100%;border-radius:999px;transform-origin:left center;
  animation:ffx-grow .6s cubic-bezier(.22,.61,.36,1) both}
.ffx-rowvalue{text-align:right;font-variant-numeric:tabular-nums;opacity:.75}
.ffx-trend{display:flex;gap:10px;align-items:flex-end}
.ffx-trendcol{flex:1 1 0;display:flex;flex-direction:column;align-items:center;gap:6px}
.ffx-trendbar{width:100%;border-radius:8px 8px 4px 4px;background:rgba(156,175,136,0.28);
  position:relative;animation:ffx-grow .6s cubic-bezier(.22,.61,.36,1) both;transform-origin:bottom center}
.ffx-trendfill{position:absolute;left:0;right:0;bottom:0;border-radius:8px 8px 4px 4px;background:${SAGE};opacity:.75}
.ffx-trendlabel{font-size:12px;opacity:.45;text-align:center;white-space:nowrap}
.ffx-trendcount{font-size:14px;font-variant-numeric:tabular-nums}
.ffx-legend{display:flex;gap:14px;flex-wrap:wrap;font-size:12px;opacity:.55;margin-top:12px}
.ffx-key{display:inline-flex;align-items:center;gap:6px}
.ffx-swatch{width:10px;height:10px;border-radius:3px;display:inline-block}
@keyframes ffx-rise{from{opacity:0;transform:translate(-50%,50%) scale(.55)}to{opacity:1;transform:translate(-50%,50%) scale(1)}}
@keyframes ffx-grow{from{opacity:.2;transform:scaleY(.15)}to{opacity:1;transform:scaleY(1)}}
@media (prefers-reduced-motion: reduce){
  .ffx-dot,.ffx-bar,.ffx-rowfill,.ffx-trendbar{animation:none !important}
}
`;

/* ── the seven nights ────────────────────────────────────────────────────── */

export function WeekStrip({ week }: { week: Week }) {
  const label = `Seven nights, Monday to Sunday. Smoke on ${week.smoked} of ${week.recorded} logged nights.`;
  return (
    <div className="ffx" role="img" aria-label={label}>
      <p className="ffx-caption">this week, night by night</p>
      <div className="ffx-strip">
        {week.days.map((d, i) => (
          <div className="ffx-col" key={d.day}>
            <div className="ffx-track">
              {d.mood !== null ? (
                <span
                  className="ffx-dot"
                  style={{
                    background: moodColor(d.mood),
                    bottom: `${((d.mood - 1) / 4) * 100}%`,
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              ) : null}
            </div>
            <span
              className={`ffx-bar ${d.smoked === true ? "is-smoke" : d.smoked === false ? "is-clear" : "is-none"}`}
              style={{ animationDelay: `${i * 60 + 90}ms` }}
            />
            <span className="ffx-dow">{DOW[i]}</span>
          </div>
        ))}
      </div>
      <div className="ffx-legend">
        <span className="ffx-key">
          <i className="ffx-swatch" style={{ background: SAGE }} /> smoked
        </span>
        <span className="ffx-key">
          <i className="ffx-swatch" style={{ border: `1px dashed ${SAGE}` }} /> didn&apos;t
        </span>
        <span className="ffx-key">
          <i className="ffx-swatch" style={{ background: "rgba(156,175,136,0.14)" }} /> not logged
        </span>
        <span className="ffx-key">dot height = mood face</span>
      </div>
    </div>
  );
}

/* ── two averages, side by side ──────────────────────────────────────────── */

function CompareChart({
  compare,
}: {
  compare: NonNullable<Pattern["compare"]>;
}) {
  const rows = [
    { label: compare.aLabel, value: compare.aValue, n: compare.aN },
    { label: compare.bLabel, value: compare.bValue, n: compare.bN },
  ];
  const label = rows
    .map((r) => `${r.label}: ${r.value.toFixed(1)} of 5 across ${r.n} nights`)
    .join(". ");

  return (
    <div className="ffx" role="img" aria-label={label}>
      <p className="ffx-caption">mood face, out of 5</p>
      <div className="ffx-rows">
        {rows.map((r, i) => (
          <div className="ffx-row" key={`${r.label}-${i}`}>
            <span className="ffx-rowlabel">{r.label}</span>
            <span className="ffx-rowtrack">
              <span
                className="ffx-rowfill"
                style={{
                  width: `${Math.max(4, Math.min(100, (r.value / 5) * 100))}%`,
                  background: r.value >= 3.5 ? SAGE : EARTH,
                  animationDelay: `${i * 110}ms`,
                }}
              />
            </span>
            <span className="ffx-rowvalue">{r.value.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── a chip, with and without ────────────────────────────────────────────── */

function TriggerChart({ trigger }: { trigger: NonNullable<Pattern["trigger"]> }) {
  return (
    <CompareChart
      compare={{
        aLabel: `with ${trigger.label.toLowerCase()}`,
        aValue: trigger.withAvg,
        aN: trigger.count,
        bLabel: "without it",
        bValue: trigger.withoutAvg,
        bN: 0,
      }}
    />
  );
}

/* ── which weekday carries it ────────────────────────────────────────────── */

function RhythmChart({ counts }: { counts: number[] }) {
  const max = Math.max(1, ...counts);
  const label = `Smoke nights by weekday: ${counts
    .map((c, i) => `${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]} ${c}`)
    .join(", ")}.`;
  return (
    <div className="ffx" role="img" aria-label={label}>
      <p className="ffx-caption">smoke nights by weekday</p>
      <div className="ffx-strip">
        {counts.map((c, i) => (
          <div className="ffx-col" key={i}>
            <div className="ffx-track" style={{ height: 64 }}>
              <span
                className="ffx-trendfill"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: `${(c / max) * 100}%`,
                  borderRadius: "8px 8px 4px 4px",
                  background: c > 0 ? SAGE : "transparent",
                  opacity: 0.65,
                }}
              />
            </div>
            <span className="ffx-dow">{DOW[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── four weeks of direction ─────────────────────────────────────────────── */

function TrendChart({ points }: { points: SeriesPoint[] }) {
  const max = 7;
  const label = `Smoke nights per week: ${points
    .map((p) => `${p.label} ${p.smoked} of ${p.recorded}`)
    .join(", ")}.`;
  return (
    <div className="ffx" role="img" aria-label={label}>
      <p className="ffx-caption">last four weeks</p>
      <div className="ffx-trend">
        {points.map((p, i) => (
          <div className="ffx-trendcol" key={p.key}>
            <span className="ffx-trendcount">{p.smoked}</span>
            <div
              className="ffx-trendbar"
              style={{ height: `${Math.max(10, (p.smoked / max) * 96)}px`, animationDelay: `${i * 80}ms` }}
            >
              <span className="ffx-trendfill" style={{ height: "100%" }} />
            </div>
            <span className="ffx-trendlabel">{p.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── one pattern, with its chart ─────────────────────────────────────────── */

export function PatternCard({ pattern }: { pattern: Pattern }) {
  return (
    <section className="ffx" aria-label={pattern.id}>
      <p style={{ margin: 0, lineHeight: 1.55 }}>{pattern.headline}</p>
      {pattern.chart === "compare" && pattern.compare ? (
        <CompareChart compare={pattern.compare} />
      ) : null}
      {pattern.chart === "trigger" && pattern.trigger ? (
        <TriggerChart trigger={pattern.trigger} />
      ) : null}
      {pattern.chart === "weekday" && pattern.weekday ? (
        <RhythmChart counts={pattern.weekday.counts} />
      ) : null}
      {pattern.chart === "series" && pattern.series ? (
        <TrendChart points={pattern.series} />
      ) : null}
      <p style={{ margin: "12px 0 0", fontSize: 14, opacity: 0.55, lineHeight: 1.5 }}>
        {pattern.detail}
      </p>
    </section>
  );
}

/* ── the whole block ─────────────────────────────────────────────────────── */

export default function MirrorGraphs({
  weeks,
  patterns,
}: {
  weeks: Week[];
  patterns: Pattern[];
}) {
  const current = weeks[weeks.length - 1];
  return (
    <div>
      <style>{CSS}</style>
      {current ? <WeekStrip week={current} /> : null}
      {patterns.map((p) => (
        <PatternCard key={p.id} pattern={p} />
      ))}
    </div>
  );
}
