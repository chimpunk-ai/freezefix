// Crisis and emergency resources.
// SOURCE: FreezeFix Safety Pack v1.0, sections 3 and 6. Verified by Safety & Trust on 15 Oct 2026.
// RE-CHECK BY: 15 Jan 2027, and before every new country launch.
// This is the ONLY place phone numbers live. The AI never types a number itself.

export type CountryCode = "GB" | "US" | "IE" | "NL" | "DE" | "IN" | "OTHER";

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

export const VERIFIED_COUNTRIES: CountryCode[] = ["GB", "US", "IE", "NL", "DE", "IN"];

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
