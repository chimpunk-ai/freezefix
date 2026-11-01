"use client";

// Insight derivation. Pure functions that compute a small, honest set of patterns from
// what the user has already saved on this device — journal entries, daily check-ins,
// and the quick wins log. Nothing is sent anywhere; no store is written to.
//
// Rules this file enforces (so the UI can trust the output):
//   • Every insight carries a minimum-sample gate. If the sample is too thin to be
//     honest, the insight does not render. "You have 1 entry so your evenings are
//     100% evenings" is noise, not signal.
//   • Every insight carries a short explainer the UI shows under "Why am I seeing
//     this?". It names the ingredients and the limit.
//   • Nothing here claims causation. The copy is always descriptive ("You recorded X")
//     and never diagnostic ("You smoke more because you're stressed").
//   • The home week-row and the 4-week bar come from the same check-in store, so the
//     two surfaces always agree.

import { allNewestFirst as journalAll, CONTEXTS, type Entry } from "@/lib/journal";
import { last7Summary, todayISO } from "@/lib/checkins";
import { allWins } from "@/lib/wins";

export type Insight = {
  /** Stable id so a user can hide a specific insight and keep it hidden. */
  id: InsightId;
  title: string;
  /** 1-3 short sentences shown next to the number. */
  body: string;
  /** Shown behind "Why am I seeing this?" — ingredients + the caveat. */
  explanation: string;
  /** Light "based on" byline shown above the title. */
  basis?: string;
};

export const INSIGHT_IDS = [
  "use_days_4w",
  "top_context",
  "stress_or_boredom",
  "time_of_day",
  "wins_this_month",
] as const;
export type InsightId = (typeof INSIGHT_IDS)[number];

/** The last four full ISO weeks of use-days-per-week, oldest → newest. Shape used by
 *  the primary bar chart on /patterns. Includes the running week on the right. */
export type WeekBar = { label: string; use: number; recorded: number };

/** Compute everything at once; the UI then filters by the hidden-set. */
export function computeInsights(now = new Date()): {
  entries: Entry[];
  weeks: WeekBar[];
  insights: Insight[];
  totalCheckins: number;
  firstEntryDay: string | null;
  lastEntryDay: string | null;
} {
  const entries = journalAll();
  const weeks = weeksOfUse(now);
  const checkins = countCheckins();
  const first = entries.length ? entries[entries.length - 1].ts : null;
  const last = entries.length ? entries[0].ts : null;

  const insights: Insight[] = [];

  // 1) Top context — honest only when at least 3 entries carry any context AND the
  //    leader is at least 2 ahead of noise.
  const topCtx = topContext(entries);
  if (topCtx) {
    insights.push({
      id: "top_context",
      title: `Context recorded most often: ${topCtx.label}`,
      body: `In ${topCtx.of} journal entr${topCtx.of === 1 ? "y" : "ies"} that carried any context tag, ${topCtx.label} appeared in ${topCtx.count}.`,
      explanation:
        "Counted from the context chips you tapped when logging each entry. Entries you didn't tag aren't counted. This is a description, not a cause: tags are your labels on your days.",
      basis: `Based on ${topCtx.of} tagged entr${topCtx.of === 1 ? "y" : "ies"}`,
    });
  }

  // 2) Stress or boredom co-mention — only shown when ≥3 entries have any context.
  const sb = stressOrBoredom(entries);
  if (sb) {
    insights.push({
      id: "stress_or_boredom",
      title: `${sb.count} of ${sb.of} entries mention stress or boredom`,
      body: `${sb.count} out of your ${sb.of} tagged entr${sb.of === 1 ? "y" : "ies"} include "stress" or "boredom" in the context you set. That may be worth noticing.`,
      explanation:
        "A count of your context chips, nothing more. It doesn't show that stress or boredom caused anything, and it may not represent every time — only the entries you chose to tag.",
      basis: `Based on ${sb.of} tagged entr${sb.of === 1 ? "y" : "ies"}`,
    });
  }

  // 3) Time of day distribution — only shown when ≥3 entries exist.
  const tod = timeOfDay(entries);
  if (tod) {
    insights.push({
      id: "time_of_day",
      title: `${tod.evening} of ${tod.total} entries recorded in the evening`,
      body: `Entries happen across the day. ${tod.evening} were after 6pm, ${tod.afternoon} between noon and 6pm, ${tod.morning} before noon.`,
      explanation:
        "Uses the local time each entry was saved. A handful of entries is a small sample, not a routine.",
      basis: `Based on ${tod.total} entr${tod.total === 1 ? "y" : "ies"}`,
    });
  }

  // 4) Wins this month — only shown when any wins exist.
  const wtm = winsThisMonth(now);
  if (wtm > 0) {
    insights.push({
      id: "wins_this_month",
      title: `${wtm} win${wtm === 1 ? "" : "s"} saved this month`,
      body: `Small things that already happened, in your own words. Keep adding when something lands — they're easy to forget.`,
      explanation:
        "Counted from the quick 'wins log' inside Fix. Lives on this device. The journal count on Home is this plus your /journal entries.",
      basis: `From this calendar month`,
    });
  }

  // 5) The 4-week bar is its own feature at the top of the page, but we also surface
  //    it as a short "use days this week" number if the week has any check-ins.
  const w = last7Summary(now);
  if (w.recorded > 0) {
    insights.push({
      id: "use_days_4w",
      title: `${w.useDays} use day${w.useDays === 1 ? "" : "s"} this week · from your check-ins`,
      body:
        w.deltaVsLastWeek === null
          ? `Based on ${w.recorded} of 7 days answered. A few more check-ins will let it compare with last week.`
          : w.deltaVsLastWeek > 0
          ? `${w.deltaVsLastWeek} fewer use day${w.deltaVsLastWeek === 1 ? "" : "s"} than the week before.`
          : w.deltaVsLastWeek < 0
          ? `${-w.deltaVsLastWeek} more use day${w.deltaVsLastWeek === -1 ? "" : "s"} than the week before — nothing to beat yourself up about.`
          : `Same number of use days as the week before.`,
      explanation:
        "Pulled from the daily check-in on Home. A day you didn't answer isn't counted either way. Not a score, and nothing resets.",
      basis: `Based on ${w.recorded} check-in day${w.recorded === 1 ? "" : "s"} this week`,
    });
  }

  return {
    entries,
    weeks,
    insights,
    totalCheckins: checkins,
    firstEntryDay: first ? todayISOms(first) : null,
    lastEntryDay: last ? todayISOms(last) : null,
  };
}

