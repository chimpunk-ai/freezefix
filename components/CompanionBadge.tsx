import { companionFor, seedFromProfile, statsFor, EMPTY_PROFILE_SEED, STAGE_LABEL, type ProfileSeed } from "@/lib/companion";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import { CompanionStats } from "@/components/CompanionStats";
import type { Entries } from "@/lib/entry";

type SeedInput = Parameters<typeof seedFromProfile>[0];

/**
 * The small companion strip at the top of Tonight. Shows level + stage +
 * streak, all derived live from the real log (lib/companion.ts) — nothing
 * here is stored separately from the entries that already exist, so it can
 * never drift out of sync with them. Hidden entirely when the person has
 * turned it off in settings (profile.showCompanion === false) — this
 * component is simply never rendered in that case, by the caller.
 *
 * `profile` is optional only so existing callers/tests don't break; pass it
 * whenever it's available so the five stat bars below start from the exact
 * same onboarding-answer credit shown at onboarding — otherwise a bar could
 * look like it fell, which is the one thing this feature isn't allowed to do.
 */
export function CompanionBadge({ name, entries, profile }: { name: string; entries: Entries; profile?: SeedInput }) {
  const companion = companionFor(name, entries);
  const { level, stage, currentStreak, longestStreak, nightsToNextLevel } = companion;
  const seed: ProfileSeed = profile ? seedFromProfile(profile) : EMPTY_PROFILE_SEED;
  const stats = statsFor(seed, entries);

  return (
    <div className="mb-5 rounded-card border border-line bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <CompanionAvatar stage={stage} size={40} className="shrink-0 text-ink-soft" animate={false} />
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
      <CompanionStats stats={stats} variant="compact" />
    </div>
  );
}
