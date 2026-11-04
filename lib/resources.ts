// Crisis and emergency resources.
// SOURCE: FreezeFix Safety Pack v1.0, sections 3 and 6. Verified by Safety & Trust on 15 Oct 2026.
// RE-CHECK BY: 15 Jan 2027, and before every new country launch.
// This is the ONLY place phone numbers live. The AI never types a number itself.
//
// France added 3 November 2026 (feat/resources-fr, Europe-audit P1.6). Every FR
// number below is verified against sante.fr, the French Ministry of Health's
// authoritative page, on 3 November 2026:
//   3114            — sante.fr/node/3485559 (24/7, free, confidential)
//   SOS Amitié      — same page (FR + EN lines, chat 13h-3h)
//   Drogues Info Service — sante.fr/node/798461 (anonymous, confidential)
//   Fil Santé Jeunes     — sante.fr/node/8130029 (ages 12-25, 9h-23h, free)
//
// Australia added 4 November 2026 (fix/safety-audit-wave) from the 15-persona
// audit — Priya (Melbourne, 25, GAD) flagged that an Australian tapping "Get
// help now" was being handed 000 (burning building) and findahelpline.com (a
// shrug) because AU was in the OTHER bucket. 000 for a 2am anxiety spiral is
// a shrug from a mental-health product. Every AU number below is verified
// against healthdirect.gov.au/mental-health-helplines (the Australian
// Government's official mental-health helpline directory) on 4 November 2026:
//   Lifeline           — 13 11 14, 24/7, crisis counselling (text + chat too)
//   Beyond Blue        — 1300 22 4636, 24/7 (chat too)
//   Kids Helpline      — 1800 55 1800, 24/7, FREE confidential (ages up to 25)
//   13YARN             — 13 92 76, 24/7, FREE (Aboriginal + Torres Strait Islander)
//   Suicide Call Back  — 1300 659 467, 24/7
//
// Spain + Italy added 4 November 2026 (feat/es-it-locales) from the 15-persona
// audit — Maria (Madrid) and Nina (Milan) were previously served OTHER with
// only findahelpline.com, which is a shrug for a Spanish or Italian user at
// 2am. Verified 4 November 2026:
//   ES — 024, Spain's national suicide-prevention line, run by the Ministry
//        of Health. 24/7, free. Telephone interpreting for other languages
//        and video interpreting for sign language. Source: prevencionsuicidio
//        .som360.org / sanidad.gob.es.
//   ES — Teléfono de la Esperanza, 717 003 717. Listening line, free, long
//        running Spanish non-profit. Source: same page.
//   IT — Telefono Amico Italia, 02 2327 2327. Confidential anonymous emotional-
//        support line run by volunteers; covers anxiety, loneliness, self-harm,
//        suicide. Source: findahelpline.com/organizations/telefono-amico-italia.
//   IT — Telefono Azzurro, 19696. Free line for minors. Source: Il Sole 24 Ore
//        feature on Telefono Azzurro's 39th anniversary.
//   IT — 114. 24/7 emergency line for situations of immediate danger to a
//        child. Source: same.

export type CountryCode = "GB" | "US" | "IE" | "NL" | "DE" | "FR" | "ES" | "IT" | "AU" | "IN" | "OTHER";

export type Contact = {
  label: string; // what the line is, shown to the user
  display: string; // how the number/text looks on screen
  tel?: string; // digits for a tel: link
  sms?: { to: string; body?: string }; // for an sms: link
  url?: string; // for chat links
  note?: string; // hours / cost
  // One short, factual sentence explaining what the service is, for services
  // that aren't instantly recognisable to a first-time user. Shown under the
  // label. Keep under about 15 words; no marketing, no emotional claims. If a
  // service is well-known in its country (Samaritans, 999, Childline), leave
  // this unset.
  blurb?: string;
};

