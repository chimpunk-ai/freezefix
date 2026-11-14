import { NextResponse } from "next/server";
import { aiKey } from "@/lib/ai";
import { keywordCheck } from "@/lib/risk";
import { resourcesFor } from "@/lib/resources";
import {
  consumeQuota,
  deviceCookie,
  isPaid,
  newDeviceId,
  readDeviceId,
  serverTrialActive,
  LIMITS,
} from "@/lib/quota";
import { paymentsOn } from "@/lib/plans";
import { PROMPT_VERSION, SYSTEM, aiModel, endWithStatement } from "@/lib/fix-prompt";

export const dynamic = "force-dynamic";

// Fix: one question about your own week, answered from your own log.
//
// Three rules are enforced here, in code, not in the prompt:
//   1. Crisis language stops the chat and hands over real phone numbers.
//   2. The turn cap is a server cap, counted per device per day (5 free, 20 paid).
//   3. After the free days, Fix is behind the paywall like everything else except help.
//
// Failure is legible. Every non-success path returns one of the codes below and
// logs one short line (code + upstream status, never the user's text), so the
// owner can read the Workers log and know which knob to turn. docs/fix-ai.md
// has the table.
//
//   bad_request          malformed or empty body                      400
//   limit                today's turns are used up                    429
//   no_key               ANTHROPIC_API_KEY is not set on the server   503
//   model_rejected       the configured AI_MODEL doesn't exist        502
//   provider_auth        the key was rejected (401/403)               502
//   provider_rate        Anthropic rate-limited us (429, after retry) 502
//   provider_overloaded  Anthropic 529/503 after retry                502
//   provider_timeout     no answer within 25s                         502
//   provider_empty       200 with no text                             502
//   provider_error       anything else from Anthropic                 502
//   quota_unavailable    reserved; the quota store being down no      —
//                        longer refuses the feature (see below)

export type FixErrorCode =
  | "bad_request"
  | "limit"
  | "no_key"
  | "model_rejected"
  | "provider_auth"
  | "provider_rate"
  | "provider_overloaded"
  | "provider_timeout"
  | "provider_empty"
  | "provider_error"
  | "quota_unavailable";

type Turn = { role: "user" | "assistant"; text: string };

function turnsFrom(value: unknown): Turn[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((t): t is Turn => {
      if (!t || typeof t !== "object") return false;
      const turn = t as { role?: unknown; text?: unknown };
      return (turn.role === "user" || turn.role === "assistant") && typeof turn.text === "string";
    })
    .slice(-8)
    .map((t) => ({ role: t.role, text: t.text.slice(0, 1200) }));
}

function crisisPayload(region: string) {
  const r = resourcesFor(region);
  const lines = [r.emergency, ...r.crisis, ...r.urgentMentalHealth]
    .filter(Boolean)
    .slice(0, 4)
    .map((c) => ({ label: c.label, display: c.display, tel: c.tel, url: c.url, note: c.note }));
  return {
    crisis: true,
    say: "this is bigger than me. please talk to a person. these are free, now.",
    lines,
  };
}

function fail(code: FixErrorCode, status: number, headers: Headers, extra: Record<string, unknown> = {}, upstream?: number | string) {
  console.error("fix:", code, upstream ?? status, PROMPT_VERSION);
  return NextResponse.json({ error: code, ...extra }, { status, headers });
}

// When the quota store can't be reached, Fix used to refuse outright — a Supabase
// blip read as "fix is quiet" for everyone. The turn cap exists for the user's
// sake, not as a hard cost wall, so now we fail open to the free limit, counted
// in this isolate's memory (and the per-device cookie counter the no-database
// path already uses). Weaker than the database — a new isolate starts at zero —
// but a working Fix with a soft cap beats a dead one with a perfect cap.
const softCounts = new Map<string, { day: string; n: number }>();
function softConsume(deviceId: string, limit: number): { allowed: boolean; used: number } {
  const day = new Date().toISOString().slice(0, 10);
  const cur = softCounts.get(deviceId);
  const n = cur && cur.day === day ? cur.n : 0;
  if (n >= limit) return { allowed: false, used: n };
  softCounts.set(deviceId, { day, n: n + 1 });
  if (softCounts.size > 5000) softCounts.clear();
  return { allowed: true, used: n + 1 };
}

type Ask = { text: string } | { error: FixErrorCode; upstream: number | string };

