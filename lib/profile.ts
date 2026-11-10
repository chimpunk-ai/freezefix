// Who the mirror is talking to.
//
// A pet-name, a bedtime, and one goal in their own words. No email, no phone,
// no account, no password. Everything here stays on the device.

import { TRIGGERS, type TriggerId } from "./entry";

export type Goal = {
  /** Their words, e.g. "go for a run". */
  text: string;
  /** How many times a week they'd like to do it. 1–7. */
  target: number;
  /** Day they set it, YYYY-MM-DD. */
  madeAt: string;
};

export type Profile = {
  name: string;
  /** Hour of the evening ping, 0–23. 23 = 11pm. */
  bedtime: number;
  goal: Goal | null;
  ageOk: boolean;
  onboarded: boolean;
  /** YYYY-MM-DD the seven free days began. Null until onboarding finishes. */
  trialStart: string | null;
  /** What weed is quietly getting in the way of. Multi-select from INTERFERES.
   *  Used to pre-seed goal suggestions and shape the Sunday-card framing. */
  interferesWith?: string[];
  /** When this user usually smokes, from SMOKE_TIMES. Single-select.
   *  Used to tune the daily-log order (if they smoke mornings, show mood
   *  first; if nights, show the yes/no first). */
  smokeTime?: string;
  /** Which trigger chips should appear FIRST in the daily log. Chosen during
   *  onboarding from the canonical TriggerId set so the first-night log feels
   *  prepared for them rather than generic. Up to five. The daily log still
   *  shows every trigger — this list controls order, not availability. */
  preferredTriggers?: TriggerId[];
};

export const INTERFERES = [
  "sleep",
  "the gym",
  "my focus",
  "mornings",
  "money",
  "someone close",
  "nothing in particular",
] as const;

export const SMOKE_TIMES = [
  "after work",
  "the evening",
  "late night",
  "weekends only",
  "varies, honestly",
] as const;

export const GOAL_EXAMPLES = [
  "go for a run",
  "call my brother back",
  "finish a chapter of a book",
  "text one friend I've been ignoring",
  "make a proper dinner on a weeknight",
  "not snooze my alarm more than once",
] as const;

export const BEDTIMES = [21, 22, 23, 0, 1, 2] as const;

export function bedtimeLabel(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  const suffix = h < 12 ? "am" : "pm";
  const twelve = h % 12 === 0 ? 12 : h % 12;
  return `${twelve}${suffix}`;
}

const KEY = "ff_profile";

const EMPTY: Profile = {
  name: "",
  bedtime: 23,
  goal: null,
  ageOk: false,
  onboarded: false,
  trialStart: null,
};

export function readProfile(): Profile {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const p = JSON.parse(raw) as Partial<Profile>;
    const bedtime = Number(p.bedtime);
    // Narrow the optional arrays carefully — stored profiles from before
    // these fields existed will simply pass through as undefined, which is
    // what the UI already treats as "not asked".
    const interferesWith = Array.isArray(p.interferesWith)
      ? (p.interferesWith.filter((s): s is string => typeof s === "string").slice(0, 8))
      : undefined;
    const preferredTriggers = Array.isArray(p.preferredTriggers)
      ? (p.preferredTriggers
          .filter((s): s is TriggerId => typeof s === "string" && (TRIGGERS as readonly string[]).includes(s))
          .slice(0, 5) as TriggerId[])
      : undefined;
    const smokeTime = typeof p.smokeTime === "string" ? p.smokeTime.slice(0, 40) : undefined;
    return {
      name: typeof p.name === "string" ? p.name.slice(0, 24) : "",
      bedtime: Number.isFinite(bedtime) && bedtime >= 0 && bedtime <= 23 ? bedtime : 23,
      goal:
        p.goal && typeof p.goal.text === "string" && p.goal.text.trim()
          ? {
              text: p.goal.text.trim().slice(0, 80),
              target: Math.min(7, Math.max(1, Number(p.goal.target) || 2)),
              madeAt: typeof p.goal.madeAt === "string" ? p.goal.madeAt : "",
            }
          : null,
      ageOk: Boolean(p.ageOk),
      onboarded: Boolean(p.onboarded),
      trialStart: typeof p.trialStart === "string" ? p.trialStart : null,
      interferesWith,
      smokeTime,
      preferredTriggers,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function writeProfile(p: Profile): Profile {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      /* storage can be blocked */
    }
  }
  return p;
}

export function patchProfile(patch: Partial<Profile>): Profile {
  return writeProfile({ ...readProfile(), ...patch });
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
