// Shape + surface checks for lib/share-card.
//
// We cannot render the canvas in node, so this test does what it can:
//   - The module's exported API has the expected signatures.
//   - SHARE_WIDTH / SHARE_HEIGHT match the vision's one share aspect
//     (1080x1350, Instagram portrait).
//   - canShareImages() returns false in a node environment (no window).
//   - sundayCardBlob() returns null in a node environment (no document),
//     rather than throwing.
//   - shareSundayCard and downloadSundayCard likewise return false, not
//     throw — the UI can degrade gracefully.
//
// Visual correctness of the generated PNG is covered by manual test,
// since node has no canvas backend. The important invariant covered here
// is that every failure path is a false/null, never an exception.
//
// Run: npm run test:share-card

import {
  SHARE_WIDTH,
  SHARE_HEIGHT,
  canShareImages,
  downloadSundayCard,
  shareSundayCard,
  sundayCardBlob,
} from "../lib/share-card";
import type { WeekStats } from "../lib/pattern";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) =>
  results.push({ id, ok, note });

// Aspect lock
check("SC-width-1080", SHARE_WIDTH === 1080);
check("SC-height-1350", SHARE_HEIGHT === 1350);

// A tiny but valid stats fixture.
const stats: WeekStats = {
  start: "2026-10-26",
  end: "2026-11-01",
  cells: [
    { day: "2026-10-26", initial: "mon", smoked: true, mood: 3, triggers: ["after-work"] },
    { day: "2026-10-27", initial: "tue", smoked: false, mood: 4, triggers: [] },
    { day: "2026-10-28", initial: "wed", smoked: true, mood: 2, triggers: ["bored"] },
    { day: "2026-10-29", initial: "thu", smoked: false, mood: 4, triggers: [] },
    { day: "2026-10-30", initial: "fri", smoked: true, mood: 3, triggers: ["after-work"] },
    { day: "2026-10-31", initial: "sat", smoked: null, mood: null, triggers: [] },
    { day: "2026-11-01", initial: "sun", smoked: false, mood: 5, triggers: [] },
  ],
  logged: 6,
  smoked: 3,
  notSmoked: 3,
  topTrigger: "after-work",
  topTriggerCount: 2,
  weekdaySmokes: 3,
  weekendSmokes: 0,
  moodAfterNoSmoke: null,
  moodAfterSmoke: null,
  sentences: ["you smoked on three of six nights.", "the log is thin on the mood comparison this week."],
  observation: null,
  goalLine: null,
};

// tsx transpiles to CJS, so top-level await isn't allowed. Wrap the
// async assertions in an IIFE and keep the same semantics.
(async () => {
  // In node (no document / window) every entry point must return the
  // documented safe value — never throw.
  {
    let threw = false;
    let result: Blob | null = "not-run" as unknown as Blob | null;
    try {
      result = await sundayCardBlob({ name: "nico", stats });
    } catch {
      threw = true;
    }
    check("SC-blob-no-doc-null", !threw && result === null, threw ? "threw" : undefined);
  }

  check("SC-canShare-no-nav-false", canShareImages() === false);

  {
    let threw = false;
    let ok: boolean | string = "not-run";
    try {
      ok = await shareSundayCard({ name: "nico", stats });
    } catch {
      threw = true;
    }
    check("SC-share-no-nav-false", !threw && ok === false);
  }

  {
    let threw = false;
    let ok: boolean | string = "not-run";
    try {
      ok = await downloadSundayCard({ name: "nico", stats });
    } catch {
      threw = true;
    }
    check("SC-download-no-doc-false", !threw && ok === false);
  }

  // Redacted shares must still accept the full stats shape and not throw.
  {
    let threw = false;
    try {
      await sundayCardBlob({ name: "nico", stats, redactName: true });
      await shareSundayCard({ name: "nico", stats, redactName: true });
      await downloadSundayCard({ name: "nico", stats, redactName: true });
    } catch {
      threw = true;
    }
    check("SC-redact-does-not-throw", !threw);
  }

  const pass = results.filter((r) => r.ok).length;
  const fail = results.length - pass;
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
  }
  console.log(`Share-card API check: ${pass}/${results.length} passed`);
  if (fail > 0) process.exit(1);
})();