/** Oldest-→newest for the last 4 weeks, counts of 'yes' and 'no' per week. */
function weeksOfUse(now: Date): WeekBar[] {
  // Pull all check-ins from storage.
  let log: Record<string, "yes" | "no"> = {};
  try {
    const raw = window.localStorage.getItem("ff_checkins");
    log = raw ? JSON.parse(raw) : {};
  } catch {
    log = {};
  }

  const out: WeekBar[] = [];
  // Walk back 4 week-spans ending today.
  for (let wi = 3; wi >= 0; wi--) {
    let use = 0;
    let recorded = 0;
    for (let d = 6; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (wi * 7 + d));
      const key = isoLocal(date);
      const ans = log[key];
      if (ans === "yes") {
        use += 1;
        recorded += 1;
      } else if (ans === "no") {
        recorded += 1;
      }
    }
    out.push({ label: wi === 0 ? "This week" : `${wi}w ago`, use, recorded });
  }
  return out;
}

function countCheckins(): number {
  try {
    const raw = window.localStorage.getItem("ff_checkins");
    return raw ? Object.keys(JSON.parse(raw) || {}).length : 0;
  } catch {
    return 0;
  }
}

function isoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayISOms(ms: number): string {
  return isoLocal(new Date(ms));
}

type TopCtx = { label: string; count: number; of: number };

function topContext(entries: Entry[]): TopCtx | null {
  if (!entries.length) return null;
  const tagged = entries.filter((e) => e.contexts && e.contexts.length);
  if (tagged.length < 3) return null;
  const counts = new Map<string, number>();
  for (const e of tagged) for (const c of e.contexts) counts.set(c, (counts.get(c) ?? 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [winnerId, winnerN] = ranked[0];
  const runnerUp = ranked[1]?.[1] ?? 0;
  // Only call a "top" when the leader is clearly ahead — a one-vote lead is noise.
  if (winnerN - runnerUp < 2 && ranked.length > 1) return null;
  const label = CONTEXTS.find((c) => c.id === winnerId)?.label ?? winnerId;
  return { label, count: winnerN, of: tagged.length };
}

function stressOrBoredom(entries: Entry[]): { count: number; of: number } | null {
  const tagged = entries.filter((e) => e.contexts && e.contexts.length);
  if (tagged.length < 3) return null;
  const hit = tagged.filter((e) => e.contexts.includes("stress") || e.contexts.includes("boredom")).length;
  if (hit === 0) return null;
  return { count: hit, of: tagged.length };
}

type ToD = { morning: number; afternoon: number; evening: number; total: number };

function timeOfDay(entries: Entry[]): ToD | null {
  if (entries.length < 3) return null;
  let morning = 0;
  let afternoon = 0;
  let evening = 0;
  for (const e of entries) {
    const h = new Date(e.ts).getHours();
    if (h < 12) morning += 1;
    else if (h < 18) afternoon += 1;
    else evening += 1;
  }
  return { morning, afternoon, evening, total: entries.length };
}

function winsThisMonth(now = new Date()): number {
  const wins = allWins();
  const y = now.getFullYear();
  const m = now.getMonth();
  return wins.filter((w) => {
    const d = new Date(w.day + "T12:00:00");
    return d.getFullYear() === y && d.getMonth() === m;
  }).length;
}

// ──────────────── hidden-insights persistence ────────────────

const HIDDEN_KEY = "ff_insights_hidden";

export function readHidden(): Set<InsightId> {
  try {
    const raw = window.localStorage.getItem(HIDDEN_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

export function hide(id: InsightId) {
  const s = readHidden();
  s.add(id);
  try {
    window.localStorage.setItem(HIDDEN_KEY, JSON.stringify([...s]));
  } catch {
    /* ignore */
  }
}

export function unhideAll() {
  try {
    window.localStorage.removeItem(HIDDEN_KEY);
  } catch {
    /* ignore */
  }
}
