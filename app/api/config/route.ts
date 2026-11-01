import { NextResponse } from "next/server";
import { LIMITS } from "@/lib/quota";
import { screenshotsOn, voiceOn } from "@/lib/features";
import { aiKey } from "@/lib/ai";
import { paymentsOn } from "@/lib/plans";

// Tells the app which optional features are switched on, and the per-day caps that
// apply when those features are on. No secrets, no user data, no per-device counts.
//
// `limits` is a static shape — the free/paid caps the server enforces. A real
// "remaining today" needs a peek_quota RPC on Supabase and a backend commit, so this
// endpoint deliberately exposes caps only. The Settings page is honest about this.
export const dynamic = "force-dynamic";

export async function GET() {
  const ai = Boolean(aiKey());
  const beta = !paymentsOn(); // payments are frozen → chat is open to everyone

  return NextResponse.json({
    ai,
    beta,
    voice: voiceOn(),
    screenshot: screenshotsOn(),
    // Kept for backward compatibility with components/Chat.tsx; `limits.voice.free`
    // is the new canonical shape.
    voiceLimit: LIMITS.voice.free,
    limits: {
      voice: LIMITS.voice,
      screenshot: LIMITS.screenshot,
      check: LIMITS.check,
    },
    // Nothing about the API key, not even its shape. It was added to diagnose a dead
    // key and should never have outlived that: a public endpoint has no business
    // describing a secret, however harmless each field looks on its own.
  });
}
