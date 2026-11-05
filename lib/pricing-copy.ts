import type { Locale } from "@/lib/landing-copy";

export type PricingCopy = {
  htmlLang: string;
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  headlineLine1: string;
  headlineLine2: string;
  subhead: string;
  plannedLabel: string;
  yearlyLabel: string;
  monthlyLabel: string;
  yearlyPriceFormat: string;
  monthlyPriceFormat: string;
  yearlyEquivalentFormat: string;
  trialLabel: string;
  trialBody: string;
  availabilityHeading: string;
  availabilityBody: string;
  featureHeading: string;
  features: string[];
  trustHeading: string;
  trustBullets: string[];
  faqHeading: string;
  faqs: Array<{ q: string; a: string }>;
  backToHome: string;
};

export const PRICING_CURRENCY_LABELS: Record<string, { yearly: string; monthly: string; yearlyPerMonth: string }> = {
  GB: { yearly: "£39.99", monthly: "£9.99", yearlyPerMonth: "£3.33" },
  EU: { yearly: "39,99 €", monthly: "9,99 €", yearlyPerMonth: "3,33 €" },
  US: { yearly: "$39.99", monthly: "$9.99", yearlyPerMonth: "$3.33" },
};

const EURO_AREA = new Set([
  "AT", "BE", "CY", "DE", "EE", "ES", "FI", "FR", "GR", "HR",
  "IE", "IT", "LT", "LU", "LV", "MT", "NL", "PT", "SI", "SK",
]);

export function currencyKey(region?: string): keyof typeof PRICING_CURRENCY_LABELS {
  const r = (region || "").toUpperCase();
  if (r === "GB") return "GB";
  if (EURO_AREA.has(r)) return "EU";
  return "US";
}

