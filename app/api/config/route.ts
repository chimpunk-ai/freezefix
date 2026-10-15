import { NextResponse } from "next/server";
import { LIMITS } from "@/lib/quota";
import { screenshotsOn, voiceOn } from "@/lib/features";

// Tells the app which optional features are switched on. No secrets, no user data.
export const dynamic = "force-dynamic";

export async function GET() {
  const ai = Boolean(process.env.ANTHROPIC_API_KEY);
  return NextResponse.json({
    ai,
    voice: voiceOn(),
    screenshot: screenshotsOn(),
    voiceLimit: LIMITS.voice.free,
  });
}
