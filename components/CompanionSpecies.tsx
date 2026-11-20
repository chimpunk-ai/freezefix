import type { CompanionSpecies, CompanionStage } from "@/lib/companion";
import { Face, GROUND } from "@/components/CompanionAvatar";

// The animal companions (task 13 of the 50-step plan, 20 Nov 2026) — base
// (seed-stage) forms, for the picker (task 14 built the picker screen).
// Evolution tiers (task 16, 20 Nov 2026) draw the other four stages each
// species goes through, against the written brief in lib/companion.ts's
// SPECIES_STAGE_LABEL comment (task 15).
//
// Implementation note on that brief: it's followed in spirit, not to the
// letter. The already-shipped seed-stage art (reference-checked against the
// founder's sheets in task 13) stays exactly as it was rather than being
// redrawn to match the brief's seed description word for word — growth
// from there is expressed through two devices applied on TOP of that
// unchanged seed art:
//   1. A uniform scale per stage, anchored to the ground line (the
//      creature gets bigger while staying planted at the same spot — see
//      stageScale()/growAboutGround() below), the same way the plant's
//      stages are each simply bigger than the last.
//   2. A small number of added strokes per stage (an extra tail line, a
//      leg hint, an ear tuft), which stay additive rather than redrawing
//      what the previous stage already had, so nothing a user has already
//      seen at a lower level "jumps" into a different shape, only a
//      bigger and more detailed one.
// Every stage still stops once it's earned: nothing above full bloom, same
// five slots the plant uses, same stageFor() level bands.
//
// Same rules as CompanionAvatar.tsx throughout:
//   - one warm ink line, no gradients — the single exception is a small
//     accent-coloured fleck at full bloom only, mirroring the plant's own
//     one-accent-colour blossom (CompanionAvatar.tsx's FullBloom)
//   - the shared Face() component, so the expression language never forks
//     between species — a fox and a plant are "calm" in exactly the same
//     way at every shared warmth level
//   - never performs happiness it hasn't earned: every species starts at
//     warmth 0 (closed, resting) and only opens up at the same pace the
//     plant's own stages do
//
// The owl is the one deliberate exception, stated in task 15's brief: its
// eyes stay closed at every stage, including full bloom — "calm, not
// sleepy-because-it's-young" — so it keeps its own hand-drawn face
// unchanged across all five stages rather than opening up with the shared
// Face() component the way every other species does.
//
// Idle motion (task 13): a shared, barely-there "breathing" scale on the
// whole body, plus one small species-specific detail (a tail flick, an ear
// tip, a tuft settling, a shy head-tuck) that rests for most of its cycle
// and happens once, slowly. Every keyframe lives in app/globals.css
// (ff-species-*) so it collapses under prefers-reduced-motion automatically.

const STAGES: readonly CompanionStage[] = ["seed", "sprout", "sapling", "young tree", "full bloom"];

// How much bigger each stage is than the seed form it grew from — modest on
// purpose; a companion growing to twice its size would stop looking like
// the same creature. Matches the plant's own pacing (each of its five
// stages is a little bigger than the last, never a dramatic jump).
const STAGE_SCALE: Record<CompanionStage, number> = {
  seed: 1,
  sprout: 1.045,
  sapling: 1.09,
  "young tree": 1.135,
  "full bloom": 1.18,
};

/** Scales a species' whole drawing about its ground-anchor point (24, 50) —
 *  the creature gets bigger while staying planted on the same ground line,
 *  the same visual logic as the plant simply being taller at a later stage. */
function growAboutGround(stage: CompanionStage, children: React.ReactNode) {
  const s = STAGE_SCALE[stage];
  return <g transform={`translate(24 50) scale(${s}) translate(-24 -50)`}>{children}</g>;
}

