// Capacitor configuration for the FreezeFix native shells.
//
// Shipped 3 November 2026 as part of audit P3.13. This file is a
// scaffold: Capacitor is NOT installed as a dependency yet because the
// native build is a user-driven step (requires Xcode for iOS and Android
// Studio for Android, neither of which Cloudflare's build has). To build
// the native shells, follow docs/native-build.md.
//
// Architecture decision: WebView mode, not static export
//
// The FreezeFix web app runs on Cloudflare Workers via @opennextjs/
// cloudflare. The chat, waitlist, suggest and config routes depend on
// that runtime. A static-export (`output: 'export'`) rebuild would break
// every one of those surfaces because there is no in-bundle runtime to
// serve them from.
//
// Instead this config points Capacitor at the live site
// (https://getfreezefix.com). The native shell is a thin WebView around
// the same Workers-hosted web app. Users get:
//   - A native app installable from the App Store and Google Play
//   - Native status bar + splash
//   - Full access to the same chat, Reduction Program, waitlist, SEO
//     landings — all served by the same code that already runs
//   - Automatic updates when the web app is redeployed (no app-store
//     review per update to the chat prompt or the safety screens)
//
// Trade-off accepted: offline usability inside the WebView is limited
// to what the service worker (public/sw.js) caches, which is the four
// landing pages, the three SEO landings, the program shell, the help
// screen and the offline fallback. The Fix chat requires network.

import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.getfreezefix.app",
  appName: "FreezeFix",
  // Point Capacitor's WebView at the live Workers-hosted site. The
  // bundle does NOT ship a copy of the web app — it opens the live URL
  // in the shell. That is why webDir is set to a tiny placeholder: the
  // Capacitor tooling expects a webDir to exist but will not actually
  // serve from it when `server.url` is set.
  webDir: "capacitor-webdir",
  server: {
    url: "https://getfreezefix.com",
    // The native shell is for the production site only. Preview Cloudflare
    // branch URLs are reached by replacing this value when running a dev
    // native build locally.
    cleartext: false,
    // iOS and Android both allow the WebView to reach any origin by
    // default. We leave that permissive so the WebView can talk back to
    // the same host it is viewing — anything that worked in the browser
    // works here.
    allowNavigation: ["getfreezefix.com", "*.getfreezefix.com"],
  },
  // Keep the status bar readable against the Grove palette.
  ios: {
    contentInset: "automatic",
  },
  android: {
    allowMixedContent: false,
  },
  // Splash and status bar plugins ship their own config via their SDKs;
  // we deliberately don't add them here until a native build run has been
  // tested on-device by the owner.
};

export default config;
