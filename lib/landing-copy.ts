export type Locale = "en" | "de" | "fr" | "nl" | "es" | "it";

export const LOCALES: Locale[] = ["en", "de", "fr", "nl", "es", "it"];
export const FALLBACK_LOCALE: Locale = "en";

export function pickLandingLocale(region: string): Locale {
  const r = region.toUpperCase();
  if (r === "DE" || r === "AT" || r === "CH") return "de";
  if (r === "FR" || r === "LU" || r === "BE") return "fr";
  if (r === "NL") return "nl";
  if (r === "ES" || r === "AD" || r === "UY") return "es";
  if (r === "IT" || r === "SM" || r === "VA") return "it";
  return "en";
}

export type LandingCopy = {
  htmlLang: string;
  metaTitle: string;
  metaDescription: string;
  getHelpNow: string;
  openReturning: string;
  switchTo: { href: string; label: string };
  languageLinks: Array<{ href: string; label: string; lang: string }>;
  kicker: string;
  heroHeadlineLine1: string;
  heroHeadlineLine2: string;
  heroBody: string;
  ctaWaitlist: string;
  ctaPrivacy: string;
  releaseNote: string;
  features: Array<{ title: string; body: string }>;
  mirror: {
    kicker: string;
    heading: string;
    observation: string;
    chartSummary: string;
    weekdays: string[];
    smokedLegend: string;
    noSmokeLegend: string;
    goalLabel: string;
    goalLine: string;
    caption: string;
  };
  loopHeading: string;
  loopIntro: string;
  loopSteps: Array<{ title: string; body: string }>;
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
  footerBlurb: string;
  footerPricingPosture: string;
  footerLinks: Array<{ href: string; label: string }>;
};

const allLanguageLinks = [
  { href: "/de", label: "Auf Deutsch", lang: "de" },
  { href: "/fr", label: "En français", lang: "fr" },
  { href: "/nl", label: "In het Nederlands", lang: "nl" },
  { href: "/es", label: "En español", lang: "es" },
  { href: "/it", label: "In italiano", lang: "it" },
];

const englishLinks = [{ href: "/", label: "English", lang: "en" }];

