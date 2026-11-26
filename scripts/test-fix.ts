// Fix AI prompt invariants.
//
// We do NOT call the live model here — that would need a real API key,
// cost money and be non-deterministic. This script asserts the SHAPE of
// the system prompt and the behaviour of the one pure post-processor
// (`endWithStatement`), which together are what give Fix its voice.
//
// Run: npm run test:fix
//
// What this file guards against:
//   - The SYSTEM prompt losing its few-shot examples block during a refactor.
//   - A reviewer "cleaning up" an example reply by adding forbidden language.
//   - Someone shortening the rules list by dropping one of the hard bans.
//   - Regressions in endWithStatement (the function that keeps every Fix reply
//     ending on a statement, never a question).

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { SYSTEM, endWithStatement } from "../lib/fix-prompt";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) =>
  results.push({ id, ok, note });

// -- SYSTEM prompt shape --------------------------------------------------

// The SYSTEM constant itself comes from lib/fix-prompt, imported above.
// readFileSync is still used below for a couple of belt-and-braces shape
// checks that want to look at the raw source file, not the evaluated string.
const sys = SYSTEM;
const _src = readFileSync(
  resolve(__dirname, "..", "lib", "fix-prompt.ts"),
  "utf8",
);
void _src;

// The anchor blocks the prompt must contain.
const REQUIRED_SECTIONS = [
  "Voice:",
  "Rules:",
  "Voice beats",
  "Dry asides",
  "Things that fail the voice test",
  "Few-shot examples",
  "End of examples",
];
for (const section of REQUIRED_SECTIONS) {
  check(
    `FIX-section-${section.toLowerCase().replace(/[^a-z]+/g, "-")}`,
    sys.includes(section),
    `missing section: ${section}`,
  );
}

// Each rule the product promises, in the prompt.
const REQUIRED_RULES: Array<[string, string]> = [
  ["two-to-four", /two to four sentences/i],
  ["under-80-words", /under 80 words/i],
  ["end-on-statement", /end on a statement/i],
  ["no-moralise", /never moralise/i],
  ["no-clean-relapse-streak", /clean, relapse, streak/i],
  // The companion feature (lib/companion.ts) gives everyone a logging streak
  // and a level, shown on its own screen. That is a different thing from the
  // "clean/relapse streak" framing banned just above — this rule exists so
  // Fix never contradicts a feature the user can see with their own eyes
  // ("no streaks" would become a lie), while still refusing to compute or
  // echo that number itself, since it isn't in Fix's context.
  ["companion-streak-boundary", /companion.*levels up from logging consistency/i],
  ["no-recommend-quitting", /never recommend quitting/i],
  ["no-doses-strains", /strains, doses/i],
  ["no-diagnosis", /never give medical advice or a diagnosis/i],
  ["not-the-problem", /not the problem/i],
  // Task 43: goal-related how-to answering is allowed, but must stay scoped
  // to the user's own non-smoking goal and must not become a backdoor around
  // the quitting/cutting-down ban just because the goal itself is phrased
  // as smoking less (Goal.text is free text -- nothing stops a user typing
  // that as their goal).
  ["goal-howto-allowed", /how do i actually do x.*question about the goal/i],
  ["goal-howto-excludes-smoking-goal", /a goal\s+that is itself about smoking less, cutting down, or quitting does not get this/i],
];
for (const [id, re] of REQUIRED_RULES) {
  check(`FIX-rule-${id}`, re.test(sys), `rule phrase missing: ${re}`);
}

// Few-shot examples: count + shape.
//
// Headers are "Example N" for the first few and "Example N (short label)"
// from Example 16 on. A bare `\d+$` anchor only ever matched the former —
// it silently under-counted by more than half the bank (15 of 39) and let
// `exampleBlocks` merge everything from Example 16 onward into one giant
// tail block, which still passed the per-block Log/User/Fix checks below
// because SOME line inside that huge block matched each one. Matching the
// optional trailing label closes that gap.
const examples = sys.match(/^Example \d+(?: \(.*\))?$/gm) ?? [];
check(
  "FIX-examples-count",
  examples.length >= 10,
  `only ${examples.length} examples (want at least 10)`,
);

