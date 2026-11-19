// Checks the behaviour-profile builder: it only ever reflects back what was
// given to it (no invented numbers, no claim about a log that doesn't
// exist), and every branch of historySentence() produces real text.
// Run: npm run test:behaviour

import { buildBehaviourProfile } from "../lib/behaviour-profile";
import { CUT_DOWN_HISTORY } from "../lib/profile";
import type { TriggerId } from "../lib/entry";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });

const base = {
  name: "nico",
  interferesWith: ["the gym", "sleep"],
  smokeTime: "after work",
  preferredTriggers: ["after-work", "bored"] as TriggerId[],
  frequency: "most days",
  triedCuttingDown: "tried, and slipped back",
  goal: { text: "go for a run", target: 2, madeAt: "2026-11-10" },
};

// A full set of answers produces every line, in the person's own words —
// nothing here should claim a pattern from logged nights, since none exist.
{
  const p = buildBehaviourProfile(base);
  check("trigger-line-has-picks", p.triggerLine.includes("after work") && p.triggerLine.includes("bored"));
  check("frequency-line-has-answer", p.frequencyLine.includes("most days"));
  check("timing-line-has-answer", p.timingLine.includes("after work"));
  check("interferes-line-present", p.interferesLine !== null && p.interferesLine.includes("the gym"));
  check("history-line-present", p.historyLine !== null && p.historyLine.length > 0);
  check("goal-line-has-goal", p.goalLine !== null && p.goalLine.includes("go for a run"));
  // Never a bare claim about "your mood" or a percentage — that would be
  // inventing data from a log that has no nights in it yet.
  check("no-fabricated-mood-claim", !/\d+%/.test(JSON.stringify(p)) && !p.triggerLine.includes("mood"));
}

// Empty answers degrade honestly rather than fabricating or crashing.
{
  const p = buildBehaviourProfile({
    name: "",
    interferesWith: [],
    smokeTime: "",
    preferredTriggers: [],
    frequency: "",
    triedCuttingDown: "",
    goal: null,
  });
  check("empty-trigger-line-is-honest", p.triggerLine.includes("not") || p.triggerLine.includes("will find"));
  check("empty-interferes-is-null", p.interferesLine === null);
  check("empty-history-is-null", p.historyLine === null);
  check("empty-goal-is-null", p.goalLine === null);
}

// Every CUT_DOWN_HISTORY option produces a non-empty, distinct sentence —
// a new option added to the list without a matching case would otherwise
// silently fall through to the raw stored string.
{
  const seen = new Set<string>();
  for (const h of CUT_DOWN_HISTORY) {
    const p = buildBehaviourProfile({ ...base, triedCuttingDown: h });
    check(`history-case-${h}`, Boolean(p.historyLine) && p.historyLine!.length > 10, p.historyLine ?? "");
    if (p.historyLine) seen.add(p.historyLine);
  }
  check("history-cases-all-distinct", seen.size === CUT_DOWN_HISTORY.length);
}

// "nothing in particular" is excluded from the interferes line, same as
// everywhere else interferesWith is used.
{
  const p = buildBehaviourProfile({ ...base, interferesWith: ["nothing in particular"] });
  check("nothing-in-particular-suppressed", p.interferesLine === null);
}

const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Behaviour profile check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
