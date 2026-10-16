import { NextResponse } from "next/server";
import { aiKey, keyShape } from "@/lib/ai";

// A read-only check of why the AI isn't answering.
//
// It asks Anthropic which models this key may use and sends one tiny message, then reports
// what came back. No secret is ever returned: only the key's prefix and length, which are
// the same for every key of that type.
//
// Why it exists: "403 Request not allowed" looks identical whether the credits ran out, the
// key lost access to a model, or the model name is wrong. Guessing cost us three hours.

export const dynamic = "force-dynamic";

export async function GET() {
  const key = aiKey();
  if (!key) return NextResponse.json({ ok: false, why: "No ANTHROPIC_API_KEY is set in Cloudflare." });

  const headers = { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" };
  const wanted = process.env.AI_MODEL || "claude-haiku-5-5";
  const out: Record<string, unknown> = { key: keyShape(), modelThisAppAsksFor: wanted };

  // 1) Which models is this key allowed to use?
  try {
    const res = await fetch("https://api.anthropic.com/v1/models?limit=50", { headers });
    const body = await res.text();
    if (res.ok) {
      const list = (JSON.parse(body).data ?? []) as { id: string }[];
      const ids = list.map((m) => m.id);
      out.modelsYourKeyCanUse = ids;
      out.askedForModelIsAvailable = ids.includes(wanted);
    } else {
      out.modelListFailed = { status: res.status, detail: body.slice(0, 300) };
    }
  } catch (e) {
    out.modelListFailed = { error: String(e).slice(0, 200) };
  }

  // 2) The smallest possible real message, to see the actual error on a chat call.
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers,
      body: JSON.stringify({ model: wanted, max_tokens: 8, messages: [{ role: "user", content: "hi" }] }),
    });
    const body = await res.text();
    out.testMessage = res.ok ? { ok: true } : { ok: false, status: res.status, detail: body.slice(0, 400) };
  } catch (e) {
    out.testMessage = { ok: false, error: String(e).slice(0, 200) };
  }

  return NextResponse.json(out);
}
