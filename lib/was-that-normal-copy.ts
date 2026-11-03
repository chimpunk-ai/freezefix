// "Was that normal?" page content — the casual-user door.
//
// Shipped 4 November 2026 (feat/was-that-normal) after Sophie (Paris, 24,
// post-party coffee the morning after) from the 15-persona audit said:
// "Tout le site présume que j'ai des 'habitudes avec le cannabis'. Moi
// j'ai tiré trois fois sur un joint pour la première fois en un an. Je ne
// me reconnais pas dans 'comprendre tes habitudes' — je cherche juste à
// comprendre pourquoi j'ai flippé."
//
// Her exact fix verbatim: "Au-dessus du CTA, ajouter une porte d'entrée
// 'C'était une fois, ça m'a fait peur' qui ouvre un flux court en
// français (même scripté, sans IA) — pour les gens comme moi qui ne sont
// pas des usagers réguliers."
//
// This page is that short scripted flow. Not a chat. Not a crisis page
// (/too-high-what-to-do already exists for people who are high right
// now). This is for the morning-after audience: it was a few puffs,
// something felt off, and now they want to know "was that normal? am I
// fine? what happened?"
//
// Posture
//   The hero reassurance is the lead. Everything else is scaffolding.
//   This page MUST NOT recommend or glorify cannabis use, or prescribe a
//   next dose. It must answer the three questions a mildly-anxious
//   post-party visitor is actually asking:
//     1. Was what I felt normal?
//     2. Is it going to happen again next time I try?
//     3. What am I supposed to do with this?
//   For (3) the honest answer is "whatever you want — nobody here is
//   pressuring you to use or not use." The product rule "do not frame
//   cannabis use as harmless or prescribe when to use it" is why the
//   next-time section does not say "try a smaller amount" — it says
//   "there might not be a next time, and that's a fine answer."

import type { Locale } from "@/lib/landing-copy";

export type WasThatNormalCopy = {
  metaTitle: string;
  metaDescription: string;

  kicker: string;
  heroH1: string;
  heroLead: string;

  normalHeading: string;
  normalParagraphs: string[];

  whyHeading: string;
  whyParagraphs: string[];

  nextHeading: string;
  nextParagraphs: string[];

  closingHeading: string;
  closingLead: string;
  closingToHomeLabel: string;
  closingToHomeCaption: string;
  closingToHelpLabel: string;
  closingToHelpCaption: string;
};

