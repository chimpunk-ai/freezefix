// New landing sections added in Stage 3 of the Calm-grade redesign
// (2026-11-05 feat/landing-calm-rebuild). Kept in its own file so the
// huge LANDING_COPY stays legible; a future consolidation can merge
// them once the shape stabilises.
//
// The sections this pack covers:
//   • scenarios — the 6 scenario cards ( "you came here because …" )
//   • socialProof — honest empty-state card, since we have no testimonials
//   • pricingTeaser — three-row summary that links to /pricing
//   • privacyBand — three bullets explaining the privacy posture
//   • faq — five short Q&As on the long-term loop
//   • ageBadge — the 18+ footer badge text
//
// Every string is native-first for its locale; no DeepL rewrites.

import type { Locale } from "@/lib/landing-copy";

export type LandingSectionsCopy = {
  scenarios: {
    kicker: string;    // short uppercase section label
    heading: string;   // h2
    body: string;      // one-line intro
    cards: Array<{ title: string; body: string }>;
  };
  socialProof: {
    kicker: string;
    heading: string;
    body: string;
    emptyLabel: string;   // the "be the first to review" badge
  };
  pricingTeaser: {
    kicker: string;
    heading: string;
    body: string;
    freeLabel: string;      // "Free" / "Gratis" / etc.
    freePrice: string;      // "$0"
    freeBullets: string[];
    proLabel: string;       // "Pro"
    proPrice: string;       // "$39.99 / year" (overridden per currency at render time)
    proPerMonth: string;    // "$3.33/month, billed yearly"
    proBullets: string[];
    ctaLabel: string;       // "See full pricing →"
    foundingTag: string;    // "Founding member — $29.99 first year"
  };
  privacyBand: {
    kicker: string;
    heading: string;
    bullets: string[];
  };
  faq: {
    heading: string;
    items: Array<{ q: string; a: string }>;
  };
  ageBadge: string;         // "Adults 18+"
};

