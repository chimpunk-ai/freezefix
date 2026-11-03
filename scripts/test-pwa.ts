// Smoke tests for the PWA + Capacitor scaffolding.
// Run: npm run test:pwa
//
// This file catches the handful of things that would make the PWA
// silently useless or dangerous:
//   - The manifest.webmanifest exists and declares the minimum fields
//     browsers need to show "Add to Home Screen"
//   - public/sw.js exists and is valid JavaScript
//   - The service worker's PRECACHE list only names on-site URLs that
//     actually exist in the app directory (a 404 in the precache list
//     silently reduces offline coverage without an error, because the
//     install step swallows failures)
//   - public/offline.html exists and renders a plain reassurance page
//   - capacitor.config.ts exists, points at the production host, and
//     does NOT accidentally include a Cloudflare branch preview URL
//   - The service worker NEVER caches /api/ routes (critical for
//     anonymity + fresh chat replies)

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

type Result = { id: string; ok: boolean; note?: string };
const results: Result[] = [];
const check = (id: string, ok: boolean, note?: string) => results.push({ id, ok, note });

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");
const exists = (p: string) => existsSync(join(ROOT, p));

// ───────────────────────── manifest ─────────────────────────
{
  check("MANIFEST-exists", exists("public/manifest.webmanifest"));
  if (exists("public/manifest.webmanifest")) {
    const raw = read("public/manifest.webmanifest");
    let m: Record<string, unknown> = {};
    try {
      m = JSON.parse(raw);
      check("MANIFEST-parses", true);
    } catch {
      check("MANIFEST-parses", false, "manifest.webmanifest is not valid JSON");
    }
    check("MANIFEST-name", typeof m.name === "string" && (m.name as string).length > 0);
    check("MANIFEST-short_name", typeof m.short_name === "string" && (m.short_name as string).length > 0);
    check("MANIFEST-start_url", typeof m.start_url === "string" && (m.start_url as string).startsWith("/"));
    check("MANIFEST-display", m.display === "standalone" || m.display === "minimal-ui");
    check("MANIFEST-icons", Array.isArray(m.icons) && (m.icons as unknown[]).length >= 1);
    check("MANIFEST-theme_color", typeof m.theme_color === "string");
  }
}

// ───────────────────────── service worker ─────────────────────────
{
  check("SW-exists", exists("public/sw.js"));
  if (exists("public/sw.js")) {
    const sw = read("public/sw.js");
    check("SW-has-install-listener", sw.includes("addEventListener(\"install\""));
    check("SW-has-activate-listener", sw.includes("addEventListener(\"activate\""));
    check("SW-has-fetch-listener", sw.includes("addEventListener(\"fetch\""));
    check("SW-has-cache-name", /const\s+CACHE_NAME\s*=/.test(sw));
    check("SW-has-precache-array", /const\s+PRECACHE\s*=/.test(sw));

    // CRITICAL: the SW must never cache /api/ routes. A cached /api/chat
    // reply would be a stale AI call; a cached /api/waitlist would be a
    // fake "you joined" response. Scan the fetch handler for an explicit
    // bail-out on /api/.
    check("SW-skips-api-routes", /\/api\//.test(sw) && /api\/.*return|skip|network/.test(sw.toLowerCase()),
      "service worker must bail out on /api/ before falling through to the cache");

    // Verify every URL in PRECACHE either is a known static asset in
    // public/ or corresponds to a real app/ route. Catches typos that
    // would silently reduce the offline coverage.
    const match = sw.match(/const\s+PRECACHE\s*=\s*\[([\s\S]*?)\]/);
    if (match) {
      const urls = [...match[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
      check("SW-PRECACHE-not-empty", urls.length >= 5);
      for (const url of urls) {
        const ok =
          url === "/" ||
          url === "/offline.html" ||
          url === "/manifest.webmanifest" ||
          routeExists(url);
        check(`SW-precache-url-exists-${url}`, ok,
          `precache URL ${url} has no corresponding file in public/ or app/`);
      }
    }
  }
}

// ───────────────────────── offline fallback ─────────────────────────
{
  check("OFFLINE-exists", exists("public/offline.html"));
  if (exists("public/offline.html")) {
    const o = read("public/offline.html");
    check("OFFLINE-is-html", o.toLowerCase().startsWith("<!doctype html>"));
    // The offline page must link back home AND must mention the local
    // emergency number fallback explicitly, because a user offline is
    // one of the few moments the project rule's safety path matters.
    check("OFFLINE-links-home", o.includes("href=\"/\""));
    check("OFFLINE-mentions-emergency",
      /\b(999|112|911|000)\b/.test(o),
      "offline page must mention at least one local emergency number");
  }
}

// ───────────────────────── capacitor config ─────────────────────────
{
  check("CAP-config-exists", exists("capacitor.config.ts"));
  if (exists("capacitor.config.ts")) {
    const cfg = read("capacitor.config.ts");
    check("CAP-config-has-appId", /appId:\s*"com\.[\w.]+"/.test(cfg));
    check("CAP-config-has-appName", /appName:\s*"\w+/.test(cfg));

    // The native shell MUST point at the production URL — never a
    // Cloudflare branch preview or a staging host that a contributor
    // forgot to reset. Pre-commit catches this.
    check("CAP-server-is-production-only",
      cfg.includes("https://getfreezefix.com") && !cfg.includes("preview"),
      "capacitor.config.ts must point at https://getfreezefix.com, never a preview branch URL");

    // allowNavigation must be scoped to the production host; a wildcard
    // allowNavigation like ["*"] would let a redirect open an attacker
    // page inside the shell.
    check("CAP-allowNavigation-scoped",
      /allowNavigation:\s*\[\s*"getfreezefix\.com"/.test(cfg) ||
      /allowNavigation:\s*\[\s*"\*\.getfreezefix\.com"/.test(cfg) ||
      /allowNavigation:\s*\[[^\]]*getfreezefix\.com/.test(cfg),
      "allowNavigation must list getfreezefix.com explicitly");
  }
}

// ───────────────────────── docs ─────────────────────────
{
  check("DOCS-native-build-exists", exists("docs/native-build.md"));
}

// ───────────────────────── runner ─────────────────────────
const pass = results.filter((r) => r.ok).length;
const fail = results.length - pass;
for (const r of results.filter((x) => !x.ok)) {
  console.log(`  FAIL ${r.id}${r.note ? ` :: ${r.note}` : ""}`);
}
console.log(`PWA check: ${pass}/${results.length} passed`);
if (fail > 0) process.exit(1);

// ─────────────────── helpers ────────────────────

function routeExists(url: string): boolean {
  // Static asset in public/?
  const asStatic = url.replace(/^\//, "");
  if (exists(join("public", asStatic))) return true;

  // Next.js App Router route? app/<path>/page.tsx?
  // Normalise "/foo/bar" -> ["foo", "bar"]
  const parts = url.replace(/^\/|\/$/g, "").split("/");
  if (parts.length === 0 || (parts.length === 1 && parts[0] === "")) {
    // Root "/" is handled separately
    return exists("app/page.tsx");
  }
  const pagePath = join("app", ...parts, "page.tsx");
  return exists(pagePath);
}

// Keep a reference just so unused-import noise doesn't appear
void readdirSync;
void statSync;
