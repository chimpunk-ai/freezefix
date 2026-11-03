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
  /** Quit-mode target-date field + helper. 4 Nov 2026 — Mohammed persona. */
  targetDateLabel: string;
  targetDateHint: string;
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
    quit_for_date: string; // "Clean until %s" / "Sauber bis %s"
  };

  /** Quit-mode specific strings. Rendered only when goal.kind ===
   *  "quit_for_date" — the one program context where a streak counter is
   *  honest (the user set the goal up that way). */
  quit: {
    streakH2: string; // "Days clean"
    streakUnit: string; // "days" / "Tage" — pluralization is not perfect here, acceptable
    streakResetNote: string; // "A used day reset the counter — that's it. Pick up where you were."
    daysLeftH2: string; // "Days to your target"
    daysLeftUnit: string; // "days to go"
    daysLeftToday: string; // "That's today."
    daysLeftPassed: string; // "You passed the target date." (displayed in the finished state too)
    targetCaption: string; // "Target: %s" shown on Today
  };
};

export const PROGRAM_COPY: Record<Locale, ProgramCopy> = {
  en: {
    metaTitle: "Reduction, tolerance break, or quit by a date — a plan you build yourself",
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
        title: "Tolerance break (T-break) or pause",
        body: "No cannabis for a chosen number of days. Reset your tolerance, or take time off.",
      },
      {
        kind: "shift_time",
        title: "Shift the time",
        body: "Move your usual time — e.g. not before 8pm, or not first thing.",
      },
      {
        // Mohammed persona (15-persona audit): "I've got a drug test / new job
        // / pregnancy / clinical reason to STOP by a specific date — pause is
        // not quite the same, and 'reduction' is hostile when quitting is
        // literally why I'm here." Quit mode has its own date input and is
        // the one Program context that shows a streak counter.
        kind: "quit_for_date",
        title: "Quit for a date",
        body: "Stay off completely until a specific date — a drug test, a pregnancy, a new job.",
      },
    ],
    currentLabel: "Where you are now",
    targetLabel: "Where you want to be",
    daysLabel: "Days",
    fromTimeLabel: "From",
    toTimeLabel: "To",
    targetDateLabel: "Target date",
    targetDateHint: "A drug test, a pregnancy, a new job, a wedding — the date you need to be clean by.",
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
      quit_for_date: "Clean until %s",
    },
    quit: {
      streakH2: "Days clean",
      streakUnit: "days",
      streakResetNote: "A used day resets the counter. That's it. Pick up where you were.",
      daysLeftH2: "Days to your target",
      daysLeftUnit: "days to go",
      daysLeftToday: "That's today. You did it.",
      daysLeftPassed: "You passed your target date.",
      targetCaption: "Target: %s",
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
        title: "Tolerance break (T-break) oder Pause",
        body: "Kein Cannabis für eine gewählte Anzahl Tage. Toleranz zurücksetzen oder einfach eine Pause.",
      },
      {
        kind: "shift_time",
        title: "Zeit verschieben",
        body: "Verschieb deine übliche Zeit — z.B. nicht vor 20 Uhr oder nicht als Erstes am Tag.",
      },
      {
        kind: "quit_for_date",
        title: "Bis zu einem Datum aufhören",
        body: "Komplett sauber bleiben bis zu einem bestimmten Datum — Drogentest, Schwangerschaft, neuer Job.",
      },
    ],
    currentLabel: "Wo du gerade bist",
    targetLabel: "Wo du hin willst",
    daysLabel: "Tage",
    fromTimeLabel: "Von",
    toTimeLabel: "Bis",
    targetDateLabel: "Zieldatum",
    targetDateHint: "Ein Drogentest, eine Schwangerschaft, ein neuer Job, eine Hochzeit — das Datum, bis zu dem du sauber sein musst.",
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
      quit_for_date: "Sauber bis %s",
    },
    quit: {
      streakH2: "Tage sauber",
      streakUnit: "Tage",
      streakResetNote: "Ein konsumierter Tag setzt den Zähler zurück. Das ist alles. Mach einfach weiter von da.",
      daysLeftH2: "Tage bis zu deinem Ziel",
      daysLeftUnit: "Tage noch",
      daysLeftToday: "Das ist heute. Du hast es geschafft.",
      daysLeftPassed: "Du hast dein Zieldatum überschritten.",
      targetCaption: "Ziel: %s",
    },
  },

  // ─────────────────── French ───────────────────
  // Added 3 November 2026 for P3.11. Sophie (Paris, 24) weekend user.
  // "Streak" stays "streak" because that's what she says.
  fr: {
    metaTitle: "Le Programme de Réduction — un plan sur 2, 4 ou 6 semaines que tu construis toi-même",
    metaDescription:
      "Un plan calme et personnel pour fumer moins, faire une pause, ou déplacer le moment où tu allumes. Sur ton appareil, sans inscription, sans streaks, sans honte. Adultes 18+.",

    introKicker: "Le Programme de Réduction",
    introH1: "Pas arrêter. Pas de streak. Un plan que tu construis.",
    introBody:
      "Un plan court et honnête — deux, quatre ou six semaines — qui t'aide à fumer moins, faire une pause, ou déplacer le moment où tu allumes. Tu choisis l'objectif. Tu notes comment la journée s'est passée en un tap. Fix est là les jours où tu veux parler.",
    introBullets: [
      "Pas de streaks. Une journée difficile n'efface pas celles d'avant.",
      "Uniquement sur ton appareil. Rien n'est téléversé, rien n'a ton nom.",
      "Mets en pause et reprends quand tu veux. Supprime tout en deux taps.",
    ],
    introStartLabel: "Commencer un plan",
    introPauseFixLink: "Je préfère juste parler → Fix",

    setupStepKicker: "Nouveau plan",
    pickGoalH2: "Choisis un objectif",
    pickGoalIntro:
      "Un seul suffit. Tu pourras modifier le plan plus tard. Si rien ne colle, prends le plus proche et ajuste les chiffres.",
    goalOptions: [
      { kind: "days_per_week", title: "Moins de jours par semaine", body: "Réduis le nombre de jours où tu fumes dans la semaine." },
      { kind: "sessions_per_day", title: "Moins de fois par jour", body: "Les jours où tu fumes, passe de plusieurs à moins de sessions." },
      { kind: "pause_for", title: "T-break (tolerance break) ou pause", body: "Pas de cannabis pendant un nombre de jours choisi. Reset ta tolérance, ou prends une vraie pause." },
      { kind: "shift_time", title: "Déplace l'heure", body: "Décale ton heure habituelle — ex. pas avant 20h ou pas en premier." },
      { kind: "quit_for_date", title: "Arrêter pour une date", body: "Reste complètement clean jusqu'à une date précise — test de drogue, grossesse, nouveau job." },
    ],
    currentLabel: "Où tu en es",
    targetLabel: "Où tu veux aller",
    daysLabel: "Jours",
    fromTimeLabel: "De",
    toTimeLabel: "À",
    targetDateLabel: "Date cible",
    targetDateHint: "Un test de drogue, une grossesse, un nouveau job, un mariage — la date à laquelle tu dois être clean.",
    nextLabel: "Suivant",
    backLabel: "Retour",

    pickWeeksH2: "Choisis une durée",
    pickWeeksIntro:
      "Un plan qu'on prolonge sans fin devient une corvée. Prends la plus courte durée qui est honnête pour le changement que tu veux.",
    weeksOptions: [
      { weeks: 2, title: "2 semaines", body: "Un reset. Assez pour voir une forme, pas assez pour dériver." },
      { weeks: 4, title: "4 semaines", body: "Une vraie période. Bien pour réduire sans bouleverser ta vie." },
      { weeks: 6, title: "6 semaines", body: "Un plan plus long pour un plus gros changement. Mets en pause autant que nécessaire." },
    ],
    startLabel: "Lancer le plan",

    todayKicker: "Jour %d sur %d",
    todayH1: "Aujourd'hui",
    todayGoalPrefix: "Ton plan :",
    logQuestion: "Comment s'est passée la journée ?",
    logStates: {
      well: { title: "Bien passé", body: "Tu as tenu, ou presque. Reste tranquille — pas besoin de tour d'honneur." },
      mixed: { title: "Mitigé", body: "Une partie a marché. Une partie non. Les deux sont OK à dire." },
      tough: { title: "Journée difficile", body: "Une journée difficile est un vrai log, pas un échec. La remarquer est le point entier." },
    },
    noteLabel: "Une ligne, si tu veux",
    notePlaceholder: "ex. journée chargée, pas pensé avant 23h",
    saveLabel: "Enregistrer aujourd'hui",
    loggedLabel: "Enregistré",
    editLabel: "Modifier",
    clearLabel: "Effacer aujourd'hui",

    reflectionKicker: "Réflexion de la semaine",
    reflectionH2: "Une question calme",
    reflectionIntro:
      "Une fois par semaine, une ligne pour toi-même. On peut passer; rien ne se passe si tu ne le fais pas.",
    reflectionPlaceholder: "Qu'est-ce qui a été plus facile que prévu ?",
    reflectionSaveLabel: "Enregistrer la réflexion",
    reflectionDoneLabel: "Enregistrée",
    reflectionSkipLabel: "Passer cette semaine",

    progressH2: "Ton plan jusqu'ici",
    progressLogged: "%d sur %d jours notés",
    progressStateLegend: {
      well: "Bien passé",
      mixed: "Mitigé",
      tough: "Journée difficile",
    },

    finishedKicker: "Plan terminé",
    finishedH1: "Tu as atteint la fin de ton plan.",
    finishedBody:
      "Rien à prouver. Si le plan a fait son travail, tu le sais déjà. Tu peux prolonger de deux semaines, ou clôturer et garder le log pour plus tard.",
    finishedExtendLabel: "Prolonger de 2 semaines",
    finishedWrapLabel: "Clôturer ce plan",

    pausedKicker: "En pause",
    pausedH1: "Ton plan est en pause.",
    pausedBody: "Rien ne compte en ce moment. Reprends quand tu veux — tes logs sont conservés.",
    resumeLabel: "Reprendre le plan",

    settingsH2: "Ce plan",
    pauseLabel: "Pause",
    exportLabel: "Exporter mes logs (JSON)",
    deleteLabel: "Supprimer ce plan",
    deleteConfirm:
      "Cela supprime le plan entier de cet appareil. Pas de retour en arrière. Supprimer ?",

    goalLine: {
      days_per_week: "De %d jours par semaine à %d",
      sessions_per_day: "De %d fois par jour à %d",
      pause_for: "Pause de %d jours",
      shift_time: "Décalage de %s à %s",
      quit_for_date: "Clean jusqu'au %s",
    },
    quit: {
      streakH2: "Jours clean",
      streakUnit: "jours",
      streakResetNote: "Un jour où tu as fumé remet le compteur à zéro. C'est tout. Reprends où tu en étais.",
      daysLeftH2: "Jours jusqu'à ta date",
      daysLeftUnit: "jours restants",
      daysLeftToday: "C'est aujourd'hui. Tu l'as fait.",
      daysLeftPassed: "Tu as passé ta date cible.",
      targetCaption: "Cible : %s",
    },
  },

  // ─────────────────── Dutch ───────────────────
  nl: {
    metaTitle: "Het Reductieprogramma — een plan van 2, 4 of 6 weken dat je zelf opbouwt",
    metaDescription:
      "Een rustig, zelfgestuurd plan om minder te blowen, een pauze te nemen, of het moment te verschuiven waarop je grijpt. Op je apparaat, geen aanmelding, geen streaks, geen schaamte. Vanaf 18.",

    introKicker: "Het Reductieprogramma",
    introH1: "Niet stoppen. Geen streak. Een plan dat je bouwt.",
    introBody:
      "Een kort, eerlijk plan — twee, vier of zes weken — dat je helpt om minder te blowen, te pauzeren, of het moment te verschuiven waarop je naar een joint grijpt. Jij kiest het doel. Jij logt met één tap hoe de dag ging. Fix is er op de dagen dat je wilt praten.",
    introBullets: [
      "Geen streaks. Een zware dag wist de dagen ervoor niet uit.",
      "Alleen op je apparaat. Niets wordt geupload, niets heeft je naam.",
      "Pauzeer en hervat wanneer je wilt. Verwijder alles met twee taps.",
    ],
    introStartLabel: "Plan starten",
    introPauseFixLink: "Ik praat liever gewoon → Fix",

    setupStepKicker: "Nieuw plan",
    pickGoalH2: "Kies één doel",
    pickGoalIntro:
      "Een is genoeg. Je kunt het plan later aanpassen. Als niets past, kies het dichtstbijzijnde en pas de getallen aan.",
    goalOptions: [
      { kind: "days_per_week", title: "Minder dagen per week", body: "Verminder het aantal dagen dat je in een week blowt." },
      { kind: "sessions_per_day", title: "Minder keer per dag", body: "Op de dagen dat je wel blowt, ga van meerdere naar minder sessies." },
      { kind: "pause_for", title: "T-break (tolerance break) of pauze", body: "Geen cannabis gedurende een gekozen aantal dagen. Reset je tolerantie, of neem gewoon pauze." },
      { kind: "shift_time", title: "Verschuif het tijdstip", body: "Verschuif je gebruikelijke tijd — bijv. niet voor 20:00 of niet als eerste." },
      { kind: "quit_for_date", title: "Stoppen voor een datum", body: "Volledig schoon blijven tot een specifieke datum — drugstest, zwangerschap, nieuwe baan." },
    ],
    currentLabel: "Waar je nu bent",
    targetLabel: "Waar je naartoe wilt",
    daysLabel: "Dagen",
    fromTimeLabel: "Van",
    toTimeLabel: "Tot",
    targetDateLabel: "Doel-datum",
    targetDateHint: "Een drugstest, een zwangerschap, een nieuwe baan, een bruiloft — de datum waarop je schoon moet zijn.",
    nextLabel: "Volgende",
    backLabel: "Terug",

    pickWeeksH2: "Kies een lengte",
    pickWeeksIntro:
      "Een plan dat je blijft verlengen wordt een plicht. Neem de kortste lengte die eerlijk voelt voor de verandering die je wilt.",
    weeksOptions: [
      { weeks: 2, title: "2 weken", body: "Een reset. Lang genoeg om een vorm te zien, niet lang genoeg om af te dwalen." },
      { weeks: 4, title: "4 weken", body: "Een echte periode. Goed om te minderen zonder je leven om te gooien." },
      { weeks: 6, title: "6 weken", body: "Een langer plan voor een grotere verandering. Pauzeer zo vaak je nodig hebt." },
    ],
    startLabel: "Plan starten",

    todayKicker: "Dag %d van %d",
    todayH1: "Vandaag",
    todayGoalPrefix: "Jouw plan:",
    logQuestion: "Hoe ging vandaag?",
    logStates: {
      well: { title: "Ging goed", body: "Je hebt het volgehouden, of bijna. Blijf rustig — geen zegeronde nodig." },
      mixed: { title: "Gemengd", body: "Een deel werkte. Een deel niet. Beide zijn OK om te zeggen." },
      tough: { title: "Zware dag", body: "Een zware dag is een echte log, geen mislukking. Hem opmerken is het hele punt." },
    },
    noteLabel: "Eén regel, als je wilt",
    notePlaceholder: "bijv. drukke dag, pas om 23:00 aan gedacht",
    saveLabel: "Vandaag opslaan",
    loggedLabel: "Opgeslagen",
    editLabel: "Bewerken",
    clearLabel: "Vandaag wissen",

    reflectionKicker: "Weekreflectie",
    reflectionH2: "Een rustige vraag",
    reflectionIntro:
      "Eén keer per week, één regel voor jezelf. Overslaan mag; er gebeurt niets als je het niet doet.",
    reflectionPlaceholder: "Wat was makkelijker dan je verwachtte?",
    reflectionSaveLabel: "Reflectie opslaan",
    reflectionDoneLabel: "Opgeslagen",
    reflectionSkipLabel: "Deze week overslaan",

    progressH2: "Je plan tot nu toe",
    progressLogged: "%d van %d dagen gelogd",
    progressStateLegend: {
      well: "Ging goed",
      mixed: "Gemengd",
      tough: "Zware dag",
    },

    finishedKicker: "Plan voltooid",
    finishedH1: "Je hebt het einde van je plan bereikt.",
    finishedBody:
      "Niets te bewijzen. Als het plan zijn werk heeft gedaan, weet je dat zelf. Je kunt met twee weken verlengen, of afsluiten en de log bewaren voor later.",
    finishedExtendLabel: "Verlengen met 2 weken",
    finishedWrapLabel: "Dit plan afsluiten",

    pausedKicker: "Gepauzeerd",
    pausedH1: "Je plan is gepauzeerd.",
    pausedBody: "Niets telt op dit moment. Hervat wanneer je wilt — je logs blijven.",
    resumeLabel: "Plan hervatten",

    settingsH2: "Dit plan",
    pauseLabel: "Pauzeren",
    exportLabel: "Mijn logs exporteren (JSON)",
    deleteLabel: "Dit plan verwijderen",
    deleteConfirm:
      "Dit wist het hele plan van dit apparaat. Geen ongedaan maken. Verwijderen?",

    goalLine: {
      days_per_week: "Van %d dagen per week naar %d",
      sessions_per_day: "Van %d keer per dag naar %d",
      pause_for: "%d dagen pauze",
      shift_time: "Verschuiven van %s naar %s",
      quit_for_date: "Schoon tot %s",
    },
    quit: {
      streakH2: "Dagen schoon",
      streakUnit: "dagen",
      streakResetNote: "Een dag waarop je blowde zet de teller terug. Dat is alles. Pak op waar je was.",
      daysLeftH2: "Dagen tot je doel",
      daysLeftUnit: "dagen te gaan",
      daysLeftToday: "Dat is vandaag. Je hebt het gedaan.",
      daysLeftPassed: "Je bent je doel-datum voorbij.",
      targetCaption: "Doel: %s",
    },
  },
};
