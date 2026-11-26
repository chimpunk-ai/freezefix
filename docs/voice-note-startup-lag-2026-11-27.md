# Voice-note startup lag — diagnosis (27 Nov 2026)

Task 36 of the 50-step plan: "diagnose the voice-note startup lag." This is a
read-only investigation — no code changed in this PR. Labels below follow the
repo's convention: **OBSERVED** (read directly from the code), **ASSUMPTION**
(a conservative reading of what "lag" means here, stated so it can be
corrected), **OPEN QUESTION** (needs a founder decision), **CAN'T VERIFY
HERE** (would need a real phone/browser with a microphone, which this
environment doesn't have).

## The code path, tap by tap (OBSERVED)

`components/LogScreen.tsx` drives a `phase` state machine for voice:
`idle → explain → ready → recording → transcribing → review`.

1. `phase` starts at `"idle"` on **every mount** of LogScreen (`useState<VoicePhase>("idle")`,
   line 116) — there is no persisted memory of whether this device has used
   voice before.
2. Tapping the mic while `phase` is `"idle"` (or `"trouble"`) does **not**
   record anything. It only flips `phase` to `"explain"` (`startRec()`,
   lines 244–252) and shows the "fix will listen... nothing is sent
   anywhere... downloads a small speech model once" card.
3. Tapping **"ok"** on that card calls `agreeToVoice()` (line 184), which sets
   `phase` to `"ready"` and, separately, kicks off `preload()` from
   `lib/transcribe.ts` in the background (not awaited).
4. Only now, with `phase === "ready"`, does a **third** tap on the mic reach
   the branch that calls `getUserMedia()` and `new MediaRecorder(stream).start()`
   (lines 254–275) — i.e., actually starts capturing audio.

So on a cold `phase`, it takes **three taps** (record → ok → record) before
any audio is captured, every time the component remounts.

## What is *not* the cause (OBSERVED, ruled out)

- `startRec()`'s actual `getUserMedia()` / `rec.start()` call (step 4 above)
  does **not** wait on the model download. `preload()` runs independently in
  the background once `phase` is `"ready"`; recording starts the instant the
  browser hands back a mic stream, model or no model.
- `transcribe()` (in `lib/transcribe.ts`) does await `preload()` internally,
  but it only runs **after** the recording stops (`finish()`, called from
  `rec.onstop`). That affects the wait for the transcript to appear, not the
  wait before recording starts — a separate concern from task 36/37, closer
  to tasks 38–40 (transcription accuracy / end-to-end test).
- There's exactly one call site for `preload()` in the whole app
  (`agreeToVoice()`); nothing preloads the model eagerly at the app-shell or
  page level, by design (`lib/transcribe.ts`'s own comment: "nobody should
  pay 40 MB [now ~80 MB] to open the log").

## What is the likely cause (ASSUMPTION)

The three-tap sequence in step 2–4 above repeats **every single time**
LogScreen mounts, with no exception for a device that has recorded voice
notes every night for a month and already has the ~80 MB model fully cached
in the browser (`useBrowserCache: true` in `lib/transcribe.ts`). From a
returning user's perspective, this reads as: tap the mic, nothing happens
except a card appears, tap "ok" on the card, *then* the mic button is finally
live. That detour — not a slow network fetch, not a slow `MediaRecorder` —
is the most likely source of what's being described as "the voice note takes
a while to start."

**CAN'T VERIFY HERE:** this environment has no microphone and no real mobile
browser to measure actual wall-clock milliseconds on. Everything above is
reasoned from the code, not measured. If the real complaint is instead about
the *transcript* appearing slowly after recording stops, that's a different
mechanism (covered above) and a different task (38–40).

## Two ways to fix it (task 37) — one needs a decision first

### Option A — remember that this device already said "ok"

Persist a one-time, non-sensitive flag the first time `agreeToVoice()` runs
(same category of thing as the existing `ff_chime_asked` flag — just "has
this device seen this screen," no content). On a later mount, if that flag
is set, initialize `phase` straight to `"ready"` instead of `"idle"`, so the
first tap on the mic is the one that calls `getUserMedia()`/`rec.start()`,
the same way the *third* tap already does today. The explain card (what
happens to the audio, the one-time download) would then show once per
device, the first night only, instead of every night.

This changes how often the privacy explanation appears before recording,
not what's recorded, where it goes, or how long anything is kept — but it
*is* a change to the shape of the consent/explain step, and the project's
standing instructions call for an explicit go-ahead before changing
privacy/consent behavior. **OPEN QUESTION: do you want this?** Everything
else in the plan can keep moving either way — this only blocks task 37.

### Option B — leave the explain screen exactly as it is today

No behavior change, no approval needed. The three-tap sequence stays, and
whatever "lag" it causes stays. Nothing to build for task 37 under this
option; the remaining voice-journaling tasks (38–40, accuracy and an
end-to-end live test) still go ahead independently of this decision.

## Not changed in this PR

No files outside this new doc. No payment-related code touched.
