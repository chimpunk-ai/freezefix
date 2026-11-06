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
} from "@/lib/quota";
import { paymentsOn } from "@/lib/plans";

export const dynamic = "force-dynamic";

// Fix: one question about your own week, answered from your own log.
//
// Three rules are enforced here, in code, not in the prompt:
//   1. Crisis language stops the chat and hands over real phone numbers.
//   2. The turn cap is a server cap, counted per device per day (5 free, 20 paid).
//   3. After the free days, Fix is behind the paywall like everything else except help.

const SYSTEM = `You are Fix, a small, dry, warm assistant inside a private weed-pattern app.

You answer exactly one kind of question: what does the user's own log say about something.
The log below is the only evidence you have. Never invent an entry, a number or a cause.

Voice: a friend a few years older. Plain, lowercase, unhurried. Dry when it fits. Never a
wellness brand, never a therapist, never a coach, never a friend who wants to hang out.
No exclamation marks. No emoji. No "great question".

Rules:
- Two to four sentences. Under 80 words.
- Quote their own data ("you tapped after work three times"). If the log doesn't cover it,
  say what the log does show and stop.
- End on a statement, never a question. Do not invite another turn.
- Never moralise, never congratulate, never grade them.
- Never say clean, relapse, streak, addict, addiction, problem, should, or well done.
- Never recommend quitting, cutting down, tapering, strains, doses, or timing tricks.
- Never give medical advice or a diagnosis. If they ask for one, say plainly that's a doctor's
  call and what the log shows.
- If it were me, I might... is allowed. You should... is not.
- They are not the problem. The pattern is just a pattern. They decide what it means.`;

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

/** Fix always ends with a sentence. If the model ends on a question, drop it. */
export function endWithStatement(text: string): string {
  const cleaned = text.replace(/!+/g, ".").replace(/\s+/g, " ").trim();
  if (!cleaned) return "that's what the log says.";
  if (!cleaned.endsWith("?")) return cleaned;
  const sentences = cleaned.match(/[^.!?]+[.!?]*/g) ?? [];
  const kept = sentences.filter((s) => s.trim() && !s.trim().endsWith("?"));
  if (!kept.length) return "that's what the log says.";
  return kept.join(" ").trim();
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

async function ask(system: string, messages: { role: string; content: string }[], key: string) {
  let lastError = "unknown";
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "claude-haiku-5-5",
          max_tokens: 500,
          system,
          messages,
        }),
        signal: AbortSignal.timeout(25_000),
      });
      if (res.status === 429 || res.status >= 500) {
        lastError = `upstream_${res.status}`;
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      if (!res.ok) return { error: `upstream_${res.status}` as const };
      const data = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = (data.content ?? [])
        .filter((b) => b.type === "text" && b.text)
        .map((b) => b.text as string)
        .join(" ")
        .trim();
      if (!text) {
        lastError = "empty";
        continue;
      }
      return { text };
    } catch {
      lastError = "timeout";
    }
  }
  return { error: lastError };
}

export async function POST(req: Request) {
  let body: { message?: unknown; history?: unknown; context?: unknown; region?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim().slice(0, 600) : "";
  const region = typeof body.region === "string" ? body.region.slice(0, 8) : "";
  if (!message) return NextResponse.json({ error: "empty" }, { status: 400 });

  // 1. Crisis language is checked in code, before the model, and never billed.
  const risk = keywordCheck(message);
  if (risk.level >= 2 || risk.screen) {
    return NextResponse.json(crisisPayload(region));
  }

  const deviceId = readDeviceId(req) || newDeviceId();
  const setCookie = deviceCookie(deviceId);

  // 2. Paywall, only when payments are actually live. A device with no server trial
  //    record (database not configured) falls through to the local clock in the UI.
  if (paymentsOn()) {
    const [paid, trial] = await Promise.all([isPaid(deviceId), serverTrialActive(deviceId)]);
    if (!paid && trial === false) {
      return NextResponse.json({ paywall: true }, { status: 402, headers: { "set-cookie": setCookie } });
    }
  }

  // 3. Five turns a day free, twenty paid.
  const quota = await consumeQuota(req, deviceId, "fix");
  if (!quota.allowed) {
    return NextResponse.json(
      { error: quota.reason === "unavailable" ? "unavailable" : "limit", limit: quota.limit },
      { status: quota.reason === "unavailable" ? 503 : 429, headers: { "set-cookie": setCookie } }
    );
  }

  const key = aiKey();
  if (!key) {
    return NextResponse.json({ error: "unavailable" }, { status: 503, headers: { "set-cookie": setCookie } });
  }

  const context = typeof body.context === "string" ? body.context.slice(0, 3000) : "";
  const history = turnsFrom(body.history);
  const messages = [
    ...history.map((t) => ({ role: t.role, content: t.text })),
    { role: "user", content: context ? `${context}\n\nTHEIR QUESTION: ${message}` : message },
  ];

  const out = await ask(SYSTEM, messages, key);
  if ("error" in out) {
    return NextResponse.json({ error: out.error }, { status: 502, headers: { "set-cookie": setCookie } });
  }

  return NextResponse.json(
    { reply: endWithStatement(out.text), used: quota.used + 1, limit: quota.limit },
    { headers: { "set-cookie": setCookie } }
  );
}
