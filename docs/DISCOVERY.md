# Repository and release discovery

As of 19 Oct 2026, commit `4864cea` on `main`. Written before any further
implementation, per the founder's v4 brief. Configuration is named here by
variable name and scope only; no secret values appear in this file or in the
repository.

Labels used below: **OBSERVED** (read directly from this repository),
**UNKNOWN** (not verifiable from here), **HYPOTHESIS** (inference, marked as such).

---

## 1. Stack and release

| | |
|---|---|
| Framework | Next.js, App Router, TypeScript (OBSERVED) |
| Runtime | Cloudflare Workers via `@opennextjs/cloudflare` (OBSERVED) |
| Build | `npx opennextjs-cloudflare build` (OBSERVED, `package.json`) |
| Deploy | Cloudflare Workers Builds, automatic on push to `main` (OBSERVED) |
| Config | `wrangler.jsonc`, `keep_vars: true` so dashboard secrets survive a deploy (OBSERVED) |
| Rollback | UNKNOWN. No documented procedure. Cloudflare keeps prior versions, but nobody has tested a rollback. |
| Tests | 8 suites, all local and offline: `risk`, `scenarios`, `plans`, `demo`, `wins`, `facts`, `ndjson`, `offtopic` |
| CI | None. Tests run only when a human runs them. (OBSERVED) |

### P0 defect: unpinned dependencies, no lockfile

`package.json` declares **every** dependency as `"latest"` — `next`, `react`,
`react-dom`, `@opennextjs/cloudflare`, `wrangler`, `typescript`, `tailwindcss`
and the rest. There is **no `package-lock.json`, `yarn.lock` or
`pnpm-lock.yaml`** in the repository.

Consequences, all OBSERVED from the configuration itself:

- Every Cloudflare build resolves dependency versions afresh. Two builds of the
  same commit can produce different applications.
- A breaking release of Next.js, React or the Cloudflare adapter reaches
  production automatically, with no code change and no warning.
- A working build cannot be reproduced, so "roll back the code" does not
  restore a known-good state.
- The local checkout has no `node_modules` and the npm registry is unreachable
  from this environment, so the versions currently running in production are
  **UNKNOWN from here**. They can only be read from a Cloudflare build log.

This is the single largest reliability risk in the repository and it is
cheap to fix: install once with the registry reachable, commit the resulting
lockfile, and replace each `"latest"` with the exact resolved version.
It is **not** fixed in this note, because guessing version numbers without a
registry would be worse than the current state.

---

## 2. Routes

Pages (OBSERVED): `/` landing, `/app` the application, `/privacy`, `/terms`,
`/refunds`.

API (OBSERVED): `chat`, `config`, `feedback`, `forget`, `message`, `moves`,
`paywall`, `portal`, `suggest`, `transcribe`, `webhooks/paddle`.

**There are no authentication routes.** No `login`, `signup`, `auth` or OAuth
callback exists anywhere in `app/`. The 404s the reviewer found at `/login` and
`/signup` are therefore **not a defect**: this is a guest-only product with no
accounts, by design (device cookie plus local storage). It is, however,
**undocumented**, which is why it read as a broken recovery path.

Consequence that does need deciding: entitlements are keyed to an anonymous
device reference, so **a paying customer who changes phone or clears cookies
has no way to recover their subscription**, and no sign-in exists to offer
them. "Manage subscription" falling back to email support is a symptom of
that, not a bug in the button.

`app/robots.ts` returns `disallow: /` for all agents (OBSERVED). Unchanged.

---

## 3. Data flow and storage

| Data | Where it lives | Notes |
|---|---|---|
| Chat messages | Not stored by FreezeFix | Sent to Anthropic, which retains up to 30 days (per provider policy; **UNKNOWN** whether a zero-retention agreement exists) |
| Memory (name, triggers, people) | Device `localStorage` only | Never uploaded. No server copy to leak, and no recovery on a new device |
| Wins log | Device `localStorage` only | Same trade-off |
| Anonymous counts | Supabase `events` | Kind, value, moment, country, timestamp. No text |
| Daily limits | Supabase `quota_usage` | Salted hashes of a device cookie and IP. Rows deleted after 2 days |
| Entitlements | Supabase `entitlements` | Keyed by a hash of the anonymous device id |
| Suggestions | Supabase `suggestions` | **The only place a user's typed words are stored.** Answer, words, optional contact, country. Insert-only through a `security definer` function; verified unreadable with the public key (401) |
| Images | Processed, then discarded | Not stored. Lifecycle **not** independently verified |

Supabase project region: EU (Frankfurt) (OBSERVED in prior setup).
`SUPABASE_SERVICE_ROLE_KEY` is referenced in exactly one file, `lib/quota.ts`
(OBSERVED) — worth a read before billing goes live, since that key bypasses
row-level security.

---

## 4. Configuration (names and scope only)