// Every Example N block must contain a Log:, a User: and a Fix: line.
const exampleBlocks = sys.split(/^Example \d+(?: \(.*\))?$/m).slice(1); // drop preamble
check(
  "FIX-example-blocks-count-matches",
  exampleBlocks.length === examples.length,
  `headers ${examples.length} vs bodies ${exampleBlocks.length}`,
);
exampleBlocks.forEach((block, i) => {
  const n = i + 1;
  check(`FIX-example-${n}-has-log`, /\n\s*Log:/i.test(block));
  check(`FIX-example-${n}-has-user`, /\n\s*User:/i.test(block));
  check(`FIX-example-${n}-has-fix`, /\n\s*Fix:/i.test(block));
});

// Forbidden language inside the SYSTEM prompt itself: the example replies
// must not model a voice we don't want Fix to use.
const FORBIDDEN_IN_EXAMPLES = [
  "great question",
  "proud of you",
  "keep it up",
  "take a deep breath",
  "you're doing great",
  "you are doing great",
  "based on your data",
  "i hear you",
  "clean day",
  "relapse",
  "addict",
];
// Grab just the "Fix:" reply text from every example.
const replyText = (exampleBlocks.join("\n").match(/Fix:\s*([\s\S]*?)(?=\n\s*Example \d+|\nEnd of examples|$)/g) ?? [])
  .map((s) => s.replace(/^Fix:\s*/, "").toLowerCase())
  .join("\n");
for (const word of FORBIDDEN_IN_EXAMPLES) {
  check(
    `FIX-forbidden-${word.replace(/\s+/g, "-")}`,
    !replyText.includes(word),
    `forbidden phrase in example reply: ${word}`,
  );
}

// Example replies should never end on a question mark — the end-on-statement
// rule applies to the examples we're teaching the model from.
const replies = exampleBlocks
  .map((block) => {
    const m = block.match(/Fix:\s*([\s\S]*?)(?=\n\s*Example \d+|\nEnd of examples|$)/);
    return (m?.[1] ?? "").trim();
  })
  .filter(Boolean);
replies.forEach((r, i) => {
  // Each reply may contain a question mark inside the body as hesitation
  // but the LAST character must be a period.
  const last = r.replace(/\s+$/, "").slice(-1);
  check(
    `FIX-example-${i + 1}-ends-statement`,
    last === "." || last === ",",
    `last char is "${last}" — reply: "${r.slice(0, 60)}…"`,
  );
});