export type CountryResources = {
  name: string;
  emergency: Contact;
  crisis: Contact[]; // 24/7 talk lines first, then text options
  urgentMentalHealth: Contact[]; // used on the psychosis screen
  substances: Contact[]; // used on the mixed-substances screen
  youth: Contact[]; // under-18 screen
  youthNightBackup?: Contact; // shown when the youth line isn't 24/7
};

export const RESOURCES: Record<CountryCode, CountryResources> = {
  GB: {
    name: "United Kingdom",
    emergency: { label: "Emergency", display: "999", tel: "999", note: "24/7, free" },
    crisis: [
      { label: "Samaritans", display: "116 123", tel: "116123", note: "24/7, free from any phone" },
      { label: "Shout (text)", display: "Text SHOUT to 85258", sms: { to: "85258", body: "SHOUT" }, note: "24/7, free on major networks" },
      { label: "Lifeline (Northern Ireland)", display: "0808 808 8000", tel: "08088088000", note: "24/7, free" },
    ],
    urgentMentalHealth: [
      { label: "NHS 111, mental health option (England, Wales)", display: "111", tel: "111", note: "24/7, free" },
      { label: "NHS 24 Mental Health Hub (Scotland)", display: "111", tel: "111", note: "24/7, free" },
      { label: "Lifeline (Northern Ireland)", display: "0808 808 8000", tel: "08088088000", note: "24/7, free" },
    ],
    substances: [
      // Safety Pack: show the free Samaritans line above FRANK. FRANK costs money and may show on a bill.
      { label: "Samaritans", display: "116 123", tel: "116123", note: "24/7, free" },
      { label: "FRANK (drug questions)", display: "0300 123 6600", tel: "03001236600", note: "24/7; not free, may show on your bill" },
      { label: "FRANK (text)", display: "Text 82111", sms: { to: "82111" }, note: "May show on your bill" },
    ],
    youth: [{ label: "Childline (under 19)", display: "0800 1111", tel: "08001111", note: "Free, not on your phone bill" }],
    youthNightBackup: { label: "Samaritans", display: "116 123", tel: "116123", note: "24/7, free" },
  },
  US: {
    name: "United States",
    emergency: { label: "Emergency", display: "911", tel: "911", note: "24/7, free" },
    crisis: [
      { label: "988 Suicide & Crisis Lifeline", display: "Call or text 988", tel: "988", note: "24/7, free", blurb: "The US national suicide and crisis lifeline, run by SAMHSA." },
      { label: "988 text", display: "Text 988", sms: { to: "988" }, note: "24/7, free" },
      { label: "988 chat", display: "chat.988lifeline.org", url: "https://chat.988lifeline.org", note: "24/7, free" },
    ],
    urgentMentalHealth: [
      { label: "988 Suicide & Crisis Lifeline", display: "Call or text 988", tel: "988", note: "24/7, free", blurb: "The US national suicide and crisis lifeline, run by SAMHSA." },
    ],
    substances: [
      { label: "Poison Help", display: "1-800-222-1222", tel: "18002221222", note: "24/7, free", blurb: "A free US line for any medication, chemical, or overdose worry." },
      { label: "988 Lifeline (covers drug and alcohol worries)", display: "988", tel: "988", note: "24/7, free" },
    ],
    youth: [{ label: "988 (call or text, all ages)", display: "988", tel: "988", note: "24/7, free" }],
  },
  IE: {
    name: "Ireland",
    emergency: { label: "Emergency", display: "112 or 999", tel: "112", note: "24/7, free" },
    crisis: [
      { label: "Samaritans", display: "116 123", tel: "116123", note: "24/7, free" },
      { label: "Pieta", display: "1800 247 247", tel: "1800247247", note: "24/7, free to call", blurb: "Irish charity offering free crisis counselling and bereavement support." },
      { label: "Pieta (text)", display: "Text HELP to 51444", sms: { to: "51444", body: "HELP" }, note: "Standard text rate" },
      { label: "Text line (HSE)", display: "Text HELLO to 50808", sms: { to: "50808", body: "HELLO" }, note: "24/7, free", blurb: "A free text-based support service from Ireland's HSE." },
    ],
    urgentMentalHealth: [
      { label: "Pieta", display: "1800 247 247", tel: "1800247247", note: "24/7, free", blurb: "Irish charity offering free crisis counselling and bereavement support." },
      { label: "Samaritans", display: "116 123", tel: "116123", note: "24/7, free" },
    ],
    substances: [{ label: "Samaritans", display: "116 123", tel: "116123", note: "24/7, free" }],
    youth: [
      { label: "Childline (up to 18)", display: "1800 66 66 66", tel: "1800666666", note: "24/7, free" },
      { label: "Childline (text)", display: "Text 50101", sms: { to: "50101" }, note: "24/7, free" },
      { label: "Childline (chat)", display: "childline.ie", url: "https://www.childline.ie", note: "24/7, free" },
    ],
  },
  NL: {
    name: "Netherlands",
    emergency: { label: "Emergency", display: "112", tel: "112", note: "24/7, free" },
    crisis: [
      { label: "113 Zelfmoordpreventie", display: "113", tel: "113", note: "24/7, free, anonymous", blurb: "The Dutch national suicide-prevention line." },
      { label: "113 chat", display: "113.nl/chat", url: "https://www.113.nl/chat", note: "24/7, free, anonymous" },
    ],
    urgentMentalHealth: [{ label: "113", display: "113", tel: "113", note: "24/7, free, anonymous", blurb: "The Dutch national suicide-prevention line." }],
    substances: [{ label: "113", display: "113", tel: "113", note: "24/7, free, anonymous", blurb: "The Dutch national suicide-prevention line." }],
    youth: [
      { label: "De Kindertelefoon (8–18)", display: "0800-0432", tel: "08000432", note: "Free, anonymous; daytime and evening", blurb: "A free Dutch listening line for children and teens." },
      { label: "De Kindertelefoon (chat)", display: "kindertelefoon.nl", url: "https://www.kindertelefoon.nl", note: "Daytime and evening" },
    ],
    youthNightBackup: { label: "113", display: "113", tel: "113", note: "24/7, free" },
  },
  DE: {
    name: "Germany",
    emergency: { label: "Emergency (medical)", display: "112 (police 110)", tel: "112", note: "24/7, free" },
    crisis: [
      { label: "TelefonSeelsorge", display: "0800 111 0 111", tel: "08001110111", note: "24/7, free", blurb: "Germany's main free listening line, run by a non-profit." },
      { label: "TelefonSeelsorge", display: "0800 111 0 222", tel: "08001110222", note: "24/7, free" },
      { label: "TelefonSeelsorge", display: "116 123", tel: "116123", note: "24/7, free" },
    ],
    urgentMentalHealth: [
      { label: "TelefonSeelsorge", display: "0800 111 0 111", tel: "08001110111", note: "24/7, free", blurb: "Germany's main free listening line, run by a non-profit." },
      { label: "Doctor on call (not life-threatening)", display: "116117", tel: "116117", note: "Out of hours, free", blurb: "Germany's out-of-hours medical on-call service." },
    ],
    substances: [
      { label: "Doctor on call (not life-threatening)", display: "116117", tel: "116117", note: "Out of hours, free", blurb: "Germany's out-of-hours medical on-call service." },
      { label: "TelefonSeelsorge", display: "0800 111 0 111", tel: "08001110111", note: "24/7, free" },
    ],
    youth: [{ label: "Nummer gegen Kummer", display: "116 111", tel: "116111", note: "Mon–Sat 14:00–20:00, free, anonymous", blurb: "A free German listening line for children and teens." }],
    youthNightBackup: { label: "TelefonSeelsorge", display: "116 123", tel: "116123", note: "24/7, free" },
  },
  FR: {
    name: "France",
    emergency: { label: "Emergency (medical)", display: "112 (SAMU 15, police 17)", tel: "112", note: "24/7, free" },
    crisis: [
      { label: "3114 — National suicide prevention", display: "3114", tel: "3114", note: "24/7, free, confidential", blurb: "France's national suicide-prevention line, run by the Ministry of Health." },
      { label: "SOS Amitié", display: "09 72 39 40 50", tel: "0972394050", note: "24/7, French; call cost of a local number", blurb: "A long-running French listening line, in French." },
      { label: "SOS Amitié (English)", display: "01 46 21 46 46", tel: "0146214646", note: "English-speaking line", blurb: "The English-language line run by SOS Amitié, for callers who prefer English." },
      { label: "SOS Amitié chat", display: "sos-amitie.com", url: "https://www.sos-amitie.com", note: "13:00–03:00, 7 days a week" },
    ],
    urgentMentalHealth: [
      { label: "3114 — National suicide prevention", display: "3114", tel: "3114", note: "24/7, free, confidential", blurb: "France's national suicide-prevention line, run by the Ministry of Health." },
    ],
    substances: [
      // Drug-specific anonymous line first, then the general crisis line as a
      // calm backup. Hours per sante.fr: answers every day; the widely
      // published 8h-2h window is left out here because sante.fr does not
      // confirm it. The call being free is also left unstated for the same
      // reason — the service is anonymous and confidential, which is what
      // sante.fr does confirm.
      { label: "Drogues Info Service", display: "0 800 23 13 13", tel: "0800231313", note: "Every day, anonymous, confidential", blurb: "A free French information line for drug use and addiction worries." },
      { label: "3114", display: "3114", tel: "3114", note: "24/7, free, confidential" },
    ],
    youth: [
      // Fil Santé Jeunes serves ages 12-25, which covers most of our under-18
      // bucket. It is not 24/7 (9h-23h), so 3114 is the night backup.
      { label: "Fil Santé Jeunes (12–25)", display: "0 800 235 236", tel: "0800235236", note: "9:00–23:00, free, anonymous", blurb: "A free French listening line for young people, run with the Ministry of Health." },
    ],
    youthNightBackup: { label: "3114", display: "3114", tel: "3114", note: "24/7, free, confidential" },
  },
  ES: {
    name: "Spain",
    emergency: { label: "Emergency", display: "112", tel: "112", note: "24/7, free" },
    crisis: [
      { label: "024 — Línea de atención al suicidio", display: "024", tel: "024", note: "24/7, free, confidential", blurb: "Spain's national suicide-prevention line, run by the Ministry of Health." },
      { label: "Teléfono de la Esperanza", display: "717 003 717", tel: "717003717", note: "Free", blurb: "A long-running Spanish listening line run by a non-profit." },
    ],
    urgentMentalHealth: [
      { label: "024 — Línea de atención al suicidio", display: "024", tel: "024", note: "24/7, free, confidential", blurb: "Spain's national suicide-prevention line, run by the Ministry of Health." },
    ],
    substances: [
      { label: "024 — Línea de atención al suicidio", display: "024", tel: "024", note: "24/7, free, confidential", blurb: "Spain's national suicide-prevention line, run by the Ministry of Health." },
      { label: "Teléfono de la Esperanza", display: "717 003 717", tel: "717003717", note: "Free" },
    ],
    youth: [
      { label: "024 (all ages)", display: "024", tel: "024", note: "24/7, free, confidential", blurb: "Spain's national suicide-prevention line." },
    ],
    youthNightBackup: { label: "024", display: "024", tel: "024", note: "24/7, free" },
  },
  IT: {
    name: "Italy",
    emergency: { label: "Emergency", display: "112", tel: "112", note: "24/7, free" },
    crisis: [
      { label: "Telefono Amico Italia", display: "02 2327 2327", tel: "0223272327", note: "Anonymous, confidential", blurb: "An Italian emotional-support line run by volunteers; anxiety, loneliness, self-harm, suicide." },
    ],
    urgentMentalHealth: [
      { label: "Telefono Amico Italia", display: "02 2327 2327", tel: "0223272327", note: "Anonymous, confidential", blurb: "An Italian emotional-support line run by volunteers." },
    ],
    substances: [
      { label: "Telefono Amico Italia", display: "02 2327 2327", tel: "0223272327", note: "Anonymous, confidential", blurb: "An Italian emotional-support line run by volunteers." },
    ],
    youth: [
      { label: "Telefono Azzurro (under 18)", display: "19696", tel: "19696", note: "Free", blurb: "Italy's main free listening line for minors, run by a national non-profit." },
    ],
    youthNightBackup: { label: "114 — Emergency line for children", display: "114", tel: "114", note: "24/7", blurb: "Italy's emergency line for situations of immediate danger to a child." },
  },
  AU: {
    name: "Australia",
    emergency: { label: "Emergency", display: "000", tel: "000", note: "24/7, free, national" },
    crisis: [
      { label: "Lifeline", display: "13 11 14", tel: "131114", note: "24/7, crisis counselling", blurb: "Australia's main crisis-support and suicide-prevention line." },
      { label: "Lifeline (text)", display: "Text 0477 13 11 14", sms: { to: "0477131114" }, note: "24/7, standard text rate" },
      { label: "Lifeline (chat)", display: "lifeline.org.au/crisis-chat", url: "https://www.lifeline.org.au/crisis-chat/", note: "24/7" },
      { label: "Beyond Blue", display: "1300 22 4636", tel: "1300224636", note: "24/7", blurb: "Australian mental-health line for anxiety, depression and support." },
      { label: "Suicide Call Back Service", display: "1300 659 467", tel: "1300659467", note: "24/7" },
      { label: "13YARN (Aboriginal + Torres Strait Islander)", display: "13 92 76", tel: "139276", note: "24/7, free, confidential", blurb: "First Nations crisis support, by First Nations counsellors." },
    ],
    urgentMentalHealth: [
      { label: "Lifeline", display: "13 11 14", tel: "131114", note: "24/7, crisis counselling", blurb: "Australia's main crisis-support and suicide-prevention line." },
      { label: "Beyond Blue", display: "1300 22 4636", tel: "1300224636", note: "24/7", blurb: "Australian mental-health line for anxiety, depression and support." },
    ],
    substances: [
      // AU has no single dedicated cannabis line; the National Alcohol and
      // Other Drug Hotline redirects callers to each state/territory's own
      // ADIS line. The direct-dial state hotlines are below, selected to
      // cover the biggest populations; the AU-wide number sits above them.
      { label: "National Alcohol and Other Drug Hotline", display: "1800 250 015", tel: "1800250015", note: "24/7, free, confidential", blurb: "The AU-wide line that routes you to your state's own drug and alcohol service." },
      { label: "Lifeline", display: "13 11 14", tel: "131114", note: "24/7" },
    ],
    youth: [
      { label: "Kids Helpline (5–25)", display: "1800 55 1800", tel: "1800551800", note: "24/7, free, confidential", blurb: "Australia's free 24/7 counselling service for ages 5–25." },
      { label: "Kids Helpline (chat + email)", display: "kidshelpline.com.au", url: "https://kidshelpline.com.au/", note: "24/7, free" },
    ],
    youthNightBackup: { label: "Lifeline", display: "13 11 14", tel: "131114", note: "24/7" },
  },
  IN: {
    name: "India",
    emergency: { label: "Emergency", display: "112", tel: "112", note: "24/7, free, national", blurb: "India's single national emergency number (police, fire, medical)." },
    crisis: [
      { label: "Tele-MANAS", display: "14416", tel: "14416", note: "24/7, free, about 20 languages", blurb: "India's national government mental-health helpline, launched by the Ministry of Health in 2022." },
      { label: "Tele-MANAS", display: "1-800-891-4416", tel: "18008914416", note: "24/7, free", blurb: "Toll-free backup number for the same Tele-MANAS service." },
    ],
    urgentMentalHealth: [{ label: "Tele-MANAS", display: "14416", tel: "14416", note: "24/7, free", blurb: "India's national government mental-health helpline." }],
    substances: [{ label: "Tele-MANAS", display: "14416", tel: "14416", note: "24/7, free", blurb: "India's national government mental-health helpline, which also handles substance worries." }],
    youth: [{ label: "Child Helpline", display: "1098", tel: "1098", note: "24/7, free", blurb: "India's national free helpline for children in distress." }],
    youthNightBackup: { label: "Tele-MANAS", display: "14416", tel: "14416", note: "24/7, free" },
  },
  // Outside the six verified countries: never show a UK or US number.
  // Show the local emergency number (from the standard list below, if we know it) plus findahelpline.com.
  OTHER: {
    name: "Somewhere else",
    emergency: { label: "Your local emergency number", display: "Local emergency number", note: "" },
    crisis: [{ label: "Find a free helpline near you", display: "findahelpline.com", url: "https://findahelpline.com", note: "", blurb: "An international directory of free, verified helplines, run by ThroughLine." }],
    urgentMentalHealth: [{ label: "Find a free helpline near you", display: "findahelpline.com", url: "https://findahelpline.com", note: "", blurb: "An international directory of free, verified helplines, run by ThroughLine." }],
    substances: [{ label: "Find a free helpline near you", display: "findahelpline.com", url: "https://findahelpline.com", note: "", blurb: "An international directory of free, verified helplines, run by ThroughLine." }],
    youth: [{ label: "Find a free helpline near you", display: "findahelpline.com", url: "https://findahelpline.com", note: "", blurb: "An international directory of free, verified helplines, run by ThroughLine." }],
  },
};

