# Release checklist — what is live, what needs you

_Updated 14 November 2026. Written for the owner. Everything in "live" is
merged to `main` and deployed by Cloudflare Workers Builds. Everything in
"needs you" cannot be done from the repository alone._

## Live on getfreezefix.com

- The product: nightly log, Sunday mirror with the mood curve, the shelf
  with its shape-over-time chart, the self-chosen goal, Fix (the AI) behind
  "ask Fix about this week", the optional Sunday chime.
- Public pages: landing with real screens and the playable ritual, plans
  (free for now), help (global fallback), privacy, terms, refunds, myths,
  FAQ with structured data. Dark and light appearance.
- PWA: manifest with Fix icons, service worker registered from the root
  layout, offline shell, install prompt on Android/Chrome/Edge, add-to-home
  steps on iPhone.
- Voice notes: on-device transcription (Whisper tiny, in the browser), audio
  never leaves the device. First use downloads the model once (~40 MB).

## Needs you — in order of impact

### 1. Fix (the AI) — secrets in Cloudflare
Open `https://getfreezefix.com/api/health`. It reports, without leaking
anything, whether the AI key and the other services are configured, and
`?probe=1` makes a one-token live call. If `aiKey` is false, add
`ANTHROPIC_API_KEY` in Cloudflare → Workers → freezefix → Settings →
Variables and Secrets. Optional `AI_MODEL` (default in the code).

### 2. Reminders — three secrets + one GitHub secret
Run `npx tsx scripts/gen-vapid.ts` on your machine. It prints a keypair.
- Cloudflare secrets: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
  `PUSH_TICK_SECRET` (any long random string), and the public key again as
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (it is public; the client needs it).
- Supabase: paste the `push_subscriptions` block from `supabase/schema.sql`
  into the SQL editor.
- GitHub → repo → Settings → Secrets → Actions: `PUSH_TICK_SECRET` with the
  same value. The workflow `.github/workflows/push-tick.yml` then calls
  `/api/push/tick` every ten minutes.
Until these exist, Settings says "reminders aren't switched on yet" and
nothing is collected. See `docs/reminders.md`.

### 3. App Store and Google Play
The web app is installable today without a store. A store listing needs:
- Apple Developer Program (US$99/yr) and a Mac with Xcode; Google Play
  Developer (US$25 once) and Android Studio.
- On your machine: `npm install @capacitor/core @capacitor/ios
  @capacitor/android` and `npm install --save-dev @capacitor/cli`, then
  `npx cap add ios && npx cap add android && npx cap sync`. The shell loads
  the live site (see `capacitor.config.ts`) so there is one code path.
- Follow `docs/native-build.md` for signing, icons and splash. The icon
  source is `public/icon.svg` / `public/icon-512.png`.
- Store review notes: 18+ rating, "no account", the privacy policy URL, and
  the data-collection questionnaire answers from `/privacy` (local-only log;
  Fix question + 7-night context to Anthropic on explicit send; push
  endpoint if reminders are enabled; Google Fonts; Hugging Face model files).
This cannot be done from the repository: it needs your accounts, your
signing keys and a Mac.

### 4. Legal review
`lib/legal.ts` (privacy, terms, refunds) is accurate to the code, not legal
advice. Have Setup & Legal or a lawyer read it before the first paid user.

### 5. Payments (parked by your instruction)
Scaffolding exists (`lib/plans.ts`, `/api/paywall`, `/api/webhooks/paddle`,
Paddle.js on `/plans`). Needs the Paddle account and its secrets. Nothing
charges and nothing locks until `paymentsOn()` is true.

## Real-device pass (ten minutes, please)
On a real phone: open `/app`, log a night, press the mic once (first use
downloads the model — watch the percent), open the Sunday card, switch on
the Sunday reminder, install to the home screen, toggle light mode. Tell me
what felt off. Everything here was verified in a desktop Chromium harness,
not on hardware.
