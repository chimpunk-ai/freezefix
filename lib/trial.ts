// Seven free days, no card.
//
// The clock starts when onboarding finishes, not when the page loads, so a
// curious visitor isn't burning the trial before they've seen anything.
// When the seven days are up the app asks for money; the crisis pages never do.

import { addDays, todayISO } from "./entry";
import type { Profile } from "./profile";

export const TRIAL_DAYS = 7;

export type TrialState = {
  started: boolean;
  active: boolean;
  daysLeft: number;
  /** YYYY-MM-DD the free days end. */
  endsOn: string | null;
  ended: boolean;
};

export function trialState(profile: Profile, now = new Date()): TrialState {
  if (!profile.trialStart) {
    return { started: false, active: false, daysLeft: TRIAL_DAYS, endsOn: null, ended: false };
  }
  const today = todayISO(now);
  const endsOn = addDays(profile.trialStart, TRIAL_DAYS);
  const msLeft = new Date(`${endsOn}T23:59:59`).getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(msLeft / 86_400_000));
  return {
    started: true,
    active: today < endsOn,
    daysLeft,
    endsOn,
    ended: today >= endsOn,
  };
}
