import { NextResponse } from "next/server";
import { rpc } from "@/lib/quota";

// Paddle Billing webhook. Paddle calls this when a subscription starts, renews, changes or ends.
// We verify Paddle's signature with our secret, then store ONLY: the device hash, subscription
// and customer IDs, status, price and period end. No email, no card, no name.

const MAX_AGE_SECONDS = 300;

async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function POST(req: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const raw = await req.text();
  const header = req.headers.get("paddle-signature") || "";
  const parts = Object.fromEntries(header.split(";").map((p) => p.split("=") as [string, string]));
  const ts = parts.ts;
  const h1 = parts.h1;
  if (!ts || !h1) return NextResponse.json({ error: "no_signature" }, { status: 401 });
  if (Math.abs(Date.now() / 1000 - Number(ts)) > MAX_AGE_SECONDS) return NextResponse.json({ error: "stale" }, { status: 401 });
  const expected = await hmacHex(secret, `${ts}:${raw}`);
  if (!safeEqual(expected, h1)) return NextResponse.json({ error: "bad_signature" }, { status: 401 });

  let event: {
    event_type?: string;
    data?: {
      id?: string;
      status?: string;
      customer_id?: string;
      custom_data?: { ref?: string } | null;
      items?: { price?: { id?: string } }[];
      current_billing_period?: { ends_at?: string } | null;
    };
  };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  // We only act on subscription events; everything else is acknowledged and ignored.
  if (!event.event_type?.startsWith("subscription.") || !event.data) return NextResponse.json({ ok: true });

  const d = event.data;
  const ref = d.custom_data?.ref;
  if (!ref || !/^[a-f0-9]{64}$/.test(ref) || !d.id || !d.status) return NextResponse.json({ ok: true, skipped: true });

  try {
    await rpc(
      "upsert_entitlement",
      {
        p_device_ref: ref,
        p_subscription_id: d.id,
        p_customer_id: d.customer_id ?? null,
        p_status: d.status,
        p_price_id: d.items?.[0]?.price?.id ?? null,
        p_period_ends_at: d.current_billing_period?.ends_at ?? null,
      },
      { service: true }
    );
  } catch {
    // Tell Paddle to retry later.
    return NextResponse.json({ error: "db" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
