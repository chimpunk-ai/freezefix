import { NextResponse } from "next/server";
import { LIMITS } from "@/lib/quota";
import { screenshotsOn, voiceOn } from "@/lib/features";
import { aiKey, keyShape } from "@/lib/ai";

// Tells the app which optional features are switched on. No secrets, no user data.
export const dynamic = "force-dynamic";

export async function GET() {
  const ai = Boolean(aiKey());
  return NextResponse.json({
    ai,
    voice: voiceOn(),
    screenshot: screenshotsOn(),
    voiceLimit: LIMITS.voice.free,
    // Shape of the key only: the first 10 characters (identical for every real Console
    // key, so no part of the secret is revealed) plus its length. This exists so a
    // "wrong key" problem can be diagnosed without anyone pasting a key anywhere.
    key: keyShape(),
  });
}
