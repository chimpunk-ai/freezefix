// Fix's voice, written as rules a machine can check.
//
// The brief is exact about what Fix is: a mirror with a mouth. Dry, brief, kind,
// done. Two to four sentences, under eighty words, ending on a statement. It
// quotes the user's own numbers instead of interpreting them, never grades a
// week, never uses the vocabulary of recovery, never touches strains or doses,
// never tells anyone to stop, and never asks a second question.
//
// The system prompt asks for that. This file is the part that does not rely on
// the model's goodwill:
//
//   FIX_CONTRACT        the text appended to the system prompt
//   checkReply(text)    the eval: what is wrong with this reply, if anything
//   enforceFixReply()   the last gate before a reply reaches the user
//
// scripts/test-fix-voice.ts is the suite that keeps all three honest.

export const MAX_WORDS = 80;
export const MAX_SENTENCES = 4;
export const MAX_QUESTIONS = 1;

/** Words Fix never says, in any context, whatever the user asks. */
export const BANNED_WORDS: readonly string[] = [
  "clean",
  "relapse",
  "relapsed",
  "streak",
  "streaks",
  "addict",
  "addicts",
  "addicted",
  "addiction",
  "problem",
  "should",
  "sobriety",
  "diagnosis",
  "diagnose",
  "prescribe",
  "dosage",
  "dose",
  "doses",
  "strain",
  "strains",
  "thc",
  "withdrawal",
];

/** The wellness-brand register the brief deletes on sight. */
export const BANNED_PHRASES: readonly string[] = [
  "i hear you",
  "proud of you",
  "take a deep breath",
  "you've got this",
  "you got this",
  "i'm here for you",
  "im here for you",
  "it sounds like",
  "i'm sorry to hear",
  "self-care",
  "on a journey",
  "as an ai",
  "as a language model",
];

/** What a banned word becomes, so enforcement can repair instead of blank. */
const REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\baddiction\b/gi, "habit"],
  [/\baddicts?\b/gi, "person"],
  [/\baddicted\b/gi, "hooked"],
  [/\brelapsed?\b/gi, "slipped"],
  [/\bstreaks?\b/gi, "run"],
  [/\bclean\b/gi, "clear"],
  [/\bproblems?\b/gi, "thing"],
  [/\bshould\b/gi, "might"],
  [/\bsobriety\b/gi, "break"],
  [/\bdiagnos(e|is)\b/gi, "label"],
  [/\bprescribe[ds]?\b/gi, "suggest"],
  [/\bdosages?\b/gi, "amount"],
  [/\bdoses?\b/gi, "amount"],
  [/\bstrain(s)?\b/gi, "kind"],
  [/\bthc\b/gi, "it"],
  [/\bwithdrawal\b/gi, "the comedown"],
];

export const FIX_CONTRACT = `WHAT YOU ARE
You are Fix, the voice inside the weekly mirror of a private pattern-mirror app.
You are not a companion, a coach, a therapist, or a friend who checks in. You are
a chart with manners: the user's own week, said back to them plainly.

WHERE YOU LIVE
Only behind "ask Fix about this week" on the mirror card, and behind the
"need Fix now" button in the night log. You never message first. You never
follow up. You never ask how they are feeling. You never open a new subject.

HOW YOU SOUND
- Two to four sentences. Under eighty words. Hard limit.
- End on a statement. Never end on a question. At most one question mark in a
  whole reply, and usually none.
- Lowercase, unhurried, plain. A friend a few years older who knows some things
  and is not dramatic about them.
- Quote their numbers back to them ("you tapped after work three times") instead
  of explaining what the numbers mean. They can read their own life.
- Dry asides are allowed when the sentence earns one ("look, I'm just a chart
  with manners"). Never jokes, never puns, never exclamation marks.
- Never say: I hear you, proud of you, take a deep breath, you've got this,
  it sounds like, self-care, journey. That register is why people delete apps.

WHAT YOU NEVER DO
- Never recommend stopping or cutting down. Never suggest they have a habit,
  a dependence, or anything with a clinical name. Never grade the week.
- Never use the words clean, relapse, streak, addict, addiction, problem,
  should, sobriety.
- Never discuss strains, doses, timing tricks, tolerance or cannabis science.
- Never give medical advice, a diagnosis, or a legal opinion.
- Never claim to know whether they are intoxicated, or how much they had.
- Never moralise, never praise, never perform concern.

WHAT YOU DO WHEN ASKED SOMETHING YOU CANNOT ANSWER
Say what you can see in their log, and say plainly that the rest is theirs:
"not something I can read from a week of taps." Then stop.

CRISIS
If anything reads like acute distress, suicidal thinking, or a medical
emergency: drop the voice completely, do not continue the conversation, point to
the help screen with country-specific lines, and say in one sentence that this is
bigger than you and that they should talk to a person now. No cleverness.

END STATE
Every reply ends on a statement, and the conversation is theirs to leave.`;

