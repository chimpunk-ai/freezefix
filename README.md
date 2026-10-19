# FreezeFix web app

One safe next step in under 60 seconds. Next.js on Cloudflare Workers (via OpenNext).

## What's in here

| Path | What it does |
| --- | --- |
| `components/FreezeFixApp.tsx` | The whole flow: 18+ gate → Unfreeze me → moment → safety check → a few words → 3 moves → pick one → Did it help? |
| `components/HelpScreen.tsx` | Emergency, crisis, psychosis, mixed-substances, doctor and under-18 screens. Never paywalled. |
| `lib/resources.ts` | **The only place phone numbers live.** Copied from Safety Pack v1.0 §3 and §6. Re-check by 15 Jan 2027. |
| `lib/risk.ts` | Keyword safety check that runs in code before the AI (Safety Pack §1 and §5). |
| `lib/prompt.ts` | AI system prompt; the safety rules are copied word for word from Safety Pack §4. |
| `lib/moves.ts` | Safe built-in moves and the filter that blocks unsafe AI wording. |
| `app/api/moves/route.ts` | Server: keyword check → AI → takes the higher risk level → returns moves or a help screen. |
| `app/api/feedback/route.ts` | Records 👍/👎 only (no text, no ID). |
| `supabase/schema.sql` | Anonymous counts table. Paste into Supabase SQL Editor. |
| `scripts/test-risk.ts` | Runs the red-team set (plus Hindi/Hinglish and false-alarm tests) against the safety check: `npm run test:risk`. |
| `components/VoiceRecorder.tsx`, `app/api/transcribe` | Voice notes up to 60 s; 3/day free, 6/day paid, counted on the server. Off until `ENABLE_VOICE=true`. |
| `components/ScreenshotPicker.tsx` | One screenshot per session, shrunk on the phone; the AI reads it as text, then the safety check runs. Off until `ENABLE_SCREENSHOTS=true`. |
| `lib/quota.ts` | Server-side daily limits (anonymous device cookie + salted IP hash, no raw IDs stored). |
| `lib/legal.ts`, `app/privacy`, `app/terms`, `app/refunds` | Legal pages from Setup & Legal's Legal Pack. |
| `components/Paywall.tsx`, `app/api/paywall`, `app/api/webhooks/paddle`, `app/api/portal` | Paywall: first unfreeze free, paywall after the first 👍, 4-day trial, $39.99/yr (default) or $9.99/mo via Paddle. Checked on the server, always AFTER the safety check. |

## Secrets (never in code)

Add these in **Cloudflare dashboard → Workers → freezefix → Settings → Variables and Secrets**:

- `ANTHROPIC_API_KEY`: without it, the app uses safe built-in moves
- `AI_MODEL`: optional, defaults to `claude-haiku-5-5`
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`: anonymous counts + daily limits (create the Supabase project in the **EU (Frankfurt)** region, as the privacy policy says)
- `QUOTA_SALT`: any long random text
- `TRANSCRIBE_API_KEY` (+ optional `TRANSCRIBE_URL`, `TRANSCRIBE_MODEL`): voice provider chosen by Budget & Ops
- `ENABLE_SCREENSHOTS`, `ENABLE_VOICE`: keep `false` until HQ T31, T32 and T33 are Done
- Payments (Paddle): `PADDLE_ENV`, `PADDLE_CLIENT_TOKEN`, `PADDLE_PRICE_YEARLY`, `PADDLE_PRICE_MONTHLY`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Webhook URL to give Paddle: `https://getfreezefix.com/api/webhooks/paddle` (subscription events).

## Commands

```bash
npm install          # first time, or after package.json changes
npm run dev          # local at http://localhost:3000
npm run test:risk    # safety check tests
npm run typecheck    # TypeScript check
npm run lint         # ESLint (requires eslint config to be present)
npm run preview      # run the Cloudflare build locally
```

Deploys happen automatically from GitHub through Cloudflare Workers Builds (build command `npx opennextjs-cloudflare build`, deploy command `npx opennextjs-cloudflare deploy`).

## Build reproducibility

- Package manager: **npm** (requires Node `>=20.9.0`; see `.nvmrc` for the version used in development).
- Dependencies in `package.json` are **pinned to caret ranges** against the current compatible releases, so every install resolves to the same major/minor family.
- A lockfile (`package-lock.json`) is required for byte-for-byte reproducible installs. **Run `npm install` once locally and commit the resulting `package-lock.json`** — it is intentionally not generated here when the registry cannot be reached.
- Once `package-lock.json` is committed, prefer `npm ci` in any CI / Cloudflare Workers Builds install step so the lockfile is respected and installs stay deterministic.