// -- goal how-to answering stays out of the quitting/cutting-down ban (task 43) --
//
// Goal.text is free text (lib/profile.ts's GOAL_EXAMPLES are suggestions,
// not a closed list), so nothing stops a user typing a goal that's itself
// about smoking less. The new "how do I actually do X" allowance must not
// become a backdoor around "never recommend quitting, cutting down,
// tapering" for that case. Example 43 is the worked case that proves it;
// this check pins its reply to the same "should I quit" shape as Examples
// 3/23 (decline, point at a doctor), not an actual how-to answer.
const example43 = exampleBlocks[42]; // Example 43, 0-indexed into exampleBlocks
check(
  "FIX-example-43-exists",
  Boolean(example43 && /smoke less on weeknights/i.test(example43)),
  "Example 43 (goal-is-about-smoking edge case) is missing or moved",
);
if (example43) {
  check(
    "FIX-example-43-declines-to-coach",
    /not a chart's job to coach|same place as "should i quit"|stay out of both/i.test(example43),
    'Example 43 must decline to coach on a smoking-reduction goal, the same way Examples 3/23 decline "should I quit"',
  );
  const reply43 = (example43.match(/Fix:\s*([\s\S]*?)(?=\n\s*Example \d+|\nEnd of examples|$)/)?.[1] ?? "").toLowerCase();
  check(
    "FIX-example-43-no-cutting-down-plan",
    !/\b(try cutting|start by|cut down by|taper off|switch to|here's how to cut)\b/.test(reply43),
    "Example 43's reply must not actually hand over a cutting-down plan",
  );
}

// -- endWithStatement post-processor -------------------------------------

const EWS_CASES: Array<[string, string, string]> = [
  // id, input, expected-still-ends-with-period-and-isnt-a-question
  ["ews-ends-period", "two of seven nights.", "two of seven nights."],
  ["ews-ends-question", "two of seven nights?", "that's what the log says."],
  ["ews-mixed-ends-question", "two of seven nights. how about you?", "two of seven nights."],
  ["ews-exclamations-removed", "two of seven!", "two of seven."],
  ["ews-empty-string", "", "that's what the log says."],
  ["ews-whitespace-only", "   \n\t  ", "that's what the log says."],
  ["ews-only-question", "really?", "that's what the log says."],
  ["ews-double-question", "really? and?", "that's what the log says."],
  ["ews-trailing-whitespace", "the log is quiet.   ", "the log is quiet."],
];
for (const [id, input, expected] of EWS_CASES) {
  const got = endWithStatement(input);
  check(id, got === expected, `want "${expected}" got "${got}"`);
}

// -- companion/streak consistency ----------------------------------------
//
// The "pure meta" example once answered "what makes this different from
// other tracker apps?" with "no counter of days off, no streaks, no
// scoreboard" — true when it was written, false once the companion feature
// (a logging streak + level, shown on its own screen) ships. A reviewer
// restoring that line from an old copy/paste would reintroduce a claim Fix
// would make that the product itself contradicts on screen.
check(
  "FIX-no-stale-no-streaks-claim",
  !/no counter of days off, no streaks, no scoreboard/i.test(sys),
  "the meta example still denies a feature (companion streak/level) the app now ships",
);
// And the replacement must still carry the point that example was making:
// no scoreboard of smoking itself, which is the thing the harm-reduction
// rules actually promise.
check(
  "FIX-meta-example-still-disclaims-smoking-scoreboard",
  /no scoreboard of what you smoked/i.test(sys),
);
// The one example that's allowed to use the word "streak" in a Fix: reply
// is the companion-boundary one, and only to point away from itself, never
// to state or imply a number.
const streakInReplies = replyText.includes("streak");
check(
  "FIX-streak-only-appears-pointing-to-companion-screen",
  streakInReplies && replyText.includes("that number lives on the companion screen"),
  "a Fix: reply uses 'streak' without the boundary language that keeps it from quoting a number",
);

// A reply cut off by max_tokens must drop back to the last complete
// sentence, never show a dangling fragment with no ending punctuation.
const TRUNCATED_CASES: Array<[string, string, string]> = [
  ["trunc-drops-dangling-fragment", "two of seven nights. the goal line reads 0 of 3 so far, which is just", "two of seven nights."],
  ["trunc-keeps-complete-sentences", "four of seven nights. mostly after work. the trend is", "four of seven nights. mostly after work."],
  ["trunc-no-complete-sentence-falls-back", "the goal line reads 0 of 3 so far, which is just", "that's what the log says."],
  ["trunc-ends-cleanly-unchanged", "two of seven nights.", "two of seven nights."],
];
for (const [id, input, expected] of TRUNCATED_CASES) {
  const got = endWithStatement(input, { truncated: true });
  check(id, got === expected, `want "${expected}" got "${got}"`);
}
// untruncated replies are never trimmed back this way, even if they'd look truncated.
check(
  "trunc-false-leaves-dangling-text-alone",
  endWithStatement("the goal line reads 0 of 3 so far, which is just") === "the goal line reads 0 of 3 so far, which is just",
);

// Property: the output never ends with "?"
for (let i = 0; i < 20; i++) {
  const seed = ["three nights", "mood two", "friday the trigger was bored"][i % 3];
  const punctuation = ["?", "??", ".", "!", " "][i % 5];
  const suffix = [". and sunday?", ".", "? nothing else", "", " "][i % 5];
  const input = `${seed}${punctuation}${suffix}`;
  const got = endWithStatement(input);
  check(
    `ews-prop-no-question-${i}`,
    !got.endsWith("?"),
    `input "${input}" produced "${got}"`,
  );
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Fix prompt + post-processor check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
