// Program UI strings, keyed by locale.
//
// Shipped 3 November 2026 with lib/program.ts for Europe-audit P2.8. The
// shape mirrors lib/landing-copy.ts so adding fr / nl later is one block
// here, nothing in the component.
//
// Posture
//   Every string in this file is calm, present-tense, and never shame-based.
//   "Tough day" never becomes "bad day". "Pause" never becomes "give up".
//   "You missed Monday" never becomes anywhere in this file — a missed day
//   gets no mention at all, because mentioning it is already a shame mechanic.
//
// Translation
//   Written German-first, not auto-translated from English. "Weniger
//   anstrengend" lands differently than "less effortful"; "lass dir Zeit"
//   lands differently than "take your time". The intent is that Marcus
//   reading /program in German feels like it was written by someone who
//   actually smokes, not an English page run through DeepL.

import type { Locale } from "@/lib/landing-copy";

export type ProgramCopy = {
  /** Page metadata — set on the /program route itself */
  metaTitle: string;
  metaDescription: string;

  // ────────── Intro state (no program yet) ──────────
  introKicker: string;
  introH1: string;
  introBody: string;
  introBullets: string[]; // three honest things about the program
  introStartLabel: string;
  introPauseFixLink: string;

  // ────────── Setup — pick goal ──────────
  setupStepKicker: string;
  pickGoalH2: string;
  pickGoalIntro: string;
  goalOptions: Array<{
    kind: "days_per_week" | "sessions_per_day" | "pause_for" | "shift_time";
    title: string;
    body: string;
  }>;
  // Field labels on the goal detail steps
  currentLabel: string;
  targetLabel: string;
  daysLabel: string;
  fromTimeLabel: string;
  toTimeLabel: string;
  nextLabel: string;
  backLabel: string;

  // ────────── Setup — pick length ──────────
  pickWeeksH2: string;
  pickWeeksIntro: string;
  weeksOptions: Array<{ weeks: 2 | 4 | 6; title: string; body: string }>;
  startLabel: string;

  // ────────── Today ──────────
  todayKicker: string; // "Day {n} of {total}" formatted at render time with %d placeholders
  todayH1: string;
  todayGoalPrefix: string; // "Today's goal:" / "Dein Ziel heute:"
  logQuestion: string;
  logStates: Record<"well" | "mixed" | "tough", { title: string; body: string }>;
  noteLabel: string;
  notePlaceholder: string;
  saveLabel: string;
  loggedLabel: string;
  editLabel: string;
  clearLabel: string;

  // ────────── Weekly reflection ──────────
  reflectionKicker: string;
  reflectionH2: string;
  reflectionIntro: string;
  reflectionPlaceholder: string;
  reflectionSaveLabel: string;
  reflectionDoneLabel: string;
  reflectionSkipLabel: string;

  // ────────── Progress ──────────
  progressH2: string;
  progressLogged: string; // "{logged} of {elapsed} days logged" with %d placeholders
  progressStateLegend: Record<"well" | "mixed" | "tough", string>;

  // ────────── Finished state ──────────
  finishedKicker: string;
  finishedH1: string;
  finishedBody: string;
  finishedExtendLabel: string;
  finishedWrapLabel: string;

  // ────────── Paused state ──────────
  pausedKicker: string;
  pausedH1: string;
  pausedBody: string;
  resumeLabel: string;

  // ────────── Program settings (bottom) ──────────
  settingsH2: string;
  pauseLabel: string;
  exportLabel: string;
  deleteLabel: string;
  deleteConfirm: string;

  // ────────── Goal description helpers ──────────
  /** Human-readable one-line description of a goal, used on Today and
   *  Progress. The number tokens %d / %s are replaced by the component. */
  goalLine: {
    days_per_week: string; // "From %d days a week to %d"
    sessions_per_day: string;
    pause_for: string;
    shift_time: string;
  };
};

