# Voice transcription accuracy — diagnosis (27 Nov 2026)

Task 38 of the 50-step plan: "diagnose current transcription accuracy." Like
the startup-lag doc, this is read-only — no code changed. Same labels:
**OBSERVED**, **ASSUMPTION**, **OPEN QUESTION**, **CAN'T VERIFY HERE**.

## What's already been done (OBSERVED)

`lib/transcribe.ts`'s git history (commit `fd16906`, 19 Nov 2026) shows this
exact problem was already worked on once: the model was bumped from
`whisper-tiny` to `whisper-base` after users reported real transcripts
dropping words, and a 5-second stride was added between 30-second chunks so
a word spoken right at a chunk boundary doesn't land half in one chunk and
half in the next and get silently dropped. `scripts/test-push.ts`-style
coverage doesn't exist for this because it isn't the kind of thing a
deterministic unit test can check (see below) — but the two concrete bugs
that prompted that fix are the kind of thing this diagnosis would have
caught if it had existed then.

## Current configuration (OBSERVED)

| Setting | Value | What it trades off |
| --- | --- | --- |
| Model | `onnx-community/whisper-base` | Bigger than tiny (better accuracy), smaller than small/medium (less download, faster on a phone CPU). Already the step up from tiny. |
| Quantization | `dtype: "q8"` (8-bit) | Smaller download and faster inference than fp16/fp32, at some accuracy cost. Standard tradeoff for on-device/WASM; going to fp16 would roughly double the ~80 MB download for a modest accuracy gain. |
| Device | `"wasm"` | Works on every browser `isSupported()` allows; no GPU dependency. |
| Chunking | `chunk_length_s: 30`, `stride_length_s: 5` | The boundary-word fix from 19 Nov. Recordings are capped at 60s (`LogScreen.tsx` line 286), so most notes are 1-2 chunks. |
| Language | **not set** — Whisper auto-detects per call | Needed because the product is multilingual (the "heard in {language}" UI, `languageName()`) — forcing a language would silently break transcripts for anyone not speaking it. Auto-detect on a short, possibly noisy clip is less reliable than a hint would be, but there's no safe default hint that doesn't risk breaking a different group of users. |
| Post-processing | Whitespace collapse + a regex dropping bracketed noise tokens (`[BLANK_AUDIO]`, `(music)`) | No further correction, no punctuation model, no custom-word boosting (e.g. cannabis-specific terms, trigger words from onboarding). |

## Why this is hard to diagnose or improve from here (CAN'T VERIFY HERE — important)

Unlike the cron logic (task 35) or the due-reminder math, transcription
accuracy isn't something a deterministic test can check — it depends on real
speech, real accents, real background noise, and a real phone microphone.
This environment has none of those: no microphone, no audio playback, and
(network access for installs is off for this account) no way to even install
`@huggingface/transformers` locally to run the model against a sample file.
CI doesn't help either — the GitHub Actions build verifies the app compiles
and type-checks, it doesn't run the ASR model against test audio.

That means I can describe what the current settings *are* and what the
general, well-documented tradeoffs of each one *are* (the table above), but
I have no way to measure whether a given change actually makes real
transcripts better or worse. Changing a setting and calling it "improved"
without being able to verify that would be exactly the kind of unverified
claim the project's own standards rule out ("never say 'fixed' or 'working'
unless the evidence supports that exact claim").

## OPEN QUESTION — what you're actually seeing

The 19 Nov fix addressed two specific, named symptoms (words dropped
generally; words dropped at chunk boundaries specifically). To do task 39
responsibly rather than guessing at settings, it would help to know: **what
does a bad transcript actually look like right now?** For example —

- Still dropping words, or dropping whole phrases?
- Mishearing specific words consistently (cannabis-specific terms, trigger
  words from onboarding, names)?
- Garbled when there's background noise, or only when speech is quiet/fast?
- Wrong language detected sometimes (if you or testers speak something
  other than English)?
- Fine for short notes but worse as they get longer (approaching the 60s cap)?

Any of those point at a different, verifiable fix (custom vocabulary hints
for a known-words list; a language override when the device's region signal
from `lib/country.ts` strongly suggests one language; chunk/stride tuning;
simple silence-trimming before the clip is sent to the model to cut down on
hallucinated filler text on quiet recordings). Without one of those signals,
the next concrete step is task 40 (an end-to-end live test) rather than
speculative tuning here.

## Not changed in this PR

No files outside this new doc. No payment-related code touched.
