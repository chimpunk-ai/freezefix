import type { HPTotal } from "@/lib/companion";
import { SHORT_LABEL } from "@/components/CompanionStats";

// The combined HP bar (task 18 of the 50-step plan, 20 Nov 2026) — the
// "Tekken-style" health-bar UI the founder asked for, built on top of
// lib/companion.ts's hpFor() (task 17, PR #120).
//
// A real Tekken-style bar is a single smooth gradient (green through
// yellow through red) that drains as you take damage. Two things here
// don't transfer, on purpose:
//   - No gradient. CompanionAvatar/CompanionSpecies/CompanionStats all
//     hold the same "one warm ink line, no gradients, single accent
//     colour" rule throughout this app — a gradient fill would be the one
//     place that broke it, for no real gain (nothing here is ever at
//     "critical health" the way a fighting-game bar is).
//   - No draining. Every bar in this app only ever fills from the left —
//     see lib/companion.ts's comment on statsFor for why that has to stay
//     true here too. A health bar that can run out would be the opposite
//     of this product's "no negative progression, no punishment for a
//     quiet week" rule.
// What *does* carry over, and is the actual point of asking for this
// shape: a single bold bar, visibly built out of chunks, read at a glance
// rather than studied — the five attribute meters already exist
// (CompanionStats.tsx) for someone who wants the detail; this is the
// same five numbers, the headline version. Each of the five segments is
// its own bordered "plate" (hp.segments from hpFor(), always in the same
// STAT_ORDER as CompanionStats) filled left-to-right by that one stat's
// own tier — so the breakdown isn't hidden behind a tap, it's the shape
// of the bar itself.
//
// Not wired into any page yet — task 22 of the plan ("replace the old
// compact badge everywhere with character+HP") is where this actually
// replaces CompanionStats' compact variant in CompanionBadge/PatternCard.
// Shipping this component on its own first, the same way task 17 shipped
// the formula before this UI and task 15 shipped the tier labels before
// task 16's art, keeps each PR small enough to actually look at.
//
// hp.hp is open-ended since task 68 (20 Nov 2026) — no fixed ceiling, no
// hp.maxHp any more. The per-segment fill below still uses that stat's 0-5
// tier (unchanged by the rescale), not the raw hp number, so this bar reads
// fine either way; whoever wires this in at task 22 should decide then
// whether segment fill should move to the same "relative to the leader"
// treatment CompanionBadge.tsx uses.

export function CompanionHPBar({
  hp,
  size = "default",
}: {
  hp: HPTotal;
  /** "compact" drops the per-segment captions row, for a narrow strip like
   *  the in-app badge; "default" keeps them, for anywhere there's room. */
  size?: "default" | "compact";
}) {
  const barHeight = size === "compact" ? "h-2.5" : "h-4";
  const hpTextSize = size === "compact" ? "text-11" : "text-13";

  return (
    <div aria-label={`total HP: ${hp.hp}`}>
      <div className="flex items-baseline justify-between gap-2">
        <span className={`${hpTextSize} font-medium uppercase tracking-wide text-ink-soft`}>hp</span>
        <span className={`${hpTextSize} text-ink-faint`}>{hp.hp}</span>
      </div>
      <div className={`mt-1 flex gap-[3px] ${barHeight}`} role="img" aria-hidden>
        {hp.segments.map((s) => (
          <div
            key={s.key}
            className="min-w-0 flex-1 overflow-hidden rounded-[3px] border border-line/70 bg-chip"
            title={`${s.label}: ${s.tier}/5`}
          >
            <div className="h-full bg-accent transition-[width]" style={{ width: `${(s.tier / 5) * 100}%` }} />
          </div>
        ))}
      </div>
      {size === "default" ? (
        <div className="mt-1 grid grid-cols-5 gap-[3px]">
          {hp.segments.map((s) => (
            <p key={s.key} className="truncate text-center text-[10px] uppercase tracking-wide text-ink-faint">
              {SHORT_LABEL[s.key]}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
