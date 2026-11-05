// Pricing-page strings, keyed by locale.
//
// Added 5 November 2026 (feat/pricing-founding-member) as Stage 1 of the
// Calm-grade redesign + revenue plan. This is the founding-member PRE-SELL
// page — it validates willingness to pay before Paddle is wired, and it is
// explicitly a WAITLIST, not a checkout. No charge, no card entry, no VAT.
//
// Posture — matches the project rules
//   • Honest about scope: "Fix is free. Pro is coming." We do not promise
//     a specific launch date; we promise to email when it ships.
//   • The founding-member $29.99 first-year price is a commitment the user
//     locks in by joining the waitlist; charging and gating happen in a
//     later stage (see FreezeFix_Redesign_Plan_2026-11.md).
//   • No countdown timers, no "last 24 hours," no manipulative urgency.
//   • The free column is what Fix is TODAY, so a visitor who never upgrades
//     reads the whole product honestly.
//   • Crisis help stays free for everyone, forever. The free column says so.

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

  // Pre-sell card
  foundingMemberBadge: string;   // "Founding member"
  foundingMemberHeadline: string; // "$29.99 for your first year"
  foundingMemberStrike: string;  // "$39.99/yr after"
  foundingMemberHint: string;    // "Launching soon. No charge today."
  foundingMemberCtaLabel: string; // "Join the founding-member list"
  foundingMemberNote: string;    // "Email only. Unsubscribe in every email."

  // Comparison table
  comparisonHeading: string;
  columnFree: string;
  columnPro: string;
  columnFreePrice: string;       // "$0"
  columnProPrice: string;        // "$39.99 / year" (set per region)
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

  // Honest FAQ for pre-sell
  faqHeading: string;
  faqs: Array<{ q: string; a: string }>;

  // Footer-ish
  backToHome: string;
};

/** Prefixes for the €/£/$ display; keeps all strings calm. Paddle charges in
 *  local currency at checkout time when the paywall ships; this file is
 *  display-only, matching lib/plans.ts's posture. */
