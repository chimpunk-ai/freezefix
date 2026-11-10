// The sunday-card chime. Three soft notes, descending, procedurally
// generated through the Web Audio API — no asset file, no CDN, no
// licensing to worry about, no bytes added to the bundle beyond this
// file. Total length ≈ 5.6 seconds. Designed to feel like a wind chime
// at the far end of a room, not a notification.
//
// Why procedural, not an MP3:
//   - The vision says three animations, each earning its place. A 300kB
//     audio file would weigh more than the hero itself.
//   - Procedural tones can't drift off-brand the way a licensed clip can;
//     the frequencies, envelope and gain are the design.
//   - Nothing to review for rights, resample for mobile, or cache.
//
// Hard rules enforced here:
//   - A single AudioContext per page; subsequent calls are coalesced so
//     a double-mount never doubles the sound.
//   - Peak gain is 0.14 — quieter than system notifications, meant to be
//     mistaken for the room.
//   - After the last note, the context is closed. No background audio
//     graph lingers.
//
// This module must only be imported in a client component (`"use client"`).

type Nullable<T> = T | null;

let currentCtx: Nullable<AudioContext> = null;
let playing = false;

type AudioCtor = new (opts?: AudioContextOptions) => AudioContext;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const w = window as typeof window & {
    AudioContext?: AudioCtor;
    webkitAudioContext?: AudioCtor;
  };
  const Ctor: AudioCtor | undefined = w.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) return null;
  try {
    return new Ctor();
  } catch {
    return null;
  }
}

/** The three notes, in Hz. Soft, warm, slightly east-of-centre. */
const NOTES = [528, 440, 352] as const;

/** Play the chime once. A no-op if it's already playing, or if the browser
 *  gives us no AudioContext (older/non-interacted page, SSR, …). */
export async function playSundayChime(): Promise<void> {
  if (playing) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  currentCtx = ctx;
  playing = true;

  try {
    // Many browsers start AudioContext in "suspended" state until a user
    // gesture. The pattern card is reached by tapping the notification or
    // the "open" chip, so resume is usually allowed. If it isn't, we bail
    // silently rather than throwing.
    if (ctx.state === "suspended") {
      try {
        await ctx.resume();
      } catch {
        playing = false;
        return;
      }
    }

    const now = ctx.currentTime;
    const noteDur = 1.8; // seconds per note, with heavy overlap
    const stagger = 1.1; // seconds between note onsets
    const peakGain = 0.14;

    for (let i = 0; i < NOTES.length; i++) {
      const start = now + i * stagger;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(NOTES[i], start);

      // ADSR: 350ms attack, hold briefly, long release. Feels like a
      // bowl resonating rather than a beep.
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(peakGain, start + 0.35);
      gain.gain.setValueAtTime(peakGain, start + 0.55);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + noteDur);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + noteDur + 0.05);
    }

    const totalMs = (NOTES.length - 1) * stagger * 1000 + noteDur * 1000 + 200;
    window.setTimeout(() => {
      if (currentCtx === ctx) {
        ctx.close().catch(() => {});
        currentCtx = null;
      }
      playing = false;
    }, totalMs);
  } catch {
    playing = false;
    try {
      ctx.close();
    } catch {
      // ignore
    }
    currentCtx = null;
  }
}

/** For tests: the notes the chime uses. Export is for inspection only. */
export const _CHIME_NOTES = NOTES;
