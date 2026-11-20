import type { CompanionSpecies, CompanionStage } from "@/lib/companion";
import { CompanionPortrait } from "@/components/CompanionPortrait";
import { SPECIES_IMAGE } from "@/lib/companion-art";

const STAGE_ORDER: CompanionStage[] = ["seed", "sprout", "sapling", "young tree", "full bloom"];

/**
 * The framed portrait box for the stat card (task 67 of the 50-step plan,
 * 20 Nov 2026). Prefers a founder-supplied image (lib/companion-art.ts) the
 * moment one exists for this species; falls back to the existing hand-drawn
 * vector art (CompanionPortrait) otherwise, so nothing breaks or looks
 * empty before art arrives, and no other component needs to change when it
 * does.
 *
 * There's only one supplied image per species, not one per growth stage, so
 * until/unless more are provided, earlier stages fade and shrink that same
 * image rather than show it at full strength before it's "earned" — a
 * deliberately simple stand-in for real per-stage art. The vector-art
 * fallback doesn't need this treatment: it already draws a distinct, real
 * picture per stage (components/CompanionSpecies.tsx).
 *
 * Decorative (alt=""/aria-hidden, like CompanionPortrait's own SVGs) — the
 * name, level and stage always appear as real text right next to this, so
 * nothing here is the only place that information lives.
 */
export function CompanionPortraitFrame({
  species,
  stage,
  size = 64,
  className,
}: {
  species?: CompanionSpecies;
  stage: CompanionStage;
  size?: number;
  className?: string;
}) {
  const image = species ? SPECIES_IMAGE[species] : undefined;

  if (!image) {
    return (
      <div
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-line bg-chip ${className ?? ""}`}
        style={{ width: size, height: size }}
        aria-hidden
      >
        <CompanionPortrait
          species={species}
          stage={stage}
          size={Math.round(size * 0.72)}
          tone="currentColor"
          className="text-ink-soft"
          animate={false}
        />
      </div>
    );
  }

  const stageIndex = Math.max(0, STAGE_ORDER.indexOf(stage));
  const fraction = stageIndex / (STAGE_ORDER.length - 1); // 0 (seed) .. 1 (full bloom)
  const scale = 0.72 + 0.28 * fraction;
  const grayscalePercent = Math.round((1 - fraction) * 70); // fully gray-ish at seed, full color by full bloom
  const opacity = 0.6 + 0.4 * fraction;

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-line bg-chip ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- a small
          local static file under public/companion/, served at one real
          size here; not worth next/image's loader config for that. */}
      <img
        src={image}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover transition-[filter,opacity,transform] duration-300 ease-out"
        style={{ transform: `scale(${scale})`, filter: `grayscale(${grayscalePercent}%)`, opacity }}
      />
    </div>
  );
}
