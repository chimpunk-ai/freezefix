import { NextResponse } from "next/server";
import {
  importVapidPrivateKey,
  listActiveSubscriptions,
  markSent,
  pushConfigured,
  removeSubscriptionService,
  runTick,
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

  // The who's-due / what-gets-sent / what-gets-marked decisions live in
  // lib/push.ts's runTick so they can run under test; this just wires in the
  // real push service and the real store. One push covers both kinds if they
  // ever coincide; the worker shows the Sunday text then.
  const counts = await runTick(subs, {
    send: (endpoint) => sendEmptyPush(endpoint, key, pub),
    mark: markSent,
    remove: removeSubscriptionService,
  });

  return NextResponse.json(counts);
}