Cloudflare Worker secrets: `ANTHROPIC_API_KEY`, `SUPABASE_URL`,
`SUPABASE_ANON_KEY`, and, when payments are enabled, `PADDLE_ENV`,
`PADDLE_CLIENT_TOKEN`, `PADDLE_PRICE_MONTHLY`, `PADDLE_PRICE_YEARLY`,
`PADDLE_WEBHOOK_SECRET`, `PADDLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

Optional: `AI_MODEL`, `TRIAL_DAYS`, `QUOTA_SALT`, `ENABLE_SCREENSHOTS`,
`ENABLE_VOICE`, `TRANSCRIBE_API_KEY`, `TRANSCRIBE_URL`, `TRANSCRIBE_MODEL`,
`SCREENSHOT_DAILY_LIMIT`, `SCREENSHOT_DAILY_LIMIT_PAID`.

No secret value is stored in the repository (OBSERVED: only `process.env`
references).

---

## 5. Behaviour matrix

| Capability | State |
|---|---|
| 18+ gate, 24h block on an under-18 answer | Implemented |
| Pre-LLM keyword safety check | Implemented, 102 tests, runs before any model call |
| Model risk check, higher level wins | Implemented |
| Crisis / emergency screens, never paywalled | Implemented |
| Safety fallback without an LLM | Implemented — the keyword check and help screens need no model |
| Buddy chat, streaming, held until the risk verdict lands | Implemented |
| Landing page, interactive scripted demo | Implemented |
| Onboarding, 4 skippable questions | Implemented |
| Quick Unfreeze, wins log, fact cards, PWA install | Implemented |
| Suggestion form | Implemented and verified end to end |
| Voice notes | Built, **off** (`ENABLE_VOICE`), browser speech path untested end to end |
| Screenshots | Built, on with the AI key, **lifecycle not independently verified** |
| Payments | Code complete, **no credentials**, never run against a sandbox |
| Accounts, sign-in, recovery | **Absent by design**, undocumented |
| Tasks and reminders | **Absent.** Blocked on ST medication rules (T56) and SL consent (T57) |
| Analytics | **Absent.** Blocked on a PostHog key |
| Reproducible builds | **Absent.** See the P0 above |
| CI | **Absent** |
| Accessibility audit | **Not done.** Reduced motion is respected; nothing else verified |

---

## 6. Contradictions to resolve before billing

1. **Trial and card.** The landing page says "First conversation free, no card.
   Then a 4-day trial." Terms describe a card requirement. One versioned
   pricing source must drive the landing page, checkout, Terms, Refunds and
   receipts. `lib/plans.ts` is the natural home and already holds prices and
   `TRIAL_DAYS`.
2. **Terms advertise unbuilt features** — reminders, voice check-ins, weekly
   reflection, a small-wins tracker. The wins log exists; reminders and voice
   check-ins do not. Terms must not sell what does not ship.
3. **No subscription recovery.** Decided before money changes hands, not after.

---

## 7. Cloudflare evidence note

The founder supplied a screenshot of the last 24 hours. Recorded here as
**OBSERVED values with unknown definitions**, because the dashboard view, exact
UTC window, filters and sampling were not captured with it:

Paths `/` 188, `/app` 80, `/privacy` 12, `/terms` 11, `/refunds` 5; host
`getfreezefix.com` 268; protocol counts HTTP/2 ~6.99k, HTTP/1.1 ~1.32k, HTTP/3
73; TLS 1.3 ~7.99k, TLS 1.2 13, none 383; largest assets ~2.45 MB, ~2.33 MB,
~1.68 MB; desktop/mobile 229/67; low-volume port labels `:8080`, `:8443`,
`:2053`, `:2083`, `:2087`, `:2096`, `:443`, `:80`.

Limitations, stated plainly:

- These are request counts, not people, sessions, conversations or conversions.
  `/app` 80 does **not** mean 80 conversations. **HYPOTHESIS**, untestable from
  here: with `robots.txt` disallowing everything and no marketing published, a
  large share is crawlers.
- The origin-response card read p50/p95 **0 ms** while the graph said "No
  data". That is **absence of data, not zero latency and not proof of origin
  health.**
- The alternate ports are Cloudflare's own supported-port labels. They are
  **not** evidence of an exposed origin or an attack.
- The Requests URL redirected to a Cloudflare sign-in during review, so no
  Requests page content was inspected. Nothing here is derived from it.

No Cloudflare setting — DNS, TLS, WAF, cache, Workers, ports, redirects, rate
limits, rulesets — has been read or changed as part of this work.

---

## 8. Recommended order

1. **Lockfile and pinned versions.** Everything else is built on sand until a
   build is reproducible.
2. **Resolve the trial/card contradiction** and make `lib/plans.ts` the single
   source the legal pages read from.
3. **Decide the account question**, because it blocks honest billing.
4. ST medication rules (T56) and SL consent (T57) before any Tasks work.
5. CI running the 8 existing suites on every push.

Nothing in this note changed application behaviour. It is documentation only.