export const PRICING_CURRENCY_LABELS: Record<string, { founding: string; pro: string; proPerMonth: string }> = {
  GB: { founding: "£24.99", pro: "£39.99", proPerMonth: "£3.33" },
  EU: { founding: "€27.99", pro: "€39.99", proPerMonth: "€3.33" },
  US: { founding: "$29.99", pro: "$39.99", proPerMonth: "$3.33" },
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
      "Fix is free. Pro is coming. Lock in the founding-member price before launch — email only, no charge today.",
    kicker: "Pricing",
    headlineLine1: "Fix is free.",
    headlineLine2: "Pro is coming.",
    subhead:
      "Everything the product does today stays free, forever. Pro is the deeper layer — unlimited Fix sessions, journal history, insights, the Reduction Program — coming soon. Lock in the founding-member price now.",
    foundingMemberBadge: "Founding member",
    foundingMemberHeadline: "$29.99 for your first year",
    foundingMemberStrike: "$39.99/year after",
    foundingMemberHint: "Launching soon. No charge today — you'll be the first to know when it ships.",
    foundingMemberCtaLabel: "Join the founding-member list",
    foundingMemberNote: "Email only. No card. Unsubscribe in every email.",
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
        a: "When it's ready. We will not ship a paywall that breaks anything that is free today. Realistic window: the first half of 2027. If you are on the founding-member list, you will be emailed before anyone else.",
      },
      {
        q: "Will the free version get worse?",
        a: "No. Crisis help, guides, the three daily Fix sessions, this-week journal, and the weekly check-in stay free forever. That is a promise we would rather close the product than break.",
      },
      {
        q: "Why email now if there is no product to sell?",
        a: "Two reasons. You lock in $29.99 for your first year instead of $39.99. And we only build Pro if enough people want it — this list is how we check.",
      },
      {
        q: "Is this a trial?",
        a: "No. There is no card entry, no automatic charge, no countdown. It is an email list. When Pro ships, you will get an email with a checkout link; you decide then.",
      },
      {
        q: "What about my country's currency and VAT?",
        a: "Paddle handles both at checkout when Pro ships. The number you see on this page is a display, not the final amount; your own currency and local tax land at that moment.",
      },
    ],
    backToHome: "Back home",
  },

  de: {
    htmlLang: "de",
    metaTitle: "Preise — FreezeFix",
    metaDescription:
      "Fix ist kostenlos. Pro kommt bald. Sichere dir den Founding-Member-Preis vor dem Start — nur E-Mail, keine Zahlung heute.",
    kicker: "Preise",
    headlineLine1: "Fix ist kostenlos.",
    headlineLine2: "Pro kommt bald.",
    subhead:
      "Alles, was das Produkt heute kann, bleibt kostenlos. Pro ist die tiefere Ebene — unbegrenzte Fix-Sitzungen, Journal-Historie, Insights, das Reduktions-Programm — kommt bald. Sichere dir den Founding-Member-Preis jetzt.",
    foundingMemberBadge: "Founding Member",
    foundingMemberHeadline: "€27,99 im ersten Jahr",
    foundingMemberStrike: "Danach €39,99/Jahr",
    foundingMemberHint: "Startet bald. Heute nichts zu zahlen — du erfährst als Erstes, wenn es so weit ist.",
    foundingMemberCtaLabel: "Auf die Founding-Member-Liste",
    foundingMemberNote: "Nur E-Mail. Keine Karte. Abmelden in jeder Mail.",
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
        a: "Wenn es so weit ist. Wir shippen keine Paywall, die etwas Kostenloses kaputt macht. Realistisches Fenster: erstes Halbjahr 2027. Wer auf der Founding-Member-Liste steht, bekommt die Mail zuerst.",
      },
      {
        q: "Wird die kostenlose Version schlechter?",
        a: "Nein. Hilfe jetzt, Guides, die drei täglichen Fix-Gespräche, das Wochen-Journal und der Wochen-Check-in bleiben für immer kostenlos. Ein Versprechen, das wir lieber nicht brechen.",
      },
      {
        q: "Warum jetzt E-Mail, wenn es noch nichts zu kaufen gibt?",
        a: "Zwei Gründe. Du sicherst dir €27,99 im ersten Jahr statt €39,99. Und wir bauen Pro nur, wenn genug Leute es wollen — diese Liste ist unsere Prüfung.",
      },
      {
        q: "Ist das ein Probe-Abo?",
        a: "Nein. Keine Karte, keine automatische Abbuchung, kein Countdown. Es ist eine E-Mail-Liste. Wenn Pro startet, bekommst du eine Mail mit einem Checkout-Link; dann entscheidest du.",
      },
      {
        q: "Was ist mit meiner Währung und MwSt.?",
        a: "Paddle erledigt beides beim Checkout, wenn Pro live ist. Die Zahl auf dieser Seite ist eine Anzeige, nicht der endgültige Betrag; deine Währung und lokale Steuer landen dann.",
      },
    ],
    backToHome: "Zurück zur Startseite",
  },

  fr: {
    htmlLang: "fr",
    metaTitle: "Prix — FreezeFix",
    metaDescription:
      "Fix est gratuit. Pro arrive. Réserve le prix membre-fondateur avant le lancement — email seulement, rien à payer aujourd'hui.",
    kicker: "Prix",
    headlineLine1: "Fix est gratuit.",
    headlineLine2: "Pro arrive.",
    subhead:
      "Tout ce que le produit fait aujourd'hui reste gratuit, pour toujours. Pro est la couche plus profonde — sessions Fix illimitées, historique de journal, insights, le Programme de Réduction — arrive bientôt. Réserve le prix membre-fondateur maintenant.",
    foundingMemberBadge: "Membre fondateur",
    foundingMemberHeadline: "27,99 € la première année",
    foundingMemberStrike: "39,99 €/an ensuite",
    foundingMemberHint: "Lancement bientôt. Rien à payer aujourd'hui — tu seras le premier au courant.",
    foundingMemberCtaLabel: "Rejoindre la liste membre-fondateur",
    foundingMemberNote: "Email seulement. Pas de carte. Désinscription dans chaque mail.",
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
        a: "Quand c'est prêt. On ne shippe pas un paywall qui casse ce qui est gratuit aujourd'hui. Fenêtre réaliste : premier semestre 2027. Sur la liste membre-fondateur, tu reçois le mail en premier.",
      },
      {
        q: "La version gratuite va-t-elle empirer ?",
        a: "Non. Aide maintenant, guides, les trois Fix du jour, le journal de la semaine et le check-in hebdomadaire restent gratuits pour toujours. On préférerait fermer le produit que casser cette promesse.",
      },
      {
        q: "Pourquoi l'email maintenant s'il n'y a rien à vendre ?",
        a: "Deux raisons. Tu réserves 27,99 € la première année au lieu de 39,99 €. Et on ne construit Pro que si assez de gens le veulent — cette liste est notre vérification.",
      },
      {
        q: "C'est un essai ?",
        a: "Non. Pas de carte, pas de prélèvement auto, pas de compte à rebours. C'est une liste email. Quand Pro sort, tu reçois un mail avec un lien de paiement ; tu décides à ce moment-là.",
      },
      {
        q: "Et ma devise et la TVA ?",
        a: "Paddle gère les deux au moment du paiement, quand Pro sera en ligne. Le chiffre sur cette page est un affichage, pas le montant final ; ta devise et ta TVA locale arrivent à ce moment-là.",
      },
    ],
    backToHome: "Retour à l'accueil",
  },

  nl: {
    htmlLang: "nl",
    metaTitle: "Prijzen — FreezeFix",
    metaDescription:
      "Fix is gratis. Pro komt eraan. Leg de founding-member-prijs vast vóór de lancering — alleen e-mail, vandaag niets te betalen.",
    kicker: "Prijzen",
    headlineLine1: "Fix is gratis.",
    headlineLine2: "Pro komt eraan.",
    subhead:
      "Alles wat het product vandaag doet blijft gratis, voor altijd. Pro is de diepere laag — onbeperkte Fix-sessies, journalgeschiedenis, insights, het Reductieprogramma — komt eraan. Leg de founding-member-prijs nu vast.",
    foundingMemberBadge: "Founding member",
    foundingMemberHeadline: "€27,99 voor je eerste jaar",
    foundingMemberStrike: "Daarna €39,99/jaar",
    foundingMemberHint: "Komt eraan. Vandaag niets te betalen — jij hoort het als eerste.",
    foundingMemberCtaLabel: "Op de founding-member-lijst",
    foundingMemberNote: "Alleen e-mail. Geen kaart. Afmelden in elke mail.",
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
        a: "Als het klaar is. We shippen geen betaalmuur die iets breekt dat vandaag gratis is. Reëel venster: eerste helft van 2027. Op de founding-member-lijst krijg je de mail als eerste.",
      },
      {
        q: "Wordt de gratis versie slechter?",
        a: "Nee. Hulp nu, gidsen, de drie dagelijkse Fix-gesprekken, het weekjournal en de wekelijkse check-in blijven voor altijd gratis. Een belofte die we liever niet breken.",
      },
      {
        q: "Waarom nu e-mail als er niks te kopen is?",
        a: "Twee redenen. Je legt €27,99 voor je eerste jaar vast in plaats van €39,99. En we bouwen Pro alleen als genoeg mensen het willen — deze lijst is onze check.",
      },
      {
        q: "Is dit een proefperiode?",
        a: "Nee. Geen kaart, geen automatische afschrijving, geen aftelklok. Het is een e-maillijst. Als Pro live gaat krijg je een mail met een afrekenlink; dan beslis jij.",
      },
      {
        q: "En mijn valuta en btw?",
        a: "Paddle regelt beide bij de afrekening, zodra Pro live is. Het bedrag op deze pagina is een weergave, niet het eindbedrag; je eigen valuta en lokale btw landen op dat moment.",
      },
    ],
    backToHome: "Terug naar home",
  },

  es: {
    htmlLang: "es",
    metaTitle: "Precios — FreezeFix",
    metaDescription:
      "Fix es gratis. Pro está en camino. Reserva el precio de miembro fundador antes del lanzamiento — sólo correo, hoy no se cobra nada.",
    kicker: "Precios",
    headlineLine1: "Fix es gratis.",
    headlineLine2: "Pro está en camino.",
    subhead:
      "Todo lo que el producto hace hoy sigue gratis, para siempre. Pro es la capa más profunda — sesiones de Fix ilimitadas, historial de diario, insights, el Programa de Reducción — llega pronto. Reserva el precio de miembro fundador ahora.",
    foundingMemberBadge: "Miembro fundador",
    foundingMemberHeadline: "27,99 € el primer año",
    foundingMemberStrike: "Después 39,99 €/año",
    foundingMemberHint: "Lanzamiento pronto. Hoy no se cobra nada — serás el primero en saberlo.",
    foundingMemberCtaLabel: "Apuntarme a la lista de miembros fundadores",
    foundingMemberNote: "Sólo correo. Sin tarjeta. Baja en cada correo.",
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
        a: "Cuando esté listo. No lanzaremos un muro de pago que rompa nada de lo que es gratis hoy. Ventana realista: primera mitad de 2027. En la lista de miembros fundadores, recibes el correo primero.",
      },
      {
        q: "¿La versión gratis va a empeorar?",
        a: "No. Ayuda ahora, guías, las tres sesiones diarias de Fix, el diario de la semana y el check-in semanal siguen gratis para siempre. Antes cerramos el producto que romper esa promesa.",
      },
      {
        q: "¿Por qué el correo si aún no hay nada que vender?",
        a: "Dos razones. Reservas 27,99 € el primer año en lugar de 39,99 €. Y sólo construimos Pro si bastante gente lo quiere — esta lista es nuestra forma de comprobarlo.",
      },
      {
        q: "¿Es una prueba?",
        a: "No. Sin tarjeta, sin cobro automático, sin cuenta atrás. Es una lista de correo. Cuando Pro salga, recibes un correo con un enlace de pago; decides en ese momento.",
      },
      {
        q: "¿Y mi divisa y el IVA?",
        a: "Paddle se ocupa de ambos al pagar, cuando Pro esté activo. El número en esta página es un indicador, no el importe final; tu divisa e IVA local llegan en ese momento.",
      },
    ],
    backToHome: "Volver al inicio",
  },

  it: {
    htmlLang: "it",
    metaTitle: "Prezzi — FreezeFix",
    metaDescription:
      "Fix è gratis. Pro sta arrivando. Blocca il prezzo da membro fondatore prima del lancio — solo email, oggi niente addebito.",
    kicker: "Prezzi",
    headlineLine1: "Fix è gratis.",
    headlineLine2: "Pro sta arrivando.",
    subhead:
      "Tutto quello che il prodotto fa oggi resta gratis, per sempre. Pro è lo strato più profondo — sessioni di Fix illimitate, cronologia del diario, insights, il Programma di Riduzione — in arrivo. Blocca ora il prezzo da membro fondatore.",
    foundingMemberBadge: "Membro fondatore",
    foundingMemberHeadline: "€27,99 per il primo anno",
    foundingMemberStrike: "Dopo €39,99/anno",
    foundingMemberHint: "Lancio in arrivo. Oggi nessun addebito — ti avvisiamo per primo.",
    foundingMemberCtaLabel: "Entrare nella lista membri fondatori",
    foundingMemberNote: "Solo email. Niente carta. Disiscrizione in ogni mail.",
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
        a: "Quando è pronto. Non lanciamo un paywall che rompe qualcosa che è gratis oggi. Finestra realistica: prima metà del 2027. Chi è nella lista membri fondatori riceve la mail per primo.",
      },
      {
        q: "La versione gratis peggiorerà?",
        a: "No. Aiuto ora, guide, le tre sessioni quotidiane di Fix, il diario della settimana e il check-in settimanale restano gratis per sempre. Prima chiudiamo il prodotto che rompere quella promessa.",
      },
      {
        q: "Perché una mail ora se non c'è niente da vendere?",
        a: "Due motivi. Blocchi €27,99 per il primo anno invece di €39,99. E costruiamo Pro solo se abbastanza persone lo vogliono — questa lista è la nostra verifica.",
      },
      {
        q: "È una prova?",
        a: "No. Niente carta, niente addebito automatico, niente conto alla rovescia. È una lista email. Quando Pro esce, ricevi una mail con un link al checkout; decidi tu in quel momento.",
      },
      {
        q: "E la mia valuta e l'IVA?",
        a: "Paddle gestisce entrambi al checkout, quando Pro è live. Il numero su questa pagina è una visualizzazione, non il totale finale; la tua valuta e l'IVA locale arrivano in quel momento.",
      },
    ],
    backToHome: "Torna alla home",
  },
};