const footerLinks: Record<Locale, Array<{ href: string; label: string }>> = {
  en: [
    { href: "/product", label: "Product details" },
    { href: "/pricing", label: "Pricing" },
    { href: "/help", label: "Get help" },
    { href: "/privacy", label: "Privacy" },
    { href: "/patterns", label: "Patterns" },
    { href: "/terms", label: "Terms" },
    { href: "/refunds", label: "Refunds" },
    { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
  ],
  de: [
    { href: "/product", label: "Produktdetails" },
    { href: "/pricing", label: "Preise" },
    { href: "/help", label: "Hilfe" },
    { href: "/privacy", label: "Datenschutz" },
    { href: "/patterns", label: "Muster" },
    { href: "/terms", label: "Nutzungsbedingungen" },
    { href: "/refunds", label: "Erstattungen" },
    { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
  ],
  fr: [
    { href: "/product", label: "Détails du produit" },
    { href: "/pricing", label: "Tarifs" },
    { href: "/help", label: "Aide" },
    { href: "/privacy", label: "Confidentialité" },
    { href: "/patterns", label: "Tendances" },
    { href: "/terms", label: "Conditions" },
    { href: "/refunds", label: "Remboursements" },
    { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
  ],
  nl: [
    { href: "/product", label: "Productdetails" },
    { href: "/pricing", label: "Prijzen" },
    { href: "/help", label: "Hulp" },
    { href: "/privacy", label: "Privacy" },
    { href: "/patterns", label: "Patronen" },
    { href: "/terms", label: "Voorwaarden" },
    { href: "/refunds", label: "Terugbetalingen" },
    { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
  ],
  es: [
    { href: "/product", label: "Detalles del producto" },
    { href: "/pricing", label: "Precios" },
    { href: "/help", label: "Ayuda" },
    { href: "/privacy", label: "Privacidad" },
    { href: "/patterns", label: "Patrones" },
    { href: "/terms", label: "Términos" },
    { href: "/refunds", label: "Reembolsos" },
    { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
  ],
  it: [
    { href: "/product", label: "Dettagli del prodotto" },
    { href: "/pricing", label: "Prezzi" },
    { href: "/help", label: "Aiuto" },
    { href: "/privacy", label: "Privacy" },
    { href: "/patterns", label: "Schemi" },
    { href: "/terms", label: "Termini" },
    { href: "/refunds", label: "Rimborsi" },
    { href: "mailto:hello@getfreezefix.com", label: "hello@getfreezefix.com" },
  ],
};

export const LANDING_COPY: Record<Locale, LandingCopy> = {
  en: {
    htmlLang: "en",
    metaTitle: "Fix — a private mirror for your cannabis habits",
    metaDescription: "Fix is building a private, nonjudgmental weekly mirror for cannabis habits. A small daily check-in, without a quit counter or lecture. Join for launch updates.",
    getHelpNow: "Get help now",
    openReturning: "Open Fix",
    switchTo: { href: "/de", label: "Auf Deutsch" },
    languageLinks: allLanguageLinks,
    kicker: "FIX · A PRIVATE PATTERN MIRROR · 18+",
    heroHeadlineLine1: "You don’t have to quit.",
    heroHeadlineLine2: "Just notice.",
    heroBody: "Fix is being built as a quiet, private way to see how cannabis fits into your week. A few small check-ins, one weekly mirror—without a quit counter or lecture. What you do with the pattern is yours.",
    ctaWaitlist: "Get launch updates",
    ctaPrivacy: "How privacy works",
    releaseNote: "The nightly log and weekly mirror are in development. Leave an email and we’ll send a note when they’re ready.",
    features: [
      { title: "No quit counter", body: "A smoke night is a note, not a setback." },
      { title: "Your goal, your call", body: "Change something, or don’t. Fix doesn’t choose for you." },
      { title: "No scoreboard", body: "The check-in and mirror are designed for your device, not a public leaderboard." },
    ],
    mirror: {
      kicker: "A SUNDAY PREVIEW · EXAMPLE ONLY",
      heading: "Nico, here’s your week.",
      observation: "You logged smoke on four nights. “After work” came up three times.",
      chartSummary: "Illustrative week: smoke was logged Monday, Tuesday, Thursday and Saturday; no smoke was logged Wednesday, Friday and Sunday.",
      weekdays: ["M", "T", "W", "T", "F", "S", "S"],
      smokedLegend: "Smoke logged",
      noSmokeLegend: "No smoke logged",
      goalLabel: "YOUR THING",
      goalLine: "You wanted to run twice. You went once. Only you know what that means.",
      caption: "Illustrative example — not real user data.",
    },
    loopHeading: "Three small taps. A clearer week.",
    loopIntro: "This is the loop we’re building: no daily journal to keep up with, just enough to notice what’s there, in your own time.",
    loopSteps: [
      { title: "Log a few taps", body: "Whether you smoked, how the day felt, and what was around it. Skip anything you don’t want to answer." },
      { title: "See the week", body: "On Sunday, a plain-language mirror shows the shape of your week. No grade. No streak." },
      { title: "Choose your next step", body: "Pick one small thing you’d like to do more of, if you want. The choice stays yours." },
    ],
    waitlist: {
      label: "Want a note when the weekly mirror is ready? Leave an email.",
      placeholder: "you@wherever.com",
      submit: "Keep me posted",
      submitting: "Adding…",
      footnote: "Email only. No account or payment. We’ll write when there’s real news; unsubscribe any time.",
      error: "That didn’t go through. Check the address and try again.",
      throttled: "Already noted. That’s plenty for today — we’ll be in touch when there’s news.",
      done: "Thanks — you’re on the list. We’ll write when the mirror is ready. Unsubscribe in any email.",
      notCollecting: "The launch list isn’t connected right now. Nothing was lost; please try again later.",
    },
    footerBlurb: "Fix is supportive software for adults 18+. It is not therapy, medical advice, or an emergency service.",
    footerPricingPosture: "The launch offer is planned, not available yet. The price page shows the intended price; joining the list starts no trial and takes no payment.",
    footerLinks: footerLinks.en,
  },
  de: {
    htmlLang: "de",
    metaTitle: "Fix — ein privater Spiegel für deinen Cannabiskonsum",
    metaDescription: "Fix entwickelt einen privaten, vorurteilsfreien Wochenspiegel für den Cannabiskonsum. Ein kurzer Check-in ohne Aufhör-Zähler oder Predigt. Launch-News erhalten.",
    getHelpNow: "Hilfe jetzt",
    openReturning: "Fix öffnen",
    switchTo: { href: "/", label: "English" },
    languageLinks: englishLinks,
    kicker: "FIX · EIN PRIVATER MUSTERSPIEGEL · AB 18",
    heroHeadlineLine1: "Du musst nicht aufhören.",
    heroHeadlineLine2: "Erst mal hinschauen.",
    heroBody: "Fix wird als ruhiger, privater Blick darauf entwickelt, wie Cannabis in deine Woche passt. Ein paar kurze Check-ins, ein Wochen-Spiegel — ohne Aufhör-Zähler oder Predigt. Was du im Muster siehst, entscheidest du.",
    ctaWaitlist: "Launch-News erhalten",
    ctaPrivacy: "Datenschutz bei Fix",
    releaseNote: "Der kurze Abend-Log und der Wochen-Spiegel sind in Arbeit. Hinterlass eine E-Mail, dann melden wir uns, wenn sie bereit sind.",
    features: [
      { title: "Kein Aufhör-Zähler", body: "Ein Abend mit Cannabis ist eine Notiz, kein Rückschritt." },
      { title: "Dein Ziel, deine Sache", body: "Etwas ändern oder nicht. Fix entscheidet das nicht für dich." },
      { title: "Keine Punktetafel", body: "Check-in und Spiegel sind für dein Gerät gedacht, nicht für eine öffentliche Rangliste." },
    ],
    mirror: {
      kicker: "SONNTAGS-VORSCHAU · NUR EIN BEISPIEL",
      heading: "Nico, so sah deine Woche aus.",
      observation: "Du hast an vier Abenden Cannabis notiert. „Nach der Arbeit“ kam dreimal vor.",
      chartSummary: "Beispielwoche: Cannabis am Montag, Dienstag, Donnerstag und Samstag notiert; kein Cannabis am Mittwoch, Freitag und Sonntag.",
      weekdays: ["M", "D", "M", "D", "F", "S", "S"],
      smokedLegend: "Cannabis notiert",
      noSmokeLegend: "Kein Cannabis notiert",
      goalLabel: "DEIN VORHABEN",
      goalLine: "Du wolltest zweimal laufen gehen. Einmal hat’s geklappt. Was das bedeutet, weißt nur du.",
      caption: "Nur ein Beispiel — keine echten Nutzungsdaten.",
    },
    loopHeading: "Ein paar kurze Taps. Eine klarere Woche.",
    loopIntro: "Das ist der Ablauf, den wir entwickeln: kein Tagebuch zum Durchhalten, nur genug, um in deinem Tempo zu sehen, was da ist.",
    loopSteps: [
      { title: "Kurz eintragen", body: "Ob du geraucht hast, wie sich der Tag angefühlt hat und was dabei eine Rolle spielte. Alles lässt sich überspringen." },
      { title: "Die Woche ansehen", body: "Am Sonntag zeigt dir ein einfacher Spiegel die Form deiner Woche. Keine Note. Keine Streak." },
      { title: "Selbst entscheiden", body: "Wenn du möchtest, suchst du dir eine Kleinigkeit aus, die öfter Platz haben soll. Es bleibt deine Entscheidung." },
    ],
    waitlist: {
      label: "Möchtest du Bescheid bekommen, wenn der Wochen-Spiegel fertig ist? Lass eine E-Mail da.",
      placeholder: "du@irgendwo.de",
      submit: "Auf dem Laufenden bleiben",
      submitting: "Wird eingetragen…",
      footnote: "Nur E-Mail. Kein Konto, keine Zahlung. Wir melden uns bei echten Neuigkeiten; Abmeldung jederzeit.",
      error: "Das hat nicht geklappt. Prüfe die Adresse und versuch es noch einmal.",
      throttled: "Schon notiert. Für heute reicht’s — wir melden uns, wenn es Neuigkeiten gibt.",
      done: "Danke — du stehst auf der Liste. Wir melden uns, wenn der Spiegel bereit ist. Abmeldung in jeder Mail.",
      notCollecting: "Die Liste ist gerade nicht erreichbar. Es ging nichts verloren; versuch es später noch einmal.",
    },
    footerBlurb: "Fix ist unterstützende Software für Erwachsene ab 18. Keine Therapie, keine medizinische Beratung und kein Notdienst.",
    footerPricingPosture: "Das geplante Angebot ist noch nicht verfügbar. Die Preisseite zeigt den vorgesehenen Preis; die Liste startet weder einen Test noch eine Zahlung.",
    footerLinks: footerLinks.de,
  },
  fr: {
    htmlLang: "fr",
    metaTitle: "Fix — un miroir privé de tes habitudes avec le cannabis",
    metaDescription: "Fix développe un miroir hebdomadaire privé et sans jugement sur les habitudes liées au cannabis. Un check-in bref, sans compteur d’arrêt. Nouvelles du lancement.",
    getHelpNow: "Aide maintenant",
    openReturning: "Ouvrir Fix",
    switchTo: { href: "/", label: "English" },
    languageLinks: englishLinks,
    kicker: "FIX · UN MIROIR PRIVÉ · 18+",
    heroHeadlineLine1: "Tu n’as pas à arrêter.",
    heroHeadlineLine2: "Tu peux juste voir.",
    heroBody: "Fix est en cours de création comme un regard calme et privé sur la place du cannabis dans ta semaine. Quelques petits check-ins, un miroir hebdomadaire — sans compteur d’arrêt ni leçon. Tu décides quoi en faire.",
    ctaWaitlist: "Recevoir les nouvelles",
    ctaPrivacy: "Comment fonctionne la confidentialité",
    releaseNote: "Le petit suivi du soir et le miroir de la semaine sont en cours de création. Laisse ton email et on te préviendra quand ils seront prêts.",
    features: [
      { title: "Pas de compteur d’arrêt", body: "Une soirée où tu fumes est une note, pas un échec." },
      { title: "Ton objectif, ton choix", body: "Changer quelque chose ou pas. Fix ne choisit pas à ta place." },
      { title: "Pas de classement", body: "Le check-in et le miroir sont conçus pour ton appareil, pas pour un classement public." },
    ],
    mirror: {
      kicker: "APERÇU DU DIMANCHE · EXEMPLE",
      heading: "Nico, voilà ta semaine.",
      observation: "Tu as noté avoir fumé quatre soirs. « Après le travail » est revenu trois fois.",
      chartSummary: "Semaine illustrative : cannabis noté lundi, mardi, jeudi et samedi ; pas de cannabis noté mercredi, vendredi et dimanche.",
      weekdays: ["L", "M", "M", "J", "V", "S", "D"],
      smokedLegend: "Cannabis noté",
      noSmokeLegend: "Pas de cannabis noté",
      goalLabel: "TON TRUC À TOI",
      goalLine: "Tu voulais courir deux fois. Tu y es allé une fois. Toi seul sais ce que ça signifie.",
      caption: "Exemple illustratif — aucune donnée réelle.",
    },
    loopHeading: "Quelques taps. Une semaine plus claire.",
    loopIntro: "C’est le parcours que nous construisons : pas de journal à tenir, juste assez pour remarquer ce qui se passe, à ton rythme.",
    loopSteps: [
      { title: "Noter quelques éléments", body: "Si tu as fumé, comment tu te sentais et ce qui se passait autour. Tu peux tout passer." },
      { title: "Voir ta semaine", body: "Le dimanche, un miroir en mots simples montre la forme de ta semaine. Pas de note. Pas de série." },
      { title: "Choisir la suite", body: "Si tu veux, choisis une petite chose que tu aimerais faire davantage. La décision reste la tienne." },
    ],
    waitlist: {
      label: "Tu veux un mot quand le miroir hebdomadaire sera prêt ? Laisse ton email.",
      placeholder: "toi@quelquepart.fr",
      submit: "Me tenir au courant",
      submitting: "Inscription…",
      footnote: "Email seulement. Pas de compte, pas de paiement. On écrit quand il y a du concret ; désinscription à tout moment.",
      error: "Ça n’a pas marché. Vérifie l’adresse et réessaie.",
      throttled: "C’est déjà noté. Ça suffit pour aujourd’hui — on te recontactera quand il y aura du nouveau.",
      done: "Merci — tu es sur la liste. On te préviendra quand le miroir sera prêt. Désinscription dans chaque email.",
      notCollecting: "La liste est momentanément indisponible. Rien n’est perdu ; réessaie plus tard.",
    },
    footerBlurb: "Fix est un logiciel de soutien pour adultes de 18 ans et plus. Ce n’est ni une thérapie, ni un conseil médical, ni un service d’urgence.",
    footerPricingPosture: "L’offre de lancement prévue n’est pas encore disponible. La page de tarifs affiche le prix envisagé ; la liste ne démarre aucun essai et n’entraîne aucun paiement.",
    footerLinks: footerLinks.fr,
  },
  nl: {
    htmlLang: "nl",
    metaTitle: "Fix — een privéspiegel voor je cannabisgebruik",
    metaDescription: "Fix bouwt aan een privé-weekspiegel voor cannabisgebruik, zonder oordeel. Een korte check-in, zonder stopteller of preek. Ontvang startnieuws.",
    getHelpNow: "Hulp nu",
    openReturning: "Fix openen",
    switchTo: { href: "/", label: "English" },
    languageLinks: englishLinks,
    kicker: "FIX · EEN PRIVÉSPIEGEL · 18+",
    heroHeadlineLine1: "Je hoeft niet te stoppen.",
    heroHeadlineLine2: "Kijk eerst maar eens.",
    heroBody: "Fix wordt gebouwd als een rustige, private manier om te zien hoe cannabis in je week past. Een paar korte check-ins, één weekspiegel — zonder stopteller of preek. Wat je ermee doet, bepaal jij.",
    ctaWaitlist: "Houd me op de hoogte",
    ctaPrivacy: "Zo werkt privacy",
    releaseNote: "De korte avondcheck en weekspiegel zijn in ontwikkeling. Laat je e-mailadres achter; we laten weten wanneer ze klaar zijn.",
    features: [
      { title: "Geen stop-teller", body: "Een avond blowen is een notitie, geen terugval." },
      { title: "Jouw doel, jouw keuze", body: "Iets veranderen of niet. Fix beslist dat niet voor je." },
      { title: "Geen scorebord", body: "De check-in en spiegel zijn bedoeld voor je eigen apparaat, niet voor een openbare ranglijst." },
    ],
    mirror: {
      kicker: "ZONDAGVOORBEELD · TER ILLUSTRATIE",
      heading: "Nico, zo zag je week eruit.",
      observation: "Je noteerde blowen op vier avonden. ‘Na het werk’ kwam drie keer terug.",
      chartSummary: "Voorbeeldweek: cannabis genoteerd op maandag, dinsdag, donderdag en zaterdag; niet genoteerd op woensdag, vrijdag en zondag.",
      weekdays: ["M", "D", "W", "D", "V", "Z", "Z"],
      smokedLegend: "Cannabis genoteerd",
      noSmokeLegend: "Geen cannabis genoteerd",
      goalLabel: "JOUW DING",
      goalLine: "Je wilde twee keer gaan hardlopen. Je ging één keer. Alleen jij weet wat dat betekent.",
      caption: "Alleen een voorbeeld — geen echte gebruikersdata.",
    },
    loopHeading: "Een paar tikken. Een helderder beeld.",
    loopIntro: "Dit is het ritme dat we bouwen: geen dagboek om bij te houden, alleen genoeg om op jouw moment te zien wat er speelt.",
    loopSteps: [
      { title: "Een paar dingen noteren", body: "Of je blowde, hoe je dag voelde en wat meespeelde. Je mag alles overslaan." },
      { title: "Je week bekijken", body: "Op zondag laat een spiegel in gewone taal de vorm van je week zien. Geen cijfer. Geen streak." },
      { title: "Zelf kiezen wat volgt", body: "Kies desgewenst één klein ding dat je vaker wilt doen. De keuze blijft bij jou." },
    ],
    waitlist: {
      label: "Wil je bericht als de weekspiegel klaar is? Laat je e-mailadres achter.",
      placeholder: "jij@ergens.nl",
      submit: "Houd me op de hoogte",
      submitting: "Bezig…",
      footnote: "Alleen e-mail. Geen account of betaling. We mailen als er echt nieuws is; afmelden kan altijd.",
      error: "Dat ging niet door. Controleer het adres en probeer opnieuw.",
      throttled: "Al genoteerd. Dat is genoeg voor vandaag — we laten het weten als er nieuws is.",
      done: "Bedankt — je staat op de lijst. We laten het weten als de spiegel klaar is. Afmelden kan in elke mail.",
      notCollecting: "De lijst is nu even niet beschikbaar. Er is niets kwijt; probeer het later opnieuw.",
    },
    footerBlurb: "Fix is ondersteunende software voor volwassenen vanaf 18. Geen therapie, medisch advies of noodhulp.",
    footerPricingPosture: "Het geplande aanbod is nog niet beschikbaar. De prijzenpagina toont de beoogde prijs; aanmelden start geen proefperiode en brengt geen betaling mee.",
    footerLinks: footerLinks.nl,
  },
  es: {
    htmlLang: "es",
    metaTitle: "Fix — un espejo privado para tus hábitos con el cannabis",
    metaDescription: "Fix está creando un espejo semanal privado y sin juicios sobre los hábitos con cannabis. Un registro breve, sin contador para dejarlo. Recibe novedades del lanzamiento.",
    getHelpNow: "Ayuda ahora",
    openReturning: "Abrir Fix",
    switchTo: { href: "/", label: "English" },
    languageLinks: englishLinks,
    kicker: "FIX · UN ESPEJO PRIVADO · 18+",
    heroHeadlineLine1: "No tienes que dejarlo.",
    heroHeadlineLine2: "Solo observar.",
    heroBody: "Fix se está creando como una forma tranquila y privada de ver cómo encaja el cannabis en tu semana. Unos apuntes breves y un espejo semanal, sin contador ni sermones. Tú decides qué significa.",
    ctaWaitlist: "Avísame cuando esté",
    ctaPrivacy: "Cómo cuidamos tu privacidad",
    releaseNote: "El registro nocturno y el espejo semanal están en desarrollo. Déjanos un correo y te avisamos cuando estén listos.",
    features: [
      { title: "Sin contador para dejarlo", body: "Una noche fumando es un dato, no un retroceso." },
      { title: "Tu objetivo, tu decisión", body: "Cambiar algo o no. Fix no decide por ti." },
      { title: "Sin marcador", body: "El registro y el espejo están pensados para tu dispositivo, no para una clasificación pública." },
    ],
    mirror: {
      kicker: "VISTA DEL DOMINGO · SOLO UN EJEMPLO",
      heading: "Nico, así fue tu semana.",
      observation: "Registraste consumo cuatro noches. «Después del trabajo» apareció tres veces.",
      chartSummary: "Semana de ejemplo: consumo registrado lunes, martes, jueves y sábado; sin consumo registrado miércoles, viernes y domingo.",
      weekdays: ["L", "M", "X", "J", "V", "S", "D"],
      smokedLegend: "Consumo registrado",
      noSmokeLegend: "Sin consumo registrado",
      goalLabel: "TU COSA",
      goalLine: "Querías salir a correr dos veces. Fuiste una. Solo tú sabes qué significa.",
      caption: "Ejemplo ilustrativo — no son datos reales de nadie.",
    },
    loopHeading: "Unos toques. Una semana más clara.",
    loopIntro: "Este es el recorrido que estamos construyendo: nada de diarios que mantener, solo lo suficiente para observar, a tu ritmo.",
    loopSteps: [
      { title: "Apunta unas pocas cosas", body: "Si fumaste, cómo fue el día y qué había alrededor. Puedes saltarte lo que quieras." },
      { title: "Mira la semana", body: "El domingo, un espejo en lenguaje claro muestra la forma de tu semana. Sin nota. Sin rachas." },
      { title: "Elige lo siguiente", body: "Si te apetece, escoge una cosa pequeña que quieras hacer más. La decisión es tuya." },
    ],
    waitlist: {
      label: "¿Quieres un aviso cuando esté listo el espejo semanal? Déjanos tu correo.",
      placeholder: "tu@donde-sea.es",
      submit: "Avísame",
      submitting: "Apuntando…",
      footnote: "Solo correo. Sin cuenta ni pago. Escribiremos cuando haya novedades de verdad; puedes darte de baja cuando quieras.",
      error: "No ha funcionado. Revisa la dirección e inténtalo de nuevo.",
      throttled: "Ya está apuntado. Por hoy es suficiente; te avisaremos cuando haya novedades.",
      done: "Gracias — estás en la lista. Te avisaremos cuando esté listo el espejo. Puedes darte de baja en cualquier correo.",
      notCollecting: "La lista no está disponible ahora mismo. No se ha perdido nada; inténtalo más tarde.",
    },
    footerBlurb: "Fix es software de apoyo para adultos mayores de 18 años. No es terapia, consejo médico ni un servicio de emergencia.",
    footerPricingPosture: "El plan de lanzamiento previsto aún no está disponible. La página de precios muestra el precio previsto; apuntarse no inicia una prueba ni supone un cobro.",
    footerLinks: footerLinks.es,
  },
  it: {
    htmlLang: "it",
    metaTitle: "Fix — uno specchio privato per le tue abitudini con la cannabis",
    metaDescription: "Fix sta costruendo uno specchio settimanale privato e senza giudizi sulle abitudini legate alla cannabis. Un check-in breve, senza contatori per smettere. Aggiornamenti al lancio.",
    getHelpNow: "Aiuto ora",
    openReturning: "Apri Fix",
    switchTo: { href: "/", label: "English" },
    languageLinks: englishLinks,
    kicker: "FIX · UNO SPECCHIO PRIVATO · 18+",
    heroHeadlineLine1: "Non devi smettere.",
    heroHeadlineLine2: "Puoi solo osservare.",
    heroBody: "Fix è in sviluppo come modo tranquillo e privato per vedere che posto ha la cannabis nella tua settimana. Qualche appunto breve, uno specchio settimanale, senza contatori o prediche. Decidi tu cosa farne.",
    ctaWaitlist: "Avvisami quando è pronto",
    ctaPrivacy: "Come proteggiamo la privacy",
    releaseNote: "Il breve check-in serale e lo specchio settimanale sono in sviluppo. Lascia un’email e ti avvisiamo quando saranno pronti.",
    features: [
      { title: "Niente contatore per smettere", body: "Una sera in cui fumi è un appunto, non un passo indietro." },
      { title: "Il tuo obiettivo, la tua scelta", body: "Cambiare qualcosa o no. Fix non decide per te." },
      { title: "Niente classifiche", body: "Il check-in e lo specchio sono pensati per il tuo dispositivo, non per una classifica pubblica." },
    ],
    mirror: {
      kicker: "ANTEPRIMA DELLA DOMENICA · SOLO UN ESEMPIO",
      heading: "Nico, ecco com’è andata la settimana.",
      observation: "Hai segnato quattro sere in cui hai fumato. «Dopo il lavoro» è comparso tre volte.",
      chartSummary: "Settimana illustrativa: consumo segnato lunedì, martedì, giovedì e sabato; nessun consumo segnato mercoledì, venerdì e domenica.",
      weekdays: ["L", "M", "M", "G", "V", "S", "D"],
      smokedLegend: "Consumo segnato",
      noSmokeLegend: "Nessun consumo segnato",
      goalLabel: "UNA COSA TUA",
      goalLine: "Volevi andare a correre due volte. Ci sei andato una volta. Solo tu sai cosa significa.",
      caption: "Esempio illustrativo — non sono dati reali.",
    },
    loopHeading: "Pochi tocchi. Una settimana più chiara.",
    loopIntro: "Questo è il percorso che stiamo costruendo: non un diario da portare avanti, solo il minimo per notare cosa c’è, con i tuoi tempi.",
    loopSteps: [
      { title: "Segna poche cose", body: "Se hai fumato, com’è andata la giornata e cosa c’era intorno. Puoi saltare tutto quello che vuoi." },
      { title: "Guarda la settimana", body: "La domenica, uno specchio in parole semplici mostra la forma della tua settimana. Nessun voto. Nessuna serie." },
      { title: "Scegli tu il prossimo passo", body: "Se ti va, scegli una piccola cosa da fare un po’ più spesso. La decisione resta tua." },
    ],
    waitlist: {
      label: "Vuoi un avviso quando lo specchio settimanale è pronto? Lascia un’email.",
      placeholder: "tu@dovevuoi.it",
      submit: "Avvisami",
      submitting: "Invio…",
      footnote: "Solo email. Nessun account o pagamento. Scriveremo quando ci saranno novità vere; puoi disiscriverti quando vuoi.",
      error: "Non è andata. Controlla l’indirizzo e riprova.",
      throttled: "Segnato. Per oggi basta così; ti avvisiamo quando ci saranno novità.",
      done: "Grazie — sei nella lista. Ti avvisiamo quando lo specchio è pronto. Puoi disiscriverti da ogni email.",
      notCollecting: "La lista non è disponibile in questo momento. Non è andato perso nulla; riprova più tardi.",
    },
    footerBlurb: "Fix è un software di supporto per adulti dai 18 anni in su. Non è terapia, consulenza medica o un servizio di emergenza.",
    footerPricingPosture: "L’offerta di lancio prevista non è ancora disponibile. La pagina prezzi mostra il prezzo previsto; iscriversi non avvia una prova né comporta pagamenti.",
    footerLinks: footerLinks.it,
  },
};
