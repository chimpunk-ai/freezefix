import { NextResponse } from "next/server";
import { LIMITS } from "@/lib/quota";
import { screenshotsOn, voiceOn } from "@/lib/features";
import { aiKey } from "@/lib/ai";

// Tells the app which optional features are switched on. No secrets, no user data.
export const dynamic = "force-dynamic";

export async function GET() {
  const ai = Boolean(aiKey());
  return NextResponse.json({
    ai,
    voice: voiceOn(),
    screenshot: screenshotsOn(),
    voiceLimit: LIMITS.voice.free,
    // Nothing about the key, not even its shape. It was added to diagnose a dead key and
    // should never have outlived that: a public endpoint has no business describing a
    // secret, however harmless each field looks on its own.
  });
}
