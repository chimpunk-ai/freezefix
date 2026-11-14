// FreezeFix service worker.
//
// Shipped 3 November 2026 for Europe-audit P3.13. Makes getfreezefix.com an
// installable Progressive Web App and the same bundle a Capacitor wrapper
// can ship to the iOS App Store and Google Play as a native shell.
//
// What this service worker does
//   1. On install: pre-caches the four landing pages, the three SEO pages,
//      the Reduction Program shell, and the small set of assets that make
//      the first offline open calm instead of broken.
//   2. On fetch:
//      - For HTML navigations, tries the network first (so users always
//        get the latest copy when they're online) and falls back to the
//        cached version offline, finally to /offline.html if neither
//        exists. Prevents a frozen stale page from standing in for a
//        page that's been published since.
//      - For same-origin static assets (fonts, images, CSS, JS,
//        manifest, SVG), serves cache-first and refreshes in the
//        background (stale-while-revalidate).
//      - For API routes (/api/*) and the warm endpoint, ALWAYS goes to
//        the network. The chat, waitlist, suggest, config, and warm
//        endpoints are not safe to serve from cache — stale AI replies
//        or a cached quota count would be worse than an offline error.
//   3. On activate: deletes old caches so a redeploy doesn't leave stale
//      bundles behind forever.
//
// What this service worker DOES NOT do
//   - No background sync. The project's "no reminders you didn't ask for"
//     rule applies here too: a plan should not nag.
//   - No push subscription against a server. The reminder below is local:
//     the page decides the time, this worker shows the notification, and
//     nothing about the user leaves the device to make it work.
//   - No analytics beacon, no telemetry, no logging.
//   - No cache of /api/chat or /api/waitlist or anything user-identifying.
//
// Versioning
//   CACHE_NAME includes a date-tagged version. Bump it to force an
//   immediate refresh of pre-cached pages on next activate.

const VERSION = "v2-2026-11-14";
const CACHE_NAME = `freezefix-${VERSION}`;

// Pre-cached shells — pages a user is most likely to open first, and the
// one they'd want to see first if they open offline. Kept short on purpose;
// the service worker is not a universal mirror of the site.
const PRECACHE = [
  "/",
  "/de",
  "/fr",
  "/nl",
  "/program",
  "/too-high-what-to-do",
  "/zu-high-was-tun",
  "/greened-out",
  "/help",
  "/offline.html",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-maskable.svg",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // addAll fails atomically — if any URL 404s, nothing gets cached. Use
      // individual add() calls so a single stale URL doesn't break install.
      for (const url of PRECACHE) {
        try {
          await cache.add(new Request(url, { cache: "reload" }));
        } catch {
          // One missing shell is not worth failing the whole install over.
        }
      }
      await self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n.startsWith("freezefix-") && n !== CACHE_NAME)
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return; // Only GET is safe to cache.

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // API routes never touch the cache — chat replies, quota counts and the
  // waitlist POST path must always be live.
  if (url.pathname.startsWith("/api/")) return;

  const isHtml =
    req.mode === "navigate" ||
    (req.headers.get("accept") || "").includes("text/html");

  if (isHtml) {
    event.respondWith(networkFirstHtml(req));
    return;
  }

  event.respondWith(staleWhileRevalidate(req));
});

async function networkFirstHtml(req) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch {
    const cached = await cache.match(req);
    if (cached) return cached;
    const offline = await cache.match("/offline.html");
    if (offline) return offline;
    return new Response("Offline", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(req);
  const network = fetch(req)
    .then((res) => {
      if (res && res.ok) cache.put(req, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || network;
}

// ---------------------------------------------------------------------------
// Daily reminder
//
// One quiet notification a day at the time the user picked, and only if they
// turned it on. The page posts this message when it sees the time has passed;
// the worker does the showing so the notification survives the tab losing
// focus, and so tapping it lands on the log instead of a blank browser.
//
// The tag means a second reminder for the same day replaces the first rather
// than stacking up. No streaks, no "you missed 3 days", no renotify buzz.
// ---------------------------------------------------------------------------
self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type !== "reminder") return;
  event.waitUntil(
    self.registration.showNotification(data.title || "three taps when you're ready", {
      body: data.body || "no rush.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "ff-daily-log",
      renotify: false,
      data: { url: data.url || "/app" },
    })
  );
});

// Only used if a push service is ever configured server-side. The payload is
// read defensively because a push can arrive with no body at all.
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }
  event.waitUntil(
    self.registration.showNotification(payload.title || "three taps when you're ready", {
      body: payload.body || "no rush.",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "ff-daily-log",
      data: { url: payload.url || "/app" },
    })
  );
});

// Tapping the reminder focuses an already-open window when there is one, so it
// doesn't pile up duplicate tabs on a phone.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/app";
  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clientList) {
        if (client.url.includes(target) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
      return undefined;
    })()
  );
});
