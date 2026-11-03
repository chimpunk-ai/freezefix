// "For someone you love" page content.
//
// Shipped 4 November 2026 (feat/for-someone-you-love) after Clara
// (Lyon, 29, physiotherapist) from the 15-persona audit said: "Zéro
// porte d'entrée 'je suis là pour quelqu'un' — pas de page proche, pas
// de conseils pour partenaire, rien dans le footer. Je n'existe pas
// dans ce produit. Si je lui envoie le lien tel quel, il va lire 'pour
// quand un joint te laisse bloqué' et le prendre comme un reproche
// déguisé — je lui jette ça à la figure, je ne l'aide pas."
//
// Her proposed fix verbatim: "Ajouter sous le CTA principal un petit
// lien discret 'Quelqu'un que tu aimes fume ? Lis ceci' qui ouvre une
// page courte (une page) écrite à moi — comment en parler sans accuser,
// quoi ne pas faire, et une formulation que je peux copier pour lui
// envoyer le lien sans que ça ressemble à une embuscade."
//
// This page is that. One scroll, four sections:
//   - Who this is for (framing — "you're not their counsellor")
//   - How to talk about it (do's that don't accuse)
//   - What NOT to do (what makes it worse)
//   - A copy-pasteable forward message (so the link doesn't feel like
//     a smuggled reproach)
//
// Tone
//   Address the READER, not the user. Second person ("you"), but "you"
//   means Clara — the partner, parent, sibling, friend. Never "your
//   boyfriend" or "your partner" by default (it's rarely the right
//   assumption; "they" is used throughout).
//
//   No clinical language. No "intervention". No "addiction". No "enabling".
//   These frames come from a 1970s substance-abuse model that does
//   enormous harm when applied to a 27-year-old functional user. We
//   stay plain-English and acknowledge that the reader knows their
//   person better than any website does.

import type { Locale } from "@/lib/landing-copy";

export type ForSomeoneCopy = {
  metaTitle: string;
  metaDescription: string;

  kicker: string; // small all-caps line above the H1
  heroH1: string;
  heroLead: string;

  whoHeading: string;
  whoParagraphs: string[];

  howHeading: string;
  howIntro: string;
  howBullets: string[];

  notHeading: string;
  notIntro: string;
  notBullets: string[];

  forwardHeading: string;
  forwardIntro: string;
  /** Pre-written message the reader can copy to their person. First
   *  person, friendly, no accusation. Under 300 characters so it fits
   *  a text message. */
  forwardMessage: string;
  forwardCopyLabel: string;
  forwardCopiedLabel: string;

  backHome: string; // link back to the main landing
};

