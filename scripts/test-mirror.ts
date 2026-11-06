import { buildMirror, mondayOf, weekKeyOf } from "../lib/mirror";
import { todayISO } from "../lib/checkins";

// The weekly mirror is the one magic moment in the product, and the only part of it a
// browser cannot reach: past nights cannot be backfilled ("nothing from before now is
// counted"), so a real browser can only ever show the empty state. These checks seed the
// device store directly and read what the engine says about complete weeks.
//
// The point is not coverage for its own sake. Every sentence the mirror prints is a claim
// about the user's own week, so the checks are: does it count correctly, and does it ever
// claim something it has no data for? Run: npm run test:mirror
const store = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  },
};

const KEYS = ["ff_checkins", "ff_wins_log", "ff_goal", "ff_thing", "ff_mirrors", "ff_nights"];
function reset() {
  for (const k of KEYS) store.delete(k);
}

/** Sunday 8 November 2026 — the last night of a complete Monday→Sunday week. */
const SUNDAY = new Date(2026, 10, 8, 12, 0, 0);
/** Wednesday 4 November 2026 — mid-week, with nights still to come. */
const WEDNESDAY = new Date(2026, 10, 4, 12, 0, 0);

type Answer = "yes" | "no" | null;

/** Write a week of check-ins, Monday first. `null` leaves that night unlogged.
 *  Merges into whatever is already stored, so a prior week can be seeded alongside. */
function seedWeek(now: Date, answers: Answer[]) {
  const start = mondayOf(now);
  const log: Record<string, "yes" | "no"> = JSON.parse(store.get("ff_checkins") ?? "{}");
  answers.forEach((a, i) => {
    if (!a) return;
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    log[todayISO(d)] = a;
  });
  store.set("ff_checkins", JSON.stringify(log));
}

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

/* ── dates ─────────────────────────────────────────────────────────────── */

check(mondayOf(SUNDAY).getDay() === 1, "mondayOf(Sunday) must land on a Monday");
check(weekKeyOf(SUNDAY) === "2026-11-02", `weekKeyOf wrong: ${weekKeyOf(SUNDAY)}`);

/* ── a first full week, with nothing before it ─────────────────────────── */

reset();
seedWeek(SUNDAY, ["yes", "yes", "no", "yes", "no", "yes", "no"]);
const first = buildMirror(SUNDAY);

check(first.smoked === 4, `smoked count wrong: ${first.smoked}`);
check(first.recorded === 7, `recorded count wrong: ${first.recorded}`);
check(first.remaining === 0, `no nights should remain on a Sunday: ${first.remaining}`);
check(first.hasEnough, "seven logged nights is enough to speak");
check(first.nights.length === 7, "the grid is always seven nights");
check(
  first.sentence === "You logged 7 of the last seven nights, and smoked on 4.",
  `sentence wrong: ${first.sentence}`,
);
check(first.direction === null, "there is no earlier week, so there is no direction");

// The bug this file was written for. On someone's very first week there is no previous
// week to be the same as, so the mirror must not imply one exists.
check(
  !/same as the last one/i.test(first.observation),
  `first week must not claim sameness with a week it has never seen: ${first.observation}`,
);
check(
  /(no earlier week|first week|nothing to compare)/i.test(first.observation),
  `first week should say why it has nothing to compare: ${first.observation}`,
);

/* ── too thin to say anything ──────────────────────────────────────────── */

reset();
seedWeek(SUNDAY, ["yes", "no", null, null, null, null, null]);
const thin = buildMirror(SUNDAY);
check(!thin.hasEnough, "two logged nights is not a shape yet");
check(
  thin.sentence === "You've logged 2 nights so far. 1 more and the shape starts to show.",
  `thin sentence wrong: ${thin.sentence}`,
);
check(thin.direction === null, "thin week must not offer a direction");

/* ── a week with something to compare against ──────────────────────────── */

reset();
seedWeek(new Date(2026, 10, 1, 12, 0, 0), ["yes", "yes", "no", "no", "no", "no", null]); // 2 of 6
seedWeek(SUNDAY, ["yes", "yes", "no", "yes", "no", "yes", "no"]); // 4 of 7
const more = buildMirror(SUNDAY);
check(more.direction === "2 more than last week", `direction wrong: ${more.direction}`);
check(
  more.observation === "That's 2 more than the week before. Weeks move. Nothing here is a verdict.",
  `comparison observation wrong: ${more.observation}`,
);

reset();
seedWeek(new Date(2026, 10, 1, 12, 0, 0), ["yes", "yes", "yes", "yes", "yes", "no", null]); // 5 of 6
seedWeek(SUNDAY, ["yes", "yes", "no", "yes", "no", "yes", "no"]); // 4 of 7
const fewer = buildMirror(SUNDAY);
check(fewer.direction === "1 fewer than last week", `direction wrong: ${fewer.direction}`);
check(
  fewer.observation.startsWith("That's 1 fewer than the week before."),
  `fewer observation wrong: ${fewer.observation}`,
);

// Identical weeks: here "the same as last week" is a real observation, not a guess.
reset();
seedWeek(new Date(2026, 10, 1, 12, 0, 0), ["yes", "yes", "no", "yes", "no", "no", null]); // 3 of 6
seedWeek(SUNDAY, ["yes", "yes", "no", "yes", "no", "no", null]); // 3 of 7
const same = buildMirror(SUNDAY);
check(same.direction === "the same as last week", `direction wrong: ${same.direction}`);
check(
  /same as the last one/i.test(same.observation),
  `a genuinely identical week should say so: ${same.observation}`,
);

