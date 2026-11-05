// Pricing-page strings, keyed by locale.
//
// First shipped 5 November 2026 (feat/pricing-founding-member) as Stage 1
// of the Calm-grade redesign + revenue plan. Simplified same day in
// fix/pricing-39-99-from-launch after the owner answered the plan's
// open questions:
//   • Launch price is $39.99 / €39,99 / £39.99 from day one — no
//     founding-member discount, no "first year" strike-through, no
//     two-tier pricing. One price, everywhere.
//   • Paddle account is being created; until it exists /pricing stays
//     a PRE-SELL (waitlist capture + visible price). It is NOT a
//     checkout — no card, no VAT dialog, no auto-charge. The hero card
//     says that clearly, every FAQ Q&A says it, and the CTA is a
//     waitlist subscribe.
//
// Posture — matches the project rules
//   • Honest about scope: "Fix is free. Pro is coming." We do not
//     promise a specific launch date; we promise to email when it ships.
//   • No countdown timers, no manipulative urgency.
//   • The free column lists what Fix is TODAY, so a visitor who never
//     upgrades reads the whole product honestly.
//   • Crisis help stays free for everyone, forever. The free column
//     says so.

import type { Locale } from "@/lib/landing-copy";

export type PricingCopy = {
  htmlLang: string;
  metaTitle: string;
  metaDescription: string;

  // Hero
  kicker: string;
  headlineLine1: string;
  headlineLine2: string;
  subhead: string;

  // Pre-launch hero card (waitlist capture + visible price)
  preLaunchBadge: string;      // e.g. "Launch price"
  preLaunchHeadline: string;   // e.g. "$39.99 / year"
  preLaunchHint: string;       // "Launching soon. No charge today."
  preLaunchCtaLabel: string;   // button-equivalent label (WaitlistCapture reads its own)
  preLaunchNote: string;       // "Email only. No card. Unsubscribe in every email."

  // Comparison table
  comparisonHeading: string;
  columnFree: string;
  columnPro: string;
  columnFreePrice: string;       // "$0"
  columnProPrice: string;        // "$39.99 / year" (set per region at render)
  columnProPriceHint: string;    // "$3.33/month, billed yearly"

  /** Each row: a human-readable feature + what free gives + what pro gives.
   *  freeHas / proHas are shown either as a word ("Yes", "3 a day", "—") or
   *  the component renders a check / limit / dash. */
  rows: Array<{
    feature: string;
    freeHas: string;
    proHas: string;
  }>;

  // Trust
  trustHeading: string;
  trustBullets: string[]; // 3 short bullets

  // Honest FAQ for pre-launch
  faqHeading: string;
  faqs: Array<{ q: string; a: string }>;

  // Footer-ish
  backToHome: string;
};

/** Per-currency display strings. Display-only; Paddle will charge in the
 *  visitor's real currency at checkout time when billing ships. */
export const PRICING_CURRENCY_LABELS: Record<string, { pro: string; proPerMonth: string }> = {
  GB: { pro: "£39.99", proPerMonth: "£3.33" },
  EU: { pro: "€39.99", proPerMonth: "€3.33" },
  US: { pro: "$39.99", proPerMonth: "$3.33" },
};

export function currencyKey(region?: string): keyof typeof PRICING_CURRENCY_LABELS {
  const r = (region || "").toUpperCase();
  if (r === "GB") return "GB";
  // Rough EU bucket — the visible value for every DE/FR/NL/ES/IT/SE/PL/CH
  // user reads in euros on the landing. Paddle applies real local currency
  // at checkout when that stage ships, so this is honest display only.
  const EU = new Set(["DE", "AT", "FR", "LU", "BE", "NL", "ES", "IT", "SE", "PL", "CH", "IE", "PT", "FI", "DK", "NO", "GR", "CZ", "SK", "SI", "HU", "RO", "BG", "HR", "EE", "LT", "LV", "MT", "CY"]);
  if (EU.has(r)) return "EU";
  return "US";
}

