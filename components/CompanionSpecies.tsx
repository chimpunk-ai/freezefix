import type { CompanionSpecies } from "@/lib/companion";
import { Face, GROUND } from "@/components/CompanionAvatar";

// The animal companions (task 13 of the 50-step plan, 20 Nov 2026) — base
// forms only, for the picker (task 14 builds the picker screen itself).
// Evolution tiers per species are task 15/16's job; every one of these
// draws its level-1 form only, the same conceptual slot as the plant's
// "seed" stage: a small, resting creature, eyes closed, just starting out.
//
// Same rules as CompanionAvatar.tsx throughout:
//   - one warm ink line, no gradients, no fill except currentColor strokes
//   - the shared Face() component, so the expression language never forks
//     between species — a fox and a plant are "calm" in exactly the same way
//   - never performs happiness it hasn't earned: closed, sleepy eyes, same
//     warmth=0 Face every stage-1 plant form uses
//
// Idle motion (new, 20 Nov 2026 — the founder asked for real animation, not
// a static icon): a shared, barely-there "breathing" scale on the whole
// body, plus one small species-specific detail (a tail flick, an ear tip, a
// tuft settling, a shy head-tuck) that rests for most of its cycle and
// happens once, slowly — a twitch, not a wiggle. Every keyframe lives in
// app/globals.css (ff-species-*) so it collapses under prefers-reduced-
// motion exactly like every other animation on this page, with no special
// casing needed here.

function Fox({ tone }: { tone: string }) {
  // Proportions checked against a reference sheet of simple line-art animal
  // icons the founder sent (20 Nov 2026): narrower, taller ears and a small
  // nose tip read as "fox" at a glance in that reference, so both are
  // sharpened here versus the first draft. The tail keeps its original
  // single-stroke shape but gains one short inner line near the tip, echoing
  // that reference's two-tone tail without needing a second fill color.
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      <ellipse cx="24" cy="42" rx="8.5" ry="9" />
      <path d="M15.8 37 L12.8 25.5 L19.8 35" />
      <path d="M32.2 37 L35.2 25.5 L28.2 35" />
      <g className="ff-species-tail-flick">
        <path d="M32 44c5-0.5 8 2 8 6.5-4 .5-7.5-2-8-6.5z" />
        <path d="M36.3 48.6q1.6 0.9 3.1 0.7" />
      </g>
      <circle cx="24" cy="45.5" r="0.9" fill={tone} stroke="none" />
      <g transform="translate(24 22)">
        <Face tone={tone} warmth={0} />
      </g>
    </g>
  );
}

function Cat({ tone }: { tone: string }) {
  // The reference sheet's cat reads clearly from its ear notch (the small
  // inner curve) as much as the ear's outer shape — added below, same
  // single-stroke rule as everywhere else in this file.
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      <ellipse cx="24" cy="42.5" rx="8" ry="9.5" />
      <path d="M18.5 34.5 L17.5 28 L21.5 33.5" />
      <path d="M19.3 32.7q1.1 0.7 2 0.1" />
      <path d="M29.5 34.5 L30.5 28 L26.5 33.5" />
      <path d="M28.7 32.7q-1.1 0.7 -2 0.1" />
      <g className="ff-species-tail-flick">
        <path d="M32 45c4.5 1 6.5 5 5 9.5-4-.5-6.5-4-5-9.5z" />
      </g>
      <path d="M14.5 41h-4.5" />
      <path d="M14.8 43.4l-4.3 1.2" />
      <path d="M33.5 41h4.5" />
      <path d="M33.2 43.4l4.3 1.2" />
      <g transform="translate(24 23)">
        <Face tone={tone} warmth={0} />
      </g>
    </g>
  );
}

function Rabbit({ tone }: { tone: string }) {
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      <ellipse cx="24" cy="44" rx="8" ry="8" />
      <path d="M19.8 37c-1.3-6-0.8-11.5 0.6-15.5" />
      <g className="ff-species-ear-tip">
        <path d="M28.2 37c1.3-6 0.8-11.5-0.6-15.5" />
      </g>
      <g transform="translate(24 24)">
        <Face tone={tone} warmth={0} />
      </g>
    </g>
  );
}

function Owl({ tone }: { tone: string }) {
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      <circle cx="24" cy="41" r="9.5" />
      <g className="ff-species-tuft-settle">
        <path d="M18.5 32.5c-0.6-2-0.2-3.6 0.9-4.6" />
        <path d="M29.5 32.5c0.6-2 0.2-3.6-0.9-4.6" />
      </g>
      <path d="M17 39c-1.5 2-2 5-1 8.5" />
      <path d="M31 39c1.5 2 2 5 1 8.5" />
      {/* the owl's own eyes/beak, not the shared Face — a closed, sleepy owl
          face reads differently from the plant's (rounder lids, a small
          V beak instead of a mouth curve), but keeps the same warmth. */}
      <g transform="translate(24 40)" strokeWidth="1.3">
        <path d="M-3.4 -2 q1.3 1 2.6 0" />
        <path d="M0.8 -2 q1.3 1 2.6 0" />
        <path d="M-1 2.6 l2 1.6 2-1.6" />
      </g>
    </g>
  );
}

function Turtle({ tone }: { tone: string }) {
  // The reference sheet's turtle reads as a turtle mostly from its shell's
  // segmented pattern, not its outline — added as two seam lines below,
  // since a plain dome could otherwise pass for almost any rounded shell.
  return (
    <g stroke={tone} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <path d={GROUND} />
      <path d="M11 48c0-9.5 6-16 15-16s15 6.5 15 16" />
      <path d="M17.3 38.3c1.8-2 4-3 6.7-3s4.9 1 6.7 3" />
      <path d="M24 32v16" />
      <path d="M11 48h30" />
      <path d="M16 48v2.2" />
      <path d="M34 48v2.2" />
      <g className="ff-species-head-retreat">
        <path d="M11.5 46.3c-1.2 0.4-2.1 1-2.8 1.9" />
        <circle cx="7.3" cy="45" r="3.6" />
        <g transform="translate(7.3 34.92) scale(0.56)">
          <Face tone={tone} warmth={0} />
        </g>
      </g>
    </g>
  );
}

const SPECIES_DRAWING: Partial<Record<CompanionSpecies, (p: { tone: string }) => React.ReactElement>> = {
  fox: ({ tone }) => <Fox tone={tone} />,
  cat: ({ tone }) => <Cat tone={tone} />,
  rabbit: ({ tone }) => <Rabbit tone={tone} />,
  owl: ({ tone }) => <Owl tone={tone} />,
  turtle: ({ tone }) => <Turtle tone={tone} />,
};

/**
 * One species' base (level-1) form. Returns null for "plant" — that one
 * stays CompanionAvatar's job, so a caller choosing between the two reads
 * one extra null-check rather than two components that both claim to draw
 * every species.
 */
export function CompanionSpeciesAvatar({
  species,
  size = 96,
  tone = "currentColor",
  animate = true,
  className,
}: {
  species: CompanionSpecies;
  size?: number;
  tone?: string;
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
      {draw({ tone })}
    </svg>
  );
}
