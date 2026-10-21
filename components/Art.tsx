"use client";

// Original artwork, drawn in code. No photographs and no people: the product promises it
// never shows photos of people, and a stock photo of someone looking anguished would sell
// exactly the judgement this whole thing exists to avoid.
//
// Everything here is abstract and calm. All of it respects reduced motion, because the
// audience is sometimes having a bad time with a racing heart.
//
// Colours below are drawn from the Ember palette in globals.css. Kept as literals here
// (rather than CSS vars) only because SVG attributes need literal values at parse time.

const SOFT = "rgba(255,248,240,0.08)";   // card tint
const FAINT = "rgba(255,248,240,0.14)"; // line tint
const DIM = "rgba(255,248,240,0.18)";   // ink dim
const INK = "#f0ece6";
const AMBER = "#e8a84c";                // accent
const MOSS = "#d4956a";                 // frost (terracotta)
const TEAL = "#c07b4f";                 // deeper terracotta

/** The loop that won't stop: a line that goes round and round and never lands. */
export function LoopArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} role="img" aria-label="A line looping back on itself">
      <defs>
        <linearGradient id="loopG" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={MOSS} />
          <stop offset="1" stopColor={AMBER} />
        </linearGradient>
      </defs>
      <rect width="200" height="140" rx="20" fill={SOFT} />
      <path
        d="M58 96c-26 0-34-20-20-36 14-16 46-8 52 12 7 22 36 30 50 14 13-15 6-38-16-38"
        fill="none"
        stroke="url(#loopG)"
        strokeWidth="7"
        strokeLinecap="round"
        className="ff-draw"
      />
      <circle cx="124" cy="48" r="6" fill={AMBER} />
    </svg>
  );
}

/** The blank page: a document with one short line on it, which is the whole job. */
export function StartArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} role="img" aria-label="A mostly blank page with one line written">
      <rect width="200" height="140" rx="20" fill={SOFT} />
      <rect x="58" y="26" width="84" height="94" rx="10" fill="rgba(239,236,227,0.08)" stroke="rgba(239,236,227,0.22)" />
      <rect x="72" y="44" width="46" height="6" rx="3" fill={AMBER} className="ff-pulse" />
      <rect x="72" y="62" width="56" height="5" rx="2.5" fill={FAINT} />
      <rect x="72" y="76" width="36" height="5" rx="2.5" fill="rgba(239,236,227,0.12)" />
    </svg>
  );
}

/** The unanswered message: two bubbles, one of them still empty. */
export function ReplyArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} role="img" aria-label="Two message bubbles, one still empty">
      <rect width="200" height="140" rx="20" fill={SOFT} />
      <rect x="30" y="34" width="92" height="34" rx="16" fill="rgba(239,236,227,0.16)" />
      <rect
        x="78"
        y="80"
        width="92"
        height="34"
        rx="16"
        fill="none"
        stroke={AMBER}
        strokeWidth="3"
        strokeDasharray="7 6"
        className="ff-dash"
      />
    </svg>
  );
}

/** The loud room: bars at different heights, one calm gap in the middle. */
export function RoomArt({ className = "" }: { className?: string }) {
  const bars = [26, 48, 70, 34, 0, 0, 40, 62, 30, 52];
  return (
    <svg viewBox="0 0 200 140" className={className} role="img" aria-label="Noise bars with a quiet gap in the middle">
      <rect width="200" height="140" rx="20" fill={SOFT} />
      {bars.map((h, i) =>
        h === 0 ? null : (
          <rect
            key={i}
            x={20 + i * 17}
            y={104 - h}
            width="9"
            height={h}
            rx="4.5"
            fill={DIM}
          />
        )
      )}
      <circle cx="100" cy="86" r="13" fill={TEAL} opacity="0.9" className="ff-breathe" />
    </svg>
  );
}

/** Progress: small marks adding up, no graph and no score. */
export function WinsArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 140" className={className} role="img" aria-label="A row of small ticks">
      <rect width="200" height="140" rx="20" fill={SOFT} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${34 + i * 36}, ${86 - i * 10})`}>
          <circle r="13" fill={i === 3 ? AMBER : "rgba(239,236,227,0.18)"} />
          <path d="M-5 0l3.5 4L6-4" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}
