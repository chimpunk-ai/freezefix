# Fix by FreezeFix

A private, device-local cannabis check-in and weekly pattern mirror for adults 18+. Next.js App Router, deployed on Cloudflare Workers through OpenNext. The public site is `getfreezefix.com`; the product is called **Fix**.

## Product shape

The intended product has three parts: a few-second daily log, a seven-day mirror, and one small goal the user names for themselves. There is no abstinence counter, public scoreboard, or required daily journal. Use days, no-use days, and missing check-ins are distinct; a missing day is never treated as zero use. Fix is supportive software, not therapy, diagnosis, or crisis care.

### Current implementation in this branch

- `/home` is the daily log: cannabis yes/no, five drawn mood faces, up to three optional context chips, a browser-speech note capped at ten seconds, an optional user-written weekly goal, and a fourteen-day dot row.
- `/patterns` shows the current week and up to twelve prior weeks that have saved check-ins. Its statistics are computed in the browser from locally stored data. Mood comparisons are withheld unless at least three mood ratings exist in each group; no next-morning comparison is claimed because the log does not collect a separate morning mood.
- `/settings` provides an optional local nickname, local data deletion, and withdrawal of log consent (which clears the daily log and goal).
- `/product` documents product intent and its present limitations. Public marketing landing pages are available in English, German, French, Dutch, Spanish, and Italian.
- `/help` remains accessible without account, age-gate completion, subscription, or payment. Urgent-help information must remain free.
- `/app` and `/fix` retain the older AI support tool as a separate surface. It is not yet grounded in the new local weekly log. The user's local log is not attached automatically.
- The old `/program` reduction-plan and `/plans` routes redirect to `/home`.

## Privacy and data boundaries

- The daily log, chosen nickname, goal, and transcript are saved in browser local storage on this device; no sync/recovery copy is created by this log.
- A user's nickname is not sent to `/api/signup`. That endpoint is retained as a non-writing `410 Gone` tombstone for stale clients.
- The daily speech control uses the browser's speech-recognition API. Browser/vendor processing may occur. The app does not record or upload audio from that control; the recognized transcript is stored locally. Voice is optional and may be unavailable in some browsers.
- Fix chat is separate. Content a user submits to chat is sent to the configured AI provider. Provider retention is described in the Privacy Policy; the local log is not added automatically.
- Waitlist email is optional and separate from an app profile. A waitlist signup is not a trial, subscription, or payment authorization.
- Settings deletion clears known local product data but does not delete an independently submitted waitlist address or recall content already processed by an AI provider.
- `/api/signup` is retired; do not use it to create profiles or collect device-linked names.

## Features intentionally not active

- Sunday 8:15pm notifications and daily bedtime reminders are not implemented; the weekly mirror is opened manually.
- Mirror-grounded AI questions are a product requirement but not yet implemented. Existing AI chat remains a separate legacy tool.
- Anonymous account/device-key sync and cross-device recovery are not implemented.
- Checkout, subscriptions, and trials are not active. `paymentsOn()` is hard-disabled; the public pricing page is a planned-offer waitlist. The planned trial is seven days, not the legacy four-day setting. Do not re-enable payment by adding secrets alone.
- Italian/Spanish end-to-end in-app localization and accessibility QA are still required before describing the redesigned app as launched in those markets.

## Design and accessibility

The visual system uses warm-black `#12100E`, warm sage `#9CAF88`, and a terracotta help color. Inter is the UI face; Newsreader is reserved for selected display moments. Product motion is limited to the 4s-in/6s-out breathing cue, 350ms weekly-mirror sheet entrance/exit with an 800ms graph draw, and a 600ms goal-line pulse. The global reduced-motion media query suppresses animation and transitions.

All data charts must have text alternatives, sufficiently large touch targets, visible keyboard focus, and no color-only meaning. Never expose real check-ins in demo content. The sample mirror on `/product` is explicitly labeled illustrative.

## Production release gates

Before calling this production-ready or opening the wider launch:

1. Run the Cloudflare OpenNext build and a browser smoke test on mobile widths; verify offline behavior, PWA install, focus behavior, and reduced-motion mode.
2. Review consent, privacy, provider/data-retention disclosures, local deletion, and browser speech behavior with qualified counsel and actual vendor documentation.
3. Decide whether daily logging requires mood to be mandatory or skippable; verify the product still takes under ten seconds.
4. Implement an explicitly opt-in Sunday local notification only after consent, timezone, schedule changes, permission denial, and opt-out are fully designed and tested. No unsolicited push before that.
5. Implement Fix's mirror-grounded, user-initiated question flow and hard daily/turn caps; test crisis escalations and ensure the local log is only shared with explicit, scoped consent.
6. Decide and implement next-morning mood only if users explicitly opt into another check-in. Do not imply causal effects from same-day or observational data.
7. Complete Italian and Spanish translation and human QA of the in-app flow, safety content, support links, privacy, legal and subscription terms.
8. Keep checkout disabled until price, VAT/tax, trial start/end, renewal, cancellation, refund, user identity/recovery, and payment-provider terms are exact and independently verified. The free trial must not silently require a payment method contrary to the public promise.
9. Test account-independent operation, local-storage failure/full-storage behavior, data loss, reinstall, and deletion; do not promise device recovery until sync exists.
10. Keep emergency help available without age-gate progression, login, trial, or payment.

## Useful paths

| Path | Purpose |
| --- | --- |
| `components/HomeDashboard.tsx` | Daily log and consent gates |
| `components/MoodFace.tsx` | Accessible five-face mood picker |
| `components/DailyVoiceNote.tsx` | Optional browser speech note |
| `components/WeeklyMirrorSheet.tsx` | Manually opened weekly mirror sheet |
| `components/Insights.tsx` | Current and past-week mirror archive |
| `lib/checkins.ts` | Device-local daily log, migration, date helpers |
| `lib/mirror.ts` | Pure, descriptive weekly summary and sample thresholds |
| `lib/weekly-goal.ts` | Optional local user-defined weekly goal |
| `components/ProductPlanPage.tsx` | Detailed public product and status page |
| `lib/legal.ts` | Privacy, terms, and refund copy; legal review still required |
| `public/sw.js` | PWA offline cache; API routes are never cached |

## Commands

Use Node `>=20.9.0` and npm.

```bash
npm ci
npm run dev
npm run typecheck
npm run test:daily-log
npm run test:risk
npm run test:pwa
npm run build
npm run preview
```

All scripts named `test:*` can be run through their matching `npm run test:<name>` command. The repository's current `npm run lint` command has a known ESLint 10 / legacy-config incompatibility; it throws before linting and should not be treated as a clean lint run.

## Deployment

Cloudflare Workers Builds are configured to build with `npx opennextjs-cloudflare build` and deploy with `npx opennextjs-cloudflare deploy`. Confirm the production branch and preview the build before publishing. No deployment has been made by this branch yet.
