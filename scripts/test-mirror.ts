// Checks the weekly mirror: the statistics behind the one card a week, when that
// card is due, and the seven-day trial clock. Run: npm run test:mirror
import { addDays, type Entries, type Entry } from "../lib/entry";
import { dueMirror, MIRROR_HOUR, weekEndFor } from "../lib/mirror";
import { goalSentence, numberWord, recentWeeks, weekStats } from "../lib/pattern";
import type { Goal } from "../lib/profile";
import { trialState, TRIAL_DAYS } from "../lib/trial";

function entry(day: string, smoked: boolean, mood: Entry["mood"], triggers: Entry["triggers"] = [], goalDone?: boolean): Entry {
  return { day, smoked, mood, triggers, goalDone, at: 0 };
}

function fill(from: string, spec: Array<[boolean, Entry["mood"], Entry["triggers"]?, boolean?]>): Entries {
  const out: Entries = {};
  spec.forEach(([smoked, mood, triggers, goalDone], i) => {
    const day = addDays(from, i);
    out[day] = entry(day, smoked, mood, triggers ?? [], goalDone);
  });
  return out;
}

const GOAL: Goal = { text: "go for a run", target: 2, madeAt: "2026-10-01" };
const SUNDAY = "2026-11-01"; // a Sunday, verified

// --- weekStats: four of seven, mostly after work -----------------------------
const week = fill("2026-10-26", [
  [true, 3, ["after-work"]],
  [true, 2, ["after-work", "bored"]],
  [false, 4],
  [true, 3, ["after-work"]],
  [false, 4],
  [true, 2, ["with-friends"]],
  [false, 3],
]);
const stats = weekStats(week, GOAL, SUNDAY);
if (stats.logged !== 7) throw new Error(`expected 7 logged nights, got ${stats.logged}`);
if (stats.smoked !== 4) throw new Error(`expected 4 smoked nights, got ${stats.smoked}`);
if (stats.notSmoked !== 3) throw new Error(`expected 3 no-smoke nights, got ${stats.notSmoked}`);
if (stats.topTrigger !== "after-work" || stats.topTriggerCount !== 3) {
  throw new Error(`expected after-work x3, got ${stats.topTrigger} x${stats.topTriggerCount}`);
}
if (!stats.sentences[0].includes("four of the seven nights")) {
  throw new Error(`first sentence must name the shape: ${stats.sentences[0]}`);
}
if (!stats.sentences.some((s) => s.includes("after work"))) {
  throw new Error("the trigger should be said out loud");
}
if (stats.cells.length !== 7 || stats.cells[6].day !== SUNDAY) {
  throw new Error("the grid must be seven nights ending on Sunday");
}
// No grade, no praise, no shame: the copy never congratulates or scolds.
const banned = /well done|great job|crush|streak|relapse|clean|should/i;
if (banned.test([...stats.sentences, stats.observation ?? "", goalSentence(stats.goalLine!)].join(" "))) {
  throw new Error("mirror copy drifted into praise or judgement");
}

// A quiet week says so without judgement.
const quiet = weekStats({}, GOAL, SUNDAY);
if (quiet.logged !== 0 || !quiet.sentences[0].includes("nothing logged")) {
  throw new Error("an empty week should say nothing was logged");
}
if (quiet.goalLine && quiet.goalLine.done !== 0) throw new Error("an empty week has no goal ticks");

// --- mood the day after ------------------------------------------------------
// The mood on a day belongs to that day, so the day AFTER a smoke night is the
// low-mood one here, and the day after a no-smoke night is the high-mood one.
const moods = fill("2026-10-26", [
  [true, 3],
  [false, 2],
  [true, 5],
  [false, 2],
  [true, 5],
  [false, 2],
  [true, 5],
]);
const moodStats = weekStats(moods, null, SUNDAY);
if (moodStats.moodAfterNoSmoke === null || moodStats.moodAfterSmoke === null) {
  throw new Error("both after-day averages should exist when every day is logged");
}
if (!(moodStats.moodAfterNoSmoke > moodStats.moodAfterSmoke)) {
  throw new Error("no-smoke mornings should read higher in this fixture");
}
if (!moodStats.sentences.some((s) => s.includes("the day after a no-smoke night"))) {
  throw new Error("the after-mood comparison should be in the card");
}
// A gap in the log must never count as a no-smoke day.
const gappy = fill("2026-10-26", [[true, 2], [false, 4], [true, 2]]);
if (weekStats(gappy, null, SUNDAY).logged !== 3) throw new Error("only logged days count");

