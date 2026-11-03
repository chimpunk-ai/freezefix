// Weekly reflection prompts + card copy.
//
// Shipped 3 November 2026 with lib/reflections.ts for Europe-audit P2.9.
// Separate from program-copy because the Reduction Program's reflection
// is scoped to a plan; this is a universal weekly nudge. Keeping them
// separate also makes it obvious that these two files can drift in tone
// independently (the program's reflection is tied to a goal; this one is
// a general week-in-review).
//
// Prompt rotation
//   8 prompts per locale. The user sees prompt[weekOrdinal % 8] each ISO
//   week, so a visitor who sticks around for two months sees every prompt
//   once with no two consecutive weeks asking the same thing.
//
// Posture
//   Every prompt is open-ended, non-judgmental, present-tense, and asks
//   about something concrete rather than evaluating the user. "What was
//   easier than you expected?" is a question anyone can answer honestly.
//   "Did you stick to your goal?" would be a pass/fail question and never
//   appears here.

import type { Locale } from "@/lib/landing-copy";

export type ReflectionsCopy = {
  cardKicker: string; // "This week"
  cardHeading: string; // "A quiet question"
  savedLabel: string;
  skipLabel: string;
  saveLabel: string;
  savingLabel: string;
  placeholder: string;
  oneLineHint: string; // small helper under the field
  prompts: string[]; // exactly 8
};

export const REFLECTIONS_COPY: Record<Locale, ReflectionsCopy> = {
  en: {
    cardKicker: "This week",
    cardHeading: "A quiet question",
    savedLabel: "Saved",
    skipLabel: "Skip this week",
    saveLabel: "Save",
    savingLabel: "Saving…",
    placeholder: "One line, if you want",
    oneLineHint:
      "On your device only. Nothing is uploaded. The question changes every week.",
    prompts: [
      "What was easier than you expected this week?",
      "What time of day did you feel most like yourself?",
      "One moment that went better than you thought it would — what was it?",
      "What did you say no to this week, big or small?",
      "What was one thing that felt good that didn’t cost anything?",
      "Who did you spend time with that you want more of?",
      "What did a tough moment teach you, if anything?",
      "What’s one small thing you want to carry into next week?",
    ],
  },

  de: {
    cardKicker: "Diese Woche",
    cardHeading: "Eine leise Frage",
    savedLabel: "Gespeichert",
    skipLabel: "Diese Woche überspringen",
    saveLabel: "Speichern",
    savingLabel: "Speichere…",
    placeholder: "Eine Zeile, wenn du magst",
    oneLineHint:
      "Nur auf deinem Gerät. Nichts wird hochgeladen. Die Frage ändert sich jede Woche.",
    prompts: [
      "Was war diese Woche einfacher als erwartet?",
      "Zu welcher Tageszeit hast du dich am meisten wie du selbst gefühlt?",
      "Ein Moment, der besser lief als gedacht — was war das?",
      "Wozu hast du diese Woche nein gesagt, groß oder klein?",
      "Was war etwas Gutes, das nichts gekostet hat?",
      "Mit wem hast du Zeit verbracht, von der du mehr willst?",
      "Was hat dir ein schwerer Moment gezeigt, wenn überhaupt?",
      "Was willst du als kleine Sache in nächste Woche mitnehmen?",
    ],
  },
};