export const FOR_SOMEONE_COPY: Record<Locale, ForSomeoneCopy> = {
  en: {
    metaTitle: "Here for someone you love — a short guide",
    metaDescription:
      "One page for partners, parents and friends of someone who uses cannabis. How to talk about it without accusing, what not to do, and a message you can forward.",

    kicker: "You're not their counsellor",
    heroH1: "Here for someone you love.",
    heroLead:
      "This one page is for you — the partner, parent, sibling, friend. You've noticed something is off. You want to help without making it worse. You know them better than any website does; this is a quiet playbook, not a protocol.",

    whoHeading: "Who this is for",
    whoParagraphs: [
      "Someone close to you uses cannabis more than you think is healthy for them, or more than you think they themselves want to. You're not here to fix them — the deepest change in these patterns has to come from them — but you'd like to be useful instead of in the way.",
      "You're allowed to have limits of your own. Being supportive of someone's recovery or reduction does not mean absorbing every weight of it. The best thing you can do is stay yourself.",
    ],

    howHeading: "How to talk about it",
    howIntro:
      "If you're going to bring it up, bring it up when nobody is high or hungover, somewhere private, when neither of you is trying to leave. Keep it short.",
    howBullets: [
      "Lead with what you notice, not with a diagnosis. \"I've noticed you've been staying in more\" lands differently than \"you have a problem.\"",
      "Ask what they'd want, not what you want for them. \"What would feel like a win for you in a month?\" opens a door. \"You should quit\" closes one.",
      "Admit you don't know everything. You don't. Most people who use cannabis aren't in crisis, and a reduction plan at their pace is not a failure of yours.",
      "Offer concrete support, not vague worry. \"Want me to text you on Thursday evenings, the time you usually use?\" is more useful than \"I'm worried about you.\"",
      "Let them lead the pace. If they want to think about it for a week, that's not stalling — that's exactly how change at this layer works.",
    ],

    notHeading: "What not to do",
    notIntro:
      "These are all well-intentioned. They also all make things worse, because they turn you from a person who cares into a problem that has to be managed.",
    notBullets: [
      "Don't run an intervention. Full stop. For heavier substance-use disorders they're controversial at best; for someone using cannabis most evenings they are an ambush that will cost you the relationship before it costs them the habit.",
      "Don't threaten to leave as a lever. If you're leaving, leave for yourself. Using the possibility as pressure just teaches them to hide it from you.",
      "Don't throw their cannabis away, hide it, or snoop. All of that is a betrayal that outlasts the conversation.",
      "Don't talk to their friends, parents or boss \"for their own good\" without their consent. That is a line you don't un-cross.",
      "Don't send articles, apps or screenshots (including this one) without a sentence of your own alongside them. A bare link is a smuggled reproach.",
    ],

    forwardHeading: "A message you can forward",
    forwardIntro:
      "If you want to share this site with them, send something like this. You can copy it as-is or change the words to sound like you. The point is that they see a human first and a link second.",
    forwardMessage:
      "Hey — I came across this site and thought of you. It's not therapy, it's not an intervention, it's just a quiet companion for people who use cannabis and want to understand their own pattern. No sign-up, nothing shared with me. Only open it if you want to.",
    forwardCopyLabel: "Copy this message",
    forwardCopiedLabel: "Copied",

    backHome: "Back to the main page",
  },

  de: {
    metaTitle: "Für jemanden, den du liebst — ein kurzer Leitfaden",
    metaDescription:
      "Eine Seite für Partner, Eltern und Freunde von jemandem, der Cannabis konsumiert. Wie du darüber sprichst, ohne anzuklagen. Was du nicht tun solltest. Und eine Nachricht, die du weiterleiten kannst.",

    kicker: "Du bist nicht ihr Therapeut",
    heroH1: "Für jemanden, den du liebst.",
    heroLead:
      "Diese eine Seite ist für dich — den Partner, das Elternteil, den Geschwister, die Freundin. Dir ist aufgefallen, dass etwas nicht stimmt. Du willst helfen, ohne es schlimmer zu machen. Du kennst diese Person besser als jede Website; das hier ist ein leises Playbook, kein Protokoll.",

    whoHeading: "Für wen das ist",
    whoParagraphs: [
      "Jemand, der dir nahesteht, konsumiert Cannabis mehr, als du es für gesund hältst — oder mehr, als diese Person selbst will. Du bist nicht hier, um sie zu reparieren. Die tiefste Änderung in diesen Mustern muss von ihr kommen, aber du möchtest hilfreich sein, statt im Weg.",
      "Du darfst eigene Grenzen haben. Jemanden in der Reduktion zu unterstützen, bedeutet nicht, jedes Gewicht davon zu tragen. Das Beste, was du tun kannst, ist du selbst zu bleiben.",
    ],

    howHeading: "Wie du darüber sprichst",
    howIntro:
      "Wenn du es ansprichst, dann in einem Moment, in dem niemand high oder verkatert ist, im Privaten, wenn niemand gehen muss. Halt es kurz.",
    howBullets: [
      "Fang mit dem an, was du bemerkst, nicht mit einer Diagnose. „Mir ist aufgefallen, dass du mehr zu Hause bleibst“ landet anders als „du hast ein Problem.“",
      "Frag, was sie wollen, nicht was du für sie willst. „Was würde sich für dich in einem Monat wie ein Erfolg anfühlen?“ öffnet eine Tür. „Du solltest aufhören“ schließt eine.",
      "Gib zu, dass du nicht alles weißt. Du weißt es nicht. Die meisten, die Cannabis konsumieren, sind nicht in einer Krise, und ein Reduktionsplan in ihrem Tempo ist kein Scheitern von dir.",
      "Biete konkrete Unterstützung an, nicht vage Sorge. „Soll ich dir am Donnerstagabend schreiben, der Zeit, zu der du meistens rauchst?“ ist nützlicher als „ich mache mir Sorgen.“",
      "Lass sie das Tempo bestimmen. Wenn sie eine Woche darüber nachdenken wollen, ist das kein Hinhalten — so funktioniert Änderung auf dieser Ebene.",
    ],

    notHeading: "Was du nicht tun solltest",
    notIntro:
      "Das hier ist alles gut gemeint. Es macht die Sache trotzdem schlimmer, weil es dich von einer Person, die sich kümmert, in ein Problem verwandelt, das verwaltet werden muss.",
    notBullets: [
      "Keine Intervention. Punkt. Für schwere Suchterkrankungen ist das umstritten; für jemanden, der abends raucht, ist es ein Hinterhalt, der dich die Beziehung kostet, bevor es sie die Gewohnheit kostet.",
      "Droh nicht damit zu gehen als Druckmittel. Wenn du gehst, geh für dich. Es als Druckmittel zu nutzen, bringt der Person nur bei, es vor dir zu verbergen.",
      "Wirf ihr Cannabis nicht weg, versteck es nicht, schnüffle nicht. Alles davon ist ein Vertrauensbruch, der länger bleibt als das Gespräch.",
      "Sprich nicht mit ihren Freunden, Eltern oder Arbeitgeber „zu ihrem Besten“ ohne ihre Zustimmung. Das ist eine Linie, die du nicht rückgängig machen kannst.",
      "Schick keine Artikel, Apps oder Screenshots (auch nicht diese Seite) ohne einen eigenen Satz dazu. Ein nackter Link ist ein versteckter Vorwurf.",
    ],

    forwardHeading: "Eine Nachricht zum Weiterleiten",
    forwardIntro:
      "Wenn du diese Seite teilen willst, schick so etwas. Du kannst es so übernehmen oder die Worte so ändern, dass es nach dir klingt. Der Punkt ist, dass sie zuerst dich sehen und dann den Link.",
    forwardMessage:
      "Hey — ich bin auf diese Seite gestoßen und musste an dich denken. Keine Therapie, keine Intervention, einfach ein stiller Begleiter für Menschen, die Cannabis konsumieren und ihr eigenes Muster verstehen wollen. Keine Anmeldung, nichts, was bei mir ankommt. Öffne es nur, wenn du magst.",
    forwardCopyLabel: "Nachricht kopieren",
    forwardCopiedLabel: "Kopiert",

    backHome: "Zurück zur Startseite",
  },

  fr: {
    metaTitle: "Pour quelqu'un que tu aimes — un petit guide",
    metaDescription:
      "Une page pour les partenaires, parents et amis de quelqu'un qui consomme du cannabis. Comment en parler sans accuser. Ce qu'il ne faut pas faire. Et un message que tu peux faire suivre.",

    kicker: "Tu n'es pas son thérapeute",
    heroH1: "Pour quelqu'un que tu aimes.",
    heroLead:
      "Cette page est pour toi — la partenaire, le parent, la sœur, l'ami. Tu as remarqué que quelque chose cloche. Tu veux aider sans empirer les choses. Tu connais cette personne mieux qu'aucun site ne la connaîtra; ceci est un playbook calme, pas un protocole.",

    whoHeading: "Pour qui c'est",
    whoParagraphs: [
      "Quelqu'un de proche de toi consomme du cannabis plus que tu ne le penses sain — ou plus que cette personne elle-même le voudrait. Tu n'es pas là pour la réparer. Le changement le plus profond dans ces habitudes doit venir d'elle, mais tu veux être utile plutôt que dans le passage.",
      "Tu as le droit d'avoir tes propres limites. Soutenir la réduction de quelqu'un ne veut pas dire porter tout son poids. La meilleure chose que tu puisses faire, c'est rester toi-même.",
    ],

    howHeading: "Comment en parler",
    howIntro:
      "Si tu en parles, parles-en dans un moment où personne n'est défoncé ni dans un après-coup, dans un endroit privé, quand personne n'a besoin de partir. Fais court.",
    howBullets: [
      "Pars de ce que tu remarques, pas d'un diagnostic. « J'ai remarqué que tu restes plus à la maison » atterrit différemment de « tu as un problème ».",
      "Demande ce qu'elle veut, pas ce que toi tu veux pour elle. « Qu'est-ce qui ressemblerait à une victoire pour toi dans un mois ? » ouvre une porte. « Tu devrais arrêter » en ferme une.",
      "Admets que tu ne sais pas tout. Tu ne le sais pas. La plupart des gens qui fument ne sont pas en crise, et un plan de réduction à son rythme n'est pas un échec du tien.",
      "Propose un soutien concret, pas une inquiétude vague. « Tu veux que je t'écrive le jeudi soir, l'heure où tu fumes d'habitude ? » est plus utile que « je m'inquiète ».",
      "Laisse-la mener le rythme. Si elle veut y réfléchir une semaine, ce n'est pas du retardement — c'est exactement comme ce genre de changement fonctionne.",
    ],

    notHeading: "Ce qu'il ne faut pas faire",
    notIntro:
      "Tout ceci part d'une bonne intention. Tout ceci rend les choses pires, parce que ça te transforme d'une personne qui se soucie en un problème à gérer.",
    notBullets: [
      "Pas d'intervention. Point. Pour les addictions lourdes c'est déjà controversé ; pour quelqu'un qui fume le soir, c'est une embuscade qui te coûtera la relation avant de lui coûter l'habitude.",
      "Ne menace pas de partir comme un levier. Si tu pars, pars pour toi. L'utiliser comme pression lui apprend juste à te le cacher.",
      "Ne jette pas son cannabis, ne le cache pas, ne fouille pas. Tout ça est une trahison qui dure plus longtemps que la conversation.",
      "Ne parle pas à ses amis, ses parents ou son patron « pour son bien » sans son accord. C'est une ligne qu'on ne refranchit pas.",
      "N'envoie pas d'articles, d'apps ou de captures d'écran (y compris celui-ci) sans une phrase de toi à côté. Un lien nu est un reproche en contrebande.",
    ],

    forwardHeading: "Un message que tu peux faire suivre",
    forwardIntro:
      "Si tu veux partager ce site avec elle, envoie quelque chose comme ça. Tu peux le copier tel quel ou changer les mots pour que ça sonne comme toi. L'important, c'est qu'elle te voie d'abord et le lien ensuite.",
    forwardMessage:
      "Hé — je suis tombée sur ce site et j'ai pensé à toi. Pas une thérapie, pas une intervention, juste un compagnon calme pour les gens qui fument et veulent comprendre leur propre rythme. Pas d'inscription, rien qui me revient. N'ouvre que si tu as envie.",
    forwardCopyLabel: "Copier ce message",
    forwardCopiedLabel: "Copié",

    backHome: "Retour à la page principale",
  },

  nl: {
    metaTitle: "Voor iemand van wie je houdt — een korte gids",
    metaDescription:
      "Eén pagina voor partners, ouders en vrienden van iemand die cannabis gebruikt. Hoe je erover praat zonder te beschuldigen. Wat je niet moet doen. En een bericht dat je kunt doorsturen.",

    kicker: "Jij bent niet hun therapeut",
    heroH1: "Voor iemand van wie je houdt.",
    heroLead:
      "Deze ene pagina is voor jou — de partner, de ouder, de broer of zus, de vriend. Je hebt gemerkt dat er iets mis is. Je wilt helpen zonder het erger te maken. Je kent ze beter dan welke website dan ook; dit is een rustig playbook, geen protocol.",

    whoHeading: "Voor wie dit is",
    whoParagraphs: [
      "Iemand die je dierbaar is gebruikt cannabis vaker dan jij gezond vindt — of vaker dan die persoon zelf wil. Je bent er niet om ze te repareren. De diepste verandering in deze patronen moet van hen komen, maar je wilt behulpzaam zijn in plaats van in de weg.",
      "Je mag eigen grenzen hebben. Iemand steunen in minderen betekent niet elk gewicht ervan dragen. Het beste wat je kunt doen is jezelf blijven.",
    ],

    howHeading: "Hoe je erover praat",
    howIntro:
      "Als je het ter sprake brengt, doe het op een moment dat niemand stoned of katerig is, op een rustige plek, als niemand hoeft weg te gaan. Hou het kort.",
    howBullets: [
      "Begin met wat je ziet, niet met een diagnose. „Ik heb gemerkt dat je meer thuisblijft” komt anders binnen dan „je hebt een probleem”.",
      "Vraag wat zij willen, niet wat jij voor hen wilt. „Wat zou voor jou als een overwinning aanvoelen over een maand?” opent een deur. „Je zou moeten stoppen” sluit er een.",
      "Geef toe dat je niet alles weet. Je weet het niet. De meesten die blowen zitten niet in een crisis, en een reductieplan in hun tempo is geen falen van jou.",
      "Bied concrete steun, geen vage zorg. „Wil je dat ik je donderdagavond app, de tijd dat je meestal blowt?” is nuttiger dan „ik maak me zorgen”.",
      "Laat hen het tempo bepalen. Als ze er een week over willen nadenken, is dat geen uitstel — zo werkt verandering op dit niveau.",
    ],

    notHeading: "Wat niet te doen",
    notIntro:
      "Dit is allemaal goed bedoeld. Het maakt het ook allemaal erger, omdat het je van iemand die om ze geeft verandert in een probleem dat gemanaged moet worden.",
    notBullets: [
      "Geen interventie. Punt. Voor zware verslavingen is het al controversieel; voor iemand die 's avonds blowt is het een hinderlaag die je de relatie kost voor het ze de gewoonte kost.",
      "Dreig niet weg te gaan als drukmiddel. Als je weggaat, ga dan voor jezelf. Het als druk gebruiken leert ze alleen om het voor je te verbergen.",
      "Gooi hun cannabis niet weg, verstop het niet, snuffel niet. Dat alles is een vertrouwensbreuk die langer duurt dan het gesprek.",
      "Praat niet met hun vrienden, ouders of baas „voor hun bestwil” zonder hun toestemming. Dat is een lijn waar je niet terug over kunt.",
      "Stuur geen artikelen, apps of screenshots (ook deze niet) zonder er een zin van jezelf bij te zetten. Een kale link is een smokkelverwijt.",
    ],

    forwardHeading: "Een bericht om door te sturen",
    forwardIntro:
      "Als je deze site met ze wilt delen, stuur iets als dit. Je kunt het letterlijk kopiëren of de woorden aanpassen zodat het klinkt als jij. Het punt is dat ze eerst jou zien en dan de link.",
    forwardMessage:
      "Hey — ik kwam deze site tegen en moest aan je denken. Geen therapie, geen interventie, gewoon een rustige metgezel voor mensen die blowen en hun eigen patroon willen begrijpen. Geen aanmelding, niks dat bij mij terechtkomt. Open het alleen als je wilt.",
    forwardCopyLabel: "Bericht kopiëren",
    forwardCopiedLabel: "Gekopieerd",

    backHome: "Terug naar de hoofdpagina",
  },
};