function Fox({ tone, accent, stage }: { tone: string; accent: string; stage: CompanionStage }) {
  // Proportions checked against a reference sheet of simple line-art animal
  // icons the founder sent (20 Nov 2026): narrower, taller ears and a small
  // nose tip read as "fox" at a glance in that reference.
  const warmth = ({ seed: 0, sprout: 0, sapling: 1, "young tree": 2, "full bloom": 2 } as const)[stage];
  const i = STAGES.indexOf(stage); // 0..4, for "at this tier or later" checks below
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      {growAboutGround(
        stage,
        <>
          <ellipse cx="24" cy="42" rx="8.5" ry="9" />
          <path d="M15.8 37 L12.8 25.5 L19.8 35" />
          <path d="M32.2 37 L35.2 25.5 L28.2 35" />
          {/* sharper ear tips from young tree on — "sharper features" */}
          {i >= 3 ? <path d="M13.6 28.8 L12.8 25.5 L15.3 27.6" /> : null}
          <g className="ff-species-tail-flick">
            <path d="M32 44c5-0.5 8 2 8 6.5-4 .5-7.5-2-8-6.5z" />
            <path d="M36.3 48.6q1.6 0.9 3.1 0.7" />
            {/* the tail fills out one stroke at a time, sprout onward */}
            {i >= 1 ? <path d="M34.3 46.4q2.1 1.3 4.1 0.9" /> : null}
            {i >= 3 ? <path d="M38 50.6q1.1 0.7 2.2 0.4" /> : null}
            {/* the full-bloom brush tail's one accent-coloured tip */}
            {i >= 4 ? <circle cx="38.4" cy="49.6" r="1.1" fill={accent} stroke="none" /> : null}
          </g>
          {/* legs read in from sapling on — "legs reading longer" */}
          {i >= 2 ? (
            <>
              <path d="M19 50.4v2.4" />
              <path d="M24.5 50.7v2.6" />
            </>
          ) : null}
          <circle cx="24" cy="45.5" r="0.9" fill={tone} stroke="none" />
          <g transform="translate(24 22)">
            <Face tone={tone} warmth={warmth} />
          </g>
        </>
      )}
    </g>
  );
}

function Cat({ tone, accent, stage }: { tone: string; accent: string; stage: CompanionStage }) {
  const warmth = ({ seed: 0, sprout: 1, sapling: 1, "young tree": 2, "full bloom": 2 } as const)[stage];
  const i = STAGES.indexOf(stage);
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      {growAboutGround(
        stage,
        <>
          <ellipse cx="24" cy="42.5" rx="8" ry="9.5" />
          <path d="M18.5 34.5 L17.5 28 L21.5 33.5" />
          <path d="M19.3 32.7q1.1 0.7 2 0.1" />
          <path d="M29.5 34.5 L30.5 28 L26.5 33.5" />
          <path d="M28.7 32.7q-1.1 0.7 -2 0.1" />
          <g className="ff-species-tail-flick">
            <path d={i >= 3 ? "M32 45c4.5 1 7 5.5 5.5 11-4-.5-7-5-5.5-11z" : "M32 45c4.5 1 6.5 5 5 9.5-4-.5-6.5-4-5-9.5z"} />
          </g>
          <path d="M14.5 41h-4.5" />
          <path d="M14.8 43.4l-4.3 1.2" />
          <path d="M33.5 41h4.5" />
          <path d="M33.2 43.4l4.3 1.2" />
          {/* "finding its feet" — legs from sapling on */}
          {i >= 2 ? (
            <>
              <path d="M19.5 50.9v2.1" />
              <path d="M28.5 50.9v2.1" />
            </>
          ) : null}
          {/* the full adult cat's one accent-coloured chest marking */}
          {i >= 4 ? <circle cx="24" cy="46.5" r="1.1" fill={accent} stroke="none" /> : null}
          <g transform="translate(24 23)">
            <Face tone={tone} warmth={warmth} />
          </g>
        </>
      )}
    </g>
  );
}

function Rabbit({ tone, accent, stage }: { tone: string; accent: string; stage: CompanionStage }) {
  const warmth = ({ seed: 0, sprout: 0, sapling: 1, "young tree": 2, "full bloom": 2 } as const)[stage];
  const i = STAGES.indexOf(stage);
  // The left ear is already fully up from the seed form — "one ear
  // starting to lift" (task 15's sprout brief) is read here as the RIGHT
  // ear catching up to it rather than redrawing the seed's own silhouette;
  // both ears also simply grow a little taller each stage via the shared
  // ground-anchored scale, same as every other species.
  const rightEar =
    i === 0
      ? "M24.4 44c0.6-3 0.9-6 0.6-8.5" // seed: shorter, still catching up
      : "M28.2 37c1.3-6 0.8-11.5-0.6-15.5"; // sprout onward: level with the left ear
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      {growAboutGround(
        stage,
        <>
          <ellipse cx="24" cy="44" rx="8" ry="8" />
          <path d="M19.8 37c-1.3-6-0.8-11.5 0.6-15.5" />
          <g className="ff-species-ear-tip">
            <path d={rightEar} />
          </g>
          {/* "alert" posture, sapling on: small haunch lines, weight forward */}
          {i >= 2 ? <path d="M30.5 46c1.8-1 3-0.3 3.4 1.3" /> : null}
          {i >= 4 ? <circle cx="24" cy="48.3" r="1.1" fill={accent} stroke="none" /> : null}
          <g transform="translate(24 24)">
            <Face tone={tone} warmth={warmth} />
          </g>
        </>
      )}
    </g>
  );
}

