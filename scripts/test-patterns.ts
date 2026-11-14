// Eval suite for the pattern engine.
//
// Every number the weekly card shows comes out of lib/patterns.ts, so this file
// builds synthetic weeks with known answers and checks the arithmetic, the
// gating (no comparison on thin data) and the copy safety (no recovery
// vocabulary, ever). Run: npm run test:patterns

import {
  BANNED_IN_COPY,
  DAY_NAMES,
  addDays,
  bannedWordsIn,
  buildPatterns,
  buildWeek,
  buildWeeks,
  flatten,
  isoLocal,
  momentum,
  moodBySmoke,
  moodTheNextDay,
  mondayOf,
  prettyLabel,
  series,
  triggerImpact,
  weekdayRhythm,
  type Checkins,
  type Nights,
  type Week,
} from "../lib/patterns";

/* ── tiny harness ────────────────────────────────────────────────────────── */

let passed = 0;
const failures: string[] = [];

function ok(name: string, cond: boolean, detail = "") {
  if (cond) {
    passed += 1;
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function eq(name: string, actual: unknown, expected: unknown) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  ok(name, a === e, `expected ${e}, got ${a}`);
}

function near(name: string, actual: number, expected: number, tol = 0.05) {
  ok(name, Math.abs(actual - expected) <= tol, `expected ≈${expected}, got ${actual}`);
}

/* ── fixtures ────────────────────────────────────────────────────────────── */

// 2026-11-09 is a Monday; anchoring here keeps every test deterministic.
const ANCHOR = new Date("2026-11-09T12:00:00");

type Seed = { a?: "yes" | "no"; m?: number; t?: string[] };

function seed(plan: (weekOffset: number, dow: number) => Seed | null) {
  const checkins: Checkins = {};
  const nights: Nights = {};
  for (let w = 0; w < 8; w += 1) {
    const monday = addDays(mondayOf(ANCHOR), -7 * w);
    for (let d = 0; d < 7; d += 1) {
      const s = plan(w, d);
      if (!s) continue;
      const key = isoLocal(addDays(monday, d));
      if (s.a) checkins[key] = s.a;
      if (s.m !== undefined || s.t) {
        nights[key] = { ...(s.m !== undefined ? { mood: s.m } : {}), triggers: s.t ?? [] };
      }
    }
  }
  return { checkins, nights };
}

/* ── dates ───────────────────────────────────────────────────────────────── */

eq("mondayOf returns the Monday of the anchor week", isoLocal(mondayOf(ANCHOR)), "2026-11-09");
eq("addDays crosses a month boundary", isoLocal(addDays(new Date("2026-10-31T12:00:00"), 1)), "2026-11-01");
eq("prettyLabel humanises a chip id", prettyLabel("after-work"), "After work");
eq("prettyLabel survives an unknown chip", prettyLabel(""), "Something else");

/* ── week shape ──────────────────────────────────────────────────────────── */

{
  const { checkins, nights } = seed((w, d) => {
    if (w !== 0) return null;
    if (d === 0) return { a: "yes", m: 3 };
    if (d === 1) return { a: "yes", m: 5 };
    if (d === 2) return { a: "no", m: 4 };
    if (d === 3) return { a: "yes" };
    if (d === 4) return { a: "no" };
    return null; // Saturday and Sunday unlogged
  });
  const week = buildWeek(checkins, nights, ANCHOR);
  eq("week starts on the Monday", week.start, "2026-11-09");
  eq("week ends on the Sunday", week.end, "2026-11-15");
  eq("smoked nights counted", week.smoked, 3);
  eq("logged nights counted", week.recorded, 5);
  eq("unlogged nights stay null", week.days[5]?.smoked, null);
  eq("mood nights counted", week.moodN, 3);
  near("week mood average", week.moodAvg ?? 0, 4);
  eq("weekday index runs Monday-first", week.days[0]?.dow, 0);
}

{
  const { checkins, nights } = seed((w, d) => (w === 0 && d === 0 ? { a: "yes", m: 9 } : null));
  const week = buildWeek(checkins, nights, ANCHOR);
  eq("an out-of-range mood is discarded, not clamped", week.days[0]?.mood, null);
  eq("the yes answer still counts", week.smoked, 1);
}

/* ── gating: no comparisons on thin data ─────────────────────────────────── */

{
  // Two smoke nights, five clear nights: the mission's floor is three per side.
  const { checkins, nights } = seed((w, d) => {
    if (w !== 0) return null;
    return d < 2 ? { a: "yes", m: 2 } : { a: "no", m: 5 };
  });
  const week = buildWeek(checkins, nights, ANCHOR);
  eq("two smoke nights are not enough to compare", moodBySmoke(week.days).ready, false);
  const ids = buildPatterns([week]).map((p) => p.id);
  ok("no mood pattern is invented from two nights", !ids.includes("mood_by_smoke"), ids.join(","));
}

{
  // Three and three: the floor is met, and the sign must be right.
  const { checkins, nights } = seed((w, d) => {
    if (w !== 0) return null;
    return d < 3 ? { a: "yes", m: 2 } : d < 6 ? { a: "no", m: 4 } : null;
  });
  const week = buildWeek(checkins, nights, ANCHOR);
  const cmp = moodBySmoke(week.days);
  eq("three per side unlocks the comparison", cmp.ready, true);
  near("smoked-side average", cmp.aAvg, 2);
  near("clear-side average", cmp.bAvg, 4);
  near("difference is clear minus smoked", cmp.diff, 2);
}

{
  const { checkins, nights } = seed((w, d) => {
    if (w !== 0) return null;
    return d < 3 ? { a: "yes", m: 3 } : d < 6 ? { a: "no", m: 3 } : null;
  });
  const week = buildWeek(checkins, nights, ANCHOR);
  const p = buildPatterns([week]).find((x) => x.id === "mood_by_smoke");
  eq("identical averages read as neutral, not as an effect", p?.tone, "neutral");
}

/* ── the morning after ───────────────────────────────────────────────────── */

{
  const { checkins, nights } = seed((w, d) => {
    if (w !== 0) return null;
    if (d < 3) return { a: "yes", m: 3 };
    if (d < 6) return { a: "no", m: 3 };
    return null;
  });
  const week = buildWeek(checkins, nights, ANCHOR);
  const next = moodTheNextDay(week.days);
  // Day after each of the six logged nights: Mon->Tue(3), Tue->Wed(3), Wed->Thu(3)
  // from smoke nights; Thu->Fri(3), Fri->Sat(3) from clear nights.
  eq("three mornings counted after smoke nights", next.aN, 3);
  eq("two mornings counted after clear nights", next.bN, 2);
  eq("two mornings is not enough to compare", next.ready, false);
}

{
  // Three smoke nights whose following mornings all read 3, and four clear nights
  // whose following mornings read 5. Thursday carries both roles: it is the
  // morning after Wednesday's smoke AND a clear night with its own morning after,
  // which is exactly how a real week overlaps.
  const { checkins, nights } = seed((w, d) => {
    if (w !== 0) return null;
    if (d === 0) return { a: "yes", m: 3 }; // Mon
    if (d === 1) return { a: "yes", m: 3 }; // Tue
    if (d === 2) return { a: "yes", m: 3 }; // Wed
    if (d === 3) return { a: "no", m: 3 }; // Thu — the morning after Wed reads 3
    if (d === 4) return { a: "no", m: 5 }; // Fri
    if (d === 5) return { a: "no", m: 5 }; // Sat
    return { a: "no", m: 5 }; // Sun
  });
  const week = buildWeek(checkins, nights, ANCHOR);
  const next = moodTheNextDay(week.days);
  eq("next-day comparison unlocks at three per side", next.ready, true);
  near("mornings after smoke nights average the smoke-side mood", next.aAvg, 3);
  near("mornings after clear nights average the clear-side mood", next.bAvg, 5);
}

/* ── triggers ────────────────────────────────────────────────────────────── */

{
  const { checkins, nights } = seed((w, d) => {
    if (w !== 0) return null;
    if (d < 3) return { a: "yes", m: 1, t: ["after-work"] };
    if (d < 7) return { a: "no", m: 5, t: ["social"] };
    return null;
  });
  const week = buildWeek(checkins, nights, ANCHOR);
  const rows = triggerImpact(week.days);
  eq("both chips with a clear contrast are reported", rows.length, 2);
  eq("the two chips are the ones tapped", rows.map((r) => r.id).sort(), ["after-work", "social"]);
  const lead = rows[0];
  eq("chip is labelled for humans", lead?.label, "After work");
  eq("chip counted across the window", lead?.count, 3);
  near("mood with the chip", lead?.withAvg ?? 0, 1);
  near("mood without the chip", lead?.withoutAvg ?? 0, 5);
  ok("chip with a lower mood sorts first", (lead?.diff ?? 0) < 0, String(lead?.diff));
}

{
  const { checkins, nights } = seed((w, d) => {
    if (w !== 0) return null;
    if (d < 2) return { a: "yes", m: 1, t: ["after-work"] };
    if (d < 7) return { a: "no", m: 5 };
    return null;
  });
  const week = buildWeek(checkins, nights, ANCHOR);
  eq("a chip tapped twice is not reported", triggerImpact(week.days).length, 0);
}

{
  // A chip on every single night has no comparison group and must be dropped.
  const { checkins, nights } = seed((w, d) => {
    if (w !== 0) return null;
    return { a: d < 4 ? "yes" : "no", m: 3, t: ["boredom"] };
  });
  const week = buildWeek(checkins, nights, ANCHOR);
  eq("a chip on every night is dropped, not divided by zero", triggerImpact(week.days).length, 0);
}

/* ── weekday rhythm ──────────────────────────────────────────────────────── */

{
  const { checkins, nights } = seed((w, d) => {
    if (w > 1) return null;
    if (d === 4) return { a: "yes", m: 3 }; // Friday, both weeks
    if (d === 0) return { a: "no", m: 4 };
    return null;
  });
  const weeks = buildWeeks(checkins, nights, ANCHOR, 4);
  const rhythm = weekdayRhythm(weeks);
  eq("rhythm unlocks across two weeks", rhythm.ready, true);
  eq("Friday is the top weekday", rhythm.top, 4);
  eq("Friday counted twice", rhythm.counts[4], 2);
  eq("the weekday name matches the index", DAY_NAMES[4], "Friday");
}

{
  const { checkins, nights } = seed((w, d) => (w === 0 && d < 2 ? { a: "yes", m: 3 } : null));
  const weeks = buildWeeks(checkins, nights, ANCHOR, 4);
  eq("two smoke nights are not a rhythm", weekdayRhythm(weeks).ready, false);
}

/* ── momentum and series ─────────────────────────────────────────────────── */

{
  const { checkins, nights } = seed((w, d) => {
    if (w === 0) return d < 4 ? { a: "yes", m: 3 } : { a: "no", m: 4 };
    if (w === 1) return d < 6 ? { a: "yes", m: 3 } : { a: "no", m: 4 };
    return null;
  });
  const weeks = buildWeeks(checkins, nights, ANCHOR, 4);
  const mom = momentum(weeks);
  eq("momentum compares the two most recent weeks", mom.ready, true);
  eq("this week's smoke count", mom.current, 4);
  eq("last week's smoke count", mom.previous, 6);
  eq("delta is fewer-minus-more", mom.delta, 2);
}

{
  const weeks: Week[] = buildWeeks({}, {}, ANCHOR, 4);
  const mom = momentum(weeks);
  eq("empty weeks do not produce momentum", mom.ready, false);
  const pts = series(weeks);
  eq("series has one point per week", pts.length, 4);
  eq("the last point is this week", pts[3]?.label, "this week");
  eq("earlier points are labelled backwards", pts[0]?.label, "3w ago");
}

/* ── the assembled card ──────────────────────────────────────────────────── */

{
  const { checkins, nights } = seed((w, d) => {
    if (w > 3) return null;
    const heavy = w === 1 || w === 2;
    if (d < (heavy ? 6 : 3)) return { a: "yes", m: 2, t: [d === 0 ? "after-work" : "sleep"] };
    return { a: "no", m: 4, t: [] };
  });
  const weeks = buildWeeks(checkins, nights, ANCHOR, 4);
  const patterns = buildPatterns(weeks);
  const ids = patterns.map((p) => p.id);

  ok("a rich month yields several patterns", patterns.length >= 3, ids.join(","));
  ok("the mood comparison is present", ids.includes("mood_by_smoke"), ids.join(","));
  ok("the weekday shape is present", ids.includes("weekday"), ids.join(","));
  ok("momentum is present", ids.includes("momentum"), ids.join(","));
  ok("every pattern carries a chart or is explicitly chartless", patterns.every((p) => !!p.chart));
  ok("every pattern has a caveat line", patterns.every((p) => p.detail.length > 20));
  ok("no pattern repeats another", new Set(ids).size === ids.length, ids.join(","));

  for (const p of patterns) {
    const text = `${p.headline} ${p.detail}`;
    eq(`copy is clean: ${p.id}`, bannedWordsIn(text), []);
    ok(`copy ends on a full stop: ${p.id}`, /[.!]$/.test(p.headline.trim()));
    ok(`copy names no cause: ${p.id}`, !/\bcaused?\b|\bbecause of\b/i.test(text));
  }

  ok(
    "no pattern in the vocabulary list survives",
    !BANNED_IN_COPY.some((w) => patterns.some((p) => new RegExp(`\\b${w}\\b`, "i").test(p.headline))),
  );
}

{
  const patterns = buildPatterns([]);
  eq("no weeks produce no patterns", patterns.length, 0);
  const thin = buildPatterns(buildWeeks({}, {}, ANCHOR, 4));
  eq("a device with no taps produces no patterns", thin.length, 0);
}

{
  const { checkins, nights } = seed((w, d) => (w === 0 && d < 2 ? { a: "yes", m: 3 } : null));
  const weeks = buildWeeks(checkins, nights, ANCHOR, 4);
  eq("two logged nights produce no card at all", buildPatterns(weeks).length, 0);
  eq("flatten walks every week", flatten(weeks).length, 28);
}

/* ── report ──────────────────────────────────────────────────────────────── */

if (failures.length) {
  console.error(`\n✗ ${failures.length} failed, ${passed} passed\n`);
  for (const f of failures) console.error(`  · ${f}`);
  process.exit(1);
}
console.log(`✓ pattern engine: ${passed} checks passed`);
