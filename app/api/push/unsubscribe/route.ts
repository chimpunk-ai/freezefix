import { NextResponse } from "next/server";
import { removeSubscription } from "@/lib/push";

// Forget a subscription. Idempotent: an endpoint we never had still returns ok.
export async function POST(req: Request) {
  let endpoint = "";
  try {
    const b = (await req.json()) as { endpoint?: unknown };
    endpoint = typeof b.endpoint === "string" ? b.endpoint : "";
  } catch {
    /* fall through */
  }
  if (!/^https:\/\/[^\s]{10,1500}$/.test(endpoint)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  try {
    await removeSubscription(endpoint);
  } catch {
    /* database down: the browser-side unsubscribe already happened; the next tick's 410 cleans us up */
  }
  return NextResponse.json({ ok: true });
}
