import { NextResponse } from "next/server";
import {
  dueKinds,
  importVapidPrivateKey,
  listActiveSubscriptions,
  localNow,
  markSent,
  pushConfigured,
  removeSubscriptionService,
  sendEmptyPush,
} from "@/lib/push";

// Called every ten minutes by .github/workflows/push-tick.yml. Sends whatever
// is due in each subscriber's local time. Empty payloads: the service worker
// picks the wording from its own clock. Bounded: one pass, concurrency 25,
// and each kind at most once per local date.
export async function POST(req: Request) {
  const secret = process.env.PUSH_TICK_SECRET;
  if (!secret || req.headers.get("x-tick-secret") !== secret) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  // Reminders aren't configured yet (no VAPID keys in secrets, or no DB).
  // This is a deliberate "feature off" state, not a server error. Returning
  // 503 made the GitHub Actions cron (every 10 min = 36 hits in 6h) register
  // as 5xx in Cloudflare metrics, which skewed the observable error rate up
  // to 15% while nothing was actually broken. Return 200 noop instead; the
  // cron sees success and doesn't retry, metrics stay honest.
  if (!pushConfigured()) {
    return NextResponse.json({ ok: true, noop: "reminders-not-configured" });
  }

  const pub = process.env.VAPID_PUBLIC_KEY as string;
  let key: CryptoKey;
  try {
    key = await importVapidPrivateKey(pub, process.env.VAPID_PRIVATE_KEY as string);
  } catch {
    // Bad key format IS a real server error — the secret is present but
    // wrong, so this one stays as 500 so it shows up in alerting.
    return NextResponse.json({ error: "bad_keys" }, { status: 500 });
  }

  let subs;
  try {
    subs = await listActiveSubscriptions();
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const now = new Date();
  const counts = { checked: subs.length, sent: 0, gone: 0, failed: 0 };
  const queue = subs.filter((s) => {
    const d = dueKinds(s, now);
    return d.sunday || d.nightly;
  });

  const CONCURRENCY = 25;
  for (let i = 0; i < queue.length; i += CONCURRENCY) {
    const slice = queue.slice(i, i + CONCURRENCY);
    await Promise.allSettled(
      slice.map(async (s) => {
        const due = dueKinds(s, now);
        const local = localNow(s.tz, now);
        if (!local) return;
        // One push covers both kinds if they ever coincide; the worker shows the Sunday text then.
        const result = await sendEmptyPush(s.endpoint, key, pub);
        if (result === "gone") {
          counts.gone++;
          await removeSubscriptionService(s.endpoint).catch(() => {});
          return;
        }
        if (result === "failed") {
          counts.failed++;
          return;
        }
        counts.sent++;
        if (due.sunday) await markSent(s.endpoint, "sunday", local.date).catch(() => {});
        if (due.nightly) await markSent(s.endpoint, "nightly", local.date).catch(() => {});
      }),
    );
  }

  return NextResponse.json(counts);
}
