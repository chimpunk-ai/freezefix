// Unit tests for lib/reflections.ts + shape test for lib/reflections-copy.ts.
// Run: npm run test:reflections

import {
  todayISO,
  mondayOf,
  weekOrdinal,
  pickPromptIdx,
  shouldShowCard,
  saveReflection,
  dismissThisWeek,
  getThisWeek,
  allReflections,
  deleteAll,
} from "../lib/reflections";
import { REFLECTIONS_COPY } from "../lib/reflections-copy";
import { LOCALES } from "../lib/landing-copy";

// Mock localStorage
const store = new Map<string, string>();
(globalThis as unknown as { window: unknown }).window = {
  localStorage: {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  },
};

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });
const nonEmpty = (s: unknown) => typeof s === "string" && s.trim().length > 0;

// ─────────────────── dates ───────────────────
{
  check("DATE-today-shape", /^\d{4}-\d{2}-\d{2}$/.test(todayISO()));
  // 2 Nov 2026 is a Monday
  check("DATE-monday-of-monday", mondayOf(new Date("2026-11-02T12:00:00")) === "2026-11-02");
  check("DATE-monday-of-sunday", mondayOf(new Date("2026-11-08T12:00:00")) === "2026-11-02");
}

// ─────────────────── weekOrdinal is stable within a week ───────────────────
{
  const monday = new Date("2026-11-02T10:00:00");
  const sunday = new Date("2026-11-08T22:00:00");
  const sameWeek = weekOrdinal(monday) === weekOrdinal(sunday);
  check("WEEK-ordinal-stable-in-week", sameWeek);

  const nextMonday = new Date("2026-11-09T10:00:00");
  // Ordinal is counted in days-since-epoch of the week's Monday, so a jump
  // of exactly 7 between consecutive weeks is correct. That's what the
  // prompt rotation (ordinal % promptCount) is designed around.
  check("WEEK-ordinal-increments-by-7", weekOrdinal(nextMonday) === weekOrdinal(monday) + 7);
}

// ─────────────────── pickPromptIdx cycles through all prompts ───────────────────
{
  const seen = new Set<number>();
  const promptCount = 8;
  // Walk 10 weeks forward from a fixed Monday. We should see every index.
  const start = new Date("2026-01-05T10:00:00"); // a Monday
  for (let i = 0; i < 10; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i * 7);
    seen.add(pickPromptIdx(promptCount, d));
  }
  check("PICK-covers-all-8-indices-in-10-weeks", seen.size === promptCount);
  check("PICK-indices-in-range", [...seen].every((n) => n >= 0 && n < promptCount));
}

// ─────────────────── shouldShowCard ───────────────────
{
  store.clear();
  check("SHOW-fresh", shouldShowCard() === true);

  saveReflection("tried calling my sister", 2);
  check("SHOW-false-after-save", shouldShowCard() === false);

  store.clear();
  dismissThisWeek(0);
  check("SHOW-false-after-dismiss", shouldShowCard() === false);
}

// ─────────────────── save + read roundtrip ───────────────────
{
  store.clear();
  const now = new Date("2026-11-05T12:00:00"); // week of Mon 2 Nov
  saveReflection("one line that mattered", 3, now);
  const e = getThisWeek(now);
  check("SAVE-text", e?.text === "one line that mattered");
  check("SAVE-promptIdx", e?.promptIdx === 3);
  check("SAVE-not-dismissed", e?.dismissed === false);
  check("SAVE-persists", getThisWeek(now)?.text === "one line that mattered");
}

// ─────────────────── trimming + max length ───────────────────
{
  store.clear();
  const long = "x".repeat(500);
  saveReflection(long, 0);
  check("SAVE-trim-400", (getThisWeek()?.text ?? "").length === 400);
  // Whitespace-only becomes undefined (= dismissed-with-prompt-remembered)
  store.clear();
  saveReflection("   ", 0);
  check("SAVE-whitespace-undefined", getThisWeek()?.text === undefined);
}

// ─────────────────── dismiss ───────────────────
{
  store.clear();
  dismissThisWeek(5);
  const e = getThisWeek();
  check("DISMISS-flag", e?.dismissed === true);
  check("DISMISS-no-text", e?.text === undefined);
  check("DISMISS-promptIdx-preserved", e?.promptIdx === 5);
}

// ─────────────────── all history ───────────────────
{
  store.clear();
  // Simulate three weeks of entries by writing directly through saveReflection
  // with varied "now" dates. The lib keys by the Monday of each date so order
  // is well-defined.
  saveReflection("w1", 0, new Date("2026-10-26T10:00:00"));
  saveReflection("w2", 1, new Date("2026-11-02T10:00:00"));
  saveReflection("w3", 2, new Date("2026-11-09T10:00:00"));
  const all = allReflections();
  check("ALL-length-3", all.length === 3);
  check("ALL-newest-first", all[0].entry.text === "w3");
  check("ALL-oldest-last", all[2].entry.text === "w1");

  deleteAll();
  check("DELETE-all-wipes", allReflections().length === 0);
}

// ─────────────────── store version guard ───────────────────
{
  store.clear();
  store.set("ff_weekly_reflections", JSON.stringify({ v: 999, items: {} }));
  // Future version: silently treated as fresh so a future migration can bump
  // the schema without wiping users
  check("GUARD-wrong-version-fresh", shouldShowCard() === true);

  store.set("ff_weekly_reflections", "not json");
  check("GUARD-malformed-fresh", shouldShowCard() === true);
}

// ─────────────────── copy shape (EN + DE) ───────────────────
for (const locale of LOCALES) {
  const c = REFLECTIONS_COPY[locale];
  const prefix = `COPY-${locale.toUpperCase()}`;
  check(`${prefix}-cardKicker`, nonEmpty(c.cardKicker));
  check(`${prefix}-cardHeading`, nonEmpty(c.cardHeading));
  check(`${prefix}-saveLabel`, nonEmpty(c.saveLabel));
  check(`${prefix}-skipLabel`, nonEmpty(c.skipLabel));
  check(`${prefix}-placeholder`, nonEmpty(c.placeholder));
  check(`${prefix}-oneLineHint`, nonEmpty(c.oneLineHint));
  check(`${prefix}-prompts-exactly-8`, c.prompts.length === 8);
  check(`${prefix}-prompts-all-nonempty`, c.prompts.every(nonEmpty));
  // Every prompt should end with a question mark — they are questions,
  // not statements, and shame-shaped assertions get silently filtered.
  for (const [i, p] of c.prompts.entries()) {
    check(`${prefix}-prompt-${i}-is-question`, p.trim().endsWith("?"));
  }
  // Posture guard: no evaluative words. The whole posture of this card is
  // open-ended noticing, not pass/fail scoring.
  const joined = c.prompts.join(" ").toLowerCase();
  const forbidden =
    locale === "de"
      ? ["ziel erreicht", "scheitern", "versagen", "streak"]
      : locale === "fr"
      ? ["objectif atteint", "échec", "streak", "as-tu tenu"]
      : locale === "nl"
      ? ["doel behaald", "mislukking", "streak", "heb je het volgehouden"]
      : ["did you stick to", "failure", "streak", "goal met"];
  for (const bad of forbidden) {
    if (joined.includes(bad)) {
      check(`POSTURE-${locale}-no-${bad.replace(/\s/g, "-")}`, false, `prompt contained: ${bad}`);
    }
  }
}

// ─────────────────── report ───────────────────
const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`Reflections check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);
