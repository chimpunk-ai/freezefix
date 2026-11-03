// Landing-page strings keyed by locale.
//
// Shipped 3 November 2026 for Europe-audit P1.5 (DE first-language localization).
// German is the ONLY non-English locale right now; French and Dutch are tracked
// as audit P3.11. Keeping the shape as a Record<Locale, LandingCopy> rather
// than two hard-coded objects so adding fr/nl later is a one-line change here
// and a new app/<locale>/page.tsx — no further refactor.
//
// Translation posture
//   Marcus (Berlin, 22) is a native German speaker. "Translated-feel" German
//   reads worse than clean English for him: it signals the product is made for
//   people like him only on the surface. These strings are written as German
//   first (not an auto-translation of the English), kept conversational, and
//   avoid false cognates. "Grinding", "stuck replying" etc. are localized to
//   German idioms where there's a natural one, or dropped where there isn't.
//
// Honest about scope
//   This is the LANDING page in German. The Fix chat, settings, journal,
//   patterns, help screen UI chrome and the entire /app surface are still
//   English today — that's audit P3.11. The German landing says so plainly
//   near the primary CTA so Marcus knows what to expect before he taps "Fix
//   öffnen". Pretending the whole product is German would be worse than
//   admitting the chat is English and shipping the German chat later.

export type Locale = "en" | "de" | "fr" | "nl";

export const LOCALES: Locale[] = ["en", "de", "fr", "nl"];

/** The locale a visitor sees when their region doesn't match any of
 *  LOCALES. English is the pivot — every alt-locale header "switch"
 *  points back to English, not between alt languages, so the user never
 *  has to go through French to reach Dutch. */
export const FALLBACK_LOCALE: Locale = "en";

/** Maps a 2-letter country code (from detectRegion / navigator) to the
 *  landing locale that should greet them. DE / AT / CH → de; FR / BE
 *  (French-speaking) / LU → fr; NL / BE (Dutch-speaking) → nl.
 *  BE is Dutch-speaking majority-wise but French in the south — we
 *  default BE to French because the FR crisis resources are stronger
 *  than the NL ones for Wallonia; a BE Dutch speaker still gets the
 *  switcher chip. Everyone else → en. */
export function pickLandingLocale(region: string): Locale {
  const r = region.toUpperCase();
  if (r === "DE" || r === "AT" || r === "CH") return "de";
  if (r === "FR" || r === "LU" || r === "BE") return "fr";
  if (r === "NL") return "nl";
  return "en";
}

