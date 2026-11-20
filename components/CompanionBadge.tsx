import { companionFor, seedFromProfile, statsFor, displayLevelName, EMPTY_PROFILE_SEED, type ProfileSeed, type CompanionSpecies } from "@/lib/companion";
import { CompanionPortrait } from "@/components/CompanionPortrait";
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
export function CompanionBadge({
  name,
  entries,
  profile,
  species,
}: {
  name: string;
  entries: Entries;
  profile?: SeedInput;
  /** Which companion they picked (task 14, 20 Nov 2026). Optional only so
   *  existing callers/tests don't break — falls back to the plant, same as
   *  CompanionPortrait itself does for an unset/legacy profile. */
  species?: CompanionSpecies;
}) {
  const companion = companionFor(name, entries);
  const { level, levelName, stage, currentStreak, longestStreak, nightsToNextLevel, progress } = companion;
  const curLevelName = displayLevelName(species, level, levelName);
  const seed: ProfileSeed = profile ? seedFromProfile(profile) : EMPTY_PROFILE_SEED;
  const stats = statsFor(seed, entries);

  return (
    <div className="mb-5 rounded-card border border-line bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <CompanionPortrait species={species} stage={stage} size={40} className="shrink-0 text-ink-soft" animate={false} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-14 text-ink">
            <span className="font-medium">{companion.name}</span>{" "}
            <span className="text-ink-faint">· level {level}, {curLevelName}</span>
          </p>
          <p className="mt-0.5 text-12 text-ink-faint">
            {currentStreak > 0
              ? `${currentStreak} night${currentStreak === 1 ? "" : "s"} running`
              : longestStreak > 0
                ? `longest run so far: ${longestStreak} night${longestStreak === 1 ? "" : "s"}`
                : "log tonight to get this started"}
          </p>
          {/* Progress is real nights logged, not a fabricated XP number —
              see lib/companion.ts's levelProgress. Hidden once maxed out,
              same as the old text-only line used to read "maxed out". */}
          {progress ? (
            <div className="mt-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-line" role="progressbar" aria-valuenow={progress.into} aria-valuemin={0} aria-valuemax={progress.span} aria-label="progress to next level">
                <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progress.fraction * 100}%` }} />
              </div>
              <p className="mt-1 text-11 text-ink-faint">
                {progress.into}/{progress.span} nights · {nightsToNextLevel} to the next level
              </p>
            </div>
          ) : (
            <p className="mt-1.5 text-11 text-ink-faint">maxed out, in the best way</p>
          )}
        </div>
      </div>
      <CompanionStats stats={stats} variant="compact" />
    </div>
  );
}
