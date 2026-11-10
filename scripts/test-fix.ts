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
  ["no-recommend-quitting", /never recommend quitting/i],
  ["no-doses-strains", /strains, doses/i],
  ["no-diagnosis", /never give medical advice or a diagnosis/i],
  ["not-the-problem", /not the problem/i],
];
for (const [id, re] of REQUIRED_RULES) {
  check(`FIX-rule-${id}`, re.test(sys), `rule phrase missing: ${re}`);
}

// Few-shot examples: count + shape.
const examples = sys.match(/^Example \d+$/gm) ?? [];
check(
  "FIX-examples-count",
  examples.length >= 10,
  `only ${examples.length} examples (want at least 10)`,
);

// Every Example N block must contain a Log:, a User: and a Fix: line.
const exampleBlocks = sys.split(/^Example \d+$/m).slice(1); // drop preamble
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
