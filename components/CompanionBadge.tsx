import { companionFor, STAGE_LABEL } from "@/lib/companion";
import type { Entries } from "@/lib/entry";

/**
 * The small companion strip at the top of Tonight. Shows level + stage +
 * streak, all derived live from the real log (lib/companion.ts) — nothing
 * here is stored separately from the entries that already exist, so it can
 * never drift out of sync with them. Hidden entirely when the person has
 * turned it off in settings (profile.showCompanion === false) — this
 * component is simply never rendered in that case, by the caller.
 */
export function CompanionBadge({ name, entries }: { name: string; entries: Entries }) {
  const companion = companionFor(name, entries);
  const { level, stage, currentStreak, longestStreak, nightsToNextLevel } = companion;

  return (
    <div className="mb-5 flex items-center justify-between gap-3 rounded-card border border-line bg-card px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-14 text-ink">
          <span className="font-medium">{companion.name}</span>{" "}
          <span className="text-ink-faint">· level {level}, {STAGE_LABEL[stage]}</span>
        </p>
        <p className="mt-0.5 text-12 text-ink-faint">
          {currentStreak > 0
            ? `${currentStreak} night${currentStreak === 1 ? "" : "s"} running`
            : longestStreak > 0
              ? `longest run so far: ${longestStreak} night${longestStreak === 1 ? "" : "s"}`
              : "log tonight to get this started"}
          {nightsToNextLevel !== null ? ` · ${nightsToNextLevel} to the next level` : " · maxed out, in the best way"}
        </p>
      </div>
    </div>
  );
}
