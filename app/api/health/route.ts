import { NextResponse } from "next/server";
import { aiKey } from "@/lib/ai";
import { paymentsOn } from "@/lib/plans";
import { PROMPT_VERSION, aiModel } from "@/lib/fix-prompt";

export const dynamic = "force-dynamic";

// GET /api/health — is this deployment wired up? Booleans only; no secret, no
// prefix of a secret, no account id ever leaves here. The owner opens it in a
// browser when "fix isn't working" and reads which knob is off.
//
// GET /api/health?probe=1 — additionally sends a one-token request to Anthropic
// with the configured model and reports the upstream status (not the body).
// Costs a fraction of a cent, so it is throttled to one probe a minute per
// isolate, and can be locked behind HEALTH_SECRET (sent as x-health-secret).

let lastProbe = 0;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = aiKey();
  const model = aiModel();

  const base = {
    ok: Boolean(key),
    aiKey: Boolean(key),
    model,
    promptVersion: PROMPT_VERSION,
    supabase: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    paymentsOn: paymentsOn(),
    vapid: Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY),
    time: new Date().toISOString(),
  };

  const headers = { "cache-control": "no-store" };

  if (url.searchParams.get("probe") !== "1") {
    return NextResponse.json(base, { headers });
  }

  const secret = process.env.HEALTH_SECRET?.trim();
  if (secret && req.headers.get("x-health-secret") !== secret) {
    return NextResponse.json({ ...base, provider: { ok: false, status: 0, code: "probe_locked" } }, { headers });
  }
  if (!key) {
    return NextResponse.json({ ...base, provider: { ok: false, status: 0, code: "no_key" } }, { headers });
  }
  const now = Date.now();
  if (now - lastProbe < 60_000) {
    return NextResponse.json({ ...base, provider: { ok: false, status: 0, code: "probe_throttled" } }, { headers });
  }
  lastProbe = now;

  let status = 0;
  let code = "provider_error";
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model, max_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
      signal: AbortSignal.timeout(15_000),
    });
    status = res.status;
    if (res.ok) code = "ok";
    else if (status === 401 || status === 403) code = "provider_auth";
    else if (status === 404) code = "model_rejected";
    else if (status === 400) {
      const detail = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      code = (detail?.error?.message ?? "").toLowerCase().includes("model") ? "model_rejected" : "provider_error";
    } else if (status === 429) code = "provider_rate";
    else if (status === 529 || status === 503) code = "provider_overloaded";
  } catch (e) {
    code = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError") ? "provider_timeout" : "provider_error";
  }
  console.error("health probe:", code, status);
  return NextResponse.json({ ...base, ok: base.ok && code === "ok", provider: { ok: code === "ok", status, code } }, { headers });
}