// Standard national emergency numbers for countries outside the verified six.
// These are well-known national numbers, not crisis lines.
export const OTHER_EMERGENCY_NUMBERS: Record<string, string> = {
  AT: "112", BE: "112", BG: "112", HR: "112", CY: "112", CZ: "112", DK: "112", EE: "112",
  FI: "112", FR: "112", GR: "112", HU: "112", IT: "112", LV: "112", LT: "112", LU: "112",
  MT: "112", PL: "112", PT: "112", RO: "112", SK: "112", SI: "112", ES: "112", SE: "112",
  NO: "112", IS: "112", CH: "112",
  CA: "911", MX: "911",
  AU: "000", NZ: "111", ZA: "112",
};

export const VERIFIED_COUNTRIES: CountryCode[] = ["GB", "US", "IE", "NL", "DE", "FR", "ES", "IT", "AU", "IN"];

export type ResolvedResources = CountryResources & { code: CountryCode; region: string };

// Turns a region code (e.g. "FR") into the resources to show.
export function resourcesFor(region: string): ResolvedResources {
  const upper = (region || "").toUpperCase();
  if ((VERIFIED_COUNTRIES as string[]).includes(upper)) {
    return { ...RESOURCES[upper as CountryCode], code: upper as CountryCode, region: upper };
  }
  const base = RESOURCES.OTHER;
  const num = OTHER_EMERGENCY_NUMBERS[upper];
  return {
    ...base,
    code: "OTHER",
    region: upper,
    emergency: num
      ? { label: "Emergency", display: num, tel: num, note: "24/7" }
      : base.emergency,
  };
}

// Urgent "see a doctor today" lines for the R9 doctor screen (Safety Pack section 2, 16 Oct).
// Only the UK and Germany have one; elsewhere the screen shows the emergency button only.
export const DOCTOR_LINES: Partial<Record<CountryCode, Contact>> = {
  GB: { label: "NHS 111", display: "111", tel: "111", note: "24/7, free" },
  DE: { label: "Doctor on call (not life-threatening)", display: "116117", tel: "116117", note: "Out of hours, free" },
};

// Ready text for "Message someone I trust" (Safety Pack section 2). Opens the phone's own messages app.
export const TRUSTED_MESSAGE = "Hey, I'm not feeling great. Can you call me or come over?";
