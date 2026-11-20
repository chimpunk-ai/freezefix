import {
  companionFor,
  seedFromProfile,
  statsFor,
  hpFor,
  displayLevelName,
  EMPTY_PROFILE_SEED,
  STAT_COLOR,
  SPECIES_TYPE_LABEL,
  type ProfileSeed,
  type CompanionSpecies,
} from "@/lib/companion";
import { CompanionPortraitFrame } from "@/components/CompanionPortraitFrame";
import { SHORT_LABEL } from "@/components/CompanionStats";
import type { Entries } from "@/lib/entry";

type SeedInput = Parameters<typeof seedFromProfile>[0];

/**
 * The companion stat card at the top of Tonight. Rebuilt task 67 of the
 * 50-step plan (20 Nov 2026) after the founder rejected the original
 * muted, line-only version outright — reference was a bold, colorful
 * game-style stat card (framed portrait, level + type badge, bold labeled
 * bars). Everything shown is still derived live from the real log
 * (lib/companion.ts) exactly as before; only the look changed. Nothing
 * here is stored separately from the entries that already exist, so it can
 * never drift out of sync with them. Hidden entirely when the person has
 * turned it off in settings (profile.showCompanion === false) — this
 * component is simply never rendered in that case, by the caller.
 *
 * `profile` is optional only so existing callers/tests don't break; pass it
 * whenever it's available so the stat bars below start from the exact same
 * onboarding-answer credit shown at onboarding — otherwise a bar could look
 * like it fell, which is the one thing this feature isn't allowed to do.
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
   *  CompanionPortraitFrame itself does for an unset/legacy profile. */
  species?: CompanionSpecies;
}) {
  const companion = companionFor(name, entries);
  const { level, levelName, stage, currentStreak, longestStreak, nightsToNextLevel, progress } = companion;
  const curLevelName = displayLevelName(species, level, levelName);
  const seed: ProfileSeed = profile ? seedFromProfile(profile) : EMPTY_PROFILE_SEED;
  const stats = statsFor(seed, entries);
  const hp = hpFor(stats);
  const typeLabel = SPECIES_TYPE_LABEL[species ?? "plant"];

  return (
    <div className="mb-5 overflow-hidden rounded-card border-2 border-line bg-card">
      <div className="flex items-center gap-3 p-3 pb-2.5">
        <CompanionPortraitFrame species={species} stage={stage} size={60} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="truncate text-16 font-semibold text-ink">{companion.name}</p>
            <span className="shrink-0 rounded-pill border border-line bg-chip px-2 py-0.5 text-11 font-semibold uppercase tracking-wide text-ink-soft">
              lv. {level}
            </span>
            <span className="shrink-0 rounded-pill border border-signpost/40 bg-signpost/10 px-2 py-0.5 text-11 font-semibold uppercase tracking-wide text-signpost">
              {typeLabel}
            </span>
          </div>
          <p className="mt-0.5 truncate text-12 text-ink-faint">{curLevelName}</p>
          <p className="mt-0.5 text-11 text-ink-faint">
            {currentStreak > 0
              ? `${currentStreak} night${currentStreak === 1 ? "" : "s"} running`
              : longestStreak > 0
                ? `longest run so far: ${longestStreak} night${longestStreak === 1 ? "" : "s"}`
                : "log tonight to get this started"}
          </p>
        </div>
      </div>

      {/* Progress is real nights logged, not a fabricated XP number — see
          lib/companion.ts's levelProgress. Hidden once maxed out, same as
          before. */}
      {progress ? (
        <div className="px-3">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full bg-chip"
            role="progressbar"
            aria-valuenow={progress.into}
            aria-valuemin={0}
            aria-valuemax={progress.span}
            aria-label="progress to next level"
          >
            <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progress.fraction * 100}%` }} />
          </div>
          <p className="mt-1 text-11 text-ink-faint">
            {progress.into}/{progress.span} nights · {nightsToNextLevel} to the next level
          </p>
        </div>
      ) : (
        <p className="px-3 text-11 text-ink-faint">maxed out, in the best way</p>
      )}

      {/* The five real stats, bold and colorful (task 67) — each bar is
          still exactly one of hpFor()'s segments, the same tiers behind
          every other stat display in the app, just drawn with real color
          and weight instead of a single muted fill. */}
      <div className="mt-3 space-y-1.5 border-t border-line px-3 py-3" aria-label={`companion stats: hp ${hp.hp} of ${hp.maxHp}`}>
        {hp.segments.map((s) => {
          const color = STAT_COLOR[s.key];
          return (
            <div key={s.key} title={`${s.label}: ${s.tier}/5`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className={`text-11 font-bold uppercase tracking-wide ${color.text}`}>{SHORT_LABEL[s.key]}</span>
                <span className="text-11 tabular-nums text-ink-faint">
                  {s.hp}/{s.maxHp}
                </span>
              </div>
              <div className="mt-0.5 h-2.5 w-full overflow-hidden rounded-full border border-line/60 bg-chip">
                <div
                  className={`h-full rounded-full transition-[width] duration-300 ${color.bg}`}
                  style={{ width: `${(s.hp / s.maxHp) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
