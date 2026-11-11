// The one sound in the app: an opt-in, once-asked soft tone when the
// weekly mirror card finishes drawing on sunday. Pref states, a tiny
// localStorage shim and a reduced-motion check live here.
//
// Rules this file enforces:
//   - Default is OFF. A new user never hears a sound until they say yes.
//   - "Later" counts as a no for this week; we ask again the next sunday
//     at most. We never ask more than once per week.
//   - prefers-reduced-motion forces off regardless of the pref.
//   - The pref is per-device, same place the rest of the app's state lives.
//
// This is only pref storage. The actual tone generator lives in lib/chime.ts.

const PREF_KEY = "ff_chime";
const ASKED_KEY = "ff_chime_asked";

export type ChimePref = "yes" | "no" | "unset";

/** Read the stored pref. Returns "unset" on any read error (SSR, locked storage, private window). */
export function readChimePref(): ChimePref {
  if (typeof window === "undefined") return "unset";
  try {
    const v = window.localStorage.getItem(PREF_KEY);
    if (v === "yes" || v === "no") return v;
    return "unset";
  } catch {
    return "unset";
  }
}

/** Write the pref. Silent on failure — the app must keep working without storage. */
export function writeChimePref(v: "yes" | "no"): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREF_KEY, v);
  } catch {
    // ignore — private window, quota, Safari ITP, etc.
  }
}

/** Remove both chime keys. Part of Settings → "forget everything". */
export function clearChimePref(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(PREF_KEY);
    window.localStorage.removeItem(ASKED_KEY);
  } catch {
    // ignore
  }
}

/** When was the opt-in question last shown, as ms since epoch, or 0. */
export function readLastAsked(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(ASKED_KEY);
    const n = raw ? Number(raw) : 0;
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function stampAsked(now: number = Date.now()): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ASKED_KEY, String(now));
  } catch {
    // ignore
  }
}

/** True iff we should ask for consent on the card right now. */
export function shouldAskOptIn(
  pref: ChimePref,
  lastAsked: number,
  now: number = Date.now(),
): boolean {
  if (pref !== "unset") return false; // already answered, never ask again
  // Only ask at most once every 7 days — if the user ignored the chip and
  // came back next sunday, we can offer it again. Not more often.
  if (lastAsked > 0 && now - lastAsked < 7 * 24 * 60 * 60 * 1000) return false;
  return true;
}

/** True iff the device asks us not to animate; we treat that as a sound mute too. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

/** The only "should we play?" decision in the app. */
export function shouldPlayChime(pref: ChimePref): boolean {
  if (pref !== "yes") return false;
  if (prefersReducedMotion()) return false;
  return true;
}
