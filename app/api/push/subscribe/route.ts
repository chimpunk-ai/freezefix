import { NextResponse } from "next/server";
import { parseSubscribeBody, pushConfigured, upsertSubscription } from "@/lib/push";

// Store (or update) a reminder subscription. The browser sends its push
// endpoint and keys plus which reminders it wants, a local hour and a
// timezone. Nothing else is accepted: unknown fields are dropped by the
// parser, and nothing about the log is in the body.
export async function POST(req: Request) {
  if (!pushConfigured()) {
    return NextResponse.json({ error: "off" }, { status: 503 });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const sub = parseSubscribeBody(body);
  if (!sub) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  try {
    await upsertSubscription(sub);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