export const WAS_THAT_NORMAL_COPY: Record<Locale, WasThatNormalCopy> = {
  en: {
    metaTitle: "Was that normal? — just once, it scared me",
    metaDescription:
      "A short, calm page for anyone who tried cannabis once or twice and had a bad time. What was that feeling, is it going to happen again, and what to do next. Adults 18+.",

    kicker: "Just once, and it scared me",
    heroH1: "You are fine. That was normal.",
    heroLead:
      "Something happened the other night that didn't feel like you. Your heart was fast. Time was weird. Someone laughed and you were certain they were laughing at you. Now it's the morning after and you want to know if that was a one-off or a signal. It was a one-off. The signal part is easier than it feels.",

    normalHeading: "What you felt is on every public-health page",
    normalParagraphs: [
      "The symptoms you noticed — a fast heart, time stretching, thoughts turning into imagined social catastrophes — are the single most common package of effects described whenever someone writes about cannabis and anxiety. Health Canada, the US CDC and the UK NHS all list them in those exact words. You were not having a breakdown; you were having a predictable response to a dose your body wasn't used to.",
      "It passed. Of course it did — that's what makes it a one-off. The chemistry rose, peaked, and left. Nobody has ever died from only cannabis, and the lasting consequences for someone who tried a few puffs on a Saturday are, honestly, zero. You are not harmed.",
    ],

    whyHeading: "Why it felt bigger than it was",
    whyParagraphs: [
      "The thing that makes a greenout feel so loud isn't the cannabis itself — it's the fact that your nervous system is set up to interpret 'heart rate up + unfamiliar brain-state' as 'something is wrong, pay attention, now.' You weren't wrong to feel alarmed. The alarm was doing its job on a signal that didn't actually need alarming.",
      "If you have any background anxiety (you don't have to call it that — anyone who overthinks counts), cannabis will tend to pick it up and amplify it. That's useful information about you, not a verdict.",
    ],

    nextHeading: "What to do with this",
    nextParagraphs: [
      "Nothing, if you don't want to. There might not be a next time, and that's a fine answer. One bad experience is enough information to decide this isn't for you — that's the honest version of \"it's just not my thing.\"",
      "If you do want to understand your own relationship to it a bit better — whether it's one-offs at parties or something more — the main page has a short, no-sign-up tool for that. It will not push you to use or quit; it will just help you see your own pattern. You are welcome there even as someone who has tried it twice.",
    ],

    closingHeading: "From here",
    closingLead:
      "You don't need anything else today. If one of these feels right, take it; otherwise, close the tab — that's a fine outcome too.",
    closingToHomeLabel: "Back to the main page",
    closingToHomeCaption: "Private, on your device, no sign-up.",
    closingToHelpLabel: "If something still feels wrong, help is free",
    closingToHelpCaption: "Local crisis lines and emergency numbers.",
  },

  de: {
    metaTitle: "War das normal? — nur einmal, und es hat mir Angst gemacht",
    metaDescription:
      "Eine kurze, ruhige Seite für Leute, die Cannabis ein- oder zweimal probiert und eine schlechte Erfahrung gemacht haben. Was war das Gefühl, passiert das wieder, und was tun als Nächstes. Ab 18.",

    kicker: "Nur einmal, und es hat mir Angst gemacht",
    heroH1: "Dir geht es gut. Das war normal.",
    heroLead:
      "Vor ein paar Tagen ist etwas passiert, das sich nicht nach dir angefühlt hat. Dein Puls war schnell. Zeit war seltsam. Jemand hat gelacht, und du warst dir sicher, dass sie über dich lachen. Jetzt ist es der Morgen danach und du willst wissen, ob das einmalig war oder ein Signal. Es war einmalig. Der Signal-Teil ist einfacher, als er sich anfühlt.",

    normalHeading: "Was du gefühlt hast steht auf jeder Public-Health-Seite",
    normalParagraphs: [
      "Die Symptome, die du bemerkt hast — schneller Puls, gedehnte Zeit, Gedanken, die sich in erfundene soziale Katastrophen drehen — sind genau das Paket an Effekten, das immer wieder beschrieben wird, wenn jemand über Cannabis und Angst schreibt. Die US CDC, Health Canada und das deutsche BZgA listen sie in genau diesen Worten. Du hattest keinen Zusammenbruch; du hattest eine vorhersehbare Reaktion auf eine Dosis, an die dein Körper nicht gewöhnt war.",
      "Es ging vorüber. Natürlich — genau deshalb ist es ein einmaliges Ereignis. Die Chemie stieg, erreichte den Höhepunkt und ging wieder. Niemand ist je nur an Cannabis gestorben, und die bleibenden Folgen für jemanden, der an einem Samstag ein paar Züge probiert hat, sind ehrlich gesagt gleich null. Du hast keinen Schaden.",
    ],

    whyHeading: "Warum es sich größer angefühlt hat, als es war",
    whyParagraphs: [
      "Was einen Greenout so laut macht, ist nicht das Cannabis selbst — es ist, dass dein Nervensystem darauf ausgelegt ist, „Puls hoch + ungewohnter Kopf-Zustand“ als „etwas stimmt nicht, achte darauf, jetzt“ zu interpretieren. Es war nicht falsch, alarmiert zu sein. Der Alarm hat seine Arbeit gemacht — bei einem Signal, das eigentlich keinen Alarm brauchte.",
      "Wenn du irgendeine Grund-Angst hast (du musst es nicht so nennen — jeder, der überdenkt, zählt), neigt Cannabis dazu, sie aufzugreifen und zu verstärken. Das ist nützliche Information über dich, kein Urteil.",
    ],

    nextHeading: "Was du damit machst",
    nextParagraphs: [
      "Nichts, wenn du nicht willst. Es muss kein nächstes Mal geben, und das ist eine gute Antwort. Eine schlechte Erfahrung ist genug Information, um zu entscheiden, dass das nichts für dich ist — das ist die ehrliche Version von „das ist einfach nicht meins.“",
      "Wenn du dein eigenes Verhältnis dazu besser verstehen willst — egal ob Einmal-Sachen auf Partys oder etwas Regelmäßigeres — die Hauptseite hat ein kurzes, anmeldefreies Tool dafür. Es wird dich weder zum Konsum noch zum Aufhören drängen; es hilft dir nur, dein eigenes Muster zu sehen. Du bist dort willkommen, auch als jemand, der es zweimal probiert hat.",
    ],

    closingHeading: "Von hier aus",
    closingLead:
      "Du brauchst heute nichts weiter. Wenn eins davon richtig wirkt, nimm es; sonst schließ den Tab — das ist auch ein gutes Ergebnis.",
    closingToHomeLabel: "Zurück zur Startseite",
    closingToHomeCaption: "Privat, auf deinem Gerät, keine Anmeldung.",
    closingToHelpLabel: "Wenn sich noch etwas falsch anfühlt, ist Hilfe kostenlos",
    closingToHelpCaption: "Krisenlinien und Notrufnummern vor Ort.",
  },

  fr: {
    metaTitle: "C'était normal ? — juste une fois, ça m'a fait peur",
    metaDescription:
      "Une page courte et calme pour les gens qui ont essayé le cannabis une ou deux fois et ont eu une mauvaise expérience. Qu'est-ce que c'était, est-ce que ça va recommencer, et que faire ensuite. Adultes 18+.",

    kicker: "C'était une fois, et ça m'a fait peur",
    heroH1: "Tu vas bien. C'était normal.",
    heroLead:
      "L'autre soir il s'est passé quelque chose qui ne te ressemblait pas. Ton cœur battait vite. Le temps était bizarre. Quelqu'un a ri et tu étais certaine qu'il riait de toi. Maintenant c'est le lendemain matin et tu veux savoir si c'était un one-shot ou un signal. C'était un one-shot. La partie signal est plus simple qu'elle n'en a l'air.",

    normalHeading: "Ce que tu as ressenti est sur toutes les pages de santé publique",
    normalParagraphs: [
      "Les symptômes que tu as remarqués — cœur rapide, temps qui s'étire, pensées qui tournent en catastrophes sociales imaginées — sont exactement le paquet d'effets qui est décrit chaque fois que quelqu'un écrit sur cannabis et anxiété. Santé publique France, l'US CDC et Health Canada les listent dans ces mots exacts. Tu n'as pas fait une dépression nerveuse ; tu as eu une réaction prévisible à une dose à laquelle ton corps n'était pas habitué.",
      "C'est passé. Évidemment — c'est exactement ce qui en fait un one-shot. La chimie est montée, a atteint le pic et est repartie. Personne n'est jamais mort uniquement du cannabis, et les conséquences durables pour quelqu'un qui a tiré trois fois un samedi soir sont, honnêtement, nulles. Tu n'es pas abîmée.",
    ],

    whyHeading: "Pourquoi ça a semblé plus gros que ça l'était",
    whyParagraphs: [
      "Ce qui rend un greenout si bruyant, ce n'est pas le cannabis en lui-même — c'est que ton système nerveux est fait pour interpréter « cœur rapide + état mental inhabituel » comme « quelque chose ne va pas, fais attention, maintenant ». Tu n'avais pas tort d'avoir peur. L'alarme faisait son travail — sur un signal qui n'avait pas vraiment besoin d'alarme.",
      "Si tu as une base anxieuse (pas besoin d'appeler ça comme ça — toute personne qui rumine compte), le cannabis a tendance à la ramasser et à l'amplifier. C'est une info utile sur toi, pas un verdict.",
    ],

    nextHeading: "Que faire avec ça",
    nextParagraphs: [
      "Rien, si tu ne veux rien faire. Il n'y a peut-être pas de prochaine fois, et c'est une bonne réponse. Une mauvaise expérience est assez d'information pour décider que ce n'est pas pour toi — c'est la version honnête de « ce n'est juste pas mon truc ».",
      "Si tu veux comprendre ton propre rapport à ça un peu mieux — que ce soit des trucs d'une fois en soirée ou quelque chose de plus régulier — la page principale a un petit outil sans inscription pour ça. Il ne te poussera pas à consommer ni à arrêter ; il t'aidera juste à voir ton propre rythme. Tu y es bienvenue même en tant que quelqu'un qui n'a essayé que deux fois.",
    ],

    closingHeading: "D'ici",
    closingLead:
      "Tu n'as besoin de rien de plus aujourd'hui. Si l'un de ces liens sonne juste, prends-le ; sinon ferme l'onglet — c'est aussi un bon résultat.",
    closingToHomeLabel: "Retour à la page principale",
    closingToHomeCaption: "Privé, sur ton appareil, sans inscription.",
    closingToHelpLabel: "Si quelque chose ne va toujours pas, l'aide est gratuite",
    closingToHelpCaption: "Lignes de crise locales et numéros d'urgence.",
  },

  nl: {
    metaTitle: "Was dat normaal? — één keer, en het schrikte me af",
    metaDescription:
      "Een korte, rustige pagina voor mensen die cannabis een of twee keer probeerden en een slechte ervaring hadden. Wat was dat gevoel, gaat het weer gebeuren, en wat nu. Vanaf 18.",

    kicker: "Eén keer, en het schrikte me af",
    heroH1: "Het gaat goed met je. Dat was normaal.",
    heroLead:
      "Laatst gebeurde er iets wat niet voelde als jij. Je hart klopte snel. Tijd was raar. Iemand lachte en je wist zeker dat ze om jou lachten. Nu is het de ochtend erna en je wilt weten of het een eenmalig iets was of een signaal. Het was eenmalig. Het signaal-deel is makkelijker dan het voelt.",

    normalHeading: "Wat je voelde staat op elke volksgezondheids-pagina",
    normalParagraphs: [
      "De symptomen die je opmerkte — snel hart, tijd die uitrekt, gedachten die in verzonnen sociale rampen veranderen — zijn precies het pakket effecten dat telkens beschreven wordt als iemand over cannabis en angst schrijft. De US CDC, Health Canada en het Nederlandse Trimbos Instituut noemen ze in precies die woorden. Je kreeg geen inzinking; je had een voorspelbare reactie op een dosis waaraan je lichaam niet gewend was.",
      "Het is voorbij. Natuurlijk — precies dat maakt het eenmalig. De chemie steeg, piekte, en zakte weer. Niemand is ooit alleen door cannabis gestorven, en de blijvende gevolgen voor iemand die op zaterdagavond een paar trekjes probeerde zijn, eerlijk gezegd, nul. Je bent niet beschadigd.",
    ],

    whyHeading: "Waarom het groter voelde dan het was",
    whyParagraphs: [
      "Wat een greenout zo luid maakt is niet de cannabis zelf — het is dat je zenuwstelsel is gemaakt om „snel hart + onbekende hoofdstaat” te interpreteren als „er is iets mis, let op, nu”. Je had geen ongelijk om geschrokken te zijn. Het alarm deed zijn werk — op een signaal dat eigenlijk geen alarm nodig had.",
      "Als je een onderliggende angst hebt (je hoeft het niet zo te noemen — iedereen die piekert telt mee), heeft cannabis de neiging om die op te pakken en te versterken. Dat is nuttige informatie over jou, geen vonnis.",
    ],

    nextHeading: "Wat je ermee doet",
    nextParagraphs: [
      "Niets, als je niets wilt. Er hoeft geen volgende keer te zijn, en dat is een prima antwoord. Eén slechte ervaring is genoeg informatie om te beslissen dat dit niets voor jou is — dat is de eerlijke versie van „het is gewoon mijn ding niet”.",
      "Als je je eigen verhouding ertoe iets beter wilt begrijpen — of het nu eenmalige dingen op feesten zijn of iets regelmatigers — de hoofdpagina heeft een korte, aanmeldingvrije tool daarvoor. Het zal je niet pushen om te gebruiken of te stoppen; het helpt je alleen je eigen patroon te zien. Je bent daar welkom ook als iemand die het twee keer probeerde.",
    ],

    closingHeading: "Vanaf hier",
    closingLead:
      "Je hebt vandaag niets anders nodig. Als een van deze goed voelt, neem die; anders sluit het tabblad — dat is ook een goed resultaat.",
    closingToHomeLabel: "Terug naar de hoofdpagina",
    closingToHomeCaption: "Privé, op je apparaat, geen aanmelding.",
    closingToHelpLabel: "Als iets nog verkeerd voelt, is hulp gratis",
    closingToHelpCaption: "Lokale crisislijnen en noodnummers.",
  },
};