export const LANDING_SECTIONS: Record<Locale, LandingSectionsCopy> = {
  en: {
    scenarios: {
      kicker: "What Fix is for",
      heading: "A few moments it's built around.",
      body: "You don't have to match any of these to use Fix. These are the moments people most often reach for it.",
      cards: [
        { title: "A craving you'd rather sit with.", body: "You planned not to tonight. Something inside you is pulling the other way. Fix walks the ten minutes with you." },
        { title: "After-smoke anxiety.", body: "The thoughts went somewhere uncomfortable. You want a quiet voice that isn't your own head, until it passes." },
        { title: "You greened out.", body: "Lying down, racing heart, sweating. Fix knows that feeling and the plain, boring steps that end it." },
        { title: "You can't sleep.", body: "It's 2am and your brain is still on. Fix is awake too and will keep it slow." },
        { title: "A paranoid turn.", body: "People are not thinking about you. Fix will not catastrophise with you; it will bring you back to the room." },
        { title: "The morning after.", body: "Regret, haze, a half-plan to cut back. Fix can hold that plan without turning it into a program." },
      ],
    },
    socialProof: {
      kicker: "Real reviews, when there are some",
      heading: "No fake testimonials.",
      body: "We'd rather show nothing than invent people. When Fix has helped enough adults that there are honest reviews to quote, this is where they'll live.",
      emptyLabel: "Be the first to leave one.",
    },
    pricingTeaser: {
      kicker: "Pricing",
      heading: "Free today. Pro when it's ready.",
      body: "Everything the product does today stays free. Pro is the deeper layer — unlimited Fix, journal history, insights, the Reduction Program.",
      freeLabel: "Free",
      freePrice: "$0",
      freeBullets: [
        "Three Fix sessions a day",
        "Crisis help, one tap away",
        "Guides, this-week journal, weekly check-in",
      ],
      proLabel: "Pro",
      proPrice: "$39.99 / year",
      proPerMonth: "$3.33/month, billed yearly",
      proBullets: [
        "Unlimited Fix sessions",
        "Full journal + pattern history",
        "Reduction Program (2 / 4 / 6-week plans)",
      ],
      ctaLabel: "See full pricing →",
      foundingTag: "Founding member — $29.99 first year",
    },
    privacyBand: {
      kicker: "What we don't do",
      heading: "No account. No tracking. No lectures.",
      bullets: [
        "The core flow works with no account. The thing works before we know anything about you.",
        "Journal entries stay on your device. Nothing you type is uploaded, and no name is attached to a Fix session.",
        "No dark patterns. Cancellation is one tap, pause is one tap, and delete removes everything in two.",
      ],
    },
    faq: {
      heading: "Honest questions",
      items: [
        {
          q: "Is Fix going to tell me to quit?",
          a: "No. Fix doesn't judge your use. You choose the goal — reduce, pause, shift the time, or nothing at all — and the app follows that. Fix is not a therapist and not a recovery program.",
        },
        {
          q: "Do I need an account?",
          a: "No. Open Fix and go. The chat, guides, crisis help, this-week journal, and the weekly check-in all work with no account. If you want journal history across devices, that'll be an opt-in anonymous account later — email not required.",
        },
        {
          q: "Where do my messages go?",
          a: "Each Fix chat round-trips through our server to an AI provider and back; the message is not kept with your name on it, and we never join a Fix session to an email. Journal entries stay on your device and are never uploaded.",
        },
        {
          q: "Is this medical advice?",
          a: "No. FreezeFix is supportive software for adults 18+. It is not therapy, medical advice, or an emergency service. If something is severe, getting worse, or staying, speak to a qualified person — Get help now is one tap from every screen.",
        },
        {
          q: "When does Pro launch?",
          a: "When it's ready. The founding-member list locks the first-year price in; you decide when the time comes. See the pricing page.",
        },
      ],
    },
    ageBadge: "Adults 18+",
  },

  de: {
    scenarios: {
      kicker: "Wofür Fix da ist",
      heading: "Ein paar Momente, um die es gebaut ist.",
      body: "Du musst nicht alle davon haben, um Fix zu nutzen. Das sind die Momente, in denen Leute am ehesten danach greifen.",
      cards: [
        { title: "Ein Craving, mit dem du lieber sitzen würdest.", body: "Du wolltest heute Abend nicht rauchen. Etwas zieht trotzdem. Fix bleibt die zehn Minuten bei dir." },
        { title: "Angst nach dem Rauchen.", body: "Die Gedanken sind unangenehm geworden. Du willst eine ruhige Stimme, die nicht deine eigene ist, bis es vorbei ist." },
        { title: "Du bist abgeschossen.", body: "Liegend, Herzrasen, Schweiß. Fix kennt dieses Gefühl und die schlichten, langweiligen Schritte, die es beenden." },
        { title: "Du kannst nicht schlafen.", body: "Es ist 2 Uhr und dein Kopf läuft noch. Fix ist auch wach und hält das Tempo langsam." },
        { title: "Ein paranoider Dreh.", body: "Die Leute denken nicht an dich. Fix katastrophisiert nicht mit dir; es holt dich zurück in den Raum." },
        { title: "Der Morgen danach.", body: "Reue, Nebel, ein halber Plan, zu reduzieren. Fix kann den Plan halten, ohne ihn zu einem Programm zu machen." },
      ],
    },
    socialProof: {
      kicker: "Echte Stimmen, wenn es welche gibt",
      heading: "Keine erfundenen Testimonials.",
      body: "Wir zeigen lieber nichts, als Leute zu erfinden. Wenn Fix genug Erwachsenen geholfen hat, dass es ehrliche Stimmen gibt, stehen sie hier.",
      emptyLabel: "Sei die erste Stimme.",
    },
    pricingTeaser: {
      kicker: "Preise",
      heading: "Heute kostenlos. Pro, wenn es so weit ist.",
      body: "Alles, was das Produkt heute kann, bleibt kostenlos. Pro ist die tiefere Ebene — unbegrenztes Fix, Journal-Historie, Insights, das Reduktions-Programm.",
      freeLabel: "Kostenlos",
      freePrice: "€0",
      freeBullets: [
        "Drei Fix-Gespräche pro Tag",
        "Hilfe jetzt, einen Tap entfernt",
        "Guides, Wochen-Journal, Wochen-Check-in",
      ],
      proLabel: "Pro",
      proPrice: "€39,99 / Jahr",
      proPerMonth: "€3,33/Monat, jährlich abgerechnet",
      proBullets: [
        "Unbegrenzte Fix-Gespräche",
        "Volle Journal- + Muster-Historie",
        "Reduktions-Programm (2 / 4 / 6 Wochen)",
      ],
      ctaLabel: "Volle Preise ansehen →",
      foundingTag: "Founding Member — €27,99 im ersten Jahr",
    },
    privacyBand: {
      kicker: "Was wir nicht machen",
      heading: "Kein Konto. Kein Tracking. Keine Belehrungen.",
      bullets: [
        "Der Kern-Flow läuft ohne Konto. Das Ding funktioniert, bevor wir irgendetwas über dich wissen.",
        "Journal-Einträge bleiben auf deinem Gerät. Nichts wird hochgeladen, und kein Name hängt an einer Fix-Sitzung.",
        "Keine dunklen Muster. Kündigen ist ein Tap, Pause ist ein Tap, und Löschen entfernt alles in zweien.",
      ],
    },
    faq: {
      heading: "Ehrliche Fragen",
      items: [
        {
          q: "Wird Fix mir sagen, dass ich aufhören soll?",
          a: "Nein. Fix bewertet deinen Konsum nicht. Du wählst das Ziel — reduzieren, pausieren, Zeit verschieben oder gar nichts — und die App folgt dem. Fix ist keine Therapie und kein Entzugsprogramm.",
        },
        {
          q: "Brauche ich ein Konto?",
          a: "Nein. Öffne Fix und los. Chat, Guides, Hilfe jetzt, Wochen-Journal und der Wochen-Check-in laufen ohne Konto. Für Journal-Historie über Geräte hinweg kommt später ein opt-in anonymes Konto — keine E-Mail nötig.",
        },
        {
          q: "Wohin gehen meine Nachrichten?",
          a: "Jede Fix-Runde geht über unseren Server zu einem KI-Anbieter und zurück; die Nachricht wird nicht unter deinem Namen gespeichert, und wir verknüpfen eine Fix-Sitzung nie mit einer E-Mail. Journal-Einträge bleiben auf deinem Gerät und werden nie hochgeladen.",
        },
        {
          q: "Ist das medizinische Beratung?",
          a: "Nein. FreezeFix ist unterstützende Software für Erwachsene ab 18. Keine Therapie, keine medizinische Beratung, kein Notdienst. Wenn etwas schwer, schlimmer oder länger wird, sprich mit einer qualifizierten Person — Hilfe jetzt ist auf jedem Screen einen Tap entfernt.",
        },
        {
          q: "Wann startet Pro?",
          a: "Wenn es so weit ist. Die Founding-Member-Liste sichert dir den Preis im ersten Jahr; du entscheidest, wenn es so weit ist. Siehe Preis-Seite.",
        },
      ],
    },
    ageBadge: "Ab 18 Jahren",
  },

  fr: {
    scenarios: {
      kicker: "À quoi sert Fix",
      heading: "Quelques moments autour desquels c'est construit.",
      body: "Tu n'as pas besoin de cocher tous ces moments pour utiliser Fix. Ce sont ceux où les gens y vont le plus souvent.",
      cards: [
        { title: "Un craving avec lequel tu préférerais rester assis.", body: "Tu comptais ne pas fumer ce soir. Quelque chose en toi tire ailleurs. Fix fait les dix minutes avec toi." },
        { title: "L'angoisse après avoir fumé.", body: "Les pensées sont parties ailleurs. Tu veux une voix calme qui n'est pas la tienne, jusqu'à ce que ça passe." },
        { title: "Tu as « greened out ».", body: "Allongé, cœur qui bat, transpiration. Fix connaît ce ressenti et les étapes plates et ennuyeuses qui le terminent." },
        { title: "Tu n'arrives pas à dormir.", body: "Il est 2h du matin et ta tête tourne encore. Fix est aussi réveillé et garde le rythme lent." },
        { title: "Un tour parano.", body: "Les gens ne pensent pas à toi. Fix ne catastrophise pas avec toi ; il te ramène à la pièce." },
        { title: "Le lendemain matin.", body: "Regret, brouillard, un demi-plan pour réduire. Fix peut tenir le plan sans en faire un programme." },
      ],
    },
    socialProof: {
      kicker: "De vraies voix, quand il y en a",
      heading: "Pas de faux témoignages.",
      body: "On préfère ne rien montrer qu'inventer des gens. Quand Fix aura aidé assez d'adultes pour qu'il y ait de vraies voix, elles seront là.",
      emptyLabel: "Sois la première.",
    },
    pricingTeaser: {
      kicker: "Prix",
      heading: "Gratuit aujourd'hui. Pro quand c'est prêt.",
      body: "Tout ce que le produit fait aujourd'hui reste gratuit. Pro est la couche plus profonde — Fix illimité, historique de journal, insights, le Programme de Réduction.",
      freeLabel: "Gratuit",
      freePrice: "0 €",
      freeBullets: [
        "Trois sessions Fix par jour",
        "Aide maintenant, à un tap",
        "Guides, journal de la semaine, check-in hebdomadaire",
      ],
      proLabel: "Pro",
      proPrice: "39,99 € / an",
      proPerMonth: "3,33 €/mois, facturé annuellement",
      proBullets: [
        "Sessions Fix illimitées",
        "Historique complet journal + motifs",
        "Programme de Réduction (2 / 4 / 6 semaines)",
      ],
      ctaLabel: "Voir le détail des prix →",
      foundingTag: "Membre fondateur — 27,99 € la première année",
    },
    privacyBand: {
      kicker: "Ce qu'on ne fait pas",
      heading: "Pas de compte. Pas de tracking. Pas de leçons.",
      bullets: [
        "Le flow principal marche sans compte. Le truc marche avant qu'on sache quoi que ce soit sur toi.",
        "Les entrées du journal restent sur ton appareil. Rien de ce que tu tapes n'est téléversé, et aucun nom n'est accroché à une session Fix.",
        "Pas de dark pattern. Annuler, c'est un tap. Pause, c'est un tap. Supprimer efface tout en deux.",
      ],
    },
    faq: {
      heading: "Questions honnêtes",
      items: [
        {
          q: "Fix va-t-il me dire d'arrêter ?",
          a: "Non. Fix ne juge pas ta consommation. Tu choisis l'objectif — réduire, faire une pause, décaler l'heure, ou rien — et l'app suit. Fix n'est ni une thérapie ni un programme de sevrage.",
        },
        {
          q: "Est-ce que j'ai besoin d'un compte ?",
          a: "Non. Ouvre Fix et vas-y. Chat, guides, aide maintenant, journal de la semaine et check-in hebdomadaire tournent sans compte. Pour l'historique de journal entre appareils, un compte anonyme opt-in arrivera plus tard — sans email requis.",
        },
        {
          q: "Où vont mes messages ?",
          a: "Chaque échange Fix passe par notre serveur jusqu'à un fournisseur d'IA et revient ; le message n'est pas gardé sous ton nom, et on ne relie jamais une session Fix à un email. Les entrées du journal restent sur ton appareil et ne sont jamais téléversées.",
        },
        {
          q: "C'est un conseil médical ?",
          a: "Non. FreezeFix est un logiciel de soutien pour adultes 18+. Ni thérapie, ni conseil médical, ni service d'urgence. Si quelque chose est grave, empire ou dure, parle à une personne qualifiée — Aide maintenant est à un tap sur chaque écran.",
        },
        {
          q: "Pro sort quand ?",
          a: "Quand c'est prêt. La liste membre-fondateur verrouille le prix de la première année ; tu décides le moment venu. Voir la page prix.",
        },
      ],
    },
    ageBadge: "Adultes 18+",
  },

  nl: {
    scenarios: {
      kicker: "Waar Fix voor is",
      heading: "Een paar momenten waar het omheen is gebouwd.",
      body: "Je hoeft deze momenten niet allemaal te hebben om Fix te gebruiken. Dit zijn de momenten waarop mensen er het meest naar grijpen.",
      cards: [
        { title: "Een trek waar je liever bij zou blijven zitten.", body: "Je had afgesproken vanavond niet. Iets trekt toch. Fix doet de tien minuten met je mee." },
        { title: "Angst na het blowen.", body: "De gedachten zijn ongemakkelijk geworden. Je wilt een kalme stem die niet van jezelf is, tot het voorbij is." },
        { title: "Je bent greened out.", body: "Liggend, hartkloppingen, zweten. Fix kent dat gevoel en de saaie, simpele stappen die het stoppen." },
        { title: "Je kunt niet slapen.", body: "Het is 2 uur en je hoofd loopt nog door. Fix is ook wakker en houdt het tempo laag." },
        { title: "Een paranoïde wending.", body: "Mensen denken niet aan jou. Fix catastroferen niet met je mee; het brengt je terug naar de kamer." },
        { title: "De ochtend erna.", body: "Spijt, waas, half plan om te minderen. Fix kan dat plan vasthouden zonder er een programma van te maken." },
      ],
    },
    socialProof: {
      kicker: "Echte stemmen, als er zijn",
      heading: "Geen verzonnen testimonials.",
      body: "We tonen liever niets dan mensen te verzinnen. Als Fix genoeg volwassenen heeft geholpen dat er eerlijke stemmen zijn, staan ze hier.",
      emptyLabel: "Wees de eerste.",
    },
    pricingTeaser: {
      kicker: "Prijzen",
      heading: "Vandaag gratis. Pro als het klaar is.",
      body: "Alles wat het product vandaag doet blijft gratis. Pro is de diepere laag — onbeperkte Fix, journalgeschiedenis, insights, het Reductieprogramma.",
      freeLabel: "Gratis",
      freePrice: "€0",
      freeBullets: [
        "Drie Fix-gesprekken per dag",
        "Hulp nu, één tap weg",
        "Gidsen, weekjournal, wekelijkse check-in",
      ],
      proLabel: "Pro",
      proPrice: "€39,99 / jaar",
      proPerMonth: "€3,33/maand, jaarlijks gefactureerd",
      proBullets: [
        "Onbeperkte Fix-gesprekken",
        "Volledige journal- + patroongeschiedenis",
        "Reductieprogramma (2 / 4 / 6 weken)",
      ],
      ctaLabel: "Bekijk alle prijzen →",
      foundingTag: "Founding member — €27,99 voor je eerste jaar",
    },
    privacyBand: {
      kicker: "Wat we niet doen",
      heading: "Geen account. Geen tracking. Geen preek.",
      bullets: [
        "De kernflow werkt zonder account. Het ding werkt voordat we iets van je weten.",
        "Journal-regels blijven op je apparaat. Niets wat je typt wordt geupload, en geen naam hangt aan een Fix-sessie.",
        "Geen dark patterns. Opzeggen is één tap, pauze is één tap, en verwijderen wist alles in twee.",
      ],
    },
    faq: {
      heading: "Eerlijke vragen",
      items: [
        {
          q: "Gaat Fix zeggen dat ik moet stoppen?",
          a: "Nee. Fix oordeelt niet over je gebruik. Jij kiest het doel — minderen, pauzeren, tijd verschuiven, of niets — en de app volgt. Fix is geen therapie en geen afkickprogramma.",
        },
        {
          q: "Heb ik een account nodig?",
          a: "Nee. Open Fix en ga. Chat, gidsen, hulp nu, weekjournal en wekelijkse check-in draaien zonder account. Voor journalgeschiedenis tussen apparaten komt later een opt-in anoniem account — zonder e-mail.",
        },
        {
          q: "Waar gaan mijn berichten heen?",
          a: "Elke Fix-ronde gaat via onze server naar een AI-leverancier en terug; het bericht wordt niet onder je naam bewaard, en we koppelen een Fix-sessie nooit aan een e-mail. Journal-regels blijven op je apparaat en worden nooit geupload.",
        },
        {
          q: "Is dit medisch advies?",
          a: "Nee. FreezeFix is ondersteunende software voor volwassenen vanaf 18. Geen therapie, geen medisch advies, geen noodhulp. Als iets ernstig is, erger wordt of blijft, praat met een gekwalificeerd persoon — Hulp nu is op elk scherm één tap weg.",
        },
        {
          q: "Wanneer gaat Pro live?",
          a: "Als het klaar is. De founding-member-lijst legt je prijs voor het eerste jaar vast; je beslist op dat moment. Zie de prijspagina.",
        },
      ],
    },
    ageBadge: "Volwassenen 18+",
  },

  es: {
    scenarios: {
      kicker: "Para qué sirve Fix",
      heading: "Unos momentos para los que está hecho.",
      body: "No tienes que cuadrar con todos para usar Fix. Son los momentos en los que la gente más lo abre.",
      cards: [
        { title: "Un craving con el que preferirías quedarte sentado.", body: "Habías decidido no esta noche. Algo tira hacia el otro lado. Fix pasa los diez minutos contigo." },
        { title: "Ansiedad después de fumar.", body: "Los pensamientos se han ido a sitios incómodos. Quieres una voz tranquila que no sea la tuya, hasta que pase." },
        { title: "Te has greened out.", body: "Tumbado, corazón acelerado, sudando. Fix conoce esa sensación y los pasos planos y aburridos que la terminan." },
        { title: "No puedes dormir.", body: "Son las 2 y tu cabeza sigue en marcha. Fix también está despierto y mantiene el ritmo lento." },
        { title: "Un giro paranoico.", body: "La gente no está pensando en ti. Fix no catastrofiza contigo; te devuelve a la habitación." },
        { title: "La mañana siguiente.", body: "Arrepentimiento, niebla, medio plan para reducir. Fix puede sostener ese plan sin convertirlo en un programa." },
      ],
    },
    socialProof: {
      kicker: "Voces reales, cuando las haya",
      heading: "Sin testimonios inventados.",
      body: "Preferimos no mostrar nada antes que inventar gente. Cuando Fix haya ayudado a bastantes adultos como para tener voces honestas, estarán aquí.",
      emptyLabel: "Sé la primera.",
    },
    pricingTeaser: {
      kicker: "Precios",
      heading: "Gratis hoy. Pro cuando esté listo.",
      body: "Todo lo que el producto hace hoy sigue gratis. Pro es la capa más profunda — Fix ilimitado, historial de diario, insights, el Programa de Reducción.",
      freeLabel: "Gratis",
      freePrice: "0 €",
      freeBullets: [
        "Tres sesiones de Fix al día",
        "Ayuda ahora, a un toque",
        "Guías, diario de la semana, check-in semanal",
      ],
      proLabel: "Pro",
      proPrice: "39,99 € / año",
      proPerMonth: "3,33 €/mes, facturado anualmente",
      proBullets: [
        "Sesiones de Fix ilimitadas",
        "Historial completo de diario + patrones",
        "Programa de Reducción (2 / 4 / 6 semanas)",
      ],
      ctaLabel: "Ver precios completos →",
      foundingTag: "Miembro fundador — 27,99 € el primer año",
    },
    privacyBand: {
      kicker: "Lo que no hacemos",
      heading: "Sin cuenta. Sin rastreo. Sin sermones.",
      bullets: [
        "El flujo principal funciona sin cuenta. La cosa funciona antes de que sepamos nada de ti.",
        "Las entradas del diario se quedan en tu dispositivo. Nada de lo que escribes se sube, y ningún nombre va atado a una sesión de Fix.",
        "Sin patrones oscuros. Cancelar es un toque, pausar es un toque, y borrar elimina todo en dos.",
      ],
    },
    faq: {
      heading: "Preguntas honestas",
      items: [
        {
          q: "¿Fix me va a decir que lo deje?",
          a: "No. Fix no juzga tu consumo. Tú eliges la meta — reducir, pausar, cambiar la hora, o nada — y la app sigue. Fix no es terapia ni un programa de abstinencia.",
        },
        {
          q: "¿Necesito una cuenta?",
          a: "No. Abre Fix y ya. Chat, guías, ayuda ahora, diario de la semana y check-in semanal van sin cuenta. Para historial de diario entre dispositivos llegará después una cuenta anónima opt-in — sin correo requerido.",
        },
        {
          q: "¿A dónde van mis mensajes?",
          a: "Cada ronda de Fix va por nuestro servidor hasta un proveedor de IA y vuelve; el mensaje no se guarda con tu nombre, y nunca ligamos una sesión de Fix a un correo. Las entradas del diario se quedan en tu dispositivo y nunca se suben.",
        },
        {
          q: "¿Es consejo médico?",
          a: "No. FreezeFix es software de apoyo para adultos mayores de 18. Ni terapia, ni consejo médico, ni servicio de emergencia. Si algo es grave, va a peor o dura, habla con una persona cualificada — Ayuda ahora está a un toque en cada pantalla.",
        },
        {
          q: "¿Cuándo sale Pro?",
          a: "Cuando esté listo. La lista de miembros fundadores bloquea el precio del primer año; decides tú en su momento. Mira la página de precios.",
        },
      ],
    },
    ageBadge: "Adultos 18+",
  },

  it: {
    scenarios: {
      kicker: "A cosa serve Fix",
      heading: "Alcuni momenti su cui è costruito.",
      body: "Non devi riconoscerti in tutti per usare Fix. Sono i momenti in cui la gente lo apre di più.",
      cards: [
        { title: "Un craving con cui preferiresti stare seduto.", body: "Avevi deciso di no stasera. Qualcosa tira dall'altra parte. Fix fa i dieci minuti con te." },
        { title: "Ansia dopo la canna.", body: "I pensieri sono andati in posti scomodi. Vuoi una voce calma che non sia la tua, finché non passa." },
        { title: "Sei greened out.", body: "Sdraiato, cuore in gola, sudore. Fix conosce quella sensazione e i passi piatti e noiosi che la finiscono." },
        { title: "Non riesci a dormire.", body: "Sono le 2 e la testa gira ancora. Fix è sveglio anche lui e tiene il ritmo basso." },
        { title: "Una svolta paranoica.", body: "La gente non sta pensando a te. Fix non catastrofizza con te; ti riporta nella stanza." },
        { title: "Il mattino dopo.", body: "Rimpianto, nebbia, mezzo piano per ridurre. Fix può tenere quel piano senza farne un programma." },
      ],
    },
    socialProof: {
      kicker: "Voci vere, quando ce ne sono",
      heading: "Niente testimonianze inventate.",
      body: "Preferiamo non mostrare niente piuttosto che inventare persone. Quando Fix avrà aiutato abbastanza adulti perché ci siano voci oneste, saranno qui.",
      emptyLabel: "Sii la prima.",
    },
    pricingTeaser: {
      kicker: "Prezzi",
      heading: "Gratis oggi. Pro quando è pronto.",
      body: "Tutto quello che il prodotto fa oggi resta gratis. Pro è lo strato più profondo — Fix illimitato, cronologia del diario, insights, il Programma di Riduzione.",
      freeLabel: "Gratis",
      freePrice: "€0",
      freeBullets: [
        "Tre sessioni di Fix al giorno",
        "Aiuto ora, a un tocco",
        "Guide, diario della settimana, check-in settimanale",
      ],
      proLabel: "Pro",
      proPrice: "€39,99 / anno",
      proPerMonth: "€3,33/mese, fatturato annualmente",
      proBullets: [
        "Sessioni di Fix illimitate",
        "Cronologia completa diario + pattern",
        "Programma di Riduzione (2 / 4 / 6 settimane)",
      ],
      ctaLabel: "Vedi i prezzi completi →",
      foundingTag: "Membro fondatore — €27,99 il primo anno",
    },
    privacyBand: {
      kicker: "Cosa non facciamo",
      heading: "Nessun account. Nessun tracciamento. Nessuna predica.",
      bullets: [
        "Il flusso principale funziona senza account. La cosa funziona prima che sappiamo qualcosa di te.",
        "Le voci del diario restano sul tuo dispositivo. Niente di quello che scrivi viene caricato, e nessun nome è attaccato a una sessione di Fix.",
        "Niente dark pattern. Disdire è un tocco, pausa è un tocco, cancellare rimuove tutto in due.",
      ],
    },
    faq: {
      heading: "Domande oneste",
      items: [
        {
          q: "Fix mi dirà di smettere?",
          a: "No. Fix non giudica il tuo uso. Scegli tu l'obiettivo — ridurre, mettere in pausa, spostare l'orario, o niente — e l'app segue. Fix non è una terapia e non è un programma di disintossicazione.",
        },
        {
          q: "Mi serve un account?",
          a: "No. Apri Fix e vai. Chat, guide, aiuto ora, diario della settimana e check-in settimanale funzionano senza account. Per la cronologia del diario tra dispositivi arriverà un account anonimo opt-in — niente email richiesta.",
        },
        {
          q: "Dove vanno i miei messaggi?",
          a: "Ogni giro di Fix passa dal nostro server a un fornitore di IA e torna; il messaggio non viene salvato col tuo nome, e non colleghiamo mai una sessione di Fix a un'email. Le voci del diario restano sul tuo dispositivo e non vengono mai caricate.",
        },
        {
          q: "È un consiglio medico?",
          a: "No. FreezeFix è software di supporto per adulti dai 18 anni. Non è terapia, non è consiglio medico, non è un servizio di emergenza. Se qualcosa è grave, peggiora o resta, parla con una persona qualificata — Aiuto ora è a un tocco su ogni schermo.",
        },
        {
          q: "Quando esce Pro?",
          a: "Quando è pronto. La lista membri fondatori blocca il prezzo del primo anno; decidi tu in quel momento. Guarda la pagina prezzi.",
        },
      ],
    },
    ageBadge: "Adulti 18+",
  },
};