async function ask(system: string, messages: { role: string; content: string }[], key: string): Promise<Ask> {
  const model = aiModel();
  let last: Ask = { error: "provider_error", upstream: "unknown" };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({ model, max_tokens: 500, system, messages }),
        signal: AbortSignal.timeout(25_000),
      });

      if (res.status === 429 || res.status === 529 || res.status === 503 || res.status === 500 || res.status === 502) {
        last = { error: res.status === 429 ? "provider_rate" : "provider_overloaded", upstream: res.status };
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      if (res.status === 401 || res.status === 403) return { error: "provider_auth", upstream: res.status };
      if (res.status === 404) return { error: "model_rejected", upstream: res.status };
      if (res.status === 400) {
        // A 400 is either our request shape or an unknown model; tell them apart
        // from the error type without echoing the body anywhere.
        const detail = (await res.json().catch(() => null)) as { error?: { type?: string; message?: string } } | null;
        const msg = detail?.error?.message?.toLowerCase() ?? "";
        return { error: msg.includes("model") ? "model_rejected" : "provider_error", upstream: res.status };
      }
      if (!res.ok) return { error: "provider_error", upstream: res.status };

      const data = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = (data.content ?? [])
        .filter((b) => b.type === "text" && b.text)
        .map((b) => b.text as string)
        .join(" ")
        .trim();
      if (!text) {
        last = { error: "provider_empty", upstream: 200 };
        continue;
      }
      return { text };
    } catch (e) {
      const name = e instanceof Error ? e.name : "";
      last = { error: name === "TimeoutError" || name === "AbortError" ? "provider_timeout" : "provider_error", upstream: name || "fetch" };
    }
  }
  return last;
}

export async function POST(req: Request) {
  const headers = new Headers();

  let body: { message?: unknown; history?: unknown; context?: unknown; region?: unknown };
  try {
    body = await req.json();
  } catch {
    return fail("bad_request", 400, headers);
  }

  const message = typeof body.message === "string" ? body.message.trim().slice(0, 600) : "";
  const region = typeof body.region === "string" ? body.region.slice(0, 8) : "";
  if (!message) return fail("bad_request", 400, headers);

  // 1. Crisis language is checked in code, before the model, and never billed.
  const risk = keywordCheck(message);
  if (risk.level >= 2 || risk.screen) {
    return NextResponse.json(crisisPayload(region));
  }

  const deviceId = readDeviceId(req) || newDeviceId();
  headers.append("set-cookie", deviceCookie(deviceId));

  // 2. Paywall, only when payments are actually live. A device with no server trial
  //    record (database not configured) falls through to the local clock in the UI.
  if (paymentsOn()) {
    const [paid, trial] = await Promise.all([isPaid(deviceId), serverTrialActive(deviceId)]);
    if (!paid && trial === false) {
      return NextResponse.json({ paywall: true }, { status: 402, headers });
    }
  }

  // 3. Five turns a day free, twenty paid.
  let quota = await consumeQuota(req, deviceId, "fix");
  if (quota.setCookie) headers.append("set-cookie", quota.setCookie);
  if (!quota.allowed && quota.reason === "unavailable") {
    console.error("fix:", "quota_unavailable", "soft-cap", PROMPT_VERSION);
    const soft = softConsume(deviceId, LIMITS.fix.free);
    quota = { allowed: soft.allowed, used: soft.used, limit: LIMITS.fix.free, reason: soft.allowed ? undefined : "limit" };
  }
  if (!quota.allowed) {
    return fail("limit", 429, headers, { limit: quota.limit, used: quota.used });
  }

  const key = aiKey();
  if (!key) {
    return fail("no_key", 503, headers);
  }

  const context = typeof body.context === "string" ? body.context.slice(0, 3000) : "";
  const history = turnsFrom(body.history);
  const messages = [
    ...history.map((t) => ({ role: t.role, content: t.text })),
    { role: "user", content: context ? `${context}\n\nTHEIR QUESTION: ${message}` : message },
  ];

  const out = await ask(SYSTEM, messages, key);
  if ("error" in out) {
    return fail(out.error, 502, headers, { limit: quota.limit, used: quota.used }, out.upstream);
  }

  return NextResponse.json(
    { reply: endWithStatement(out.text), used: quota.used, limit: quota.limit },
    { headers }
  );
}