// --- the goal line ----------------------------------------------------------
const lastWeek = fill("2026-10-19", [
  [true, 3, [], false],
  [false, 3, [], false],
  [true, 3, [], false],
  [false, 3, [], false],
]);
const thisWeek = fill("2026-10-26", [
  [true, 3, [], true],
  [false, 3, [], false],
  [true, 3, [], false],
  [false, 3, [], true],
  [true, 3, [], false],
  [false, 3, [], false],
  [true, 3, [], false],
]);
const goalStats = weekStats({ ...lastWeek, ...thisWeek }, GOAL, SUNDAY);
if (!goalStats.goalLine) throw new Error("a goal should produce a goal line");
if (goalStats.goalLine.done !== 2) throw new Error(`expected 2 goal ticks, got ${goalStats.goalLine.done}`);
if (goalStats.goalLine.lastWeekDone !== 0) throw new Error("last week had no ticks");
if (goalStats.goalLine.direction !== "up") throw new Error("two beats zero: that is a direction");
const goalText = goalSentence(goalStats.goalLine);
if (!goalText.includes("go for a run") || !goalText.includes("twice")) {
  throw new Error(`goal line should quote the goal and its target: ${goalText}`);
}
if (!goalText.includes("that's a direction")) throw new Error("direction must be named, not praised");
if (/well done|amazing|crushed/i.test(goalText)) throw new Error("no cheerleading on the goal line");
// One logged day last week is not a week to compare against.
const thin = weekStats({ ...fill("2026-10-26", [[false, 3, [], true]]), "2026-10-25": entry("2026-10-25", true, 3) }, GOAL, SUNDAY);
if (thin.goalLine!.lastWeekDone !== null) throw new Error("a single day is not last week");

// --- when the card is due ---------------------------------------------------
// Sunday 21:00 closes the week that ends that day.
const sunLate = new Date(2026, 10, 1, MIRROR_HOUR + 1, 0);
if (weekEndFor(sunLate) !== SUNDAY) throw new Error("Sunday should close on itself");
const sundayDue = dueMirror(week, null, sunLate);
if (!sundayDue || sundayDue.end !== SUNDAY) throw new Error("Sunday evening should show this week's card");

// Monday to Saturday the week that just closed is the Sunday gone.
for (const [label, now] of [
  ["Monday", new Date(2026, 10, 2, 10, 0)],
  ["Wednesday", new Date(2026, 10, 4, 23, 47)],
  ["Saturday", new Date(2026, 10, 7, 9, 0)],
] as const) {
  const due = dueMirror(week, null, now);
  if (!due || due.end !== SUNDAY) {
    throw new Error(`${label} should still offer the week ending ${SUNDAY}, got ${due?.end ?? "nothing"}`);
  }
}

// Sunday before the mirror hour: this week isn't closed yet, and last week is empty.
if (dueMirror(week, null, new Date(2026, 10, 1, 10, 0)) !== null) {
  throw new Error("Sunday morning must not show a card for an unfinished week");
}

// Nothing logged anywhere = no card, no empty sheet sliding up.
if (dueMirror({}, null, new Date(2026, 10, 2, 10, 0)) !== null) {
  throw new Error("no log, no mirror");
}

// A missed week is caught up later rather than lost.
const older = fill("2026-10-19", [[true, 3], [false, 3], [true, 3]]);
const catchUp = dueMirror(older, null, new Date(2026, 10, 2, 10, 0));
if (!catchUp || catchUp.end !== "2026-10-25") throw new Error("an older week should still arrive");

// --- the shelf --------------------------------------------------------------
const shelf = recentWeeks({ ...older, ...week }, null, 8, SUNDAY);
if (shelf.length !== 2) throw new Error(`expected two weeks with entries, got ${shelf.length}`);
if (shelf[0].end !== SUNDAY) throw new Error("the shelf is newest first");
if (recentWeeks({}, null, 8, SUNDAY).length !== 0) throw new Error("an empty log has an empty shelf");

// --- the seven free days ----------------------------------------------------
const profile = (start: string | null) => ({ name: "nico", bedtime: 23, goal: null, ageOk: true, onboarded: true, trialStart: start });
const fresh = trialState(profile(null), new Date(2026, 10, 2, 10, 0));
if (fresh.started || fresh.ended) throw new Error("a trial starts at onboarding, not on page load");

const day1 = trialState(profile("2026-11-02"), new Date(2026, 10, 2, 10, 0));
if (!day1.active || day1.daysLeft < TRIAL_DAYS) throw new Error("day one should be the fullest trial");

const lastDay = trialState(profile("2026-11-02"), new Date(2026, 10, 8, 9, 0));
if (!lastDay.active || lastDay.daysLeft < 1) {
  throw new Error(`day seven should still be free, got ${lastDay.daysLeft}`);
}
if (lastDay.endsOn !== "2026-11-09") throw new Error(`the free days end on day eight: ${lastDay.endsOn}`);

const over = trialState(profile("2026-11-02"), new Date(2026, 10, 9, 0, 5));
if (!over.ended || over.active) throw new Error("day eight is the paywall");

if (numberWord(0) !== "zero" || numberWord(7) !== "seven") throw new Error("number words stop at seven");

console.log("mirror ok: week stats, after-moods, goal line, Sunday timing, shelf, trial");
