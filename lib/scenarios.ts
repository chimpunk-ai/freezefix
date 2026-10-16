import type { MomentId } from "@/lib/prompt";

// Scenario cards. Each one opens a real conversation with the situation already handed to
// Fix, so the first reply lands in the right place instead of starting from "what's up?".
//
// `context` goes into the system prompt for that session. `opener` is what Fix says first,
// written here rather than generated, so the screen fills instantly with no wait and no
// model call before the user has said anything.

export type Scenario = {
  id: string;
  moment: MomentId;
  /** Shown on the card. Their words, not ours. */
  label: string;
  /** One line under the label. */
  blurb: string;
  emoji: string;
  /** Handed to Fix as the situation. Never shown to the user. */
  context: string;
  /** Fix's first message. */
  opener: string;
  /** Taps under the opener, so nobody has to type to get going. */
  chips: string[];
  /** Only shown at the times of day it fits. 24h, inclusive start, exclusive end. */
  hours?: [number, number];
};

export const SCENARIOS: Scenario[] = [
  {
    id: "pres",
    moment: "people",
    label: "Everyone's too loud",
    blurb: "At pres and it's a lot",
    emoji: "🔊",
    context:
      "They're at a pre-drinks or a party. The room is loud and busy and they're struggling to be in it. Likely overstimulated rather than in danger.",
    opener: "Loud rooms are a lot when your head's already going. Are you stuck in the middle of it or can you get somewhere quieter?",
    chips: ["stuck in it", "could step out", "everyone's looking"],
    hours: [18, 4],
  },
  {
    id: "awkward",
    moment: "people",
    label: "I feel out of place",
    blurb: "Everyone else seems fine",
    emoji: "👀",
    context:
      "They're somewhere social and feel like they don't fit. Probably comparing their insides to everyone else's outsides.",
    opener: "That feeling of everyone else having the manual and you not. Where are you right now?",
    chips: ["someone's party", "family thing", "work thing"],
  },
  {
    id: "said",
    moment: "people",
    label: "I said something stupid",
    blurb: "Still replaying it",
    emoji: "🫠",
    context:
      "They said something they're now replaying. Classic spotlight effect. Do not tell them nobody noticed as the first move, acknowledge the replay first.",
    opener: "The replay loop. How long's it been going?",
    chips: ["about an hour", "all day", "since last night"],
  },
  {
    id: "loop",
    moment: "alone",
    label: "Same thought, hours",
    blurb: "It won't switch off",
    emoji: "🌀",
    context: "They're alone and stuck on a loop. Rumination rather than acute crisis.",
    opener: "Overthinking on your own is the worst version of it. What's the loop about?",
    chips: ["something i said", "tomorrow", "everything at once"],
  },
  {
    id: "reply",
    moment: "reply",
    label: "Can't reply to someone",
    blurb: "It's been sat there",
    emoji: "💬",
    context:
      "They have a message they can't answer. The gap has made it worse. Offer to draft actual words fairly early.",
    opener: "The longer it sits the bigger it gets. Who is it, and how long's it been?",
    chips: ["a mate", "someone i like", "my mum", "work"],
  },
  {
    id: "start",
    moment: "task",
    label: "Can't start the thing",
    blurb: "Been staring at it",
    emoji: "🧱",
    context:
      "They can't begin a task. This is a stuck start, not laziness. Aim for the smallest possible first action.",
    opener: "Staring at it counts as the hard part, weirdly. What's the thing?",
    chips: ["uni work", "job stuff", "an email", "tidying"],
  },
  {
    id: "talk",
    moment: "alone",
    label: "I just want to talk",
    blurb: "Nothing specific",
    emoji: "🌙",
    context:
      "No particular problem. They want company or a chat. Do not hunt for a problem to solve, and do not offer a move unless they ask.",
    opener: "Go on then. What's on your mind?",
    chips: ["bit of a day", "nothing really", "can't sleep"],
  },
  {
    id: "tomorrow",
    moment: "task",
    label: "Help me plan tomorrow",
    blurb: "Make it smaller",
    emoji: "🗓️",
    context:
      "They want tomorrow broken down. Aim for one to three small things, in their words, and offer a reminder at the end.",
    opener: "Alright. What's tomorrow got in it that's bothering you?",
    chips: ["too much on", "one big thing", "early start"],
  },
];

// A different question depending on the day, so the home screen isn't identical every visit.
const CHECK_INS: { day: number; line: string }[] = [
  { day: 0, line: "Sunday scaries or an alright one?" },
  { day: 1, line: "Monday. How's the head?" },
  { day: 2, line: "How's your week going so far?" },
  { day: 3, line: "Midweek. Still standing?" },
  { day: 4, line: "Nearly there. How's today been?" },
  { day: 5, line: "Friday. Anything on?" },
  { day: 6, line: "How's the weekend treating you?" },
];

export function checkInLine(now = new Date()): string {
  return CHECK_INS.find((c) => c.day === now.getDay())?.line ?? "How's it going?";
}

// Picks the cards worth showing now: time-of-day ones only when they fit, and the
// ones they've used before first, so the home screen slowly becomes theirs.
export function scenariosFor(opts: { now?: Date; recent?: string[] } = {}): Scenario[] {
  const now = opts.now ?? new Date();
  const hour = now.getHours();
  const recent = opts.recent ?? [];

  const fits = (s: Scenario) => {
    if (!s.hours) return true;
    const [from, to] = s.hours;
    return from <= to ? hour >= from && hour < to : hour >= from || hour < to;
  };

  const shown = SCENARIOS.filter(fits);
  const rank = (s: Scenario) => {
    const i = recent.indexOf(s.id);
    return i === -1 ? recent.length : i;
  };
  return [...shown].sort((a, b) => rank(a) - rank(b));
}