export const PRICING_COPY: Record<Locale, PricingCopy> = {
  en: {
    htmlLang: "en",
    metaTitle: "Planned pricing — Fix",
    metaDescription: "See the planned Fix launch price and seven-day trial. No payment or trial starts from this pre-launch waitlist.",
    kicker: "PRICING · PLANNED FOR LAUNCH",
    headlineLine1: "One plan.",
    headlineLine2: "A week to see your week.",
    subhead: "The planned launch price is {yearly} a year or {monthly} a month, with seven days to try the full product. No card to start the trial. Fix is not taking payments yet; this page is only a launch waitlist.",
    plannedLabel: "Planned launch price · not available to buy yet",
    yearlyLabel: "Yearly",
    monthlyLabel: "Monthly",
    yearlyPriceFormat: "{price} / year",
    monthlyPriceFormat: "{price} / month",
    yearlyEquivalentFormat: "{price} a month, billed yearly",
    trialLabel: "7-day free trial at launch",
    trialBody: "The planned trial includes full access and won’t ask for a card to start. Joining this list does not start a trial or authorize a payment.",
    availabilityHeading: "Not open yet",
    availabilityBody: "The nightly log and weekly mirror are in development. This page is only a launch waitlist. Leave an email and we’ll send a note when the product is ready. No early-bird price, countdown, checkout, or charge today.",
    featureHeading: "What the launch plan is being built around",
    features: [
      "A short, optional daily check-in for cannabis, mood and context",
      "A weekly mirror that reflects your own pattern without a score",
      "One small goal you choose, with no pressure to change it",
      "Fix as a brief tool for questions about your own week — not a therapist or companion",
    ],
    trustHeading: "A clear line between now and launch",
    trustBullets: [
      "The current app is free to use. This page does not take payment or card details.",
      "Prices shown are the planned launch prices, not a discount.",
      "Safety and crisis-help information stays available without a subscription.",
    ],
    faqHeading: "A few straight answers",
    faqs: [
      { q: "Can I start the trial now?", a: "No. The planned product and its seven-day trial are not open yet. Joining the email list only asks us to send a launch update; it starts no trial and creates no payment agreement." },
      { q: "What will it cost?", a: "The planned launch price is {yearly} per year or {monthly} per month. These are the intended prices, not an early-bird discount. There is nothing to buy on this page." },
      { q: "How is the trial meant to work?", a: "At launch, the plan is seven days of full access without a card required to start. Any renewal, cancellation and tax details will be shown clearly before a trial is available." },
      { q: "Do I have to quit or set a goal?", a: "No. Fix is being built to help you notice your own pattern. You decide whether you want to change anything; a goal is optional." },
      { q: "Is Fix therapy or medical advice?", a: "No. Fix is supportive software, not a diagnostic tool, therapist or emergency service. Safety information remains accessible from the site." },
    ],
    backToHome: "Back home",
  },
  de: {
    htmlLang: "de",
    metaTitle: "Geplante Preise — Fix",
    metaDescription: "Der geplante Startpreis und die siebentägige Testphase von Fix. Über diese Warteliste beginnen weder Testphase noch Zahlung.",
    kicker: "PREISE · FÜR DEN START GEPLANT",
    headlineLine1: "Ein Plan.",
    headlineLine2: "Eine Woche, um deine Woche zu sehen.",
    subhead: "Zum Start sind {yearly} pro Jahr oder {monthly} pro Monat geplant, mit sieben Tagen zum Ausprobieren des vollen Produkts. Für den Start der Testphase ist keine Karte vorgesehen. Fix nimmt noch keine Zahlungen an; diese Seite ist nur eine Start-Warteliste.",
    plannedLabel: "Geplanter Startpreis · noch nicht erhältlich",
    yearlyLabel: "Jährlich",
    monthlyLabel: "Monatlich",
    yearlyPriceFormat: "{price} / Jahr",
    monthlyPriceFormat: "{price} / Monat",
    yearlyEquivalentFormat: "{price} pro Monat, jährlich abgerechnet",
    trialLabel: "7 Tage kostenlos testen – zum Start geplant",
    trialBody: "Die geplante Testphase umfasst den vollen Zugang und soll ohne Karte beginnen. Mit dem Eintrag in die Liste startest du weder eine Testphase noch erlaubst du eine Zahlung.",
    availabilityHeading: "Noch nicht verfügbar",
    availabilityBody: "Der kurze Abend-Log und der Wochen-Spiegel sind in Arbeit. Diese Seite ist nur eine Warteliste. Hinterlass eine E-Mail, dann melden wir uns zum Start. Heute gibt es weder Frühbucherpreis noch Countdown, Checkout oder Abbuchung.",
    featureHeading: "Darauf wird der Startplan ausgerichtet",
    features: [
      "Ein kurzer, freiwilliger Tages-Check-in zu Cannabis, Stimmung und Umfeld",
      "Ein Wochen-Spiegel, der dein eigenes Muster ohne Bewertung zeigt",
      "Ein kleines Ziel, das du selbst wählst — ohne Änderungsdruck",
      "Fix als kurzes Werkzeug für Fragen zu deiner Woche — keine Therapie und kein Begleiter",
    ],
    trustHeading: "Jetzt und später klar getrennt",
    trustBullets: [
      "Die aktuelle App ist kostenlos nutzbar. Diese Seite erfasst weder Zahlung noch Kartendaten.",
      "Die angezeigten Beträge sind die geplanten Startpreise — kein Rabatt.",
      "Sicherheits- und Krisenhilfe bleibt ohne Abo erreichbar.",
    ],
    faqHeading: "Kurz und ehrlich",
    faqs: [
      { q: "Kann ich die Testphase jetzt starten?", a: "Nein. Das geplante Produkt und die siebentägige Testphase sind noch nicht verfügbar. Mit der E-Mail-Liste bittest du nur um eine Startnachricht; sie startet keine Testphase und vereinbart keine Zahlung." },
      { q: "Was wird es kosten?", a: "Geplant sind {yearly} pro Jahr oder {monthly} pro Monat. Das sind die vorgesehenen Preise, kein Frühbucherrabatt. Auf dieser Seite kannst du nichts kaufen." },
      { q: "Wie soll die Testphase funktionieren?", a: "Zum Start sind sieben Tage voller Zugang ohne Karte zum Beginn geplant. Angaben zu Verlängerung, Kündigung und Steuern stehen klar da, bevor eine Testphase startet." },
      { q: "Muss ich aufhören oder ein Ziel festlegen?", a: "Nein. Fix soll dir helfen, dein eigenes Muster zu bemerken. Ob du etwas ändern willst, entscheidest du; ein Ziel ist freiwillig." },
      { q: "Ist Fix Therapie oder medizinische Beratung?", a: "Nein. Fix ist unterstützende Software, kein Diagnosewerkzeug, keine Therapie und kein Notdienst. Sicherheitsinformationen bleiben auf der Website zugänglich." },
    ],
    backToHome: "Zur Startseite",
  },
  fr: {
    htmlLang: "fr",
    metaTitle: "Tarifs prévus — Fix",
    metaDescription: "Le prix de lancement et l’essai de sept jours prévus pour Fix. Cette liste d’attente ne démarre ni essai ni paiement.",
    kicker: "TARIFS · PRÉVUS AU LANCEMENT",
    headlineLine1: "Un seul plan.",
    headlineLine2: "Une semaine pour voir ta semaine.",
    subhead: "Le tarif de lancement prévu est de {yearly} par an ou {monthly} par mois, avec sept jours pour essayer le produit complet. Aucune carte ne sera demandée pour commencer l’essai. Fix n’accepte pas encore de paiement ; cette page est seulement une liste d’attente.",
    plannedLabel: "Tarif prévu au lancement · pas encore disponible",
    yearlyLabel: "Annuel",
    monthlyLabel: "Mensuel",
    yearlyPriceFormat: "{price} / an",
    monthlyPriceFormat: "{price} / mois",
    yearlyEquivalentFormat: "{price} par mois, facturé à l’année",
    trialLabel: "Essai gratuit de 7 jours prévu au lancement",
    trialBody: "L’essai prévu donnera accès au produit complet et commencera sans carte. L’inscription à cette liste ne démarre aucun essai et n’autorise aucun paiement.",
    availabilityHeading: "Pas encore ouvert",
    availabilityBody: "Le suivi du soir et le miroir hebdomadaire sont en cours de création. Cette page n’est qu’une liste d’attente. Laisse ton email et on t’enverra une nouvelle au lancement. Aujourd’hui : ni tarif de lancement anticipé, ni compte à rebours, ni paiement.",
    featureHeading: "Ce que le plan de lancement doit réunir",
    features: [
      "Un bref check-in quotidien, facultatif, sur le cannabis, l’humeur et le contexte",
      "Un miroir hebdomadaire de ton propre motif, sans note",
      "Un petit objectif choisi par toi, sans pression de changement",
      "Fix comme outil bref pour parler de ta semaine — ni thérapeute ni compagnon",
    ],
    trustHeading: "Une distinction nette entre aujourd’hui et plus tard",
    trustBullets: [
      "L’application actuelle est gratuite. Cette page ne demande ni paiement ni carte.",
      "Les montants affichés sont les tarifs prévus au lancement, pas une remise ni une offre fondateur.",
      "Les informations de sécurité et d’aide de crise restent accessibles sans abonnement.",
    ],
    faqHeading: "Réponses sans détour",
    faqs: [
      { q: "Puis-je commencer l’essai maintenant ?", a: "Non. Le produit prévu et son essai de sept jours ne sont pas encore disponibles. La liste demande seulement une nouvelle au lancement ; elle ne démarre pas d’essai et ne vaut pas accord de paiement." },
      { q: "Quel sera le prix ?", a: "Le tarif prévu est de {yearly} par an ou {monthly} par mois. Ce sont les tarifs envisagés, pas une remise de pré-lancement. Aucun achat n’est possible ici." },
      { q: "Comment l’essai devrait-il fonctionner ?", a: "Au lancement, l’idée est d’offrir sept jours d’accès complet sans carte au démarrage. Le renouvellement, la résiliation et les taxes seront indiqués clairement avant tout essai." },
      { q: "Dois-je arrêter ou me fixer un objectif ?", a: "Non. Fix est conçu pour t’aider à remarquer ton propre motif. Tu décides si tu veux changer quelque chose ; l’objectif est facultatif." },
      { q: "Fix est-il une thérapie ou un conseil médical ?", a: "Non. Fix est un logiciel de soutien, pas un outil de diagnostic, un thérapeute ou un service d’urgence. Les informations de sécurité restent accessibles sur le site." },
    ],
    backToHome: "Retour à l’accueil",
  },
  nl: {
    htmlLang: "nl",
    metaTitle: "Geplande prijzen — Fix",
    metaDescription: "De geplande lanceringsprijs en proefperiode van zeven dagen. Deze wachtlijst start geen proefperiode en brengt niets in rekening.",
    kicker: "PRIJZEN · GEPLAND VOOR DE START",
    headlineLine1: "Eén plan.",
    headlineLine2: "Een week om je week te zien.",
    subhead: "De geplande startprijs is {yearly} per jaar of {monthly} per maand, met zeven dagen om het volledige product te proberen. Voor de start van de proefperiode is geen kaart nodig. Fix neemt nog geen betalingen aan; deze pagina is alleen een wachtlijst voor de start.",
    plannedLabel: "Geplande startprijs · nog niet te koop",
    yearlyLabel: "Per jaar",
    monthlyLabel: "Per maand",
    yearlyPriceFormat: "{price} / jaar",
    monthlyPriceFormat: "{price} / maand",
    yearlyEquivalentFormat: "{price} per maand, jaarlijks betaald",
    trialLabel: "Gratis proefperiode van 7 dagen gepland",
    trialBody: "De geplande proefperiode geeft volledige toegang en begint zonder kaart. Aanmelden voor deze lijst start geen proefperiode en geeft geen toestemming voor betaling.",
    availabilityHeading: "Nog niet beschikbaar",
    availabilityBody: "De korte avondcheck en weekspiegel zijn in ontwikkeling. Deze pagina is alleen een wachtlijst. Laat je e-mailadres achter voor een bericht bij de start. Vandaag is er geen vroege korting, aftelklok, checkout of afschrijving.",
    featureHeading: "Waar het startplan om draait",
    features: [
      "Een korte, optionele dagelijkse check-in over cannabis, stemming en context",
      "Een weekspiegel die je eigen patroon laat zien, zonder cijfer",
      "Eén klein doel dat je zelf kiest, zonder druk om te veranderen",
      "Fix als kort hulpmiddel voor vragen over je week — geen therapeut of maatje",
    ],
    trustHeading: "Nu en later duidelijk gescheiden",
    trustBullets: [
      "De huidige app is gratis. Deze pagina vraagt niet om betaling of kaartgegevens.",
      "De bedragen zijn de geplande startprijzen, geen korting of aanbod voor oprichters.",
      "Veiligheidsinformatie en hulp bij crisis blijven zonder abonnement beschikbaar.",
    ],
    faqHeading: "Een paar heldere antwoorden",
    faqs: [
      { q: "Kan ik nu met de proefperiode beginnen?", a: "Nee. Het geplande product en de proefperiode van zeven dagen zijn nog niet beschikbaar. Met de e-maillijst vraag je alleen om startnieuws; er begint geen proefperiode en je gaat geen betalingsverplichting aan." },
      { q: "Wat gaat het kosten?", a: "De geplande prijs is {yearly} per jaar of {monthly} per maand. Dit zijn de beoogde prijzen, geen vroegboekkorting. Op deze pagina kun je niets kopen." },
      { q: "Hoe moet de proefperiode werken?", a: "Bij de start zijn zeven dagen volledige toegang gepland, zonder kaart bij aanvang. Verlenging, opzegging en eventuele belastingen worden helder getoond voordat een proefperiode begint." },
      { q: "Moet ik stoppen of een doel kiezen?", a: "Nee. Fix wordt gebouwd om je je eigen patroon te laten opmerken. Jij beslist of je iets wilt veranderen; een doel is optioneel." },
      { q: "Is Fix therapie of medisch advies?", a: "Nee. Fix is ondersteunende software, geen diagnosehulpmiddel, therapeut of spoeddienst. Veiligheidsinformatie blijft op de website beschikbaar." },
    ],
    backToHome: "Terug naar home",
  },
  es: {
    htmlLang: "es",
    metaTitle: "Precios previstos — Fix",
    metaDescription: "El precio previsto de lanzamiento y la prueba de siete días de Fix. Esta lista de espera no inicia una prueba ni cobra nada.",
    kicker: "PRECIOS · PREVISTOS PARA EL LANZAMIENTO",
    headlineLine1: "Un plan.",
    headlineLine2: "Una semana para ver tu semana.",
    subhead: "El precio previsto al lanzamiento es {yearly} al año o {monthly} al mes, con siete días para probar el producto completo. No hará falta una tarjeta para empezar la prueba. Fix todavía no acepta pagos; esta página es solo una lista de espera para el lanzamiento.",
    plannedLabel: "Precio previsto al lanzamiento · aún no disponible",
    yearlyLabel: "Anual",
    monthlyLabel: "Mensual",
    yearlyPriceFormat: "{price} / año",
    monthlyPriceFormat: "{price} / mes",
    yearlyEquivalentFormat: "{price} al mes, con pago anual",
    trialLabel: "Prueba gratis de 7 días prevista al lanzamiento",
    trialBody: "La prueba prevista incluirá acceso completo y empezará sin pedir una tarjeta. Apuntarse a esta lista no inicia ninguna prueba ni autoriza un pago.",
    availabilityHeading: "Aún no está abierto",
    availabilityBody: "El registro nocturno y el espejo semanal están en desarrollo. Esta página es solo una lista de espera. Déjanos tu correo y te avisamos cuando esté listo. Hoy no hay descuento anticipado, cuenta atrás, pago ni cobro.",
    featureHeading: "En torno a esto se está construyendo el plan de lanzamiento",
    features: [
      "Un registro diario breve y opcional sobre cannabis, ánimo y contexto",
      "Un espejo semanal que refleja tu patrón sin ponerle nota",
      "Un objetivo pequeño elegido por ti, sin presión para cambiar",
      "Fix como herramienta breve para preguntar por tu semana — no es terapeuta ni compañero",
    ],
    trustHeading: "Lo de ahora y lo del lanzamiento, sin confundirlo",
    trustBullets: [
      "La aplicación actual es gratuita. Esta página no pide pagos ni datos de tarjeta.",
      "Los importes son los precios previstos al lanzamiento, no un descuento ni una oferta fundadora.",
      "La información de seguridad y ayuda en crisis seguirá disponible sin suscripción.",
    ],
    faqHeading: "Respuestas claras",
    faqs: [
      { q: "¿Puedo empezar la prueba ahora?", a: "No. El producto previsto y su prueba de siete días aún no están disponibles. Apuntarte al correo solo sirve para recibir noticias del lanzamiento; no inicia una prueba ni crea un compromiso de pago." },
      { q: "¿Cuánto costará?", a: "El precio previsto es {yearly} al año o {monthly} al mes. Son los precios previstos, no un descuento anticipado. Aquí no se puede comprar nada." },
      { q: "¿Cómo funcionará la prueba?", a: "Al lanzamiento, el plan es ofrecer siete días de acceso completo sin pedir una tarjeta al empezar. La renovación, cancelación e impuestos se explicarán claramente antes de que se pueda iniciar." },
      { q: "¿Tengo que dejarlo o elegir un objetivo?", a: "No. Fix se está construyendo para ayudarte a observar tu propio patrón. Tú decides si quieres cambiar algo; el objetivo es opcional." },
      { q: "¿Fix es terapia o consejo médico?", a: "No. Fix es software de apoyo, no una herramienta de diagnóstico, terapeuta ni servicio de emergencia. La información de seguridad seguirá disponible en la web." },
    ],
    backToHome: "Volver al inicio",
  },
  it: {
    htmlLang: "it",
    metaTitle: "Prezzi previsti — Fix",
    metaDescription: "Il prezzo previsto al lancio e la prova di sette giorni. Questa lista d’attesa non avvia prove e non comporta pagamenti.",
    kicker: "PREZZI · PREVISTI AL LANCIO",
    headlineLine1: "Un piano.",
    headlineLine2: "Una settimana per vedere la tua settimana.",
    subhead: "Il prezzo previsto al lancio è {yearly} l’anno o {monthly} al mese, con sette giorni per provare il prodotto completo. Per iniziare la prova non servirà una carta. Fix non accetta ancora pagamenti; questa pagina è solo una lista d’attesa per il lancio.",
    plannedLabel: "Prezzo previsto al lancio · non ancora disponibile",
    yearlyLabel: "Annuale",
    monthlyLabel: "Mensile",
    yearlyPriceFormat: "{price} / anno",
    monthlyPriceFormat: "{price} / mese",
    yearlyEquivalentFormat: "{price} al mese, con addebito annuale",
    trialLabel: "Prova gratuita di 7 giorni prevista al lancio",
    trialBody: "La prova prevista darà accesso completo e inizierà senza carta. Iscriversi a questa lista non avvia una prova né autorizza un pagamento.",
    availabilityHeading: "Non è ancora disponibile",
    availabilityBody: "Il check-in serale e lo specchio settimanale sono in sviluppo. Questa pagina è solo una lista d’attesa. Lascia un’email e ti avvisiamo quando il prodotto è pronto. Oggi non ci sono sconti anticipati, conto alla rovescia, checkout o addebiti.",
    featureHeading: "Su cosa si basa il piano di lancio",
    features: [
      "Un breve check-in quotidiano e facoltativo su cannabis, umore e contesto",
      "Uno specchio settimanale che riflette il tuo schema senza dargli un voto",
      "Un piccolo obiettivo scelto da te, senza pressione a cambiare",
      "Fix come strumento breve per chiedere della tua settimana — non un terapeuta o un compagno",
    ],
    trustHeading: "Una distinzione chiara tra oggi e il lancio",
    trustBullets: [
      "L’app attuale è gratuita. Questa pagina non chiede pagamenti o dati della carta.",
      "Gli importi sono i prezzi previsti al lancio, non uno sconto o un’offerta fondatori.",
      "Le informazioni di sicurezza e di aiuto in caso di crisi restano accessibili senza abbonamento.",
    ],
    faqHeading: "Risposte chiare",
    faqs: [
      { q: "Posso iniziare la prova adesso?", a: "No. Il prodotto previsto e la prova di sette giorni non sono ancora disponibili. Iscriverti alla lista serve solo a ricevere una notizia sul lancio; non avvia una prova e non crea un impegno di pagamento." },
      { q: "Quanto costerà?", a: "Il prezzo previsto è {yearly} l’anno o {monthly} al mese. Sono i prezzi previsti, non uno sconto anticipato. Da questa pagina non si può acquistare." },
      { q: "Come funzionerà la prova?", a: "Al lancio, il piano è offrire sette giorni di accesso completo senza chiedere una carta all’inizio. Rinnovo, cancellazione e tasse saranno spiegati chiaramente prima dell’avvio." },
      { q: "Devo smettere o scegliere un obiettivo?", a: "No. Fix si sta costruendo per aiutarti a notare il tuo schema. Decidi tu se vuoi cambiare qualcosa; l’obiettivo è facoltativo." },
      { q: "Fix è terapia o un consiglio medico?", a: "No. Fix è un software di supporto, non uno strumento diagnostico, un terapeuta o un servizio di emergenza. Le informazioni di sicurezza restano disponibili sul sito." },
    ],
    backToHome: "Torna alla home",
  },
};
