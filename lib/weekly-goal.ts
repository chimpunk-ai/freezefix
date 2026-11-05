"use client";

const KEY = "ff_weekly_goal_v1";
const MAX_TEXT = 120;

export type WeeklyGoal = { text: string; target: number };

export function normalizeGoal(value: unknown): WeeklyGoal | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const text = typeof row.text === "string" ? row.text.trim().slice(0, MAX_TEXT) : "";
  const target = Number(row.target);
  if (!text || !Number.isInteger(target) || target < 1 || target > 7) return null;
  return { text, target };
}

export function readWeeklyGoal(): WeeklyGoal | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? normalizeGoal(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function writeWeeklyGoal(goal: WeeklyGoal | null): void {
  try {
    if (!goal) window.localStorage.removeItem(KEY);
    else {
      const normalized = normalizeGoal(goal);
      if (normalized) window.localStorage.setItem(KEY, JSON.stringify(normalized));
    }
  } catch {
    // Storage may be unavailable; the rest of the app still works.
  }
}

export function clearWeeklyGoal(): void {
  writeWeeklyGoal(null);
}
