import type { CompanionSpecies, CompanionStage } from "@/lib/companion";
import { CompanionAvatar } from "@/components/CompanionAvatar";
import { CompanionSpeciesAvatar } from "@/components/CompanionSpecies";

/**
 * Draws whichever companion the person actually has, at its real growth
 * stage — added for task 14 of the 50-step plan (20 Nov 2026, the
 * character-picker screen) so every place that used to assume "the
 * companion is a plant" (CompanionBadge, PatternCard, the onboarding
 * reveal) can draw any of the picked species without each needing its own
 * if/else. Extended for task 16 (evolution tiers): every species now draws
 * its real stage, not just a fixed base form.
 */
export function CompanionPortrait({
  species,
  stage,
  size = 96,
  tone = "currentColor",
  accent = "#e8a265",
  animate = true,
  className,
}: {
  species?: CompanionSpecies;
  stage: CompanionStage;
  size?: number;
  tone?: string;
  accent?: string;
  animate?: boolean;
  className?: string;
}) {
  if (!species || species === "plant") {
    return <CompanionAvatar stage={stage} size={size} tone={tone} accent={accent} animate={animate} className={className} />;
  }
  return (
    <CompanionSpeciesAvatar species={species} stage={stage} size={size} tone={tone} accent={accent} animate={animate} className={className} />
  );
}
