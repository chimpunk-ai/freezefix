import { NextRequest, NextResponse } from "next/server";
import { readDeviceId, newDeviceId, deviceCookie } from "@/lib/quota";
import { logEvent } from "@/lib/log";

// Saves the user's first name + device ID to Supabase so the founder can
// track daily user count.  The name is just a first name / nickname — no
// email, no surname, no PII beyond that.

export async function POST(req: NextRequest) {
  try {
    let deviceId = readDeviceId(req);
    const isNew = !deviceId;
    if (!deviceId) deviceId = newDeviceId();

    // Read the name from the body (optional — skip users won't send one).
    let name: string | null = null;
    try {
      const body = await req.json();
      if (typeof body.name === "string") {
        name = body.name.trim().slice(0, 40) || null;
      }
    } catch {
      /* body may be empty for legacy calls */
    }

    // Save to the "users" table in Supabase (upsert by device_id).
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (url && key && name) {
      await fetch(`${url.replace(/\/$/, "")}/rest/v1/users`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal,resolution=merge-duplicates",
        },
        body: JSON.stringify({
          device_id: deviceId,
          name,
        }),
        signal: AbortSignal.timeout(4000),
      });
    }

    // Also log an anonymous signup event for the events dashboard.
    await logEvent({ kind: "signup", value: 1 });

    const res = NextResponse.json({ ok: true });
    if (isNew) res.headers.append("Set-Cookie", deviceCookie(deviceId));
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
