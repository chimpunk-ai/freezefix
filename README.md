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
| `scripts/test-risk.ts` | Runs the red-team set against the safety check: `npm run test:risk`. |

## Secrets (never in code)

Add these in **Cloudflare dashboard → Workers → freezefix → Settings → Variables and Secrets**:

- `ANTHROPIC_API_KEY`: without it, the app uses safe built-in moves
- `AI_MODEL`: optional, defaults to `claude-haiku-5-5`
- `SUPABASE_URL` and `SUPABASE_ANON_KEY`: optional; logging is off without them

## Commands

```bash
npm install
npm run dev          # local at http://localhost:3000
npm run test:risk    # safety check tests
npm run preview      # run the Cloudflare build locally
```

Deploys happen automatically from GitHub through Cloudflare Workers Builds (build command `npx opennextjs-cloudflare build`, deploy command `npx opennextjs-cloudflare deploy`).
