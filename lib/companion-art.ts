// Founder-supplied character art (task 67 of the 50-step plan, 20 Nov
// 2026). The founder rejected the plain line-art companions for the stat
// card and is generating real illustrated art themselves (e.g. via
// ChatGPT) rather than this session adding a paid image-generation vendor
// — one image per species, square, ideally on a plain/transparent
// background.
//
// This file is the ONLY thing that needs to change once an image arrives:
// drop the file at public/companion/<species>.png and add one line below.
// CompanionPortraitFrame (components/CompanionPortraitFrame.tsx) already
// knows to prefer this image over the hand-drawn vector art the moment a
// species has an entry here — no other component needs to change.
//
// Treated as that species' single "grown" look. There's no per-stage art
// yet (that would be 6 species x 5 stages = 30 images) — until/unless the
// founder supplies more, CompanionPortraitFrame fades and scales this same
// image down for the earlier stages instead of showing the full-color,
// full-size art before it's "earned".
import type { CompanionSpecies } from "./companion";

export const SPECIES_IMAGE: Partial<Record<CompanionSpecies, string>> = {
  // fox: "/companion/fox.png",
};
