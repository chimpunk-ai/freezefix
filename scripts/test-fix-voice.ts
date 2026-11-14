// Eval suite for Fix's voice.
//
// Fix is a prompt, and a prompt is a wish. This file is the part that behaves
// like a test: a table of replies that must fail, replies that must pass, and
// the repairs enforceFixReply() has to make before anything reaches the user.
// Run: npm run test:fix

import {
  FIX_CONTRACT,
  MAX_SENTENCES,
  MAX_WORDS,
  bannedIn,
  checkReply,
  countQuestions,
  endsOnQuestion,
  enforceFixReply,
  sentences,
  words,
} from "../lib/fix-voice";

let passed = 0;
const failures: string[] = [];

function ok(name: string, cond: boolean, detail = "") {
  if (cond) passed += 1;
  else failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
}

function eq(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  ok(name, a === e, `expected ${e}, got ${a}`);
}

/* ── replies that must pass ──────────────────────────────────────────────── */

const GOOD = [
  "You tapped after work three times this week, and your mood on those nights averaged 2.1 against 3.8 when it didn't. That is a shape, not a verdict.",
  "Four smoke nights, three of them a Friday or Saturday. Weekends are doing a lot of the work in that pattern.",
  "Not something I can read from a week of taps. What I can see is that the two nights you logged nothing were the two you mentioned her.",
  "You ran once, against twice the week before. I just count; you decide what it means.",
  "Look, I'm just a chart with manners. Your mood sat at 2 on the nights you smoked and 4 on the nights you didn't, and that is the whole of what I know.",
];

for (const [i, reply] of GOOD.entries()) {
  const check = checkReply(reply);
  eq(`good reply ${i + 1} passes`, check.ok, true);
  ok(`good reply ${i + 1} reports why when it fails`, check.ok || check.issues.length > 0);
  ok(`good reply ${i + 1} is under the word cap`, check.wordCount <= MAX_WORDS, String(check.wordCount));
}

/* ── replies that must fail, and for the right reason ────────────────────── */

const BAD: Array<[string, string]> = [
  ["You should probably cut back a bit.", "banned:should"],
  ["Sounds like a relapse to me.", "banned:relapse"],
  ["That is three weeks without a streak broken.", "banned:streak"],
  ["You might be an addict.", "banned:addict"],
  ["I hear you. That sounds heavy.", "phrase:i hear you"],
  ["Proud of you for staying clean this week.", "banned:clean"],
  ["Take a deep breath and start again tomorrow.", "phrase:take a deep breath"],
  ["It's a shape. Want to talk about it?", "ends_on_question"],
  ["Why? What happened? Was it her?", "interrogating"],
  ["Your dosage is too high for that strain.", "banned:dosage"],
  ["That is a problem worth naming.", "banned:problem"],
  ["", "empty"],
];

for (const [reply, issue] of BAD) {
  const check = checkReply(reply);
  eq(`fails: ${reply.slice(0, 34) || "(empty)"}`, check.ok, false);
  ok(
    `names the issue "${issue}"`,
    check.issues.some((x) => x === issue || x.startsWith(`${issue}:`)),
    check.issues.join(", "),
  );
}

/* ── the word and sentence caps ──────────────────────────────────────────── */

{
  const long = Array.from({ length: 40 }, (_, i) => `Sentence number ${i + 1} about the week.`).join(" ");
  const check = checkReply(long);
  eq("a long reply fails", check.ok, false);
  ok("the failure names the word count", check.issues.some((i) => i.startsWith("too_long")));
  const fixed = enforceFixReply(long);
  ok("enforcement brings it under the cap", words(fixed).length <= MAX_WORDS, String(words(fixed).length));
  ok("enforcement keeps it to four sentences", sentences(fixed).length <= MAX_SENTENCES, String(sentences(fixed).length));
}

/* ── enforcement repairs rather than blanks ──────────────────────────────── */

{
  const fixed = enforceFixReply("You should stop. That is the problem.");
  eq("no banned words survive", bannedIn(fixed), []);
  ok("the reply is not blanked", fixed.length > 0, fixed);
  ok("the reply ends on a statement", !endsOnQuestion(fixed), fixed);
}

{
  const fixed = enforceFixReply("It's a shape. Want to talk about it?");
  ok("a trailing question is dropped", !endsOnQuestion(fixed), fixed);
  ok("the statement before it is kept", fixed.includes("shape"), fixed);
}

{
  const fixed = enforceFixReply("I hear you. You logged four nights this week.");
  ok("the wellness sentence is dropped", !/i hear you/i.test(fixed), fixed);
  ok("the data sentence is kept", /four nights/i.test(fixed), fixed);
}

{
  const fixed = enforceFixReply("Your addiction is showing in the streak.");
  eq("both banned words are swapped", bannedIn(fixed), []);
  ok("the swap reads as English", /habit/.test(fixed), fixed);
}

{
  const once = enforceFixReply("You should log more. It might help.");
  const twice = enforceFixReply(once);
  eq("enforcement is idempotent", twice, once);
}

{
  const fixed = enforceFixReply("");
  eq("empty in, empty out", fixed, "");
}

/* ── question counting ───────────────────────────────────────────────────── */

eq("no question marks counted", countQuestions("Four nights. That is all."), 0);
eq("two question marks counted", countQuestions("Why? When?"), 2);
ok("a reply ending in a full stop is a statement", !endsOnQuestion("That is all."));
ok("a reply ending in a question mark is not", endsOnQuestion("That is all?"));

/* ── the contract itself carries the rails ───────────────────────────────── */

const CONTRACT_MUST_SAY = [
  "under eighty words",
  "never end on a question",
  "never message first",
  "clean, relapse, streak, addict",
  "strains",
  "medical advice",
  "crisis",
];

for (const phrase of CONTRACT_MUST_SAY) {
  ok(`contract states: "${phrase}"`, FIX_CONTRACT.toLowerCase().includes(phrase), "missing");
}

ok("contract forbids recommending stopping", /never recommend stopping/i.test(FIX_CONTRACT));
ok("contract forbids grading the week", /never grade the week/i.test(FIX_CONTRACT));
ok("contract is a real instruction block", FIX_CONTRACT.length > 900, String(FIX_CONTRACT.length));

/* ── report ──────────────────────────────────────────────────────────────── */

if (failures.length) {
  console.error(`\n✗ ${failures.length} failed, ${passed} passed\n`);
  for (const f of failures) console.error(`  · ${f}`);
  process.exit(1);
}
console.log(`✓ fix voice: ${passed} checks passed`);
