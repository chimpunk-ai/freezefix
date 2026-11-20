import type { CompanionStage } from "@/lib/companion";

// The companion, drawn — not just a level number and a label. Same visual
// language as MoodFace (components/MoodFace.tsx): one warm ink line, no
// gradients, no mascot-brand cheerfulness. A small plant that grows taller
// and fuller with each stage; the face on it is always calm, never grading
// the person (same rule lib/companion.ts already states: it levels up on
// logging, never on smoking less, so the face never looks disappointed).
//
// Added 19 Nov 2026 after the founder's "it should create their avatar or
// animated character, not just raw data" note — the companion existed in
// lib/companion.ts and CompanionBadge.tsx already, but both were text only.
// This is the part that was missing: something to actually look at.

export const FACE_Y = 18; // shared eye/mouth baseline for every stage, drawn on top of its stem

// Exported so components/CompanionSpecies.tsx (the animal character set, Nov
// 2026) can draw the exact same calm, never-grading face on top of its own
// bodies — one visual language for every companion, plant or animal.
export function Face({ tone, warmth }: { tone: string; warmth: 0 | 1 | 2 }) {
  // warmth 0 = seed (closed, resting), 1 = sprout/sapling (content), 2 = young tree/full bloom (pleased).
  const mouth =
    warmth === 0
      ? `M${-3} ${FACE_Y + 2}q3 1.4 6 0` // closed, sleepy curve — not a frown, just not awake yet
      : warmth === 1
        ? `M${-3} ${FACE_Y + 1}q3 1.6 6 0`
        : `M${-3.2} ${FACE_Y}q3.2 2.4 6.4 0`;
  return (
    <g stroke={tone} strokeWidth="1.3" strokeLinecap="round" fill="none">
      {warmth === 0 ? (
        <>
          <path d={`M${-2.6} ${FACE_Y - 2}q1 0.8 2 0`} />
          <path d={`M${1.6} ${FACE_Y - 2}q1 0.8 2 0`} />
        </>
      ) : (
        <>
          <circle cx={-1.6} cy={FACE_Y - 2} r="0.85" fill={tone} stroke="none" />
          <circle cx={2.6} cy={FACE_Y - 2} r="0.85" fill={tone} stroke="none" />
        </>
      )}
      <path d={mouth} />
    </g>
  );
}

export const GROUND = "M4 50h40"; // the soil/ground line every stage sits on

function Seed({ tone }: { tone: string }) {
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      <ellipse cx="24" cy={44} rx="7" ry="8.5" />
      <g transform={`translate(24 ${44 - FACE_Y + 24})`}>
        <Face tone={tone} warmth={0} />
      </g>
    </g>
  );
}

function Sprout({ tone }: { tone: string }) {
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      <path d="M24 50V33" />
      <path d="M24 38c-4-1-6-4-5.5-7.5 3.5 0 6 2 6 5.5" />
      <circle cx="24" cy="26" r="8" />
      <g transform={`translate(24 ${26 - FACE_Y + 18})`}>
        <Face tone={tone} warmth={1} />
      </g>
    </g>
  );
}

function Sapling({ tone }: { tone: string }) {
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      <path d="M24 50V28" />
      <path d="M24 36c-4.5-1-7-4.5-6.5-8.5C21.5 28 24 31 24 36z" />
      <path d="M24 32c4.5-1 7-4 6.5-8C26.5 25 24 28 24 32z" />
      <circle cx="24" cy="21" r="8.5" />
      <g transform={`translate(24 ${21 - FACE_Y + 18})`}>
        <Face tone={tone} warmth={1} />
      </g>
    </g>
  );
}

function YoungTree({ tone }: { tone: string }) {
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      <path d="M24 50V26" />
      <path d="M24 34c-5-1-8-5-7.5-9.5C21 25 24 29 24 34z" />
      <path d="M24 30c5-1 8-4.5 7.5-9C27 22 24 25.5 24 30z" />
      <circle cx="24" cy="18" r="9.5" />
      <g transform={`translate(24 ${18 - FACE_Y + 18})`}>
        <Face tone={tone} warmth={2} />
      </g>
    </g>
  );
}

function FullBloom({ tone, accent }: { tone: string; accent: string }) {
  return (
    <g strokeLinecap="round">
      <g stroke={tone} strokeWidth="1.4" fill="none">
        <path d={GROUND} />
        <path d="M24 50V24" />
        <path d="M24 32c-5.5-1-9-5.5-8.5-10.5 5 .5 8 4.5 8.5 10.5z" />
        <path d="M24 28c5.5-1 9-5 8.5-10C27.5 19.5 24 23.5 24 28z" />
        <circle cx="24" cy="15" r="10.5" />
      </g>
      {/* one small blossom — the only accent-coloured mark on the whole drawing */}
      <g fill={accent} stroke="none">
        <circle cx="33.5" cy="10" r="1.6" />
        <circle cx="36" cy="13" r="1.6" />
        <circle cx="34" cy="15.8" r="1.6" />
      </g>
      <g transform={`translate(24 ${15 - FACE_Y + 18})`}>
        <Face tone={tone} warmth={2} />
      </g>
    </g>
  );
}

const STAGE_DRAWING: Record<CompanionStage, (p: { tone: string; accent: string }) => React.ReactElement> = {
  seed: ({ tone }) => <Seed tone={tone} />,
  sprout: ({ tone }) => <Sprout tone={tone} />,
  sapling: ({ tone }) => <Sapling tone={tone} />,
  "young tree": ({ tone }) => <YoungTree tone={tone} />,
  "full bloom": ({ tone, accent }) => <FullBloom tone={tone} accent={accent} />,
};

export function CompanionAvatar({
  stage,
  size = 96,
  tone = "currentColor",
  accent = "#e8a265",
  animate = true,
  className,
}: {
  stage: CompanionStage;
  size?: number;
  tone?: string;
  accent?: string;
  animate?: boolean;
  className?: string;
}) {
  const draw = STAGE_DRAWING[stage];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 56"
      aria-hidden
      focusable="false"
      className={`${animate ? "ff-companion-rise" : ""}${className ? ` ${className}` : ""}`}
    >
      {draw({ tone, accent })}
    </svg>
  );
}