/* ── an empty week ─────────────────────────────────────────────────────── */

reset();
const empty = buildMirror(SUNDAY);
check(empty.recorded === 0 && empty.smoked === 0, "empty week must count nothing");
check(!empty.hasEnough, "empty week has nothing to say");
check(
  empty.sentence.startsWith("Nothing logged this week yet."),
  `empty sentence wrong: ${empty.sentence}`,
);
check(
  empty.nights.every((n) => n.smoked === null),
  "unlogged nights must be null, not a guess at 'no'",
);

/* ── mid-week: the nights still to come ────────────────────────────────── */

reset();
seedWeek(WEDNESDAY, ["yes", "no", "yes", null, null, null, null]);
const mid = buildMirror(WEDNESDAY);
check(mid.remaining === 4, `four nights remain on a Wednesday: ${mid.remaining}`);
check(
  mid.nights.slice(0, 3).every((n) => !n.future),
  "the first three nights have happened",
);
check(
  mid.nights.slice(3).every((n) => n.future),
  "the last four nights are still to come, so the grid dims them",
);
check(
  mid.nights.map((n) => n.initial).join("") === "MTWTFSS",
  `weekday initials wrong: ${mid.nights.map((n) => n.initial).join("")}`,
);

/* ── the voice rules, on every sentence the engine can emit ────────────── */

const BANNED = /\b(should|streak|relapse|clean|well done|you've got this|grade|score)\b|!/i;
for (const [label, m] of Object.entries({ first, thin, more, fewer, same, empty, mid })) {
  for (const [field, text] of Object.entries({
    sentence: m.sentence,
    observation: m.observation,
    direction: m.direction ?? "",
    thingLine: m.thingLine ?? "",
  })) {
    check(!BANNED.test(text), `${label}.${field} breaks the voice rules: ${text}`);
  }
}

/* ── the nightly detail (lib/nights) ───────────────────────────────────── */

/** Write mood faces and trigger chips for specific days, leaving other days alone. */
function seedNights(entries: Record<string, { mood?: number; triggers?: string[] }>) {
  const all: Record<string, unknown> = JSON.parse(store.get("ff_nights") ?? "{}");
  for (const [day, meta] of Object.entries(entries)) all[day] = meta;
  store.set("ff_nights", JSON.stringify(all));
}

/** Monday → Sunday of the seeded week, at noon so a DST shift cannot move the date. */
function weekDay(i: number) {
  const m = mondayOf(SUNDAY);
  return todayISO(new Date(m.getFullYear(), m.getMonth(), m.getDate() + i, 12, 0, 0));
}

// The nightly tap carries its own trigger chips, so the mirror's trigger sentence has
// to work without the user ever opening the journal.
reset();
seedWeek(SUNDAY, ["yes", "yes", "yes", "no", "no", "no", "no"]);
seedNights({
  [weekDay(0)]: { triggers: ["after-work"] },
  [weekDay(1)]: { triggers: ["after-work"] },
  [weekDay(2)]: { triggers: ["boredom"] },
});
const nightly = buildMirror(SUNDAY);
check(
  nightly.sentence.includes("after work"),
  `nightly triggers never reached the sentence: ${nightly.sentence}`,
);

// "nothing really" is a way of saying "no trigger", not a pattern to report back.
reset();
seedWeek(SUNDAY, ["yes", "yes", "yes", "yes", "yes", "yes", "yes"]);
seedNights({
  [weekDay(0)]: { triggers: ["none"] },
  [weekDay(1)]: { triggers: ["none"] },
  [weekDay(2)]: { triggers: ["none"] },
});
const nothingReally = buildMirror(SUNDAY);
check(
  !/nothing really/i.test(nothingReally.sentence),
  `"nothing really" must never be reported as a pattern: ${nothingReally.sentence}`,
);

// The mood comparison only speaks when both sides have at least two faces.
reset();
seedWeek(SUNDAY, ["yes", "yes", "yes", "yes", "no", "no", "no"]);
seedNights({
  [weekDay(0)]: { mood: 2 },
  [weekDay(1)]: { mood: 2 },
  [weekDay(2)]: { mood: 3 },
  [weekDay(3)]: { mood: 2 },
  [weekDay(4)]: { mood: 4 },
  [weekDay(5)]: { mood: 5 },
  [weekDay(6)]: { mood: 4 },
});
const moody = buildMirror(SUNDAY);
check(
  /mood face/i.test(moody.observation),
  `mood comparison never appeared: ${moody.observation}`,
);

// One clean night is not a comparison. It must stay quiet.
reset();
seedWeek(SUNDAY, ["yes", "yes", "no", "yes", "yes", "yes", "yes"]);
seedNights({
  [weekDay(0)]: { mood: 4 },
  [weekDay(1)]: { mood: 4 },
  [weekDay(2)]: { mood: 1 },
});
const thinMood = buildMirror(SUNDAY);
check(
  !/mood face/i.test(thinMood.observation),
  `a single clean night must not read as a mood pattern: ${thinMood.observation}`,
);

for (const [label, m] of Object.entries({ nightly, nothingReally, moody, thinMood })) {
  for (const [field, text] of Object.entries({
    sentence: m.sentence,
    observation: m.observation,
    direction: m.direction ?? "",
  })) {
    check(!BANNED.test(text), `${label}.${field} breaks the voice rules: ${text}`);
  }
}

console.log(
  "Mirror: counts, direction, first-week honesty, nightly triggers, mood and voice all behave",
);
