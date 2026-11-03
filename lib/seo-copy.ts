// Content for the three SEO landing pages shipped as audit P1.7 on
// 3 November 2026. Each page targets a phrase a frozen or panicking young
// adult actually types into Google at 2am:
//
//   /too-high-what-to-do   English, broad: UK / IE / US / AU
//   /zu-high-was-tun       German: DE / AT / CH
//   /greened-out           English, slang: UK / AU in particular
//
// These are static reassurance pages, NOT a chat. Fix (the chat) is reachable
// via one CTA per page. The language is designed to meet a scared person in
// the first 90 seconds of their worst 20 minutes:
//   1. Reassurance: "you're not dying, this passes"
//   2. What's actually happening (demedicalized, honest, cited)
//   3. Three concrete things that help in the next 10 minutes
//   4. The unambiguous red flags that DO warrant calling for help
//   5. One soft CTA to Fix / waitlist
//
// Clinical posture
// Every claim about cannabis physiology on these pages matches public-health
// language published by Health Canada, NHS Talk to Frank, and the US CDC.
// Nothing frames cannabis use as safe or desirable. Nothing prescribes dose,
// timing or future use. The red-flag list mirrors what P0.2 (fix/risk-
// heart-racing-demote) just taught lib/risk.ts: a racing heart alone is not
// an emergency; chest pain, numb arm, can't-breathe, fainting, collapse, and
// suicidal thinking are. If these pages ever drift from lib/risk.ts, the
// safety story contradicts itself — keep them in step.

export type SeoLocale = "en" | "de";

export type SeoLandingContent = {
  slug: string;
  locale: SeoLocale;
  /** HTML <title> and metadata description. Written for people searching, not
   *  for the brand — "What to do if you're too high — honest, 60 seconds"
   *  outranks "FreezeFix: supportive software". */
  metaTitle: string;
  metaDescription: string;
  /** The alternate page's URL for the hreflang pair. Keeps Google in sync. */
  hreflangAlt?: { href: string; locale: string };
  /** The reassurance kicker + hero. */
  kicker: string;
  heroH1: string;
  heroLead: string;
  /** "What's actually happening" — honest physiology, cited.
   *  cite is a short attribution line (public health body) shown as a quiet
   *  footnote, not a scientific citation block. */
  whatSection: {
    heading: string;
    paragraphs: string[];
    cite: string;
  };
  /** Three things that help in 10 min. Numbered, imperative, concrete. */
  threeThings: {
    heading: string;
    intro: string;
    items: Array<{ title: string; body: string }>;
  };
  /** The red-flag list. These are the ONLY cases that warrant the emergency
   *  wall / 112 / 988. Must match lib/risk.ts R1-R7 exactly in intent. */
  whenToCall: {
    heading: string;
    intro: string;
    items: string[];
    /** Local emergency number + crisis line. For German page, 112 + 3114.
     *  For English pages, we list a short multi-country stub rather than
     *  pretending to know the reader's country. */
    emergencyLine: string;
  };
  /** Soft CTA — never commands "sign up", never a countdown. */
  cta: {
    heading: string;
    body: string;
    primary: { href: string; label: string };
    secondary: { href: string; label: string } | null;
  };
  /** A one-line banner above the hero disclosing what Fix is. Shown on every
   *  SEO page so a stranger arriving from search knows the context before
   *  reading the reassurance. */
  productDisclosure: string;
};

