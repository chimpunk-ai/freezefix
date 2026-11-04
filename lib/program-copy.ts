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

  // ────────── Optional streak counter (opt-in) ──────────
  // Added 4 Nov 2026 for Lars's audit item — the default is OFF for
  // everyone (preserving the "no streaks" posture), visible only when
  // the user explicitly turns it on in Program settings. These strings
  // only appear once the toggle has been flipped.
  streakToggleOnLabel: string;  // button label when OFF: "Show streak counter"
  streakToggleOffLabel: string; // button label when ON: "Hide streak counter"
  streakToggleHint: string;     // one-line hint under the toggle in settings
  /** "{n}-day streak" / "{n} days" — rendered on Today when the toggle is on.
   *  The %d placeholder is replaced at render time; keep it as a single line. */
  streakDaysLine: string;
  /** Rendered when the count is zero. Calm wording, never shaming. */
  streakDaysZero: string;

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

    streakToggleOnLabel: "Show streak counter",
    streakToggleOffLabel: "Hide streak counter",
    streakToggleHint: "Off by default. Only days that went well count — missed logs break it.",
    streakDaysLine: "%d-day streak",
    streakDaysZero: "No streak yet — today starts fresh.",

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

    streakToggleOnLabel: "Streak-Zähler anzeigen",
    streakToggleOffLabel: "Streak-Zähler ausblenden",
    streakToggleHint: "Standardmäßig aus. Zählt nur gute Tage — vergessene Logs brechen ihn.",
    streakDaysLine: "%d-Tage-Streak",
    streakDaysZero: "Noch kein Streak — heute fängt frisch an.",

    goalLine: {
      days_per_week: "Von %d Tagen die Woche auf %d",
      sessions_per_day: "Von %d Mal am Tag auf %d",
      pause_for: "%d Tage Pause",
      shift_time: "Verschieben von %s auf %s",
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
      { kind: "pause_for", title: "Fais une pause", body: "Pas de cannabis pendant un nombre de jours choisi." },
      { kind: "shift_time", title: "Déplace l'heure", body: "Décale ton heure habituelle — ex. pas avant 20h ou pas en premier." },
    ],
    currentLabel: "Où tu en es",
    targetLabel: "Où tu veux aller",
    daysLabel: "Jours",
    fromTimeLabel: "De",
    toTimeLabel: "À",
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

    streakToggleOnLabel: "Afficher le compteur de streak",
    streakToggleOffLabel: "Masquer le compteur de streak",
    streakToggleHint: "Désactivé par défaut. Seuls les jours qui vont bien comptent — un log manqué le casse.",
    streakDaysLine: "Streak de %d jours",
    streakDaysZero: "Pas encore de streak — aujourd'hui repart à neuf.",

    goalLine: {
      days_per_week: "De %d jours par semaine à %d",
      sessions_per_day: "De %d fois par jour à %d",
      pause_for: "Pause de %d jours",
      shift_time: "Décalage de %s à %s",
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
      { kind: "pause_for", title: "Een pauze inlassen", body: "Geen cannabis gedurende een gekozen aantal dagen." },
      { kind: "shift_time", title: "Verschuif het tijdstip", body: "Verschuif je gebruikelijke tijd — bijv. niet voor 20:00 of niet als eerste." },
    ],
    currentLabel: "Waar je nu bent",
    targetLabel: "Waar je naartoe wilt",
    daysLabel: "Dagen",
    fromTimeLabel: "Van",
    toTimeLabel: "Tot",
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

    streakToggleOnLabel: "Streakteller tonen",
    streakToggleOffLabel: "Streakteller verbergen",
    streakToggleHint: "Standaard uit. Alleen dagen die goed gingen tellen — gemiste logs breken hem.",
    streakDaysLine: "Streak van %d dagen",
    streakDaysZero: "Nog geen streak — vandaag begint fris.",

    goalLine: {
      days_per_week: "Van %d dagen per week naar %d",
      sessions_per_day: "Van %d keer per dag naar %d",
      pause_for: "%d dagen pauze",
      shift_time: "Verschuiven van %s naar %s",
    },
  },

  // ───────────────────────────── Spanish ─────────────────────────────
  // Added 4 Nov 2026 for the audit (Maria, Madrid). Spanish-first; not a
  // DeepL of English. "Streak" keeps the Spanish idiom "racha" since
  // "sin streak" would read as techbro; "sin rachas" is what Spanish
  // users actually say about habit trackers.
  es: {
    metaTitle: "El Programa de Reducción — un plan de 2 / 4 / 6 semanas que montas tú",
    metaDescription:
      "Un plan tranquilo y autoguiado para reducir, pausar o cambiar el momento en el que recurres al cannabis. En tu dispositivo, sin registro, sin rachas, sin vergüenza. Mayores de 18.",

    introKicker: "El Programa de Reducción",
    introH1: "Sin dejarlo. Sin racha. Un plan que montas tú.",
    introBody:
      "Un plan corto y honesto — dos, cuatro o seis semanas — que te ayuda a reducir, hacer una pausa, o cambiar el momento en el que recurres a un porro. Tú eliges la meta. Con un toque registras cómo fue el día. Fix está los días que quieras hablar.",
    introBullets: [
      "Sin rachas. Un día duro no borra los de antes.",
      "Sólo en tu dispositivo. Nada se sube, nada lleva tu nombre.",
      "Pausa y retoma cuando quieras. Borra todo con dos toques.",
    ],
    introStartLabel: "Empezar un plan",
    introPauseFixLink: "Prefiero sólo hablar → Fix",

    setupStepKicker: "Nuevo plan",
    pickGoalH2: "Elige una meta",
    pickGoalIntro:
      "Con una basta. Puedes ajustar el plan después. Si no encaja ninguna, elige la más cercana y ajusta los números.",
    goalOptions: [
      { kind: "days_per_week", title: "Menos días por semana", body: "Reduce el número de días que fumas en una semana." },
      { kind: "sessions_per_day", title: "Menos veces al día", body: "En los días que sí fumas, pasa de varias veces a menos." },
      { kind: "pause_for", title: "Hacer una pausa", body: "Sin cannabis durante los días que elijas." },
      { kind: "shift_time", title: "Cambiar la hora", body: "Mueve tu hora habitual — p. ej. no antes de las 20:00 o no a primera hora." },
    ],
    currentLabel: "Dónde estás ahora",
    targetLabel: "A dónde quieres llegar",
    daysLabel: "Días",
    fromTimeLabel: "Desde",
    toTimeLabel: "Hasta",
    nextLabel: "Siguiente",
    backLabel: "Atrás",

    pickWeeksH2: "Elige una duración",
    pickWeeksIntro:
      "Un plan que vas alargando sin parar se vuelve una obligación. Elige la duración más corta que te resulte honesta para el cambio que quieres.",
    weeksOptions: [
      { weeks: 2, title: "2 semanas", body: "Un reset. Suficiente para ver una forma, no tanto como para distraerte." },
      { weeks: 4, title: "4 semanas", body: "Un trozo real. Bueno para reducir sin dar la vuelta a tu vida." },
      { weeks: 6, title: "6 semanas", body: "Un plan más largo para un cambio más grande. Pausa tantas veces como necesites." },
    ],
    startLabel: "Empezar plan",

    todayKicker: "Día %d de %d",
    todayH1: "Hoy",
    todayGoalPrefix: "Tu plan:",
    logQuestion: "¿Cómo fue hoy?",
    logStates: {
      well: { title: "Bien", body: "Lo mantuviste, o casi. Con eso basta — no hace falta vuelta de honor." },
      mixed: { title: "Mixto", body: "Parte funcionó. Parte no. Ambas cosas se pueden decir." },
      tough: { title: "Día duro", body: "Un día duro es un registro real, no un fallo. Reconocerlo es el objetivo." },
    },
    noteLabel: "Una línea, si quieres",
    notePlaceholder: "p. ej. día ajetreado, me acordé sólo a las 23:00",
    saveLabel: "Guardar hoy",
    loggedLabel: "Guardado",
    editLabel: "Editar",
    clearLabel: "Borrar hoy",

    reflectionKicker: "Reflexión semanal",
    reflectionH2: "Una pregunta tranquila",
    reflectionIntro:
      "Una vez por semana, una línea para ti. Puedes saltártela; no pasa nada si no lo haces.",
    reflectionPlaceholder: "¿Qué fue más fácil de lo que esperabas?",
    reflectionSaveLabel: "Guardar reflexión",
    reflectionDoneLabel: "Guardado",
    reflectionSkipLabel: "Saltar esta semana",

    progressH2: "Tu plan hasta ahora",
    progressLogged: "%d de %d días registrados",
    progressStateLegend: {
      well: "Bien",
      mixed: "Mixto",
      tough: "Día duro",
    },

    finishedKicker: "Plan completado",
    finishedH1: "Has llegado al final de tu plan.",
    finishedBody:
      "Nada que demostrar. Si el plan ha hecho su trabajo, tú lo sabes. Puedes alargarlo dos semanas, o cerrarlo y guardar el registro para después.",
    finishedExtendLabel: "Alargar 2 semanas",
    finishedWrapLabel: "Cerrar este plan",

    pausedKicker: "En pausa",
    pausedH1: "Tu plan está en pausa.",
    pausedBody: "Ahora mismo no cuenta nada. Retoma cuando quieras — tus registros se quedan.",
    resumeLabel: "Retomar plan",

    settingsH2: "Este plan",
    pauseLabel: "Pausar",
    exportLabel: "Exportar mis registros (JSON)",
    deleteLabel: "Borrar este plan",
    deleteConfirm:
      "Esto borra todo el plan de este dispositivo. No se puede deshacer. ¿Borrar?",

    streakToggleOnLabel: "Mostrar contador de racha",
    streakToggleOffLabel: "Ocultar contador de racha",
    streakToggleHint: "Desactivado por defecto. Solo los días que fueron bien cuentan — un registro olvidado la rompe.",
    streakDaysLine: "Racha de %d días",
    streakDaysZero: "Sin racha todavía — hoy empieza limpio.",

    goalLine: {
      days_per_week: "De %d días por semana a %d",
      sessions_per_day: "De %d veces al día a %d",
      pause_for: "%d días de pausa",
      shift_time: "Mover de %s a %s",
    },
  },

  // ───────────────────────────── Italian ─────────────────────────────
  // Added 4 Nov 2026 for the audit (Nina, Milan). Italian-first.
  it: {
    metaTitle: "Il Programma di Riduzione — un piano di 2 / 4 / 6 settimane che costruisci tu",
    metaDescription:
      "Un piano tranquillo e autoguidato per ridurre, fare una pausa, o spostare il momento in cui prendi uno spinello. Sul tuo dispositivo, senza registrazione, senza streak, senza vergogna. Dai 18 anni.",

    introKicker: "Il Programma di Riduzione",
    introH1: "Non smettere. Niente streak. Un piano che costruisci tu.",
    introBody:
      "Un piano breve e onesto — due, quattro o sei settimane — che ti aiuta a ridurre, a fermarti, o a spostare il momento in cui prendi una canna. Scegli tu l'obiettivo. Con un tocco registri com'è andata la giornata. Fix c'è nei giorni in cui vuoi parlare.",
    introBullets: [
      "Niente streak. Una giornata dura non cancella quelle prima.",
      "Solo sul tuo dispositivo. Niente viene caricato, niente porta il tuo nome.",
      "Metti in pausa e riprendi quando vuoi. Cancella tutto con due tocchi.",
    ],
    introStartLabel: "Iniziare un piano",
    introPauseFixLink: "Preferisco solo parlare → Fix",

    setupStepKicker: "Nuovo piano",
    pickGoalH2: "Scegli un obiettivo",
    pickGoalIntro:
      "Ne basta uno. Puoi aggiustare il piano dopo. Se nessuno torna, scegli il più vicino e cambia i numeri.",
    goalOptions: [
      { kind: "days_per_week", title: "Meno giorni a settimana", body: "Riduci il numero di giorni in cui fumi in una settimana." },
      { kind: "sessions_per_day", title: "Meno volte al giorno", body: "Nei giorni in cui fumi, passa da più volte a meno." },
      { kind: "pause_for", title: "Fare una pausa", body: "Niente cannabis per i giorni che scegli." },
      { kind: "shift_time", title: "Spostare l'orario", body: "Sposta il tuo orario abituale — es. non prima delle 20:00 o non appena sveglio." },
    ],
    currentLabel: "Dove sei ora",
    targetLabel: "Dove vuoi arrivare",
    daysLabel: "Giorni",
    fromTimeLabel: "Da",
    toTimeLabel: "A",
    nextLabel: "Avanti",
    backLabel: "Indietro",

    pickWeeksH2: "Scegli una durata",
    pickWeeksIntro:
      "Un piano che continui ad allungare diventa un dovere. Scegli la durata più corta che ti sembra onesta per il cambiamento che vuoi.",
    weeksOptions: [
      { weeks: 2, title: "2 settimane", body: "Un reset. Abbastanza per vedere una forma, non tanto da perderti per strada." },
      { weeks: 4, title: "4 settimane", body: "Un pezzo vero. Buono per ridurre senza ribaltare la vita." },
      { weeks: 6, title: "6 settimane", body: "Un piano più lungo per un cambiamento più grande. Metti in pausa quando serve." },
    ],
    startLabel: "Iniziare il piano",

    todayKicker: "Giorno %d di %d",
    todayH1: "Oggi",
    todayGoalPrefix: "Il tuo piano:",
    logQuestion: "Com'è andata oggi?",
    logStates: {
      well: { title: "Bene", body: "L'hai tenuto, o quasi. Basta così — niente giro d'onore." },
      mixed: { title: "Misto", body: "Una parte ha funzionato. Una parte no. Entrambe si possono dire." },
      tough: { title: "Giornata dura", body: "Una giornata dura è un log vero, non un fallimento. Notarla è il punto." },
    },
    noteLabel: "Una riga, se vuoi",
    notePlaceholder: "es. giornata piena, mi sono ricordato solo alle 23:00",
    saveLabel: "Salva oggi",
    loggedLabel: "Salvato",
    editLabel: "Modifica",
    clearLabel: "Cancella oggi",

    reflectionKicker: "Riflessione settimanale",
    reflectionH2: "Una domanda tranquilla",
    reflectionIntro:
      "Una volta a settimana, una riga per te. Saltare va bene; non succede niente se non lo fai.",
    reflectionPlaceholder: "Cosa è stato più facile di quanto pensassi?",
    reflectionSaveLabel: "Salva riflessione",
    reflectionDoneLabel: "Salvato",
    reflectionSkipLabel: "Salta questa settimana",

    progressH2: "Il tuo piano finora",
    progressLogged: "%d di %d giorni registrati",
    progressStateLegend: {
      well: "Bene",
      mixed: "Misto",
      tough: "Giornata dura",
    },

    finishedKicker: "Piano completato",
    finishedH1: "Sei arrivato alla fine del tuo piano.",
    finishedBody:
      "Niente da dimostrare. Se il piano ha fatto il suo lavoro, lo sai tu. Puoi allungare di due settimane, o chiudere e tenere il log per dopo.",
    finishedExtendLabel: "Allunga di 2 settimane",
    finishedWrapLabel: "Chiudi questo piano",

    pausedKicker: "In pausa",
    pausedH1: "Il tuo piano è in pausa.",
    pausedBody: "Ora niente conta. Riprendi quando vuoi — i tuoi log restano.",
    resumeLabel: "Riprendi il piano",

    settingsH2: "Questo piano",
    pauseLabel: "Pausa",
    exportLabel: "Esporta i miei log (JSON)",
    deleteLabel: "Cancella questo piano",
    deleteConfirm:
      "Questo cancella tutto il piano da questo dispositivo. Non si può annullare. Cancellare?",

    streakToggleOnLabel: "Mostra contatore streak",
    streakToggleOffLabel: "Nascondi contatore streak",
    streakToggleHint: "Disattivato di default. Contano solo i giorni andati bene — un log mancato lo rompe.",
    streakDaysLine: "Streak di %d giorni",
    streakDaysZero: "Ancora nessuno streak — oggi riparte da zero.",

    goalLine: {
      days_per_week: "Da %d giorni a settimana a %d",
      sessions_per_day: "Da %d volte al giorno a %d",
      pause_for: "%d giorni di pausa",
      shift_time: "Sposta da %s a %s",
    },
  },
};