export const PROGRAM_COPY: Record<Locale, ProgramCopy> = {
  en: {
    metaTitle: "The Reduction Program — a 2 / 4 / 6-week plan you build yourself",
    metaDescription:
      "A quiet, self-guided plan to cut back, pause, or shift when you reach for cannabis. On your device, no sign-up, no streaks, no shame. Adults 18+.",

    introKicker: "The Reduction Program",
    introH1: "Not quitting. Not a streak. A plan you build.",
    introBody:
      "A short, honest plan — two, four, or six weeks — that helps you cut back, pause, or move the time you reach for a joint. You pick the goal. You log how each day went in one tap. Fix is here on the days you want to talk.",
    introBullets: [
      "No streaks. A tough day doesn’t erase the ones before it.",
      "On your device only. Nothing is uploaded, nothing has your name on it.",
      "Pause and resume whenever. Delete the whole thing in two taps.",
    ],
    introStartLabel: "Start a plan",
    introPauseFixLink: "I’d rather just talk → Fix",

    setupStepKicker: "New plan",
    pickGoalH2: "Pick one goal",
    pickGoalIntro:
      "One is enough. You can change the plan later. If none of these fit, pick the closest and tweak the numbers.",
    goalOptions: [
      {
        kind: "days_per_week",
        title: "Fewer days a week",
        body: "Drop the number of days you smoke in a week.",
      },
      {
        kind: "sessions_per_day",
        title: "Fewer times a day",
        body: "On the days you do, go from several to fewer sessions.",
      },
      {
        kind: "pause_for",
        title: "Pause for a stretch",
        body: "No cannabis for a chosen number of days.",
      },
      {
        kind: "shift_time",
        title: "Shift the time",
        body: "Move your usual time — e.g. not before 8pm, or not first thing.",
      },
    ],
    currentLabel: "Where you are now",
    targetLabel: "Where you want to be",
    daysLabel: "Days",
    fromTimeLabel: "From",
    toTimeLabel: "To",
    nextLabel: "Next",
    backLabel: "Back",

    pickWeeksH2: "Pick a length",
    pickWeeksIntro:
      "A plan you keep extending becomes a chore. Pick the shortest length that feels honest for the change you want.",
    weeksOptions: [
      { weeks: 2, title: "2 weeks", body: "A reset. Enough to notice a shape, not long enough to drift." },
      { weeks: 4, title: "4 weeks", body: "A real stretch. Good for cutting back without flipping your life." },
      { weeks: 6, title: "6 weeks", body: "A longer plan for a bigger change. Pause as often as you need." },
    ],
    startLabel: "Start the plan",

    todayKicker: "Day %d of %d",
    todayH1: "Today",
    todayGoalPrefix: "Your plan:",
    logQuestion: "How did today go?",
    logStates: {
      well: {
        title: "Went well",
        body: "You held the line, or close to it. Keep it light — no victory lap needed.",
      },
      mixed: {
        title: "Mixed",
        body: "Some of it worked. Some of it didn’t. Both are fine to say.",
      },
      tough: {
        title: "Tough day",
        body: "A tough day is a real log, not a failure. Noticing it is the whole point.",
      },
    },
    noteLabel: "One line, if you want",
    notePlaceholder: "e.g. busy day, didn’t think about it until 11pm",
    saveLabel: "Save today",
    loggedLabel: "Logged",
    editLabel: "Edit",
    clearLabel: "Clear today",

    reflectionKicker: "Week reflection",
    reflectionH2: "A quiet question",
    reflectionIntro:
      "Once a week, one line to yourself. Skippable; nothing happens if you don’t.",
    reflectionPlaceholder: "What was easier than you expected?",
    reflectionSaveLabel: "Save reflection",
    reflectionDoneLabel: "Saved",
    reflectionSkipLabel: "Skip this week",

    progressH2: "Your plan so far",
    progressLogged: "%d of %d days logged",
    progressStateLegend: {
      well: "Went well",
      mixed: "Mixed",
      tough: "Tough day",
    },

    finishedKicker: "Plan complete",
    finishedH1: "You reached the end of your plan.",
    finishedBody:
      "Nothing to prove. If the plan did its job you already know. You can extend by another two weeks, or wrap it up and keep the log for later.",
    finishedExtendLabel: "Extend by 2 weeks",
    finishedWrapLabel: "Wrap this plan up",

    pausedKicker: "Paused",
    pausedH1: "Your plan is paused.",
    pausedBody: "Nothing is counting. Resume whenever you want — your logs are kept.",
    resumeLabel: "Resume the plan",

    settingsH2: "This plan",
    pauseLabel: "Pause",
    exportLabel: "Export my logs (JSON)",
    deleteLabel: "Delete this plan",
    deleteConfirm:
      "This clears the whole plan from this device. There is no undo. Delete?",

    goalLine: {
      days_per_week: "From %d days a week to %d",
      sessions_per_day: "From %d times a day to %d",
      pause_for: "Pause for %d days",
      shift_time: "Shift from %s to %s",
    },
  },

  de: {
    metaTitle: "Das Reduktions-Programm — ein Plan über 2, 4 oder 6 Wochen, den du selbst baust",
    metaDescription:
      "Ein stiller, selbstgeführter Plan, um weniger, pausiert oder zu einer anderen Zeit zu konsumieren. Auf deinem Gerät, keine Anmeldung, keine Streaks, keine Scham. Ab 18.",

    introKicker: "Das Reduktions-Programm",
    introH1: "Nicht aufhören. Keine Streak. Ein Plan, den du baust.",
    introBody:
      "Ein kurzer, ehrlicher Plan — zwei, vier oder sechs Wochen — der dir hilft, weniger zu rauchen, zu pausieren oder die Zeit zu verschieben, zu der du zum Joint greifst. Du wählst das Ziel. Du loggst mit einem Tap, wie der Tag lief. Fix ist da, wenn du reden willst.",
    introBullets: [
      "Keine Streaks. Ein schwerer Tag löscht nicht die davor.",
      "Nur auf deinem Gerät. Nichts wird hochgeladen, nichts trägt deinen Namen.",
      "Pausieren und weitermachen jederzeit. Alles mit zwei Taps löschen.",
    ],
    introStartLabel: "Plan starten",
    introPauseFixLink: "Ich will lieber reden → Fix",

    setupStepKicker: "Neuer Plan",
    pickGoalH2: "Wähl ein Ziel",
    pickGoalIntro:
      "Eins reicht. Du kannst den Plan später ändern. Wenn nichts davon passt, nimm das nächstbeste und pass die Zahlen an.",
    goalOptions: [
      {
        kind: "days_per_week",
        title: "Weniger Tage pro Woche",
        body: "Reduzier die Anzahl Tage, an denen du in einer Woche rauchst.",
      },
      {
        kind: "sessions_per_day",
        title: "Weniger Mal am Tag",
        body: "An den Tagen, an denen du rauchst, geh von mehreren auf weniger Sessions.",
      },
      {
        kind: "pause_for",
        title: "Pause einlegen",
        body: "Kein Cannabis für eine gewählte Anzahl Tage.",
      },
      {
        kind: "shift_time",
        title: "Zeit verschieben",
        body: "Verschieb deine übliche Zeit — z.B. nicht vor 20 Uhr oder nicht als Erstes am Tag.",
      },
    ],
    currentLabel: "Wo du gerade bist",
    targetLabel: "Wo du hin willst",
    daysLabel: "Tage",
    fromTimeLabel: "Von",
    toTimeLabel: "Bis",
    nextLabel: "Weiter",
    backLabel: "Zurück",

    pickWeeksH2: "Wähl eine Länge",
    pickWeeksIntro:
      "Ein Plan, den du ständig verlängerst, wird zur Pflicht. Nimm die kürzeste Länge, die sich ehrlich anfühlt für das, was du ändern willst.",
    weeksOptions: [
      { weeks: 2, title: "2 Wochen", body: "Ein Reset. Lang genug, um eine Form zu sehen — nicht lang genug, um abzudriften." },
      { weeks: 4, title: "4 Wochen", body: "Ein echter Zeitraum. Gut, um weniger zu rauchen, ohne alles umzudrehen." },
      { weeks: 6, title: "6 Wochen", body: "Ein längerer Plan für eine größere Änderung. Pausier so oft du willst." },
    ],
    startLabel: "Plan starten",

    todayKicker: "Tag %d von %d",
    todayH1: "Heute",
    todayGoalPrefix: "Dein Plan:",
    logQuestion: "Wie lief heute?",
    logStates: {
      well: {
        title: "Lief gut",
        body: "Du hast es durchgezogen, oder fast. Bleib locker — keine Siegerrunde nötig.",
      },
      mixed: {
        title: "Gemischt",
        body: "Ein Teil hat geklappt. Ein Teil nicht. Beides ist okay zu sagen.",
      },
      tough: {
        title: "Schwerer Tag",
        body: "Ein schwerer Tag ist ein echter Log, kein Scheitern. Ihn wahrzunehmen ist der ganze Punkt.",
      },
    },
    noteLabel: "Eine Zeile, wenn du magst",
    notePlaceholder: "z.B. voller Tag, bis 23 Uhr nicht dran gedacht",
    saveLabel: "Heute speichern",
    loggedLabel: "Gespeichert",
    editLabel: "Bearbeiten",
    clearLabel: "Heute löschen",

    reflectionKicker: "Wochen-Reflexion",
    reflectionH2: "Eine leise Frage",
    reflectionIntro:
      "Einmal die Woche, eine Zeile für dich selbst. Überspringbar; nichts passiert, wenn du es nicht machst.",
    reflectionPlaceholder: "Was war einfacher als erwartet?",
    reflectionSaveLabel: "Reflexion speichern",
    reflectionDoneLabel: "Gespeichert",
    reflectionSkipLabel: "Diese Woche überspringen",

    progressH2: "Dein Plan bisher",
    progressLogged: "%d von %d Tagen geloggt",
    progressStateLegend: {
      well: "Lief gut",
      mixed: "Gemischt",
      tough: "Schwerer Tag",
    },

    finishedKicker: "Plan beendet",
    finishedH1: "Du hast das Ende deines Plans erreicht.",
    finishedBody:
      "Nichts zu beweisen. Wenn der Plan sein Ding gemacht hat, weißt du das selbst. Du kannst um zwei Wochen verlängern oder abschließen und den Log aufheben.",
    finishedExtendLabel: "Um 2 Wochen verlängern",
    finishedWrapLabel: "Plan abschließen",

    pausedKicker: "Pausiert",
    pausedH1: "Dein Plan ist pausiert.",
    pausedBody: "Nichts zählt gerade. Mach weiter, wann du willst — deine Logs bleiben.",
    resumeLabel: "Plan fortsetzen",

    settingsH2: "Dieser Plan",
    pauseLabel: "Pausieren",
    exportLabel: "Meine Logs exportieren (JSON)",
    deleteLabel: "Diesen Plan löschen",
    deleteConfirm:
      "Das löscht den ganzen Plan von diesem Gerät. Kein Rückgängig. Löschen?",

    goalLine: {
      days_per_week: "Von %d Tagen die Woche auf %d",
      sessions_per_day: "Von %d Mal am Tag auf %d",
      pause_for: "%d Tage Pause",
      shift_time: "Verschieben von %s auf %s",
    },
  },
};
