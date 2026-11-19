// The Cannabis Behaviour Profile: a one-time reflection built from the
// onboarding answers, shown right before the free week starts.
//
// This is deliberately NOT a claim about patterns in a log that doesn't
// exist yet — there are no logged nights when onboarding finishes, so
// "your mood is lower on smoke nights" would be an invented fact. Instead
// this takes what the person just told us in their own onboarding answers
// (what weed gets in the way of, when they usually smoke, how often, what
// they've tried before, their one small goal) and reflects it back as a
// short, structured profile. The "wow" is being seen accurately from five
// honest questions, not a fabricated analysis.
//
// Once a week of real log nights exists, the Sunday card (lib/pattern.ts)
// takes over as the thing that actually measures them — this profile is
// the bridge between "I just answered some questions" and "the mirror
// knows something real about me."

import type { Goal } from "./profile";
import { TRIGGER_LABEL, type TriggerId } from "./entry";

export type BehaviourProfile = {
  /** "your most common trigger" line, from preferredTriggers / interferesWith. */
  triggerLine: string;
  /** "how often" line, from frequency. */
  frequencyLine: string;
  /** "when" line, from smokeTime. */
  timingLine: string;
  /** "what it's getting in the way of" line, from interferesWith. */
  interferesLine: string | null;
  /** "what you've tried before" line, from triedCuttingDown. */
  historyLine: string | null;
  /** "your one thing" line, from goal. */
  goalLine: string | null;
};

function joinNatural(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

export function buildBehaviourProfile(input: {
  name: string;
  interferesWith: string[];
  smokeTime: string;
  preferredTriggers: TriggerId[];
  frequency: string;
  triedCuttingDown: string;
  goal: Goal | null;
}): BehaviourProfile {
  const who = input.name.trim() || "you";

  const triggerNames = input.preferredTriggers.slice(0, 2).map((t) => TRIGGER_LABEL[t]);
  const triggerLine = triggerNames.length
    ? `the chips you picked to lead with: ${joinNatural(triggerNames)}. that's usually the honest answer to "why tonight."`
    : "no trigger chips picked yet — the log will find them for you.";

  const frequencyLine = input.frequency
    ? `by your own count, ${input.frequency}.`
    : "frequency: not said yet.";

  const timingLine = input.smokeTime
    ? `mostly ${input.smokeTime === "varies, honestly" ? "no fixed time" : input.smokeTime}.`
    : "no particular time named yet.";

  const interferesLine =
    input.interferesWith.length > 0 && !input.interferesWith.includes("nothing in particular")
      ? `${who}, you said it's quietly getting in the way of ${joinNatural(input.interferesWith)}.`
      : null;

  const historyLine = input.triedCuttingDown
    ? historySentence(input.triedCuttingDown)
    : null;

  const goalLine = input.goal
    ? `the one thing you want more of: "${input.goal.text}," ${input.goal.target}x a week.`
    : null;

  return { triggerLine, frequencyLine, timingLine, interferesLine, historyLine, goalLine };
}

function historySentence(h: string): string {
  switch (h) {
    case "tried, and it stuck for a while":
      return "you've cut down before and it held for a while — that's real evidence it's possible, not luck.";
    case "tried, and slipped back":
      return "you've tried before and slipped back. that's not a failure the mirror will hold against you — most real change is a few attempts, not one.";
    case "never really tried":
      return "you haven't really tried to cut down before. fair — this isn't built to make you.";
    case "not trying to cut down, just want to see it clearly":
      return "you're not here to cut down — just to see it clearly. the mirror holds to that.";
    default:
      return h;
  }
}