export type LandingCopy = {
  /** 2-letter BCP-47 for the <html lang> and OpenGraph locale. */
  htmlLang: string;
  /** <title> + metadata description. Separate from the body copy so the
   *  SEO story and the on-page story don't drift apart. */
  metaTitle: string;
  metaDescription: string;
  /** Header */
  getHelpNow: string;
  openReturning: string;
  /** Locale switcher link to the primary OTHER locale. Kept for backward
   *  compat with existing SeoLanding + Program headers that render only
   *  one chip. For the main landing header, use `languageLinks` which
   *  carries ALL available alternates for the current page. */
  switchTo: { href: string; label: string };
  /** All alternate-language versions of this page, each a chip in the
   *  header. On EN this lists de / fr / nl; on each alt locale this is
   *  just [EN], the pivot — so a visitor never has to navigate through
   *  French to reach Dutch. Added 3 Nov 2026 for audit P3.11. */
  languageLinks: Array<{ href: string; label: string; lang: string }>;
  /** Hero */
  kicker: string;
  heroHeadlineLine1: string;
  heroHeadlineLine2: string;
  heroBody: string;
  ctaOpen: string;
  ctaPrivacy: string;
  /** Small link under the hero CTA pointing at /for-someone-you-love —
   *  added 4 Nov 2026 (feat/for-someone-you-love) for the Clara persona.
   *  Deliberately a tertiary link, not a chip, so it doesn't compete with
   *  the primary Open Fix action but is findable from the hero. */
  ctaForSomeone: string;
  /** Honest note shown ONLY on non-English pages: "Fix chat is still English".
   *  null on English because there's nothing to disclose. */
  chatIsEnglishNote: string | null;
  /** Three honest-feature cards */
  features: Array<{ title: string; body: string }>;
  /** Example card */
  exampleHeading: string;
  exampleKicker: string;
  exampleSubtitle: string;
  exampleSteps: Array<{ index: string; label: string; body: string | null }>;
  /**
   * Tutorial card — "How the long-term loop works."
   *
   * Added 4 November 2026 (feat/tutorial-replaces-illustration) after the
   * 15-persona audit. Multiple agents (Yuki, Lars, implicitly others) called
   * out the "ILLUSTRATION" placeholder badge sitting in production above the
   * example card. Lars's specific suggestion: "replace the chat-bubble
   * example with real pattern output — a 7-day grid or a '4× on Thursdays'
   * line — show the data the landing implies." This block carries the copy
   * for the new tutorial card that replaces the sunrise SVG and badge.
   *
   * The card has four steps. Step 3 ("Patterns") carries no body prose —
   * the component renders a real-looking 7-day heat strip (same visual
   * language as /patterns and /program progress) so the reader sees the
   * data product, not another chat screenshot. The user also explicitly
   * asked for a walkthrough about Patterns, Journal, and using the app for
   * the long run; these four steps are that walkthrough.
   */
  tutorial: {
    kicker: string;
    heading: string;
    patternsExampleCaption: string; // sits next to the mini pattern strip
    steps: Array<{ title: string; body: string }>;
  };
  /** Waitlist (passed to WaitlistCapture via its own copy prop, see below) */
  waitlist: {
    label: string;
    placeholder: string;
    submit: string;
    submitting: string;
    footnote: string;
    error: string;
    throttled: string;
    done: string;
    notCollecting: string;
  };
  /** Footer */
  footerBlurb: string;
  /** Added 4 November 2026 (feat/tutorial-replaces-illustration). An honest
   *  one-liner about the current pricing posture. The repo carries dormant
   *  prices in lib/plans.ts; Tom (NYC, 15-persona audit) called that out as
   *  the shady part. If a paid plan launches, this line, /terms section 5,
   *  and /refunds get updated together in the same PR. */
  footerPricingPosture: string;
  footerLinks: Array<{ href: string; label: string }>;
};

