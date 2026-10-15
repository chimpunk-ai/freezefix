import { NextResponse } from "next/server";
import { readDeviceId, deviceRef, rpc } from "@/lib/quota";

// Settings → Manage subscription. Asks Paddle for a one-time link to its customer portal,
// where the user can cancel, change plan or update their card. (Terms section 6.)
export async function POST(req: Request) {
  const apiKey = process.env.PADDLE_API_KEY;
  const deviceId = readDeviceId(req);
  if (!apiKey || !deviceId) return NextResponse.json({ error: "unavailable" }, { status: 503 });

  try {
    const ids = (await rpc("get_subscription_ids", { p_device_ref: await deviceRef(deviceId) })) as {
      customer_id?: string;
      subscription_id?: string;
    };
    if (!ids?.customer_id) return NextResponse.json({ error: "no_subscription" }, { status: 404 });

    const base = process.env.PADDLE_ENV === "production" ? "https://api.paddle.com" : "https://sandbox-api.paddle.com";
    const res = await fetch(`${base}/customers/${encodeURIComponent(ids.customer_id)}/portal-sessions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(ids.subscription_id ? { subscription_ids: [ids.subscription_id] } : {}),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { data?: { urls?: { general?: { overview?: string } } } };
    const url = data.data?.urls?.general?.overview;
    if (!url) throw new Error("no_url");
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}
