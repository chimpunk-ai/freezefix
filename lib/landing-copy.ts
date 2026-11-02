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

export type Locale = "en" | "de";

export const LOCALES: Locale[] = ["en", "de"];

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
  /** Locale switcher link to the OTHER locale. */
  switchTo: { href: string; label: string };
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
  exampleIllustrationLabel: string;
  exampleSteps: Array<{ index: string; label: string; body: string | null }>;
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
    exampleIllustrationLabel: "Illustration",
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
    footerLinks: [
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
    metaTitle: "FreezeFix — wenn du nach dem Rauchen hängenbleibst",
    metaDescription:
      "Ein stiller Begleiter für Erwachsene, die ihren Cannabis-Konsum verstehen und einen nächsten Schritt finden wollen, der sich für sie richtig anfühlt.",
    getHelpNow: "Hilfe jetzt",
    openReturning: "Öffnen",
    switchTo: { href: "/", label: "English" },
    kicker: "GetFreezeFix · ab 18 Jahren",
    heroHeadlineLine1: "Mehr Kontrolle,",
    heroHeadlineLine2: "Moment für Moment.",
    heroBody:
      "Ein stiller Begleiter für Erwachsene, die ihren Cannabis-Konsum verstehen und einen nächsten Schritt finden wollen, der sich für sie richtig anfühlt.",
    ctaOpen: "Fix öffnen",
    ctaPrivacy: "Wie Datenschutz funktioniert",
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
    exampleIllustrationLabel: "Illustration",
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
    footerLinks: [
      { href: "/help", label: "Hilfe" },
      { href: "/privacy", label: "Datenschutz" },
      { href: "/patterns", label: "Muster" },
      { href: "/terms", label: "AGB" },
      { href: "/refunds", label: "Rückerstattung" },
      { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
    ],
  },
};
