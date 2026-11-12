# Fix — the FreezeFix web app

A private pattern-mirror for people who smoke weed and wonder how it's sitting in their life. Three taps a night. One card on Sunday. No streaks, no lectures, no one telling you to quit. Adults 18+.

Next.js on Cloudflare Workers (via OpenNext). The product is "Fix"; the legal entity and the domain are "FreezeFix".

## What's in here

| Path | What it does |
| --- | --- |
| `app/page.tsx` → `components/Landing.tsx` | The public front door. Vision in prose + a real sample Sunday card. |
| `app/app/page.tsx` → `components/AppClient.tsx` | The app shell. Hosts the log, the Sunday mirror, the shelf, Fix, and settings — one view at a time. |
| `components/Onboarding.tsx` | 9-screen first-run flow: 18+ gate → pet name → what weed is in the way of → when they smoke → trigger chips → bedtime → their one thing → explainer → preview card. |
| `components/LogScreen.tsx` | The nightly log. Yes/no, one mood face, up to three trigger chips, an optional 10-second voice note, an optional goal tick. Local storage only. |
| `components/PatternCard.tsx` | The weekly mirror card. Plain-English pattern, a seven-cell grid, the goal line, the optional chime. |
| `components/FixSheet.tsx` | Fix (the AI): one question about your own week, answered from your own log. Server-side turn cap (5/day free, 20/day paid). |
| `components/HelpScreen.tsx` · `components/HelpPage.tsx` | Crisis / urgent help. Always free. Never behind the gate or the paywall. |
| `lib/entry.ts` | Nightly log data model, local storage read/write, trigger + mood definitions. |
| `lib/pattern.ts` | Weekly stats, mirror sentences, the context string sent to Fix when the user asks. |
| `lib/mirror.ts` | When the Sunday card arrives (8:15 pm local), which weeks have been seen. |
| `lib/profile.ts` | Pet name, bedtime, chosen goal, onboarding answers — local-storage profile. |
| `lib/trial.ts` | The seven free days. Reads from the profile; the server copy lives in `supabase.start_trial()`. |
| `lib/plans.ts` | Pricing: yearly / monthly, per-region currency, trial dates. `paymentsOn()` gates the paywall UI. |
| `lib/resources.ts` | **The only place crisis phone numbers live.** Verified from each country's health-ministry pages, dated. Re-check by 15 Jan 2027. |
| `lib/risk.ts` | Keyword safety check that runs in code **before** the AI. |
| `lib/fix-prompt.ts` | Fix's system prompt and the one post-processor that ends replies on a statement, never a question. |
| `lib/country.ts` | Device-side region detection from time zone + language list. No GPS. |
| `lib/chime.ts` · `lib/chime-pref.ts` | The one optional, default-off Sunday chime. Procedurally generated three descending sine notes. |
| `lib/quota.ts` | Server-side daily limits and the paywall check. Anonymous device cookie + salted IP hash. |
| `lib/legal.ts`, `app/privacy`, `app/terms`, `app/refunds` | Legal pages. Wording owned by Setup & Legal. |
| `app/api/fix/route.ts` | Fix's API: keyword check → quota → Anthropic (Claude) → post-process. |
| `app/api/trial/start/route.ts` | Records the start of the seven free days on the server. |
| `app/api/transcribe/route.ts` | Voice note transcription. Off until `ENABLE_VOICE=true`. |
| `app/api/paywall/route.ts` · `app/api/portal/route.ts` · `app/api/webhooks/paddle/route.ts` | Paddle wiring. `/api/paywall` returns `active: true` for everyone while payments are off. |
| `app/help/page.tsx` → `components/HelpPage.tsx` | Public /help route. Always free, no gate. |
| `supabase/schema.sql` | Anonymous counts, hashed-key quotas, entitlements, trial record, waitlist, suggestions. Paste into Supabase SQL Editor. |
| `public/sw.js` · `public/manifest.webmanifest` · `public/offline.html` | PWA. Pre-caches landing, legal pages and app shell; `/api/*` never cached. |
| `capacitor.config.ts` | Native shell is a thin WebView over the live site. See `docs/native-build.md`. |
| `scripts/test-*.ts` | 10 offline test suites: risk, country, resources, plans, pwa, offtopic, mirror, fix, chime, onboarding. |

## Secrets (never in code)

Added in **Cloudflare dashboard → Workers → freezefix → Settings → Variables and Secrets**:

- `ANTHROPIC_API_KEY`: without it, Fix returns an "unavailable" and the rest of the app still works
- `AI_MODEL`: optional, defaults to `claude-haiku-5-5`
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`: anonymous counts + daily limits (Supabase project is in **EU (Frankfurt)**, as the privacy policy says)
- `QUOTA_SALT`: any long random text; used to hash the device cookie and IP
- `TRANSCRIBE_API_KEY` (+ optional `TRANSCRIBE_URL`, `TRANSCRIBE_MODEL`): voice provider chosen by Budget & Ops
- `ENABLE_VOICE`: keep `false` until the voice flow is approved end-to-end
- Payments (Paddle): `PADDLE_ENV`, `PADDLE_CLIENT_TOKEN`, `PADDLE_PRICE_YEARLY`, `PADDLE_PRICE_MONTHLY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Webhook URL: `https://getfreezefix.com/api/webhooks/paddle` (subscription events).

## Commands

```bash
npm install          # first time, or after package.json changes
npm run dev          # local at http://localhost:3000
npm run typecheck    # TypeScript check
npm run lint         # ESLint
npm run test:risk    # safety-check tests
npm run test:fix     # Fix prompt + post-processor tests
npm run test:mirror  # weekly stats + mirror sentences
npm run test:onboarding   # 9-step flow invariants
npm run test:chime   # chime preference state machine
npm run test:country # region detection
npm run test:resources    # crisis resources invariants
npm run test:plans   # pricing display
npm run test:pwa     # PWA manifest + offline fallback
npm run test:offtopic     # Fix's refusal to leave the log
npm run preview      # local Cloudflare build
```

Deploys happen automatically from GitHub through Cloudflare Workers Builds (build command `npx opennextjs-cloudflare build`, deploy command `npx opennextjs-cloudflare deploy`).

## Build reproducibility

- Package manager: **npm** (requires Node `>=20.9.0`; see `.nvmrc` for the version used in development).
- Dependencies in `package.json` are pinned to caret ranges against the current compatible releases.
- A lockfile (`package-lock.json`) is required for byte-for-byte reproducible installs. Prefer `npm ci` in CI / Cloudflare Workers Builds.
