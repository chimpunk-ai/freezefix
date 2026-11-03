# Building the native FreezeFix shell (iOS + Android)

Shipped 3 November 2026 as audit P3.13. This document walks through
building the iOS and Android native shells for FreezeFix using Capacitor.

The web app at `getfreezefix.com` is already a **Progressive Web App** — a
visitor can "Add to Home Screen" from any browser and get an installable
icon, splash, and standalone window. The native shell goes one step
further: a `.ipa` and a `.apk` that go through the App Store and Google
Play, with native status bar, splash and app lifecycle handling.

Both share the same WebView architecture: the native shell loads the
live `getfreezefix.com` URL. There is **no second code path**, no static
export, no duplicated API routes. The chat, Reduction Program, waitlist
and SEO landings all served by the same Cloudflare Workers runtime that
powers the web app today.

## Why WebView mode, not a static export

The web app depends on server runtime for several surfaces:

- `/api/chat` — streaming Anthropic calls, server-side only
- `/api/waitlist`, `/api/suggest`, `/api/signup` — Supabase RPCs
- `/api/config`, `/api/warm`, `/api/paywall` — small helpers

A Next.js static export (`output: 'export'`) would strip every one of
those from the bundle. The chat would stop working inside the native
app. WebView mode avoids that entirely: the shell opens the live URL
and the server stays where it already is.

**Trade-offs:**

- **Updates ship instantly.** No App Store review for a chat prompt or
  safety-screen tweak — redeploy the web app and the native shell
  picks it up on next open.
- **Offline is limited** to what `public/sw.js` caches: the four
  landing pages, the three SEO landings, the Program shell, the help
  screen, and the `offline.html` fallback. The Fix chat requires
  network, which is accurate — a chat without a live model is nothing.
- **Native-only features** (biometric unlock, push notifications,
  background sync) are not wired. The project rule _"no reminders you
  did not ask for"_ makes push the wrong default anyway; it can be
  added behind an explicit opt-in later.

## Prerequisites

- Node.js 20+
- An App Store Connect account (iOS) — Apple Developer Program ($99/yr)
- A Google Play Developer account (Android) — $25 one-time
- **Xcode** installed on macOS (iOS build)
- **Android Studio** installed, with Android SDK + Platform Tools (Android build)

Capacitor is not currently in `package.json`. The first contributor to
build the native shell runs:

```bash
npm install --save-dev @capacitor/cli
npm install @capacitor/core @capacitor/ios @capacitor/android
```

This adds four MIT-licensed dependencies. No cost, no vendor lock-in,
no telemetry — Capacitor is maintained by Ionic (same stack most
cannabis-adjacent harm-reduction and wellness apps use on the stores).

## Build and run

The repository already includes [`capacitor.config.ts`](../capacitor.config.ts)
and a one-line `capacitor-webdir/` stub.

### iOS

```bash
# One-time setup
npx cap add ios

# Each build
npx cap sync ios        # copies webDir + config into ios/
npx cap open ios        # opens ios/App/App.xcworkspace in Xcode
# ... Xcode -> Product -> Archive -> App Store Connect
```

### Android

```bash
# One-time setup
npx cap add android

# Each build
npx cap sync android          # copies webDir + config into android/
npx cap open android          # opens android/ in Android Studio
# ... Build -> Generate Signed Bundle / APK -> AAB
```

Both commands pick up the server URL from `capacitor.config.ts`.
To preview against a Cloudflare branch URL during development, edit
`server.url` in that file locally. Do not commit the branch URL.

## Icons and splash screens

The web manifest's icons at `public/icon.svg` and `public/icon-maskable.svg`
are the SVG masters. Capacitor needs rasterized PNG variants for the
native projects (iOS and Android both reject SVG app icons):

```bash
# Install the generator one-time
npm install --save-dev @capacitor/assets

# Place master images (1024x1024 PNG for icon, 2732x2732 PNG for splash)
# at resources/icon.png and resources/splash.png, then:
npx capacitor-assets generate
```

The 1024x1024 PNG icon should be rendered from `public/icon.svg`
without the maskable safe-zone padding; the maskable variant from
`public/icon-maskable.svg`. The splash should be the dark Grove green
`#0F1F1A` with the Fix wordmark centred.

**Do not use a photo of a real person on either the icon or splash** —
the Terms + Vision rule _"no clinical or treatment claims"_ extends to
avoiding anything that could be read as "a therapist you can download".

## Safety-pack items to re-check before store submission

Both stores check against regulated-health language in app
descriptions and screenshots. Specifically, Apple's App Review Guideline
1.1.6 and Google Play's Health Content policy will reject apps that
claim to treat substance use disorder or make clinical outcome claims.

Before submitting:

- Store listings and in-app screenshots must match `getfreezefix.com`'s
  Terms section 5 and the Vision doc: _"not therapy, not medical advice,
  not an emergency service."_
- The `/privacy` and `/terms` pages must be reachable without a login
  (they are — static routes).
- The crisis path (`/help`, `/sos`, the emergency wall) must work with
  no network for the local emergency number only. The service worker
  caches `/help` for this reason; `/sos` is a client-render page served
  by Workers so it needs the first open online.
- The age gate (18+) must be the first thing a new install sees. The
  existing `ff_adult` localStorage gate handles this inside the WebView,
  so no extra wiring is needed — but the store listing age rating must
  match (17+ on Apple, "Mature 17+" on Google Play).

## What this document deliberately does NOT do

- **No app-store submission steps.** The listing, screenshots, privacy
  nutrition label and age rating are the owner's call and vary per
  review cycle.
- **No signing-cert management.** Those secrets never belong in the
  repository.
- **No bundled analytics or crash reporter.** The project rule _"collect
  the minimum personal data necessary"_ applies to native too; add
  these only behind an explicit, reviewed consent design.
