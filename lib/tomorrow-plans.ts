"use client";

// User-written "Tomorrow Loop" plans. If–then sentences stored on this device.
//
// IMPORTANT — this is NOT lib/plans.ts. That file holds paid subscription plans
// (yearly/monthly prices, trial length) and is frozen. These two concepts share the
// word "plan" but must not be conflated: user plans live client-side with no money,
// no reminders, no notifications, no third party.

const KEY = "ff_tomorrow_plans";
const MAX_PLANS = 50;
const MAX_WHEN = 120;
const MAX_THEN = 240;

export type Plan = {
  id: string;
  ts: number;
  /** Plain-text trigger ("After dinner", "When I get in from work"). */
  when: string;
  /** Plain-text action ("I can pause for ten minutes and decide again"). */
  then: string;
  /** Opt-in reminder flag — currently has NO effect; notifications are not wired. */
  reminder: boolean;
};

function read(): Plan[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? (list as Plan[]) : [];
  } catch {
    return [];
  }
}

function write(list: Plan[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_PLANS)));
  } catch {
    /* ignore */
  }
}

export function all(): Plan[] {
  return read();
}
export function allNewestFirst(): Plan[] {
  return read().slice().reverse();
}
export function count(): number {
  return read().length;
}

export function add(input: { when: string; then: string; reminder?: boolean }): Plan | null {
  const when = (input.when || "").trim().slice(0, MAX_WHEN);
  const then = (input.then || "").trim().slice(0, MAX_THEN);
  // A plan with no "then" is not a plan — refuse rather than save a junk row.
  if (!then) return null;
  const now = Date.now();
  const plan: Plan = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    ts: now,
    when,
    then,
    reminder: Boolean(input.reminder),
  };
  const list = read();
  list.push(plan);
  write(list);
  return plan;
}

export function toggleReminder(id: string): boolean {
  const list = read();
  const i = list.findIndex((p) => p.id === id);
  if (i < 0) return false;
  list[i].reminder = !list[i].reminder;
  write(list);
  return list[i].reminder;
}

export function remove(id: string) {
  write(read().filter((p) => p.id !== id));
}

export function clearAll() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