export const LANDING_COPY: Record<Locale, LandingCopy> = {
  en: {
    htmlLang: "en",
    metaTitle: "FreezeFix — the mate for when a smoke leaves you frozen",
    metaDescription:
      "A private companion for adults who want to understand their cannabis habits and find a next step that feels right for them.",
    getHelpNow: "Get help now",
    openReturning: "Open",
    switchTo: { href: "/de", label: "Auf Deutsch" },
    languageLinks: [
      { href: "/de", label: "Auf Deutsch", lang: "de" },
      { href: "/fr", label: "En français", lang: "fr" },
      { href: "/nl", label: "In het Nederlands", lang: "nl" },
    ],
    kicker: "GetFreezeFix · for adults 18+",
    heroHeadlineLine1: "More control,",
    heroHeadlineLine2: "one moment at a time.",
    heroBody:
      "A private companion for adults who want to understand their cannabis habits and find a next step that feels right for them.",
    ctaOpen: "Open Fix",
    ctaPrivacy: "How privacy works",
    ctaForSomeone: "Here for someone you love?",
    chatIsEnglishNote: null,
    features: [
      { title: "No judgment", body: "Reflect, reduce, pause, or just get through tonight." },
      { title: "You choose your goal", body: "No streaks. Skip anything." },
      { title: "Fix is an AI tool and can be wrong.", body: "" },
    ],
    exampleHeading: "Example",
    exampleKicker: "Example",
    exampleSubtitle: "Not a live conversation",
    exampleSteps: [
      { index: "1", label: "Choose a situation", body: "I'm having a craving" },
      {
        index: "2",
        label: "A few words",
        body: "I planned not to smoke tonight but I really want to.",
      },
      {
        index: "3",
        label: "One small suggestion",
        body: "“A craving can feel urgent. You don't have to decide your whole future right now. Would you rather create a ten-minute pause, change your setting, or write down what's pulling you toward it?”",
      },
      { index: "4", label: "You choose — try it, another idea, or leave", body: null },
    ],
    tutorial: {
      kicker: "The long-term loop",
      heading: "How it adds up over weeks",
      patternsExampleCaption: "Example — your weeks, not someone else's.",
      steps: [
        {
          title: "Open Fix in a tough moment",
          body: "One safe next step in under sixty seconds. No sign-up, no account, no name required.",
        },
        {
          title: "Jot a line in Journal",
          body: "Your own words, on your device only. The feeling, the trigger, what you tried — enough that your week has a shape later.",
        },
        {
          title: "Watch Patterns build",
          body: "Honest weekly shapes — what days you tend to use, what time, what moods come first. No streaks, no scoreboards.",
        },
        {
          title: "Build a Reduction Plan",
          body: "A 2, 4 or 6-week plan you set yourself — pause, cut back, or shift the time. Pause and resume whenever.",
        },
      ],
    },
    waitlist: {
      label: "Want to hear when the next thing ships? Leave an email.",
      placeholder: "you@wherever.com",
      submit: "Add me",
      submitting: "Adding…",
      footnote:
        "Email only. No name, no phone, nothing tied to your Fix sessions. We send at most once a month and only when something you’d actually want to know about ships.",
      error: "That didn’t go through. Check the address and try again.",
      throttled:
        "Already noted. If you’ve signed up a few times today, that’s plenty — we’ll reach out when there’s something to say.",
      done:
        "Thanks — you’re on the list. We’ll only email when something you’d actually want to know about ships. Easy to unsubscribe in every email.",
      notCollecting:
        "The waitlist isn’t connected yet — try again in a bit. Nothing was lost; we just can’t save it right now.",
    },
    footerBlurb:
      "GetFreezeFix.com is supportive software for adults 18+. It is not therapy, medical advice or an emergency service.",
    footerPricingPosture:
      "Free today. If a paid plan ships one day, you'll see the price and terms before you're ever asked for a card.",
    footerLinks: [
      { href: "/help", label: "Help" },
      { href: "/for-someone-you-love", label: "For someone you love" },
      { href: "/privacy", label: "Privacy" },
      { href: "/patterns", label: "Patterns" },
      { href: "/terms", label: "Terms" },
      { href: "/refunds", label: "Refunds" },
      { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
    ],
  },

  de: {
    htmlLang: "de",
    metaTitle: "FreezeFix — wenn du nach dem Rauchen hängenbleibst",
    metaDescription:
      "Ein stiller Begleiter für Erwachsene, die ihren Cannabis-Konsum verstehen und einen nächsten Schritt finden wollen, der sich für sie richtig anfühlt.",
    getHelpNow: "Hilfe jetzt",
    openReturning: "Öffnen",
    switchTo: { href: "/", label: "English" },
    languageLinks: [{ href: "/", label: "English", lang: "en" }],
    kicker: "GetFreezeFix · ab 18 Jahren",
    heroHeadlineLine1: "Mehr Kontrolle,",
    heroHeadlineLine2: "Moment für Moment.",
    heroBody:
      "Ein stiller Begleiter für Erwachsene, die ihren Cannabis-Konsum verstehen und einen nächsten Schritt finden wollen, der sich für sie richtig anfühlt.",
    ctaOpen: "Fix öffnen",
    ctaPrivacy: "Wie Datenschutz funktioniert",
    ctaForSomeone: "Für jemanden, den du liebst?",
    // The chat itself is still English today. Say it plainly, don't bait and
    // switch. "Fix spricht aktuell Englisch — Deutsch folgt bald."
    chatIsEnglishNote:
      "Fix selbst läuft momentan auf Englisch. Deutsch kommt als Nächstes — wenn du das lieber abwarten willst, lass unten eine E-Mail da.",
    features: [
      { title: "Kein Urteil", body: "Nachdenken, weniger rauchen, pausieren — oder einfach durch heute Abend kommen." },
      { title: "Du wählst dein Ziel", body: "Keine Streaks. Alles lässt sich überspringen." },
      { title: "Fix ist ein KI-Tool und kann sich irren.", body: "" },
    ],
    exampleHeading: "Beispiel",
    exampleKicker: "Beispiel",
    exampleSubtitle: "Kein echtes Gespräch",
    // These sample conversation strings are deliberately shown in German even
    // though the real chat is English, because the whole point of the example
    // card is to let Marcus imagine himself inside the conversation. The
    // chatIsEnglishNote above sets expectations before he taps the CTA.
    exampleSteps: [
      { index: "1", label: "Wähl eine Situation", body: "Ich hab gerade einen Craving" },
      {
        index: "2",
        label: "Ein paar Worte",
        body: "Ich wollte heute Abend eigentlich nicht rauchen, aber ich hab richtig Bock drauf.",
      },
      {
        index: "3",
        label: "Ein kleiner Vorschlag",
        body: "„Ein Craving kann sich dringend anfühlen. Du musst gerade nicht deine ganze Zukunft entscheiden. Magst du zehn Minuten Pause einlegen, die Umgebung wechseln oder aufschreiben, was dich hinzieht?“",
      },
      { index: "4", label: "Du wählst — ausprobieren, eine andere Idee oder gehen", body: null },
    ],
    tutorial: {
      kicker: "Die Langzeit-Schleife",
      heading: "Wie sich das über Wochen summiert",
      patternsExampleCaption: "Beispiel — deine Wochen, nicht die von jemand anderem.",
      steps: [
        {
          title: "Fix öffnen in einem schweren Moment",
          body: "Ein sicherer nächster Schritt in unter sechzig Sekunden. Keine Anmeldung, kein Konto, kein Name.",
        },
        {
          title: "Eine Zeile ins Journal schreiben",
          body: "Deine eigenen Worte, nur auf deinem Gerät. Das Gefühl, der Auslöser, was du versucht hast — genug, dass deine Woche später eine Form hat.",
        },
        {
          title: "Muster sichtbar machen",
          body: "Ehrliche Wochen-Shapes — an welchen Tagen du eher rauchst, zu welcher Zeit, welche Stimmungen vorher kommen. Keine Streaks, keine Punktzähler.",
        },
        {
          title: "Einen Reduktions-Plan bauen",
          body: "Ein Plan über 2, 4 oder 6 Wochen, den du selbst setzt — pausieren, weniger rauchen, oder die Zeit verschieben. Jederzeit pausieren und weitermachen.",
        },
      ],
    },
    waitlist: {
      label: "Willst du erfahren, wann das Nächste kommt? Lass eine E-Mail da.",
      placeholder: "du@irgendwo.de",
      submit: "Ich bin dabei",
      submitting: "Trage ein…",
      footnote:
        "Nur die E-Mail. Kein Name, keine Telefonnummer, nichts, was mit deinen Fix-Gesprächen verknüpft wäre. Wir schreiben höchstens einmal pro Monat und nur, wenn es etwas gibt, das du wirklich wissen willst.",
      error: "Das hat nicht geklappt. Prüf die Adresse und versuch’s noch mal.",
      throttled:
        "Schon notiert. Wenn du dich heute mehrmals eingetragen hast, reicht das — wir melden uns, sobald es etwas zu sagen gibt.",
      done:
        "Danke — du stehst auf der Liste. Wir mailen nur, wenn es etwas gibt, das du wirklich wissen willst. In jeder Mail steht ein Abmelde-Link.",
      notCollecting:
        "Die Warteliste ist noch nicht angeschlossen — versuch’s in einer Minute noch mal. Es ist nichts verloren; wir können es gerade nur nicht speichern.",
    },
    footerBlurb:
      "GetFreezeFix.com ist unterstützende Software für Erwachsene ab 18. Keine Therapie, keine medizinische Beratung, kein Notdienst.",
    footerPricingPosture:
      "Heute kostenlos. Wenn ein kostenpflichtiger Plan irgendwann kommt, siehst du den Preis und die Bedingungen, bevor jemals nach einer Karte gefragt wird.",
    footerLinks: [
      { href: "/help", label: "Hilfe" },
      { href: "/for-someone-you-love", label: "Für jemanden, den du liebst" },
      { href: "/privacy", label: "Datenschutz" },
      { href: "/patterns", label: "Muster" },
      { href: "/terms", label: "AGB" },
      { href: "/refunds", label: "Rückerstattung" },
      { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
    ],
  },

  // ───────────────────────────── French ─────────────────────────────
  // Added 3 November 2026 for audit P3.11. Written French-first for Sophie
  // (Paris, 24, weekend user) — not an auto-translation of the English.
  // "Craving" stays "craving" because that is what she actually says; a
  // stilted "envie irrépressible" would sound like a university textbook.
  // The chat-is-English note is louder here than on /de, because P1.5's
  // German chat is explicitly next; French chat has no committed date yet,
  // so the honest line directs Sophie at the waitlist.
  fr: {
    htmlLang: "fr",
    metaTitle: "FreezeFix — un allié pour quand un joint te laisse bloqué",
    metaDescription:
      "Un compagnon privé pour les adultes qui veulent comprendre leurs habitudes avec le cannabis et trouver un prochain pas qui leur parle. Ados exclus. Confidentiel.",
    getHelpNow: "Aide maintenant",
    openReturning: "Ouvrir",
    switchTo: { href: "/", label: "English" },
    languageLinks: [{ href: "/", label: "English", lang: "en" }],
    kicker: "GetFreezeFix · pour adultes 18+",
    heroHeadlineLine1: "Plus de contrôle,",
    heroHeadlineLine2: "un moment à la fois.",
    heroBody:
      "Un compagnon privé pour les adultes qui veulent comprendre leurs habitudes avec le cannabis et trouver un prochain pas qui leur parle vraiment.",
    ctaOpen: "Ouvrir Fix",
    ctaPrivacy: "Comment la vie privée fonctionne",
    ctaForSomeone: "Ici pour quelqu'un que tu aimes ?",
    chatIsEnglishNote:
      "Fix lui-même est pour l'instant en anglais. Le français est en cours — si tu préfères attendre, laisse ton email plus bas et on te préviendra.",
    features: [
      { title: "Pas de jugement", body: "Réfléchir, réduire, faire une pause — ou juste passer ce soir." },
      { title: "Tu choisis ton objectif", body: "Pas de streaks. Tout peut être passé." },
      { title: "Fix est un outil IA et peut se tromper.", body: "" },
    ],
    exampleHeading: "Exemple",
    exampleKicker: "Exemple",
    exampleSubtitle: "Pas une vraie conversation",
    exampleSteps: [
      { index: "1", label: "Choisis une situation", body: "J'ai un craving" },
      {
        index: "2",
        label: "Quelques mots",
        body: "Je comptais ne pas fumer ce soir mais j'en ai vraiment envie.",
      },
      {
        index: "3",
        label: "Une petite suggestion",
        body: "« Un craving peut sembler urgent. Tu n'as pas à décider de toute ta vie là, maintenant. Tu veux créer dix minutes de pause, changer d'ambiance, ou écrire ce qui te tire vers ça ? »",
      },
      { index: "4", label: "Tu choisis — essayer, une autre idée, ou partir", body: null },
    ],
    tutorial: {
      kicker: "La boucle sur la durée",
      heading: "Comment ça prend forme sur les semaines",
      patternsExampleCaption: "Exemple — tes semaines, pas celles de quelqu'un d'autre.",
      steps: [
        {
          title: "Ouvrir Fix dans un moment difficile",
          body: "Un prochain pas sûr en moins de soixante secondes. Sans inscription, sans compte, sans nom.",
        },
        {
          title: "Noter une ligne dans Journal",
          body: "Tes propres mots, uniquement sur ton appareil. Le ressenti, le déclencheur, ce que tu as essayé — assez pour que ta semaine ait une forme plus tard.",
        },
        {
          title: "Voir tes Motifs se dessiner",
          body: "Des formes hebdomadaires honnêtes — quels jours tu fumes plutôt, à quelle heure, quelles humeurs arrivent avant. Pas de streaks, pas de tableaux de score.",
        },
        {
          title: "Construire un Plan de Réduction",
          body: "Un plan de 2, 4 ou 6 semaines que tu règles toi-même — pause, réduire, ou décaler l'heure. Mettre en pause et reprendre quand tu veux.",
        },
      ],
    },
    waitlist: {
      label: "Tu veux être averti quand la prochaine chose arrive ? Laisse un email.",
      placeholder: "toi@quelquepart.fr",
      submit: "Ajoute-moi",
      submitting: "J'ajoute…",
      footnote:
        "Juste l'email. Pas de nom, pas de téléphone, rien de lié à tes conversations avec Fix. On écrit au plus une fois par mois et seulement s'il y a quelque chose que tu veux vraiment savoir.",
      error: "Ça n'a pas marché. Vérifie l'adresse et réessaie.",
      throttled:
        "Déjà noté. Si tu t'es inscrit plusieurs fois aujourd'hui, c'est suffisant — on te contactera quand il y aura quelque chose à dire.",
      done:
        "Merci — tu es sur la liste. On n'enverra un email que s'il y a quelque chose que tu veux vraiment savoir. Lien de désinscription dans chaque mail.",
      notCollecting:
        "La liste d'attente n'est pas encore connectée — réessaie dans une minute. Rien n'est perdu; on ne peut juste pas l'enregistrer maintenant.",
    },
    footerBlurb:
      "GetFreezeFix.com est un logiciel de soutien pour adultes 18+. Pas une thérapie, pas un conseil médical, pas un service d'urgence.",
    footerPricingPosture:
      "Gratuit aujourd'hui. Si un plan payant arrive un jour, tu verras le prix et les conditions avant qu'on ne te demande une carte.",
    footerLinks: [
      { href: "/help", label: "Aide" },
      { href: "/for-someone-you-love", label: "Pour quelqu'un que tu aimes" },
      { href: "/privacy", label: "Vie privée" },
      { href: "/patterns", label: "Tendances" },
      { href: "/terms", label: "CGU" },
      { href: "/refunds", label: "Remboursements" },
      { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
    ],
  },

  // ───────────────────────────── Dutch ─────────────────────────────
  // Added 3 November 2026 for audit P3.11. Written Dutch-first for Lars
  // (Amsterdam, 25, social user, English-fluent but reads Dutch
  // marketing better). NL has a particularly strong harm-reduction
  // culture around cannabis, so this copy leans slightly more
  // matter-of-fact than EN or DE — "kalm, niet oordelend" lands softer
  // than "no judgment" in a culture that already does not judge much.
  nl: {
    htmlLang: "nl",
    metaTitle: "FreezeFix — voor als een joint je laat vastlopen",
    metaDescription:
      "Een stille metgezel voor volwassenen die hun cannabisgebruik willen begrijpen en een volgende stap willen vinden die bij hen past. Vanaf 18. Privé.",
    getHelpNow: "Hulp nu",
    openReturning: "Openen",
    switchTo: { href: "/", label: "English" },
    languageLinks: [{ href: "/", label: "English", lang: "en" }],
    kicker: "GetFreezeFix · voor volwassenen 18+",
    heroHeadlineLine1: "Meer grip,",
    heroHeadlineLine2: "moment voor moment.",
    heroBody:
      "Een stille metgezel voor volwassenen die hun cannabisgebruik willen begrijpen en een volgende stap willen vinden die goed voelt voor hen.",
    ctaOpen: "Fix openen",
    ctaPrivacy: "Hoe privacy werkt",
    ctaForSomeone: "Hier voor iemand van wie je houdt?",
    chatIsEnglishNote:
      "Fix zelf is nu in het Engels. Nederlands komt eraan — als je dat liever afwacht, laat hieronder een e-mail achter en we laten het weten.",
    features: [
      { title: "Geen oordeel", body: "Nadenken, minderen, pauzeren — of gewoon vanavond doorkomen." },
      { title: "Jij kiest je doel", body: "Geen streaks. Alles mag overgeslagen worden." },
      { title: "Fix is een AI-tool en kan ongelijk hebben.", body: "" },
    ],
    exampleHeading: "Voorbeeld",
    exampleKicker: "Voorbeeld",
    exampleSubtitle: "Geen echt gesprek",
    exampleSteps: [
      { index: "1", label: "Kies een situatie", body: "Ik heb trek" },
      {
        index: "2",
        label: "Een paar woorden",
        body: "Ik had afgesproken vanavond niet te blowen maar ik heb er echt zin in.",
      },
      {
        index: "3",
        label: "Eén klein voorstel",
        body: "“Trek kan dringend aanvoelen. Je hoeft nu niet je hele toekomst te beslissen. Wil je tien minuten pauze nemen, van omgeving veranderen, of opschrijven wat je ernaartoe trekt?”",
      },
      { index: "4", label: "Jij kiest — proberen, een ander idee, of weggaan", body: null },
    ],
    tutorial: {
      kicker: "De lange-termijn-lus",
      heading: "Hoe het over weken opbouwt",
      patternsExampleCaption: "Voorbeeld — jouw weken, niet die van iemand anders.",
      steps: [
        {
          title: "Open Fix in een zwaar moment",
          body: "Eén veilige volgende stap binnen zestig seconden. Geen aanmelding, geen account, geen naam nodig.",
        },
        {
          title: "Schrijf een regel in Journal",
          body: "Je eigen woorden, alleen op je apparaat. Het gevoel, de trigger, wat je probeerde — genoeg zodat je week later een vorm heeft.",
        },
        {
          title: "Zie Patronen opbouwen",
          body: "Eerlijke weekvormen — welke dagen je blowt, welk tijdstip, welke stemmingen eerst komen. Geen streaks, geen scorebord.",
        },
        {
          title: "Bouw een Reductieplan",
          body: "Een plan van 2, 4 of 6 weken dat je zelf instelt — pauzeren, minderen, of het tijdstip verschuiven. Pauzeer en hervat wanneer je wilt.",
        },
      ],
    },
    waitlist: {
      label: "Wil je horen wanneer het volgende komt? Laat een e-mail achter.",
      placeholder: "jij@ergens.nl",
      submit: "Zet me erop",
      submitting: "Bezig…",
      footnote:
        "Alleen de e-mail. Geen naam, geen telefoon, niets wat gekoppeld is aan je Fix-gesprekken. We mailen hoogstens één keer per maand en alleen als er iets is dat je echt wilt weten.",
      error: "Dat ging niet door. Controleer het adres en probeer opnieuw.",
      throttled:
        "Al genoteerd. Als je je vandaag een paar keer hebt aangemeld, is dat genoeg — we laten het weten als er iets te melden is.",
      done:
        "Bedankt — je staat op de lijst. We mailen alleen als er iets is dat je echt wilt weten. Afmeldlink in elke mail.",
      notCollecting:
        "De wachtlijst is nog niet aangesloten — probeer het over een minuut nog eens. Niets is kwijt; we kunnen het alleen even niet opslaan.",
    },
    footerBlurb:
      "GetFreezeFix.com is ondersteunende software voor volwassenen vanaf 18. Geen therapie, geen medisch advies, geen noodhulp.",
    footerPricingPosture:
      "Vandaag gratis. Als er ooit een betaald plan komt, zie je de prijs en voorwaarden voordat er ooit om een kaart wordt gevraagd.",
    footerLinks: [
      { href: "/help", label: "Hulp" },
      { href: "/for-someone-you-love", label: "Voor iemand van wie je houdt" },
      { href: "/privacy", label: "Privacy" },
      { href: "/patterns", label: "Patronen" },
      { href: "/terms", label: "Voorwaarden" },
      { href: "/refunds", label: "Terugbetalingen" },
      { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
    ],
  },
};
