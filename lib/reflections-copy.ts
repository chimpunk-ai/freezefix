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

  // French. Added 4 Nov 2026 to keep in step with P3.11's locale expansion.
  // Written French-first for Sophie; each prompt ends with a question mark
  // and never evaluates her.
  fr: {
    cardKicker: "Cette semaine",
    cardHeading: "Une question calme",
    savedLabel: "Enregistré",
    skipLabel: "Passer cette semaine",
    saveLabel: "Enregistrer",
    savingLabel: "J'enregistre…",
    placeholder: "Une ligne, si tu veux",
    oneLineHint:
      "Uniquement sur ton appareil. Rien n'est téléversé. La question change chaque semaine.",
    prompts: [
      "Qu'est-ce qui a été plus facile que prévu cette semaine ?",
      "À quelle heure de la journée t'es-tu senti le plus toi-même ?",
      "Un moment qui s'est mieux passé que tu pensais — c'était quoi ?",
      "À quoi as-tu dit non cette semaine, grand ou petit ?",
      "Qu'est-ce qui a fait du bien et qui n'a rien coûté ?",
      "Avec qui as-tu passé du temps dont tu veux plus ?",
      "Qu'est-ce qu'un moment difficile t'a montré, s'il t'a montré quelque chose ?",
      "Qu'est-ce que tu veux emmener comme petite chose dans la semaine prochaine ?",
    ],
  },

  // Dutch. Added 4 Nov 2026 to keep in step with P3.11's locale expansion.
  nl: {
    cardKicker: "Deze week",
    cardHeading: "Een rustige vraag",
    savedLabel: "Opgeslagen",
    skipLabel: "Deze week overslaan",
    saveLabel: "Opslaan",
    savingLabel: "Bezig…",
    placeholder: "Eén regel, als je wilt",
    oneLineHint:
      "Alleen op je apparaat. Niets wordt geupload. De vraag verandert elke week.",
    prompts: [
      "Wat was deze week makkelijker dan je verwachtte?",
      "Op welk moment van de dag voelde je je het meest jezelf?",
      "Een moment dat beter ging dan je dacht — wat was dat?",
      "Waar heb je deze week nee tegen gezegd, groot of klein?",
      "Wat was iets goeds dat niets heeft gekost?",
      "Met wie heb je tijd doorgebracht waar je meer van wilt?",
      "Wat heeft een zware moment je laten zien, als het je iets heeft laten zien?",
      "Wat wil je als kleine ding meenemen naar volgende week?",
    ],
  },
};
