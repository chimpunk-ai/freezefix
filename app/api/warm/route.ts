import { NextResponse } from "next/server";

// Tiny warm-up endpoint. Returns an immediate 200 and nothing of value — the whole
// point is just to make the Cloudflare Worker handle a request so the HTTP isolate
// stays warm. Pings come from the scheduled GitHub Actions workflow at
// .github/workflows/warm.yml every 5 minutes.
//
// What this endpoint deliberately does NOT do:
// - Touch Anthropic (that would eat chat quota and be an actual AI call)
// - Touch Supabase (anonymous counts, quota rows, entitlements — all read-only)
// - Set a cookie
// - Log the user's words or any identifier
//
// There is no abuse surface here: the response has no state and no cost. A spammer
// hitting it just helps us keep the Worker warm, which is the entire goal.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { ok: true, ts: Date.now() },
    {
      headers: {
        // Make it clear this is not a cacheable surface — the Worker needs to run
        // for each ping, otherwise warming via cache would defeat the point.
        "Cache-Control": "no-store",
      },
    }
  );
}

// HEAD lets a monitoring service check liveness without downloading the body.
// Still forces the Worker to run.
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