export const PRICING_COPY: Record<Locale, PricingCopy> = {
  en: {
    htmlLang: "en",
    metaTitle: "Pricing — FreezeFix",
    metaDescription:
      "Fix is free. Pro is $39.99 a year, coming soon. Join the launch list — email only, no card, no charge today.",
    kicker: "Pricing",
    headlineLine1: "Fix is free.",
    headlineLine2: "Pro is coming.",
    subhead:
      "Everything the product does today stays free, forever. Pro is the deeper layer — unlimited Fix sessions, journal history, insights, the Reduction Program — coming soon. Join the launch list and we'll email you when it ships.",
    preLaunchBadge: "Pre-launch",
    preLaunchHeadline: "$39.99 / year",
    preLaunchHint: "Launching soon. No card today, no auto-charge. You'll get one email when Pro ships, and you decide then.",
    preLaunchCtaLabel: "Join the launch list",
    preLaunchNote: "Email only. No card. Unsubscribe in every email.",
    comparisonHeading: "What's in each",
    columnFree: "Free",
    columnPro: "Pro",
    columnFreePrice: "$0",
    columnProPrice: "$39.99 / year",
    columnProPriceHint: "$3.33/month, billed yearly",
    rows: [
      { feature: "Crisis help, always one tap away", freeHas: "Yes", proHas: "Yes" },
      { feature: "Fix chat sessions", freeHas: "3 a day", proHas: "Unlimited" },
      { feature: "Guides (too high, greened out, cravings)", freeHas: "Yes", proHas: "Yes" },
      { feature: "Journal — on-device, your own words", freeHas: "This week only", proHas: "Full history" },
      { feature: "Weekly check-in", freeHas: "Yes", proHas: "Yes" },
      { feature: "Check-in insights across weeks", freeHas: "—", proHas: "Yes" },
      { feature: "Reduction Program (2 / 4 / 6-week plan)", freeHas: "—", proHas: "Yes" },
      { feature: "Pattern view", freeHas: "Last 14 days", proHas: "Full history" },
      { feature: "Export your data (JSON)", freeHas: "Yes", proHas: "Yes" },
    ],
    trustHeading: "How Pro stays honest",
    trustBullets: [
      "No card today. We only email when Pro ships; you decide then.",
      "Cancel anytime once Pro is live. 7-day refund, no questions.",
      "Free stays free — crisis help, guides, and daily Fix will never move behind a paywall.",
    ],
    faqHeading: "Honest questions",
    faqs: [
      {
        q: "When does Pro actually launch?",
        a: "As soon as the billing provider (Paddle) is wired and the first round of QA is done. We won't ship a paywall that breaks anything that's free today. If you are on the launch list, you will be emailed before anyone else. Once Pro is live, cancelling is one tap and there is a 7-day refund with no questions.",
      },
      {
        q: "Will the free version get worse?",
        a: "No. Crisis help, guides, the three daily Fix sessions, this-week journal, and the weekly check-in stay free forever. That is a promise we would rather close the product than break.",
      },
      {
        q: "Why email now if there is no product to sell?",
        a: "We build Pro only if enough people want it — the launch list is how we check. You get notified first when it ships; that is the only thing the list does.",
      },
      {
        q: "Is this a trial?",
        a: "No. There is no card entry, no automatic charge, no countdown. It is an email list. When Pro ships, you will get an email with a checkout link; you decide then.",
      },
      {
        q: "What about my country's currency and VAT?",
        a: "Paddle handles both at checkout when Pro ships. The $39.99 / €39.99 / £39.99 you see on this page is a display, not the final amount; your own currency and local tax land at that moment.",
      },
    ],
    backToHome: "Back home",
  },

  de: {
    htmlLang: "de",
    metaTitle: "Preise — FreezeFix",
    metaDescription:
      "Fix ist kostenlos. Pro kostet €39,99 im Jahr und kommt bald. Trag dich in die Launch-Liste ein — nur E-Mail, keine Karte, heute keine Zahlung.",
    kicker: "Preise",
    headlineLine1: "Fix ist kostenlos.",
    headlineLine2: "Pro kommt bald.",
    subhead:
      "Alles, was das Produkt heute kann, bleibt kostenlos. Pro ist die tiefere Ebene — unbegrenzte Fix-Sitzungen, Journal-Historie, Insights, das Reduktions-Programm — kommt bald. Trag dich in die Launch-Liste ein und wir melden uns, wenn es so weit ist.",
    preLaunchBadge: "Vor dem Start",
    preLaunchHeadline: "€39,99 / Jahr",
    preLaunchHint: "Startet bald. Heute keine Karte, keine automatische Abbuchung. Du bekommst eine E-Mail, wenn Pro startet, und entscheidest dann.",
    preLaunchCtaLabel: "Auf die Launch-Liste",
    preLaunchNote: "Nur E-Mail. Keine Karte. Abmelden in jeder Mail.",
    comparisonHeading: "Was in jedem drin ist",
    columnFree: "Kostenlos",
    columnPro: "Pro",
    columnFreePrice: "€0",
    columnProPrice: "€39,99 / Jahr",
    columnProPriceHint: "€3,33/Monat, jährlich abgerechnet",
    rows: [
      { feature: "Hilfe jetzt, immer einen Tap entfernt", freeHas: "Ja", proHas: "Ja" },
      { feature: "Fix-Gespräche", freeHas: "3 pro Tag", proHas: "Unbegrenzt" },
      { feature: "Guides (zu high, abgeschossen, Cravings)", freeHas: "Ja", proHas: "Ja" },
      { feature: "Journal — auf deinem Gerät, deine Worte", freeHas: "Nur diese Woche", proHas: "Volle Historie" },
      { feature: "Wochen-Check-in", freeHas: "Ja", proHas: "Ja" },
      { feature: "Check-in-Insights über Wochen", freeHas: "—", proHas: "Ja" },
      { feature: "Reduktions-Programm (2 / 4 / 6 Wochen)", freeHas: "—", proHas: "Ja" },
      { feature: "Muster-Ansicht", freeHas: "Letzte 14 Tage", proHas: "Volle Historie" },
      { feature: "Daten exportieren (JSON)", freeHas: "Ja", proHas: "Ja" },
    ],
    trustHeading: "Wie Pro ehrlich bleibt",
    trustBullets: [
      "Heute keine Karte. Wir mailen nur, wenn Pro live ist; dann entscheidest du.",
      "Jederzeit kündbar, sobald Pro live ist. 7 Tage Rückerstattung, keine Fragen.",
      "Kostenlos bleibt kostenlos — Hilfe jetzt, Guides und tägliches Fix wandern nie hinter eine Paywall.",
    ],
    faqHeading: "Ehrliche Fragen",
    faqs: [
      {
        q: "Wann startet Pro wirklich?",
        a: "Sobald Paddle angeschlossen ist und die erste QA-Runde steht. Wir shippen keine Paywall, die etwas Kostenloses kaputt macht. Wer auf der Launch-Liste steht, bekommt die Mail zuerst. Sobald Pro live ist, ist Kündigen ein Tap, und es gibt 7 Tage Rückerstattung ohne Fragen.",
      },
      {
        q: "Wird die kostenlose Version schlechter?",
        a: "Nein. Hilfe jetzt, Guides, die drei täglichen Fix-Gespräche, das Wochen-Journal und der Wochen-Check-in bleiben für immer kostenlos. Ein Versprechen, das wir lieber nicht brechen.",
      },
      {
        q: "Warum jetzt E-Mail, wenn es noch nichts zu kaufen gibt?",
        a: "Pro bauen wir nur, wenn genug Leute es wollen — die Launch-Liste ist unsere Prüfung. Du wirst als Erstes benachrichtigt, wenn es so weit ist; mehr macht die Liste nicht.",
      },
      {
        q: "Ist das ein Probe-Abo?",
        a: "Nein. Keine Karte, keine automatische Abbuchung, kein Countdown. Es ist eine E-Mail-Liste. Wenn Pro startet, bekommst du eine Mail mit einem Checkout-Link; dann entscheidest du.",
      },
      {
        q: "Was ist mit meiner Währung und MwSt.?",
        a: "Paddle erledigt beides beim Checkout, wenn Pro live ist. Die €39,99 auf dieser Seite sind eine Anzeige, nicht der endgültige Betrag; deine Währung und lokale Steuer landen dann.",
      },
    ],
    backToHome: "Zurück zur Startseite",
  },

  fr: {
    htmlLang: "fr",
    metaTitle: "Prix — FreezeFix",
    metaDescription:
      "Fix est gratuit. Pro coûte 39,99 € par an et arrive bientôt. Rejoins la liste de lancement — email seulement, pas de carte, rien à payer aujourd'hui.",
    kicker: "Prix",
    headlineLine1: "Fix est gratuit.",
    headlineLine2: "Pro arrive.",
    subhead:
      "Tout ce que le produit fait aujourd'hui reste gratuit, pour toujours. Pro est la couche plus profonde — sessions Fix illimitées, historique de journal, insights, le Programme de Réduction — arrive bientôt. Rejoins la liste de lancement et on t'écrit quand c'est prêt.",
    preLaunchBadge: "Avant le lancement",
    preLaunchHeadline: "39,99 € / an",
    preLaunchHint: "Lancement bientôt. Pas de carte aujourd'hui, pas de prélèvement auto. Tu reçois un email quand Pro sort, et tu décides à ce moment-là.",
    preLaunchCtaLabel: "Rejoindre la liste de lancement",
    preLaunchNote: "Email seulement. Pas de carte. Désinscription dans chaque mail.",
    comparisonHeading: "Ce qu'il y a dans chaque",
    columnFree: "Gratuit",
    columnPro: "Pro",
    columnFreePrice: "0 €",
    columnProPrice: "39,99 € / an",
    columnProPriceHint: "3,33 €/mois, facturé annuellement",
    rows: [
      { feature: "Aide maintenant, toujours à un tap", freeHas: "Oui", proHas: "Oui" },
      { feature: "Sessions Fix", freeHas: "3 par jour", proHas: "Illimitées" },
      { feature: "Guides (trop high, greened out, cravings)", freeHas: "Oui", proHas: "Oui" },
      { feature: "Journal — sur ton appareil, tes mots", freeHas: "Cette semaine", proHas: "Historique complet" },
      { feature: "Check-in hebdomadaire", freeHas: "Oui", proHas: "Oui" },
      { feature: "Insights sur plusieurs semaines", freeHas: "—", proHas: "Oui" },
      { feature: "Programme de Réduction (2 / 4 / 6 semaines)", freeHas: "—", proHas: "Oui" },
      { feature: "Vue des Motifs", freeHas: "14 derniers jours", proHas: "Historique complet" },
      { feature: "Exporter mes données (JSON)", freeHas: "Oui", proHas: "Oui" },
    ],
    trustHeading: "Comment Pro reste honnête",
    trustBullets: [
      "Pas de carte aujourd'hui. On n'écrit que quand Pro sort ; tu décides à ce moment-là.",
      "Annule quand tu veux, une fois Pro en ligne. Remboursement 7 jours, pas de questions.",
      "Le gratuit reste gratuit — aide maintenant, guides, et le Fix du jour ne passeront jamais derrière un paywall.",
    ],
    faqHeading: "Questions honnêtes",
    faqs: [
      {
        q: "Pro sort quand, vraiment ?",
        a: "Dès que Paddle est branché et que la première passe de QA est faite. On ne shippe pas un paywall qui casse ce qui est gratuit aujourd'hui. Sur la liste de lancement, tu reçois le mail en premier. Une fois Pro en ligne, annuler c'est un tap, et il y a un remboursement de 7 jours sans questions.",
      },
      {
        q: "La version gratuite va-t-elle empirer ?",
        a: "Non. Aide maintenant, guides, les trois Fix du jour, le journal de la semaine et le check-in hebdomadaire restent gratuits pour toujours. On préférerait fermer le produit que casser cette promesse.",
      },
      {
        q: "Pourquoi l'email maintenant s'il n'y a rien à vendre ?",
        a: "On ne construit Pro que si assez de gens le veulent — la liste de lancement est notre vérification. Tu es prévenu en premier quand c'est prêt ; la liste ne fait que ça.",
      },
      {
        q: "C'est un essai ?",
        a: "Non. Pas de carte, pas de prélèvement auto, pas de compte à rebours. C'est une liste email. Quand Pro sort, tu reçois un mail avec un lien de paiement ; tu décides à ce moment-là.",
      },
      {
        q: "Et ma devise et la TVA ?",
        a: "Paddle gère les deux au moment du paiement, quand Pro sera en ligne. Les 39,99 € sur cette page sont un affichage, pas le montant final ; ta devise et ta TVA locale arrivent à ce moment-là.",
      },
    ],
    backToHome: "Retour à l'accueil",
  },

  nl: {
    htmlLang: "nl",
    metaTitle: "Prijzen — FreezeFix",
    metaDescription:
      "Fix is gratis. Pro is €39,99 per jaar en komt eraan. Meld je aan voor de launch-lijst — alleen e-mail, geen kaart, vandaag niets te betalen.",
    kicker: "Prijzen",
    headlineLine1: "Fix is gratis.",
    headlineLine2: "Pro komt eraan.",
    subhead:
      "Alles wat het product vandaag doet blijft gratis, voor altijd. Pro is de diepere laag — onbeperkte Fix-sessies, journalgeschiedenis, insights, het Reductieprogramma — komt eraan. Meld je aan voor de launch-lijst, we mailen zodra het live is.",
    preLaunchBadge: "Vóór de lancering",
    preLaunchHeadline: "€39,99 / jaar",
    preLaunchHint: "Komt eraan. Vandaag geen kaart, geen automatische afschrijving. Je krijgt één mail als Pro live gaat en beslist dan.",
    preLaunchCtaLabel: "Op de launch-lijst",
    preLaunchNote: "Alleen e-mail. Geen kaart. Afmelden in elke mail.",
    comparisonHeading: "Wat zit er in elk",
    columnFree: "Gratis",
    columnPro: "Pro",
    columnFreePrice: "€0",
    columnProPrice: "€39,99 / jaar",
    columnProPriceHint: "€3,33/maand, jaarlijks gefactureerd",
    rows: [
      { feature: "Hulp nu, altijd één tap weg", freeHas: "Ja", proHas: "Ja" },
      { feature: "Fix-gesprekken", freeHas: "3 per dag", proHas: "Onbeperkt" },
      { feature: "Gidsen (te high, greened out, cravings)", freeHas: "Ja", proHas: "Ja" },
      { feature: "Journal — op je apparaat, jouw woorden", freeHas: "Deze week", proHas: "Volledige geschiedenis" },
      { feature: "Wekelijkse check-in", freeHas: "Ja", proHas: "Ja" },
      { feature: "Check-in-insights over weken", freeHas: "—", proHas: "Ja" },
      { feature: "Reductieprogramma (2 / 4 / 6 weken)", freeHas: "—", proHas: "Ja" },
      { feature: "Patroonweergave", freeHas: "Laatste 14 dagen", proHas: "Volledige geschiedenis" },
      { feature: "Gegevens exporteren (JSON)", freeHas: "Ja", proHas: "Ja" },
    ],
    trustHeading: "Hoe Pro eerlijk blijft",
    trustBullets: [
      "Vandaag geen kaart. We mailen alleen als Pro live is; dan beslis jij.",
      "Opzeggen wanneer je wilt zodra Pro live is. 7 dagen terugbetaling, geen vragen.",
      "Gratis blijft gratis — hulp nu, gidsen en de dagelijkse Fix gaan nooit achter een betaalmuur.",
    ],
    faqHeading: "Eerlijke vragen",
    faqs: [
      {
        q: "Wanneer gaat Pro echt live?",
        a: "Zodra Paddle is aangesloten en de eerste QA-ronde klaar is. We shippen geen betaalmuur die iets breekt dat vandaag gratis is. Op de launch-lijst krijg je de mail als eerste. Zodra Pro live is, is opzeggen één tap en krijg je 7 dagen terugbetaling zonder vragen.",
      },
      {
        q: "Wordt de gratis versie slechter?",
        a: "Nee. Hulp nu, gidsen, de drie dagelijkse Fix-gesprekken, het weekjournal en de wekelijkse check-in blijven voor altijd gratis. Een belofte die we liever niet breken.",
      },
      {
        q: "Waarom nu e-mail als er niks te kopen is?",
        a: "We bouwen Pro alleen als genoeg mensen het willen — de launch-lijst is onze check. Jij hoort het als eerste als het live gaat; meer doet de lijst niet.",
      },
      {
        q: "Is dit een proefperiode?",
        a: "Nee. Geen kaart, geen automatische afschrijving, geen aftelklok. Het is een e-maillijst. Als Pro live gaat krijg je een mail met een afrekenlink; dan beslis jij.",
      },
      {
        q: "En mijn valuta en btw?",
        a: "Paddle regelt beide bij de afrekening, zodra Pro live is. De €39,99 op deze pagina is een weergave, niet het eindbedrag; je eigen valuta en lokale btw landen op dat moment.",
      },
    ],
    backToHome: "Terug naar home",
  },

  es: {
    htmlLang: "es",
    metaTitle: "Precios — FreezeFix",
    metaDescription:
      "Fix es gratis. Pro cuesta 39,99 € al año y está en camino. Apúntate a la lista de lanzamiento — sólo correo, sin tarjeta, hoy no se cobra nada.",
    kicker: "Precios",
    headlineLine1: "Fix es gratis.",
    headlineLine2: "Pro está en camino.",
    subhead:
      "Todo lo que el producto hace hoy sigue gratis, para siempre. Pro es la capa más profunda — sesiones de Fix ilimitadas, historial de diario, insights, el Programa de Reducción — llega pronto. Apúntate a la lista de lanzamiento y te avisamos cuando esté listo.",
    preLaunchBadge: "Antes del lanzamiento",
    preLaunchHeadline: "39,99 € / año",
    preLaunchHint: "Lanzamiento pronto. Hoy sin tarjeta, sin cobro automático. Recibes un correo cuando Pro salga, y decides entonces.",
    preLaunchCtaLabel: "Apuntarme a la lista de lanzamiento",
    preLaunchNote: "Sólo correo. Sin tarjeta. Baja en cada correo.",
    comparisonHeading: "Qué incluye cada uno",
    columnFree: "Gratis",
    columnPro: "Pro",
    columnFreePrice: "0 €",
    columnProPrice: "39,99 € / año",
    columnProPriceHint: "3,33 €/mes, facturado anualmente",
    rows: [
      { feature: "Ayuda ahora, siempre a un toque", freeHas: "Sí", proHas: "Sí" },
      { feature: "Sesiones de Fix", freeHas: "3 al día", proHas: "Ilimitadas" },
      { feature: "Guías (muy high, greened out, craving)", freeHas: "Sí", proHas: "Sí" },
      { feature: "Diario — en tu dispositivo, tus palabras", freeHas: "Esta semana", proHas: "Historial completo" },
      { feature: "Check-in semanal", freeHas: "Sí", proHas: "Sí" },
      { feature: "Insights de check-in entre semanas", freeHas: "—", proHas: "Sí" },
      { feature: "Programa de Reducción (2 / 4 / 6 semanas)", freeHas: "—", proHas: "Sí" },
      { feature: "Vista de patrones", freeHas: "Últimos 14 días", proHas: "Historial completo" },
      { feature: "Exportar tus datos (JSON)", freeHas: "Sí", proHas: "Sí" },
    ],
    trustHeading: "Cómo Pro sigue siendo honesto",
    trustBullets: [
      "Hoy sin tarjeta. Sólo escribimos cuando Pro esté listo; tú decides entonces.",
      "Cancela cuando quieras una vez Pro esté activo. 7 días de reembolso, sin preguntas.",
      "Lo gratis sigue gratis — ayuda ahora, guías y la Fix diaria nunca pasarán detrás de un muro de pago.",
    ],
    faqHeading: "Preguntas honestas",
    faqs: [
      {
        q: "¿Cuándo sale Pro de verdad?",
        a: "En cuanto Paddle esté conectado y la primera ronda de QA esté hecha. No lanzamos un muro de pago que rompa nada de lo que es gratis hoy. En la lista de lanzamiento, recibes el correo primero. Una vez Pro esté activo, cancelar es un toque y hay un reembolso de 7 días sin preguntas.",
      },
      {
        q: "¿La versión gratis va a empeorar?",
        a: "No. Ayuda ahora, guías, las tres sesiones diarias de Fix, el diario de la semana y el check-in semanal siguen gratis para siempre. Antes cerramos el producto que romper esa promesa.",
      },
      {
        q: "¿Por qué el correo si aún no hay nada que vender?",
        a: "Sólo construimos Pro si bastante gente lo quiere — la lista de lanzamiento es nuestra forma de comprobarlo. Te avisamos a ti primero cuando salga; la lista no hace nada más.",
      },
      {
        q: "¿Es una prueba?",
        a: "No. Sin tarjeta, sin cobro automático, sin cuenta atrás. Es una lista de correo. Cuando Pro salga, recibes un correo con un enlace de pago; decides en ese momento.",
      },
      {
        q: "¿Y mi divisa y el IVA?",
        a: "Paddle se ocupa de ambos al pagar, cuando Pro esté activo. Los 39,99 € de esta página son un indicador, no el importe final; tu divisa e IVA local llegan en ese momento.",
      },
    ],
    backToHome: "Volver al inicio",
  },

  it: {
    htmlLang: "it",
    metaTitle: "Prezzi — FreezeFix",
    metaDescription:
      "Fix è gratis. Pro costa €39,99 all'anno e sta arrivando. Iscriviti alla lista di lancio — solo email, niente carta, oggi niente addebito.",
    kicker: "Prezzi",
    headlineLine1: "Fix è gratis.",
    headlineLine2: "Pro sta arrivando.",
    subhead:
      "Tutto quello che il prodotto fa oggi resta gratis, per sempre. Pro è lo strato più profondo — sessioni di Fix illimitate, cronologia del diario, insights, il Programma di Riduzione — in arrivo. Iscriviti alla lista di lancio e ti avvisiamo quando è pronto.",
    preLaunchBadge: "Prima del lancio",
    preLaunchHeadline: "€39,99 / anno",
    preLaunchHint: "Lancio in arrivo. Oggi niente carta, nessun addebito automatico. Ricevi una mail quando Pro esce, e decidi tu in quel momento.",
    preLaunchCtaLabel: "Entrare nella lista di lancio",
    preLaunchNote: "Solo email. Niente carta. Disiscrizione in ogni mail.",
    comparisonHeading: "Cosa c'è in ciascuno",
    columnFree: "Gratis",
    columnPro: "Pro",
    columnFreePrice: "€0",
    columnProPrice: "€39,99 / anno",
    columnProPriceHint: "€3,33/mese, fatturato annualmente",
    rows: [
      { feature: "Aiuto ora, sempre a un tocco", freeHas: "Sì", proHas: "Sì" },
      { feature: "Sessioni di Fix", freeHas: "3 al giorno", proHas: "Illimitate" },
      { feature: "Guide (troppo high, greened out, craving)", freeHas: "Sì", proHas: "Sì" },
      { feature: "Diario — sul tuo dispositivo, le tue parole", freeHas: "Questa settimana", proHas: "Cronologia completa" },
      { feature: "Check-in settimanale", freeHas: "Sì", proHas: "Sì" },
      { feature: "Insights di check-in tra settimane", freeHas: "—", proHas: "Sì" },
      { feature: "Programma di Riduzione (2 / 4 / 6 settimane)", freeHas: "—", proHas: "Sì" },
      { feature: "Vista pattern", freeHas: "Ultimi 14 giorni", proHas: "Cronologia completa" },
      { feature: "Esporta i tuoi dati (JSON)", freeHas: "Sì", proHas: "Sì" },
    ],
    trustHeading: "Come Pro resta onesto",
    trustBullets: [
      "Oggi niente carta. Scriviamo solo quando Pro è live; decidi tu in quel momento.",
      "Disdici quando vuoi una volta che Pro è attivo. Rimborso 7 giorni, senza domande.",
      "Gratis resta gratis — aiuto ora, guide e Fix quotidiano non passeranno mai dietro un paywall.",
    ],
    faqHeading: "Domande oneste",
    faqs: [
      {
        q: "Quando esce davvero Pro?",
        a: "Appena Paddle è collegato e il primo giro di QA è fatto. Non lanciamo un paywall che rompe qualcosa che è gratis oggi. Chi è nella lista di lancio riceve la mail per primo. Una volta che Pro è live, disdire è un tocco e c'è un rimborso di 7 giorni senza domande.",
      },
      {
        q: "La versione gratis peggiorerà?",
        a: "No. Aiuto ora, guide, le tre sessioni quotidiane di Fix, il diario della settimana e il check-in settimanale restano gratis per sempre. Prima chiudiamo il prodotto che rompere quella promessa.",
      },
      {
        q: "Perché una mail ora se non c'è niente da vendere?",
        a: "Costruiamo Pro solo se abbastanza persone lo vogliono — la lista di lancio è la nostra verifica. Ti avvisiamo per primo quando esce; la lista non fa altro.",
      },
      {
        q: "È una prova?",
        a: "No. Niente carta, niente addebito automatico, niente conto alla rovescia. È una lista email. Quando Pro esce, ricevi una mail con un link al checkout; decidi tu in quel momento.",
      },
      {
        q: "E la mia valuta e l'IVA?",
        a: "Paddle gestisce entrambi al checkout, quando Pro è live. I €39,99 su questa pagina sono una visualizzazione, non il totale finale; la tua valuta e l'IVA locale arrivano in quel momento.",
      },
    ],
    backToHome: "Torna alla home",
  },
};
