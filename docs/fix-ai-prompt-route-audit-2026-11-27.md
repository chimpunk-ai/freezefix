# Fix AI prompt/route audit (27 Nov 2026)

Task 41 of the 50-step plan: "audit the current Fix AI prompt/route — what
it's grounded on today, and where it falls short." Read-only, no code
changed. Covers `app/api/fix/route.ts`, `lib/fix-prompt.ts`, `lib/pattern.ts`
(the context builder), `lib/risk.ts`, `lib/ai.ts`, and `lib/quota.ts`.

## It's live, not mocked (OBSERVED)

`lib/ai.ts` reads `ANTHROPIC_API_KEY` straight from the environment; the
route calls `https://api.anthropic.com/v1/messages` directly over `fetch`,
model from `AI_MODEL` (defaulting to `claude-haiku-5-5`). Whenever the key is
configured in Cloudflare, Fix is a real, live call — not a stub. Without the
key, the route returns `{ error: "unavailable" }` (503) rather than faking a
reply; `components/FixSheet.tsx` (not re-read in full here, but confirmed by
the route's own contract) has to treat that as a real failure state, not
silently show nothing.

## What it's grounded on (OBSERVED)

Three inputs go into every turn:

1. **The log** — `lib/pattern.ts`'s `buildFixContext()` renders the last
   seven nights (smoked/not, mood, triggers, goal line), a one-line summary
   (nights logged, top trigger, mood-after-smoke vs. mood-after-no-smoke),
   and the goal's weekly progress. Each night's free-text note (typed or
   voice-transcribed) is quoted verbatim, truncated to **160 characters**.
2. **Moments** — up to the 30 most recent short free-form notes across the
   week, each truncated to 200 characters, explicitly labeled "NOT log
   entries" so the model doesn't conflate them with the structured log.
3. **Self-report** — onboarding answers (frequency, cutting-down history,
   what it interferes with, usual time), in their own clearly-separated
   block, labeled "self-reported once, not log data — never treat as
   measured." The system prompt independently reinforces this ("the log,
   when it exists, always outranks it").

This whole context block is capped at 2400 characters (`buildFixContext`'s
own `maxChars`) before the route adds its own, looser 3000-character cap on
top — the outer cap is redundant in practice since the inner one almost
always binds first. Not a bug, just worth knowing if either number is tuned
later.

## The system prompt (OBSERVED)

`lib/fix-prompt.ts`, versioned (`PROMPT_VERSION = "2026-11-19.6"`, six
revisions in one day on 19 Nov), is unusually thorough: a tight voice
spec (dry, 2-4 sentences, never a question, never "you should"), an explicit
banned-phrase list, and **41 few-shot examples** covering empty logs,
moments-only weeks, self-report/log mismatches, alcohol co-use, pain
framing, shift work, meta questions about the app itself, and a crisis
hand-off case. This is a real strength — most of what would otherwise need
runtime logic (don't diagnose, don't recommend strains, don't grade them,
don't narrate a previous broken reply) is encoded as explicit rules with a
worked example, not left to the model's judgment alone.

## Safety ordering (OBSERVED — this part is solid)

Crisis detection (`lib/risk.ts`'s `keywordCheck`) runs **in code, before the
model**: level ≥ 2 or an explicit `screen` match returns real crisis-line
phone numbers immediately, never reaches the API, and is never billed
against the daily turn quota. `lib/risk.ts` has 106/106 tests passing. The
turn cap (5 free / 20 paid) is a server-side count keyed to the device
cookie, not a client-trusted number, and the paywall check only applies once
`paymentsOn()` is true — so Fix isn't gated by a dormant paywall while
payments stay frozen.

## Resilience (OBSERVED)

Three retries on 429/5xx with linear backoff, 25s timeout per attempt,
`stop_reason === "max_tokens"` is detected and `endWithStatement()` trims the
reply back to its last complete sentence rather than showing a reply that
trails off mid-word. Quota has a documented fallback (a cookie counter) if
the database is unreachable, so a Supabase outage degrades the cap instead
of breaking Fix entirely.

## Where it falls short (the actual ask)

1. **No test coverage of the route's own orchestration.** `scripts/test-fix.ts`
   covers the system prompt and `endWithStatement()` as pure functions —
   231 checks, all real logic — but nothing exercises `route.ts` itself: the
   crisis-before-quota ordering, the paywall gate, the retry/backoff loop, or
   that a crisis match truly never calls the API. This is the same shape of
   gap task 35 found and fixed in the push-reminder cron (the orchestration
   around a well-tested pure core was itself untested) — `lib/fix-prompt.ts`'s
   own functions are solid, but nothing currently proves the route wires them
   together correctly. Candidate for the same treatment: extract the
   ordering into an injectable, testable shape the way `runTick` did for the
   cron.
2. **A note longer than 160 characters is silently cut mid-sentence** in the
   context block `buildFixContext` sends to Fix. A typed or voice-transcribed
   note can run up to 500 characters (`LogScreen.tsx`'s cap); anything past
   160 never reaches the model at all, with no indication to the user that
   part of what they said that night isn't what Fix is actually seeing. This
   seems like the kind of thing task 42 ("improve extraction from short
   voice/extra notes") is pointing at, but the task name is ambiguous enough
   that I didn't want to guess and build the wrong thing — see the open
   question below.
3. **Fix can't help with practical "how do I actually do this" questions
   about the user's own stated goal** — the system prompt's rules are
   explicitly built around "what does the log say," and "if it were me, I
   might... / you should..." is the only even-slightly-advisory language
   allowed, scoped to reflecting the log back, not goal-coaching. Task 43
   ("add goal-related how-to answering") sounds like a deliberate, scoped
   widening of that boundary — but it's a real change to what Fix is allowed
   to do, not a bug fix, so it's worth confirming the intended scope before
   touching 41 examples' worth of carefully-tuned prompt rules.

## Open questions before building 42/43

- **Task 42**: is the ask "notes get truncated before Fix sees them" (the
  160-char cut found above — a concrete, fixable bug), or "short notes don't
  give Fix/the log enough signal" (a different, bigger feature — auto-tagging
  or sentiment extraction from free text)? These are different pieces of
  work.
- **Task 43**: should "how do I actually get myself to do X" questions about
  the user's own goal get a real, scoped answer from Fix (still never
  cannabis-related advice), or is this about something narrower, like
  explaining how the goal-tracking feature itself works?

## Not changed in this PR

No files outside this new doc. No payment-related code touched.
