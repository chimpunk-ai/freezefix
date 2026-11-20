import type { CompanionSpecies, CompanionStage } from "@/lib/companion";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import { CompanionSpeciesAvatar } from "@/components/CompanionSpecies";

/**
 * Draws whichever companion the person actually has — added for task 14 of
 * the 50-step plan (20 Nov 2026, the character-picker screen) so every
 * place that used to assume "the companion is a plant" (CompanionBadge, the
 * onboarding reveal) can draw any of the picked species without each
 * needing its own if/else.
 *
 * Honest limitation, not a bug: only the plant has art for every growth
 * stage right now. Evolution tiers per animal are task 15/16's job — until
 * those exist, every animal species shows its one drawn (level-1/base)
 * form at every level. A fox at level 8 looks identical to a fox at level
 * 1; it is not stuck or broken, the higher tiers just aren't drawn yet.
 */
export function CompanionPortrait({
  species,
  stage,
  size = 96,
  tone = "currentColor",
  animate = true,
  className,
}: {
  species?: CompanionSpecies;
  stage: CompanionStage;
  size?: number;
  tone?: string;
  animate?: boolean;
  className?: string;
}) {
  if (!species || species === "plant") {
    return <CompanionAvatar stage={stage} size={size} tone={tone} animate={animate} className={className} />;
  }
  return <CompanionSpeciesAvatar species={species} size={size} tone={tone} animate={animate} className={className} />;
}