export const SEO_PAGES: SeoLandingContent[] = [
  // ────────────────────────────────────────────────────────────────────
  // 1. /too-high-what-to-do — English, broad reach
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "too-high-what-to-do",
    locale: "en",
    metaTitle: "Too high — what to do (honest, 60 seconds)",
    metaDescription:
      "A calm, honest guide to a cannabis greenout. What is happening, three things that help in the next ten minutes, and the handful of signs that actually mean call for help. No judgment. Adults 18+.",
    hreflangAlt: { href: "/zu-high-was-tun", locale: "de-DE" },
    kicker: "If you just searched this at 2am",
    heroH1: "You're too high. This passes.",
    heroLead:
      "You are not dying. Nobody has ever died from only cannabis. The next twenty minutes feel long because your body is working through more than it was comfortable with, not because something is going wrong. Breathe. Keep reading.",
    whatSection: {
      heading: "What is actually happening",
      paragraphs: [
        "You took in more THC than your body is comfortable with right now. Your heart rate goes up a bit. Your blood pressure can swing. Time feels stretched. Thoughts can spiral into things that would not normally bother you. It can feel like a cardiac event. It is not; it is the chemistry working through, and it tapers off on its own.",
        "For most people, inhaled cannabis peaks at around 20–30 minutes and the heaviest feelings ease within an hour or two. Edibles can run longer — three to six hours before the strongest part is behind you — because your gut and liver release the dose more slowly. Either way, the direction is down. You are already past the hardest part by the time you finish reading this.",
      ],
      cite:
        "Timings in line with public guidance from Health Canada, the US CDC, and NHS Talk to Frank.",
    },
    threeThings: {
      heading: "Three things that help in the next ten minutes",
      intro:
        "Pick one. You do not need to do all three. The goal is to lower the volume on what your body is doing, not to fix it instantly.",
      items: [
        {
          title: "Sit, water, slower breath",
          body:
            "Sit somewhere soft. Drink a few sips of water. Breathe out for longer than you breathe in — four in, six out, five rounds. Longer out-breath tells your nervous system the danger has passed, even if your head still thinks it hasn't.",
        },
        {
          title: "Change the room",
          body:
            "Dim the lights. Turn the music down or off. If you were lying down and feel worse, sit up. If you were standing and feel worse, sit down. Pets, familiar blankets, a window cracked for cool air — all small, all help.",
        },
        {
          title: "Something cold on your face",
          body:
            "Cold water on your face, or an ice cube held in your hand, triggers a reflex that slows a racing heart. It is a single-step physical interrupt that often shifts the whole feeling by a few degrees. Nothing dramatic — just a reset.",
        },
      ],
    },
    whenToCall: {
      heading: "When to actually call for help",
      intro:
        "A racing heart on its own is almost never an emergency after a smoke. The signs below are different — they are the ones that mean call now, not later. Trust them, not the feeling that everything is wrong.",
      items: [
        "Chest pain, pressure, or a tight feeling that doesn't let up",
        "An arm (especially the left) going numb or tingling",
        "You genuinely can't catch a breath, not just the feeling of not breathing right",
        "You've fainted, blacked out, or feel you're about to pass out and can't stay sitting",
        "Someone with you has collapsed or will not wake up",
        "You're thinking about ending your life or hurting yourself",
      ],
      emergencyLine:
        "If any of those are true: call your local emergency number (999 in the UK, 112 across Europe, 911 in the US and Canada, 000 in Australia). Suicide and crisis lines are also free, 24/7: 116 123 (UK and IE Samaritans), 988 (US), 13 11 14 (Lifeline AU).",
    },
    cta: {
      heading: "If you want someone to talk to right now",
      body:
        "Fix is a private AI companion for exactly this moment. No sign-up, no account, no name required. Not therapy, not a doctor, not an emergency service — just a calm first step while the chemistry works through.",
      primary: { href: "/app", label: "Open Fix" },
      secondary: { href: "/", label: "What FreezeFix is" },
    },
    productDisclosure:
      "This page is from GetFreezeFix.com — a privacy-first companion for adults 18+ who use cannabis. Not therapy, not a doctor, not an emergency service.",
  },

  // ────────────────────────────────────────────────────────────────────
  // 2. /zu-high-was-tun — German
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "zu-high-was-tun",
    locale: "de",
    metaTitle: "Zu high — was tun? (ehrlich, 60 Sekunden)",
    metaDescription:
      "Ein ruhiger, ehrlicher Leitfaden für einen Cannabis-Greenout. Was gerade passiert, drei Dinge, die in den nächsten zehn Minuten helfen, und die wenigen Anzeichen, die wirklich bedeuten: Hilfe holen. Kein Urteil. Ab 18.",
    hreflangAlt: { href: "/too-high-what-to-do", locale: "en" },
    kicker: "Wenn du das gerade um 2 Uhr nachts gesucht hast",
    heroH1: "Du bist zu high. Das geht vorbei.",
    heroLead:
      "Du stirbst nicht. Niemand ist je an Cannabis allein gestorben. Die nächsten zwanzig Minuten fühlen sich lang an, weil dein Körper mit mehr arbeitet, als ihm gerade angenehm ist — nicht, weil etwas schiefläuft. Atme. Lies weiter.",
    whatSection: {
      heading: "Was gerade wirklich passiert",
      paragraphs: [
        "Du hast mehr THC aufgenommen, als dein Körper gerade bequem verarbeitet. Dein Puls steigt. Der Blutdruck schwankt. Zeit fühlt sich gedehnt an. Gedanken drehen sich um Sachen, die dich sonst nicht so beschäftigen würden. Es kann sich wie ein Herzproblem anfühlen. Es ist keins — es ist die Chemie, die durchläuft, und sie geht von selbst zurück.",
        "Bei den meisten Menschen erreicht geraucht konsumiertes Cannabis nach etwa 20–30 Minuten den stärksten Punkt und die intensivsten Gefühle lassen in ein bis zwei Stunden nach. Edibles brauchen länger — drei bis sechs Stunden, bis der stärkste Teil vorbei ist — weil Magen und Leber die Dosis langsamer freisetzen. In beiden Fällen geht die Richtung nach unten. Bis du das hier zu Ende gelesen hast, bist du schon ein Stück weiter.",
      ],
      cite:
        "Zeitangaben orientieren sich an öffentlichen Informationen von Health Canada, der US CDC und NHS Talk to Frank.",
    },
    threeThings: {
      heading: "Drei Dinge, die in den nächsten zehn Minuten helfen",
      intro:
        "Such dir eines aus. Du musst nicht alle drei machen. Das Ziel ist, die Lautstärke von dem, was dein Körper gerade macht, leiser zu drehen — nicht, es sofort zu stoppen.",
      items: [
        {
          title: "Hinsetzen, Wasser, langsamer atmen",
          body:
            "Setz dich auf etwas Weiches. Trink ein paar Schlucke Wasser. Atme länger aus als ein — vier Sekunden rein, sechs raus, fünf Runden. Ein längeres Ausatmen sagt deinem Nervensystem, dass die Gefahr vorbei ist, auch wenn dein Kopf das noch nicht glaubt.",
        },
        {
          title: "Veränder den Raum",
          body:
            "Mach das Licht dunkler. Musik leiser oder aus. Wenn du gelegen hast und es schlimmer wird, setz dich auf. Wenn du gestanden hast und es schlimmer wird, setz dich hin. Haustier, vertraute Decke, kurz das Fenster auf für frische Luft — klein, aber hilft.",
        },
        {
          title: "Etwas Kaltes aufs Gesicht",
          body:
            "Kaltes Wasser ins Gesicht oder ein Eiswürfel in der Hand löst einen Reflex aus, der einen schnellen Puls runterbringt. Ein einzelner körperlicher Impuls, der oft reicht, um das Gesamtgefühl ein paar Grad zu drehen. Nichts Dramatisches — ein Reset.",
        },
      ],
    },
    whenToCall: {
      heading: "Wann du wirklich Hilfe holen solltest",
      intro:
        "Ein schneller Puls alleine ist nach dem Rauchen so gut wie nie ein Notfall. Die Anzeichen hier unten sind anders — sie bedeuten: jetzt anrufen, nicht später. Vertrau ihnen, nicht dem Gefühl, dass alles schiefläuft.",
      items: [
        "Brustschmerzen, Druck oder ein enges Gefühl, das nicht nachlässt",
        "Ein Arm (besonders der linke) wird taub oder kribbelt",
        "Du bekommst wirklich keine Luft — nicht nur das Gefühl, nicht richtig zu atmen",
        "Du bist ohnmächtig geworden, hast einen Blackout gehabt oder kannst dich nicht mehr aufsetzen",
        "Jemand bei dir ist zusammengebrochen oder wacht nicht auf",
        "Du denkst daran, dein Leben zu beenden oder dir wehzutun",
      ],
      emergencyLine:
        "Wenn eins davon zutrifft: 112 anrufen (medizinischer Notdienst in DE/AT/CH). 3114 ist der nationale Krisendienst für Suizidprävention in Deutschland, 24/7, kostenlos und vertraulich. In Deutschland hilft auch die TelefonSeelsorge: 0800 111 0 111.",
    },
    cta: {
      heading: "Wenn du gerade mit jemandem reden willst",
      body:
        "Fix ist ein privater KI-Begleiter genau für diesen Moment. Keine Anmeldung, kein Konto, kein Name nötig. Keine Therapie, kein Arzt, kein Notdienst — nur ein ruhiger erster Schritt, während die Chemie durchläuft. Fix läuft momentan auf Englisch; Deutsch kommt als Nächstes.",
      primary: { href: "/de", label: "Zur Startseite" },
      secondary: { href: "/app", label: "Fix öffnen (Englisch)" },
    },
    productDisclosure:
      "Diese Seite kommt von GetFreezeFix.com — ein privater Begleiter für Erwachsene ab 18, die Cannabis konsumieren. Keine Therapie, kein Arzt, kein Notdienst.",
  },

  // ────────────────────────────────────────────────────────────────────
  // 3. /greened-out — English, UK/AU slang
  // ────────────────────────────────────────────────────────────────────
  {
    slug: "greened-out",
    locale: "en",
    metaTitle: "Greened out — honest 60-second guide",
    metaDescription:
      "A calm, honest guide if you've greened out. What's happening, three things that help in the next ten minutes, and the handful of signs that actually mean call for help. No judgment. Adults 18+.",
    hreflangAlt: { href: "/zu-high-was-tun", locale: "de-DE" },
    kicker: "If you just searched this at 2am",
    heroH1: "You've greened out. This passes.",
    heroLead:
      "You are not dying. Nobody has ever died from only cannabis. A greenout is horrible for twenty minutes to an hour or two, and then it stops. Breathe. Keep reading.",
    whatSection: {
      heading: "What a greenout actually is",
      paragraphs: [
        "A greenout — too much weed too fast — is your body pushing back on more THC than it was comfortable with. Heart rate up, blood pressure wobbly, time stretched, maybe nausea, maybe cold sweats, maybe the feeling that something is really wrong. It is not a cardiac event, even though it can feel exactly like one. It is the dose working through.",
        "For inhaled cannabis the heaviest part peaks at around 20–30 minutes and the worst feelings ease within an hour or two. Edibles run longer — three to six hours before the hardest bit is behind you — because the gut and liver release the dose slowly. The direction is down. You are already past the worst of it just by reading this far.",
      ],
      cite:
        "Timings in line with public guidance from Health Canada, the US CDC, and NHS Talk to Frank.",
    },
    threeThings: {
      heading: "Three things that help in the next ten minutes",
      intro:
        "Pick one. You don't need to do all three. The goal is to lower the volume on what your body is doing, not to fix it right now.",
      items: [
        {
          title: "Sit, water, slower breath",
          body:
            "Sit somewhere soft. Drink a few sips of water. Breathe out for longer than you breathe in — four in, six out, five rounds. The longer exhale tells your nervous system the danger has passed, even if your head still thinks it hasn't.",
        },
        {
          title: "Change the room",
          body:
            "Dim the lights. Turn music down or off. If you were lying down and feel worse, sit up. If you were standing and feel worse, sit down. A pet, a familiar blanket, a window cracked for cool air — all small, all help.",
        },
        {
          title: "Something cold on your face",
          body:
            "Cold water on your face, or an ice cube held in your hand, triggers a reflex that slows a racing heart. One single physical interrupt that often shifts the whole feeling by a few degrees. Nothing dramatic — a reset.",
        },
      ],
    },
    whenToCall: {
      heading: "When to actually call for help",
      intro:
        "A racing heart on its own after a smoke is almost never an emergency. The signs below are different — they're the ones that mean call now, not later. Trust them, not the feeling that everything's wrong.",
      items: [
        "Chest pain, pressure, or a tight feeling that doesn't let up",
        "An arm (especially the left) going numb or tingling",
        "You genuinely can't catch a breath, not just the feeling of not breathing right",
        "You've fainted, blacked out, or feel you're about to pass out and can't stay sitting",
        "Someone with you has collapsed or won't wake up",
        "You're thinking about ending your life or hurting yourself",
      ],
      emergencyLine:
        "If any of those are true: 999 in the UK, 112 across Europe and Ireland, 000 in Australia, 911 in the US and Canada. Free 24/7 crisis lines: 116 123 (Samaritans UK and IE), 988 (US), 13 11 14 (Lifeline AU).",
    },
    cta: {
      heading: "If you want someone to talk to right now",
      body:
        "Fix is a private AI companion for exactly this moment. No sign-up, no account, no name required. Not therapy, not a doctor, not an emergency service — just a calm first step while it works through.",
      primary: { href: "/app", label: "Open Fix" },
      secondary: { href: "/", label: "What FreezeFix is" },
    },
    productDisclosure:
      "This page is from GetFreezeFix.com — a privacy-first companion for adults 18+ who use cannabis. Not therapy, not a doctor, not an emergency service.",
  },
];

export function pageBySlug(slug: string): SeoLandingContent | undefined {
  return SEO_PAGES.find((p) => p.slug === slug);
}
