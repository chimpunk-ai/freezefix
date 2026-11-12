// Landing-page sample data invariants. Run: npm run test:landing
//
// The landing's shelf shows three sample weeks as proof. They must be built
// from the same weekStats the app uses, the first must be thin (so the "a
// gap is a dot, never a no" promise is visibly true), and the goal count
// must climb one at a time — a direction, not a score.

import { weekStats } from "../lib/pattern";
import { SAMPLE_END, SAMPLE_GOAL, SAMPLE_WEEK_ENDS, sampleEntries, sampleShelfEntries } from "../lib/sample";

let fails = 0;
function ok(cond: boolean, msg: string) {
  if (!cond) {
    fails++;
    console.log("FAIL", msg);
  }
}

const shelf = sampleShelfEntries();
const weeks = SAMPLE_WEEK_ENDS.map((end) => weekStats(shelf, SAMPLE_GOAL, end));

ok(SAMPLE_WEEK_ENDS[SAMPLE_WEEK_ENDS.length - 1] === SAMPLE_END, "shelf ends on the hero's sample week");
ok(weeks.length === 3, "three shelf weeks");
ok(weeks[0].logged === 3, `first shelf week is thin (logged ${weeks[0].logged}, want 3)`);
ok(weeks[0].cells.filter((c) => c.smoked === null).length === 4, "thin week has four no-entry cells");
ok(weeks[1].logged === 5, `second week logged ${weeks[1].logged}, want 5`);
ok(weeks[2].logged === 7, `third week logged ${weeks[2].logged}, want 7`);

const done = weeks.map((w) => w.goalLine?.done ?? 0);
ok(done.join(",") === "0,1,2", `goal count climbs 0,1,2 (got ${done.join(",")})`);
ok(weeks[2].goalLine?.lastWeekDone === 1, "third week knows last week's count");

// The hero sample must be unchanged by the shelf (it's the same week).
const hero = weekStats(sampleEntries(), SAMPLE_GOAL, SAMPLE_END);
ok(hero.smoked === weeks[2].smoked && hero.logged === weeks[2].logged, "hero week and third shelf week agree");

// No week may claim a correlation it can't support: the thin week has no observation.
ok(!weeks[0].observation, "thin week withholds the mood observation");

// Sentences never say "no" for a missing night.
for (const w of weeks) {
  for (const s of w.sentences) ok(!/didn't smoke on (seven|7)/i.test(s) || w.logged === 7, `sentence doesn't overclaim: ${s}`);
}

console.log(fails ? `${fails} failing` : "test-landing: ok");
process.exit(fails ? 1 : 0);