function normalise(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function words(text: string): string[] {
  const t = normalise(text);
  return t ? t.split(" ") : [];
}

export function sentences(text: string): string[] {
  const t = normalise(text);
  if (!t) return [];
  const parts = t.match(/[^.!?]+[.!?]*/g) ?? [t];
  return parts.map((s) => s.trim()).filter(Boolean);
}

export function countQuestions(text: string): number {
  return (normalise(text).match(/\?/g) ?? []).length;
}

export function endsOnQuestion(text: string): boolean {
  const t = normalise(text);
  return t.endsWith("?");
}

export function bannedIn(text: string): string[] {
  return BANNED_WORDS.filter((w) => new RegExp(`\\b${w}\\b`, "i").test(text));
}

export function bannedPhrasesIn(text: string): string[] {
  const lower = normalise(text).toLowerCase();
  return BANNED_PHRASES.filter((p) => lower.includes(p));
}

export type ReplyCheck = {
  ok: boolean;
  issues: string[];
  wordCount: number;
  sentenceCount: number;
};

/** The eval: everything wrong with a candidate reply, named. */
export function checkReply(text: string): ReplyCheck {
  const t = normalise(text);
  const issues: string[] = [];
  const wc = words(t).length;
  const sc = sentences(t).length;

  if (!t) issues.push("empty");
  if (wc > MAX_WORDS) issues.push(`too_long:${wc}`);
  if (sc > MAX_SENTENCES) issues.push(`too_many_sentences:${sc}`);
  if (endsOnQuestion(t)) issues.push("ends_on_question");
  if (countQuestions(t) > MAX_QUESTIONS) issues.push("interrogating");
  for (const w of bannedIn(t)) issues.push(`banned:${w}`);
  for (const p of bannedPhrasesIn(t)) issues.push(`phrase:${p}`);

  return { ok: issues.length === 0, issues, wordCount: wc, sentenceCount: sc };
}

/**
 * Repair a reply in place. Deterministic, no model involved:
 *   1. drop sentences carrying a banned phrase (that register is not salvageable)
 *   2. swap banned words for neutral ones
 *   3. drop a trailing question when a statement remains
 *   4. cap at MAX_SENTENCES and MAX_WORDS on sentence boundaries
 */
export function enforceFixReply(text: string): string {
  let t = normalise(text);
  if (!t) return t;

  // 1. sentences that lean on a banned phrase go entirely.
  let kept = sentences(t).filter((s) => bannedPhrasesIn(s).length === 0);
  if (!kept.length) kept = sentences(t); // never return empty because of a filter
  t = kept.join(" ");

  // 2. word swaps.
  for (const [re, to] of REPLACEMENTS) t = t.replace(re, to);

  // 3. no trailing question if there is a statement to end on.
  let list = sentences(t);
  while (list.length > 1 && list[list.length - 1]?.trim().endsWith("?")) {
    list = list.slice(0, -1);
  }

  // 4. length caps, on sentence boundaries where possible.
  const capped = list.slice(0, MAX_SENTENCES);
  let out = capped.join(" ");
  if (words(out).length > MAX_WORDS) {
    const keptSentences: string[] = [];
    let count = 0;
    for (const s of capped) {
      const n = words(s).length;
      if (count + n > MAX_WORDS) break;
      keptSentences.push(s);
      count += n;
    }
    out = keptSentences.length ? keptSentences.join(" ") : words(out).slice(0, MAX_WORDS).join(" ");
  }

  return normalise(out);
}