function Owl({ tone, accent, stage }: { tone: string; accent: string; stage: CompanionStage }) {
  // The deliberate exception (task 15's brief): the owl's eyes stay closed
  // at every stage — "calm, not sleepy-because-it's-young" — so its own
  // hand-drawn face (not the shared Face()) is identical at every tier.
  // Only the body, tufts and wings grow.
  const i = STAGES.indexOf(stage);
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      {growAboutGround(
        stage,
        <>
          <circle cx="24" cy="41" r="9.5" />
          <g className="ff-species-tuft-settle">
            <path d="M18.5 32.5c-0.6-2-0.2-3.6 0.9-4.6" />
            <path d="M29.5 32.5c0.6-2 0.2-3.6-0.9-4.6" />
          </g>
          <path d="M17 39c-1.5 2-2 5-1 8.5" />
          <path d="M31 39c1.5 2 2 5 1 8.5" />
          {/* more defined wing/feather lines, sapling on — "filling out" */}
          {i >= 2 ? (
            <>
              <path d="M16.5 42.5c-1 1.8-1.2 3.8-0.6 6" />
              <path d="M31.5 42.5c1 1.8 1.2 3.8 0.6 6" />
            </>
          ) : null}
          {i >= 4 ? <circle cx="24" cy="45.5" r="1.1" fill={accent} stroke="none" /> : null}
          {/* the owl's own eyes/beak, not the shared Face — a closed, sleepy
              owl face reads differently from the plant's (rounder lids, a
              small V beak instead of a mouth curve), unchanged every stage. */}
          <g transform="translate(24 40)" strokeWidth="1.3">
            <path d="M-3.4 -2 q1.3 1 2.6 0" />
            <path d="M0.8 -2 q1.3 1 2.6 0" />
            <path d="M-1 2.6 l2 1.6 2-1.6" />
          </g>
        </>
      )}
    </g>
  );
}

function Turtle({ tone, accent, stage }: { tone: string; accent: string; stage: CompanionStage }) {
  const warmth = ({ seed: 0, sprout: 1, sapling: 1, "young tree": 2, "full bloom": 2 } as const)[stage];
  const i = STAGES.indexOf(stage);
  // The shared Face() is drawn at a fixed local scale (0.56) relative to
  // the head circle; growAboutGround() then grows the whole group,
  // including the head and face together, so this scale stays constant
  // across stages rather than needing its own per-stage number.
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      {growAboutGround(
        stage,
        <>
          <path d="M11 48c0-9.5 6-16 15-16s15 6.5 15 16" />
          <path d="M17.3 38.3c1.8-2 4-3 6.7-3s4.9 1 6.7 3" />
          <path d="M24 32v16" />
          {/* the shell's pattern gets one more seam, sapling on — "more
              defined" */}
          {i >= 2 ? (
            <>
              <path d="M15.5 41.5c1.2-3 3.2-5 5.7-6" />
              <path d="M32.5 41.5c-1.2-3-3.2-5-5.7-6" />
            </>
          ) : null}
          <path d="M11 48h30" />
          <path d="M16 48v2.2" />
          <path d="M34 48v2.2" />
          {i >= 4 ? <circle cx="24" cy="44" r="1.1" fill={accent} stroke="none" /> : null}
          <g className="ff-species-head-retreat">
            <path d="M11.5 46.3c-1.2 0.4-2.1 1-2.8 1.9" />
            <circle cx="7.3" cy="45" r="3.6" />
            <g transform="translate(7.3 34.92) scale(0.56)">
              <Face tone={tone} warmth={warmth} />
            </g>
          </g>
        </>
      )}
    </g>
  );
}

const SPECIES_DRAWING: Partial<
  Record<CompanionSpecies, (p: { tone: string; accent: string; stage: CompanionStage }) => React.ReactElement>
> = {
  fox: (p) => <Fox {...p} />,
  cat: (p) => <Cat {...p} />,
  rabbit: (p) => <Rabbit {...p} />,
  owl: (p) => <Owl {...p} />,
  turtle: (p) => <Turtle {...p} />,
};

/**
 * One species at one growth stage. Returns null for "plant" — that one
 * stays CompanionAvatar's job, so a caller choosing between the two reads
 * one extra null-check rather than two components that both claim to draw
 * every species.
 */
export function CompanionSpeciesAvatar({
  species,
  stage,
  size = 96,
  tone = "currentColor",
  accent = "#e8a265",
  animate = true,
  className,
}: {
  species: CompanionSpecies;
  stage: CompanionStage;
  size?: number;
  tone?: string;
  accent?: string;
  animate?: boolean;
  className?: string;
}) {
  const draw = SPECIES_DRAWING[species];
  if (!draw) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 56"
      aria-hidden
      focusable="false"
      className={[animate ? "ff-companion-rise ff-species-breathe" : "", className].filter(Boolean).join(" ")}
    >
      {draw({ tone, accent, stage })}
    </svg>
  );
}
