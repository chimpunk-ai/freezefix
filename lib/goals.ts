"use client";

// The user's goal — one of Quit / Cut down / Take a break / Not sure yet / none.
// Stored on the device only; never uploaded. Optional by design — the home screen
// renders a chip row and whichever one is picked is highlighted. Picking the same
// goal again clears it (second tap = cancel), so the user is never stuck with a
// label they changed their mind on.

const KEY = "ff_goal";

export const GOALS = ["quit", "cutdown", "break", "unsure"] as const;
export type GoalId = (typeof GOALS)[number];

export const GOAL_LABEL: Record<GoalId, string> = {
  quit: "Quit",
  cutdown: "Cut down",
  break: "Take a break",
  unsure: "Not sure yet",
};

export function readGoal(): GoalId | null {
  try {
    const v = window.localStorage.getItem(KEY);
    return v && (GOALS as readonly string[]).includes(v) ? (v as GoalId) : null;
  } catch {
    return null;
  }
}

export function writeGoal(goal: GoalId | null) {
  try {
    if (goal) window.localStorage.setItem(KEY, goal);
    else window.localStorage.removeItem(KEY);
  } catch {
    /* storage can be blocked */
  }
}
