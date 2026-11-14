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

export type Locale = "en" | "de" | "fr" | "nl" | "es" | "it";

export const LOCALES: Locale[] = ["en", "de", "fr", "nl", "es", "it"];

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
  // Spanish (Maria, Madrid) and Italian (Nina, Milan) — added 4 Nov 2026
  // for the 15-persona audit. AD/UY/other Spanish-speaking regions pivot
  // here too; a UY visitor would prefer Castilian over English. IT covers
  // SM and VA as neighbouring Italian-speaking states.
  if (r === "ES" || r === "AD" || r === "UY") return "es";
  if (r === "IT" || r === "SM" || r === "VA") return "it";
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
      { href: "/es", label: "En español", lang: "es" },
      { href: "/it", label: "In italiano", lang: "it" },
    ],
    kicker: "GetFreezeFix · for adults 18+",
    heroHeadlineLine1: "More control,",
    heroHeadlineLine2: "one moment at a time.",
    heroBody:
      "A private companion for adults who want to understand their cannabis habits and find a next step that feels right for them.",
    ctaOpen: "Open Fix",
    ctaPrivacy: "How privacy works",
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
      kicker: "The loop",
      heading: "Three taps, then Sunday",
      patternsExampleCaption: "Example — your weeks, not someone else's.",
      steps: [
        {
          title: "Log in about nine seconds",
          body: "Yes or no, one mood face, up to three triggers. A voice note if you feel like it. No account, no name required.",
        },
        {
          title: "Nothing gets graded",
          body: "Miss a day and nothing is said. Miss a week and it says welcome back, then starts a new week. No streak to break.",
        },
        {
          title: "Sunday, one card",
          body: "Your nights as a seven-box grid, one plain sentence about the shape of the week, and one thing you might not have put together.",
        },
        {
          title: "Ask Fix one question",
          body: "Five a day on free. It answers from your own numbers, in a couple of sentences, then stops. It never messages you first.",
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
      { href: "/pricing", label: "Pricing" },
      { href: "/help", label: "Help" },
      { href: "/privacy", label: "Privacy" },
      { href: "/patterns", label: "Patterns" },
      { href: "/terms", label: "Terms" },
      { href: "/refunds", label: "Refunds" },
      { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
    ],
  },

  de: {
    htmlLang: "de",
    metaTitle: "Fix — ein Spiegel, keine App zum Aufhören",
    metaDescription:
      "Ein privater Spiegel für Menschen, die rauchen und sich fragen. Ein Protokoll mit drei Taps am Abend und eine Karte am Sonntag, die dir deine Woche zurückzeigt. Keine Streaks, keine Noten, keine Belehrungen.",
    getHelpNow: "Hilfe jetzt",
    openReturning: "Öffnen",
    switchTo: { href: "/", label: "English" },
    languageLinks: [{ href: "/", label: "English", lang: "en" }],
    kicker: "GetFreezeFix · ab 18 Jahren",
    heroHeadlineLine1: "Du musst nicht aufhören.",
    heroHeadlineLine2: "Du musst nur hinschauen.",
    heroBody:
      "Drei Mal tippen am Abend. Eine Karte am Sonntag. Sie zeigt dir deine eigene Woche — die Abende, die Auslöser, die Morgen — und überlässt dir, was das bedeutet. Keine Streaks, keine Noten, keine Belehrungen.",
    ctaOpen: "Fix öffnen",
    ctaPrivacy: "Wie Datenschutz funktioniert",
    // The chat itself is still English today. Say it plainly, don't bait and
    // switch. "Fix spricht aktuell Englisch — Deutsch folgt bald."
    chatIsEnglishNote:
      "Fix selbst läuft momentan auf Englisch. Deutsch kommt als Nächstes — wenn du das lieber abwarten willst, lass unten eine E-Mail da.",
    features: [
      { title: "Keine Streaks", body: "Rauchen ist hier kein Rückfall. Nichts springt auf null." },
      { title: "Dein Ziel, deine Worte", body: "Eine kleine Sache, die du öfter tun willst. Sie wird bemerkt, nicht erzwungen." },
      { title: "Fix ist ein KI-Tool und kann sich irren.", body: "" },
    ],
    exampleHeading: "Beispiel",
    exampleKicker: "Beispiel",
    exampleSubtitle: "Kein echtes Gespräch",
    // The example now shows the log, not a craving conversation — the card is
    // the product, so the sample should be the card.
    exampleSteps: [
      { index: "1", label: "Logge den Abend", body: "Hast du heute geraucht?" },
      {
        index: "2",
        label: "Stimmung und Auslöser",
        body: "Ein Gesicht, bis zu drei Chips — nach der Arbeit, konnte nicht schlafen, Langeweile.",
      },
      {
        index: "3",
        label: "Deine Woche, am Sonntag",
        body: "„Du hast an vier von sieben Abenden geraucht. Dreimal hast du nach der Arbeit getippt.“",
      },
      { index: "4", label: "Du entscheidest, was es bedeutet", body: null },
    ],
    tutorial: {
      kicker: "Die Schleife",
      heading: "Drei Taps, dann Sonntag",
      patternsExampleCaption: "Beispiel — deine Wochen, nicht die von jemand anderem.",
      steps: [
        {
          title: "In etwa neun Sekunden loggen",
          body: "Ja oder nein, ein Gesicht, bis zu drei Auslöser. Eine Sprachnotiz, wenn du magst. Kein Konto, kein Name.",
        },
        {
          title: "Nichts wird benotet",
          body: "Fehlt ein Tag, wird nichts gesagt. Fehlt eine Woche, sagt es willkommen zurück und beginnt eine neue Woche. Kein Streak, der bricht.",
        },
        {
          title: "Sonntag, eine Karte",
          body: "Deine Abende als Sieben-Kästchen-Raster, ein schlichter Satz zur Form der Woche, und eine Sache, die du vielleicht nicht zusammengebracht hattest.",
        },
        {
          title: "Frag Fix eine Frage",
          body: "Fünf am Tag im kostenlosen Plan. Es antwortet mit deinen eigenen Zahlen, in ein paar Sätzen, und hört auf. Es schreibt dir nie zuerst.",
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
      { href: "/pricing", label: "Preise" },
      { href: "/help", label: "Hilfe" },
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
    metaTitle: "Fix — un miroir, pas une app pour arrêter",
    metaDescription:
      "Un miroir privé pour ceux qui fument et se posent la question. Un relevé en trois touches chaque soir et une carte le dimanche qui te rend ta semaine. Pas de streaks, pas de notes, pas de leçons.",
    getHelpNow: "Aide maintenant",
    openReturning: "Ouvrir",
    switchTo: { href: "/", label: "English" },
    languageLinks: [{ href: "/", label: "English", lang: "en" }],
    kicker: "GetFreezeFix · pour adultes 18+",
    heroHeadlineLine1: "Tu n'as pas à arrêter.",
    heroHeadlineLine2: "Juste à regarder.",
    heroBody:
      "Trois touches le soir. Une carte le dimanche. Elle te montre ta propre semaine — les soirs, les déclencheurs, les matins — et te laisse décider ce que ça veut dire. Pas de streaks, pas de notes, pas de leçons.",
    ctaOpen: "Ouvrir Fix",
    ctaPrivacy: "Comment la vie privée fonctionne",
    chatIsEnglishNote:
      "Fix lui-même est pour l'instant en anglais. Le français est en cours — si tu préfères attendre, laisse ton email plus bas et on te préviendra.",
    features: [
      { title: "Pas de streaks", body: "Fumer n'est pas une rechute ici. Rien ne repart à zéro." },
      { title: "Ton objectif, tes mots", body: "Une petite chose que tu voudrais faire plus souvent. Remarquée, jamais imposée." },
      { title: "Fix est un outil IA et peut se tromper.", body: "" },
    ],
    exampleHeading: "Exemple",
    exampleKicker: "Exemple",
    exampleSubtitle: "Pas une vraie conversation",
    exampleSteps: [
      { index: "1", label: "Note le soir", body: "Tu as fumé aujourd'hui ?" },
      {
        index: "2",
        label: "Humeur et déclencheurs",
        body: "Un visage, jusqu'à trois étiquettes — après le boulot, je n'arrivais pas à dormir, l'ennui.",
      },
      {
        index: "3",
        label: "Ta semaine, le dimanche",
        body: "« Tu as fumé quatre soirs sur sept. Trois fois tu as touché après le boulot. »",
      },
      { index: "4", label: "Tu décides ce que ça veut dire", body: null },
    ],
    tutorial: {
      kicker: "La boucle",
      heading: "Trois touches, puis le dimanche",
      patternsExampleCaption: "Exemple — tes semaines, pas celles de quelqu'un d'autre.",
      steps: [
        {
          title: "Noter en neuf secondes",
          body: "Oui ou non, un visage, jusqu'à trois déclencheurs. Une note vocale si tu veux. Sans compte, sans nom.",
        },
        {
          title: "Rien n'est noté",
          body: "Un jour manqué, rien n'est dit. Une semaine manquée, ça dit bon retour et ça repart sur une nouvelle semaine. Pas de streak à casser.",
        },
        {
          title: "Le dimanche, une carte",
          body: "Tes soirs en une grille de sept cases, une phrase simple sur la forme de la semaine, et une chose que tu n'avais peut-être pas reliée.",
        },
        {
          title: "Pose une question à Fix",
          body: "Cinq par jour en gratuit. Il répond avec tes propres chiffres, en deux ou trois phrases, puis il s'arrête. Il ne t'écrit jamais en premier.",
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
      { href: "/pricing", label: "Prix" },
      { href: "/help", label: "Aide" },
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
    metaTitle: "Fix — een spiegel, geen app om te stoppen",
    metaDescription:
      "Een privéspiegel voor mensen die blowen en zich dat afvragen. Een log van drie tikken elke avond en één kaart op zondag die je week aan je teruggeeft. Geen streaks, geen cijfers, geen preken.",
    getHelpNow: "Hulp nu",
    openReturning: "Openen",
    switchTo: { href: "/", label: "English" },
    languageLinks: [{ href: "/", label: "English", lang: "en" }],
    kicker: "GetFreezeFix · voor volwassenen 18+",
    heroHeadlineLine1: "Je hoeft niet te stoppen.",
    heroHeadlineLine2: "Je hoeft alleen te kijken.",
    heroBody:
      "Drie tikken 's avonds. Eén kaart op zondag. Die laat je je eigen week zien — de avonden, de triggers, de ochtenden — en laat jou bepalen wat het betekent. Geen streaks, geen cijfers, geen preken.",
    ctaOpen: "Fix openen",
    ctaPrivacy: "Hoe privacy werkt",
    chatIsEnglishNote:
      "Fix zelf is nu in het Engels. Nederlands komt eraan — als je dat liever afwacht, laat hieronder een e-mail achter en we laten het weten.",
    features: [
      { title: "Geen streaks", body: "Blowen is hier geen terugval. Niets gaat terug naar nul." },
      { title: "Jouw doel, jouw woorden", body: "Iets kleins dat je vaker wilt doen. Het wordt opgemerkt, niet opgelegd." },
      { title: "Fix is een AI-tool en kan het mis hebben.", body: "" },
    ],
    exampleHeading: "Voorbeeld",
    exampleKicker: "Voorbeeld",
    exampleSubtitle: "Geen echt gesprek",
    exampleSteps: [
      { index: "1", label: "Log de avond", body: "Heb je vandaag geblowd?" },
      {
        index: "2",
        label: "Stemming en triggers",
        body: "Eén gezicht, tot drie labels — na het werk, kon niet slapen, verveling.",
      },
      {
        index: "3",
        label: "Jouw week, op zondag",
        body: "“Je blowde vier van de zeven avonden. Drie keer tikte je na het werk.”",
      },
      { index: "4", label: "Jij bepaalt wat het betekent", body: null },
    ],
    tutorial: {
      kicker: "De lus",
      heading: "Drie tikken, dan zondag",
      patternsExampleCaption: "Voorbeeld — jouw weken, niet die van iemand anders.",
      steps: [
        {
          title: "Loggen in negen seconden",
          body: "Ja of nee, één gezicht, tot drie triggers. Een spraaknotitie als je wilt. Geen account, geen naam.",
        },
        {
          title: "Niets wordt beoordeeld",
          body: "Mis je een dag, dan wordt er niets gezegd. Mis je een week, dan zegt het welkom terug en begint een nieuwe week. Geen streak om te breken.",
        },
        {
          title: "Zondag, één kaart",
          body: "Je avonden als een raster van zeven vakjes, één gewone zin over de vorm van de week, en één ding dat je misschien niet had samengebracht.",
        },
        {
          title: "Vraag Fix één ding",
          body: "Vijf per dag gratis. Het antwoordt met je eigen cijfers, in een paar zinnen, en stopt. Het stuurt je nooit als eerste een bericht.",
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
      { href: "/pricing", label: "Prijzen" },
      { href: "/help", label: "Hulp" },
      { href: "/privacy", label: "Privacy" },
      { href: "/patterns", label: "Patronen" },
      { href: "/terms", label: "Voorwaarden" },
      { href: "/refunds", label: "Terugbetalingen" },
      { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
    ],
  },

  // ───────────────────────────── Spanish ─────────────────────────────
  // Added 4 November 2026 for the 15-persona audit (Maria, Madrid, 28).
  // Written Spanish-first — not an auto-translation. "Craving" stays as
  // "craving" because that is what Maria actually says; Spanish does not
  // have a one-word equivalent that lands as softly as the anglicism in
  // a youth register. Spanish chat is on the waitlist (same posture as
  // French and Dutch).
  es: {
    htmlLang: "es",
    metaTitle: "Fix — un espejo, no una app para dejarlo",
    metaDescription:
      "Un espejo privado para quien fuma y se lo pregunta. Un registro de tres toques cada noche y una tarjeta el domingo que te devuelve tu semana. Sin rachas, sin notas, sin sermones.",
    getHelpNow: "Ayuda ahora",
    openReturning: "Abrir",
    switchTo: { href: "/", label: "English" },
    languageLinks: [{ href: "/", label: "English", lang: "en" }],
    kicker: "GetFreezeFix · para adultos 18+",
    heroHeadlineLine1: "No tienes que dejarlo.",
    heroHeadlineLine2: "Sólo tienes que mirarlo.",
    heroBody:
      "Tres toques por la noche. Una tarjeta el domingo. Te enseña tu propia semana — las noches, los detonantes, las mañanas — y deja que tú decidas qué significa. Sin rachas, sin notas, sin sermones.",
    ctaOpen: "Abrir Fix",
    ctaPrivacy: "Cómo funciona la privacidad",
    chatIsEnglishNote:
      "Fix en sí está ahora mismo en inglés. El español viene — si prefieres esperar, deja tu correo abajo y te avisamos.",
    features: [
      { title: "Sin rachas", body: "Fumar no es una recaída aquí. Nada vuelve a cero." },
      { title: "Tu meta, tus palabras", body: "Algo pequeño que querrías hacer más. Se nota, no se exige." },
      { title: "Fix es una herramienta de IA y puede equivocarse.", body: "" },
    ],
    exampleHeading: "Ejemplo",
    exampleKicker: "Ejemplo",
    exampleSubtitle: "No es una conversación real",
    exampleSteps: [
      { index: "1", label: "Registra la noche", body: "¿Has fumado hoy?" },
      {
        index: "2",
        label: "Ánimo y detonantes",
        body: "Una cara, hasta tres etiquetas — después del trabajo, no podía dormir, aburrimiento.",
      },
      {
        index: "3",
        label: "Tu semana, el domingo",
        body: "«Has fumado cuatro de siete noches. Tres de ellas marcaste después del trabajo.»",
      },
      { index: "4", label: "Tú decides qué significa", body: null },
    ],
    tutorial: {
      kicker: "El bucle",
      heading: "Tres toques, y el domingo",
      patternsExampleCaption: "Ejemplo — tus semanas, no las de otra persona.",
      steps: [
        {
          title: "Registrar en unos nueve segundos",
          body: "Sí o no, una cara, hasta tres detonantes. Una nota de voz si te apetece. Sin cuenta, sin nombre.",
        },
        {
          title: "Nada se puntúa",
          body: "Si faltas un día, no se dice nada. Si faltas una semana, dice bienvenido de nuevo y empieza semana nueva. No hay racha que romper.",
        },
        {
          title: "El domingo, una tarjeta",
          body: "Tus noches en una cuadrícula de siete casillas, una frase llana sobre la forma de la semana, y una cosa que quizá no habías juntado.",
        },
        {
          title: "Pregúntale una cosa a Fix",
          body: "Cinco al día en el plan gratis. Responde con tus propios números, en un par de frases, y para. Nunca te escribe primero.",
        },
      ],
    },
    waitlist: {
      label: "¿Quieres saber cuándo llega lo próximo? Deja un correo.",
      placeholder: "tu@donde-sea.es",
      submit: "Apúntame",
      submitting: "Apuntando…",
      footnote:
        "Sólo el correo. Sin nombre, sin teléfono, nada vinculado a tus sesiones con Fix. Escribimos como mucho una vez al mes y sólo cuando hay algo que te interese saber.",
      error: "No ha pasado. Revisa la dirección e inténtalo otra vez.",
      throttled:
        "Ya apuntado. Si te has apuntado varias veces hoy, con eso vale — te avisaremos cuando haya algo que contar.",
      done:
        "Gracias — estás en la lista. Sólo escribimos cuando hay algo que te interese saber. Baja fácil en cada correo.",
      notCollecting:
        "La lista de espera no está conectada ahora mismo — vuelve a probar en un momento. No se ha perdido nada; es que no podemos guardarlo ahora.",
    },
    footerBlurb:
      "GetFreezeFix.com es software de apoyo para adultos mayores de 18. No es terapia, ni consejo médico, ni un servicio de emergencia.",
    footerPricingPosture:
      "Gratis hoy. Si algún día llega un plan de pago, verás el precio y las condiciones antes de que te pidamos una tarjeta.",
    footerLinks: [
      { href: "/pricing", label: "Precios" },
      { href: "/help", label: "Ayuda" },
      { href: "/privacy", label: "Privacidad" },
      { href: "/patterns", label: "Patrones" },
      { href: "/terms", label: "Términos" },
      { href: "/refunds", label: "Reembolsos" },
      { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
    ],
  },

  // ───────────────────────────── Italian ─────────────────────────────
  // Added 4 November 2026 for the 15-persona audit (Nina, Milan, 26).
  // Written Italian-first. "Craving" stays as "craving" — the Italian
  // youth register uses the anglicism; "voglia impellente" would sound
  // like a textbook. Italian chat is on the waitlist.
  it: {
    htmlLang: "it",
    metaTitle: "Fix — uno specchio, non un'app per smettere",
    metaDescription:
      "Uno specchio privato per chi fuma e se lo chiede. Un registro da tre tocchi ogni sera e una card la domenica che ti restituisce la tua settimana. Niente streak, niente voti, niente prediche.",
    getHelpNow: "Aiuto ora",
    openReturning: "Apri",
    switchTo: { href: "/", label: "English" },
    languageLinks: [{ href: "/", label: "English", lang: "en" }],
    kicker: "GetFreezeFix · per adulti 18+",
    heroHeadlineLine1: "Non devi smettere.",
    heroHeadlineLine2: "Devi solo guardarla.",
    heroBody:
      "Tre tocchi la sera. Una card la domenica. Ti mostra la tua settimana — le sere, gli inneschi, le mattine — e lascia a te decidere cosa significa. Niente streak, niente voti, niente prediche.",
    ctaOpen: "Apri Fix",
    ctaPrivacy: "Come funziona la privacy",
    chatIsEnglishNote:
      "Fix al momento è in inglese. L'italiano sta arrivando — se preferisci aspettare, lascia una mail qui sotto e ti avvisiamo.",
    features: [
      { title: "Niente streak", body: "Fumare qui non è una ricaduta. Niente torna a zero." },
      { title: "Il tuo obiettivo, le tue parole", body: "Una cosa piccola che vorresti fare più spesso. Si nota, non si impone." },
      { title: "Fix è uno strumento IA e può sbagliare.", body: "" },
    ],
    exampleHeading: "Esempio",
    exampleKicker: "Esempio",
    exampleSubtitle: "Non è una conversazione vera",
    exampleSteps: [
      { index: "1", label: "Registra la sera", body: "Hai fumato oggi?" },
      {
        index: "2",
        label: "Umore e inneschi",
        body: "Una faccia, fino a tre etichette — dopo il lavoro, non riuscivo a dormire, noia.",
      },
      {
        index: "3",
        label: "La tua settimana, la domenica",
        body: "«Hai fumato quattro sere su sette. Tre volte hai toccato dopo il lavoro.»",
      },
      { index: "4", label: "Decidi tu cosa significa", body: null },
    ],
    tutorial: {
      kicker: "Il loop",
      heading: "Tre tocchi, poi la domenica",
      patternsExampleCaption: "Esempio — le tue settimane, non quelle di qualcun altro.",
      steps: [
        {
          title: "Registrare in nove secondi",
          body: "Sì o no, una faccia, fino a tre inneschi. Un vocale se ti va. Senza account, senza nome.",
        },
        {
          title: "Niente viene valutato",
          body: "Se salti un giorno non viene detto niente. Se salti una settimana dice bentornato e ricomincia. Non c'è uno streak da rompere.",
        },
        {
          title: "La domenica, una card",
          body: "Le tue sere in una griglia da sette caselle, una frase semplice sulla forma della settimana, e una cosa che forse non avevi messo insieme.",
        },
        {
          title: "Chiedi una cosa a Fix",
          body: "Cinque al giorno nel piano gratis. Risponde con i tuoi numeri, in un paio di frasi, e si ferma. Non ti scrive mai per primo.",
        },
      ],
    },
    waitlist: {
      label: "Vuoi sapere quando arriva la prossima cosa? Lascia una mail.",
      placeholder: "tu@dovunque.it",
      submit: "Aggiungimi",
      submitting: "Aggiungo…",
      footnote:
        "Solo la mail. Niente nome, niente telefono, niente collegato alle tue sessioni con Fix. Scriviamo al massimo una volta al mese e solo quando c'è qualcosa che vorresti davvero sapere.",
      error: "Non è andata. Controlla l'indirizzo e riprova.",
      throttled:
        "Già segnato. Se ti sei iscritto più volte oggi, basta così — ti contattiamo quando c'è qualcosa da dire.",
      done:
        "Grazie — sei nella lista. Scriviamo solo quando c'è qualcosa che vorresti davvero sapere. Link per disiscriversi in ogni mail.",
      notCollecting:
        "La lista d'attesa non è ancora collegata — riprova tra un minuto. Non si è perso nulla; è che non riusciamo a salvarlo ora.",
    },
    footerBlurb:
      "GetFreezeFix.com è software di supporto per adulti dai 18 anni. Non è terapia, non è consiglio medico, non è un servizio di emergenza.",
    footerPricingPosture:
      "Gratis oggi. Se un giorno arriva un piano a pagamento, vedrai prezzo e condizioni prima che ti venga mai chiesta una carta.",
    footerLinks: [
      { href: "/pricing", label: "Prezzi" },
      { href: "/help", label: "Aiuto" },
      { href: "/privacy", label: "Privacy" },
      { href: "/patterns", label: "Pattern" },
      { href: "/terms", label: "Termini" },
      { href: "/refunds", label: "Rimborsi" },
      { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
    ],
  },
};
