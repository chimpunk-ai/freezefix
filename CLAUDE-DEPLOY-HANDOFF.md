# Claude deployment handoff — FreezeFix / Fix

Please review and deploy the changes for repository `chimpunk-ai/freezefix` to the existing production Cloudflare Worker for `getfreezefix.com`. Preserve the existing deployment configuration and secrets; do not create another site or change domains.

## Applying the changes

The GitHub push has not happened. The complete pending change is supplied separately as the [ready-to-apply patch](/home/ubuntu/freezefix-ready-to-apply.patch). Start from a clean checkout of the production branch. Verify that `origin/main` still has base revision `9da2caa151d48786dd92ada0df9bb4ca1b6bc4c1b` and that there is no user work to overwrite. Run `git apply --check` before `git apply`. The patch contains the earlier landing-page update as well as this product refactor. Review the resulting diff and this file, then run the verification below before committing or deploying.

## What changes

This change makes `/home` a brief, device-local daily cannabis log (yes/no, five drawn mood faces, up to three optional context chips, optional ten-second browser speech, and a user-defined weekly goal); reshapes `/patterns` as a descriptive local weekly mirror and past-week archive; adds a detailed `/product` page and links to it from the public landing-page footers; updates metadata and the PWA start page; adds local-only nickname, deletion, and consent-withdrawal controls; retires nickname upload (`/api/signup` returns 410); corrects legacy chat privacy disclosures; and redirects the old `/program` and `/plans` reduction-plan pages to `/home`. Crisis and urgent-help pages remain freely available.

The user's “year ahead” roadmap/targets are deliberately excluded from public copy.

## Keep disabled during deployment

Do not enable payment processing, checkout, subscriptions, or trials. `paymentsOn()` is deliberately hard-disabled even if old Paddle credentials exist. The public pricing page is a waitlist and nobody should be charged. Do not claim that Sunday notifications, bedtime reminders, cross-device sync, or mirror-grounded AI chat are live. Do not change environment secrets or include them in build logs.

## Verification before publishing

Run `npm ci`, `npm run typecheck`, each repository `npm run test:<name>` script, `npm run build`, and `npm run preview`. Smoke-test `/`, `/product`, `/home`, `/patterns`, `/settings`, `/privacy`, `/help`, `/program`, and `/plans` at desktop and mobile widths. Confirm the old plan routes redirect to `/home`, `/api/signup` returns 410 without writing a row, and `/api/paywall` reports `paymentsOn: false`.

In a fresh browser profile, verify the age and sensitive-data consent gates, save/reopen a sample log, check its local-only archive, and clear the data. Test speech in a supported and unsupported browser, reduced-motion preferences, keyboard use, and help access before consent. Deploy only after those checks; then verify the production routes, PWA manifest/service worker, and logs.

## Known release caveats

TypeScript, all repository regression tests, the Next.js production build, and the Cloudflare OpenNext build passed in the Manus sandbox. The current `npm run lint` script fails before linting because of an ESLint 10 / legacy-config circular-serialization error; do not report it as a lint pass. The redesigned in-app flow remains English-first pending Italian and Spanish human QA. The mirror only compares same-day mood ratings; no next-morning correlation is collected or claimed. The local log is not backed up or recoverable after browser storage is cleared or the device is lost.
