import { NextResponse } from "next/server";
import { consumeQuota, refundQuota, readDeviceId, newDeviceId, deviceCookie } from "@/lib/quota";
import { voiceOn } from "@/lib/features";

// Voice note → text. Up to 60 seconds. The audio is sent to the transcription service once
// and never stored by FreezeFix. The text goes back to the phone, where the user can see it,
// and then through the same safety check as typed words before any moves.
//
// Provider is set in Cloudflare secrets (Budget & Ops picks it, HQ T33). Any service with an
// OpenAI-style /audio/transcriptions endpoint works. Until a key is set, voice is switched off.

const MAX_BYTES = 3 * 1024 * 1024; // 60 sec of compressed voice is well under this
const OK_TYPES = ["audio/webm", "audio/ogg", "audio/mp4", "audio/mpeg", "audio/wav", "audio/x-m4a", "audio/aac"];

export async function POST(req: Request) {
  const apiKey = process.env.TRANSCRIBE_API_KEY;
  if (!voiceOn() || !apiKey) return NextResponse.json({ error: "voice_off" }, { status: 503 });

  let deviceId = readDeviceId(req);
  const isNewDevice = !deviceId;
  if (!deviceId) deviceId = newDeviceId();

  // Captured by `respond`: when the Supabase-less fallback counter in consumeQuota
  // returns a Set-Cookie, we must apply it or the fallback never persists its count.
  let countCookie: string | null = null;
  const respond = (body: unknown, status = 200) => {
    const res = NextResponse.json(body, { status });
    if (isNewDevice) res.headers.append("Set-Cookie", deviceCookie(deviceId!));
    if (countCookie) res.headers.append("Set-Cookie", countCookie);
    return res;
  };

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return respond({ error: "bad_request" }, 400);
  }
  const file = form.get("audio");
  const seconds = Number(form.get("seconds") || 0);
  if (!(file instanceof Blob) || file.size === 0) return respond({ error: "no_audio" }, 400);
  if (file.size > MAX_BYTES || seconds > 62) return respond({ error: "too_long" }, 413);
  const baseType = (file.type || "").split(";")[0];
  if (baseType && !OK_TYPES.includes(baseType)) return respond({ error: "bad_type" }, 415);

  // Daily limit, counted on the server: 3 free, 6 paid.
  const quota = await consumeQuota(req, deviceId, "voice");
  countCookie = quota.setCookie ?? null;
  if (!quota.allowed) {
    // "limit" is too generic — lib/chat-errors.ts can't map it to a sensible message.
    // Use "voice_limit" so the client renders "That's today's voice notes" rather
    // than the generic "That didn't come through" fallback.
    return respond({ error: quota.reason === "limit" ? "voice_limit" : "voice_off", used: quota.used, limit: quota.limit }, 429);
  }

  try {
    const out = new FormData();
    const ext = baseType.includes("mp4") || baseType.includes("m4a") || baseType.includes("aac") ? "m4a" : baseType.includes("ogg") ? "ogg" : baseType.includes("wav") ? "wav" : baseType.includes("mpeg") ? "mp3" : "webm";
    out.append("file", file, `voice.${ext}`);
    out.append("model", process.env.TRANSCRIBE_MODEL || "gpt-4o-mini-transcribe");
    // Helps with Hindi-English mixing. The service keeps the user's own language.
    out.append("prompt", "Casual speech. May mix English and Hindi (Hinglish). Write Hindi words in the script the speaker would type.");
    out.append("response_format", "json");

    const res = await fetch(process.env.TRANSCRIBE_URL || "https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: out,
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) throw new Error(`stt_${res.status}`);
    const data = (await res.json()) as { text?: string };
    const text = String(data.text ?? "").trim().slice(0, 1200);
    if (!text) {
      await refundQuota(req, deviceId, "voice");
      return respond({ error: "empty" }, 422);
    }
    return respond({ text, used: quota.used, limit: quota.limit });
  } catch {
    await refundQuota(req, deviceId, "voice");
    return respond({ error: "failed" }, 502);
  }
}
