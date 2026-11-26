// Whether this device has already gone through the one-time "what happens to
// your voice" explanation (components/LogScreen.tsx's "explain" phase, shown
// before the mic is ever touched) and said ok. Before this file existed, that
// explain card reappeared on every single LogScreen mount -- including for a
// device that had already recorded voice notes every night for a month --
// forcing two extra taps (explain -> ok) before the mic button would even
// start a recording. See docs/voice-note-startup-lag-2026-11-27.md for the
// diagnosis this came out of.
//
// This only controls whether that one-time card reappears. It does not
// change what's recorded, where it goes, how long it's kept, or the
// browser's own microphone permission prompt, which still happens on its own
// terms whenever the OS/browser decides it does.

const KEY = "ff_voice_agreed";

/** True once this device has tapped "ok" on the explain card at least once. */
export function hasAgreedToVoice(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(KEY) === "yes";
  } catch {
    return false;
  }
}

/** Called the moment "ok" is tapped. */
export function markAgreedToVoice(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, "yes");
  } catch {
    // ignore -- private window, quota, Safari ITP, etc.
  }
}

/** Part of Settings -> "forget everything": the card shows again next time. */
export function clearVoiceAgreement(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
