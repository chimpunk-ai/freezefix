import { NextResponse } from "next/server";
import { aiKey } from "@/lib/ai";
import { aiModel } from "@/lib/fix-prompt";
import { mythItems } from "@/lib/myth-items";

export const dynamic = "force-dynamic";

// A single myth-vs-reality card, generated fresh each call.
//
// Why a route and not a static pool: 11 items repeat. 100 still repeat. People
// who open the app every day want it to feel fresh for months, so the item
// comes from the model inside strict rules.
//
// Content boundaries (enforced in the prompt below):
//   - Nothing about cannabis pharmacology, doses, strains, metabolism, health
//     outcomes, mental-health diagnoses, or substance-use disorders. The
//     product vision rules those out and so does this route.
//   - Every item is about the LOOKING: judgement, shame, privacy, data,
//     habit-forming cues, the honesty of a mood tap, what fix does and
//     doesn't do.
//   - No medical, legal or financial advice.
//   - Lower-case voice, same as fix. Under 50 words of "reality".
//
// Fallback: if the model is unreachable or the output fails to parse, the
// client falls back to lib/myth-items.ts — the 11 seed items are known-good.

type Reframe = { myth: string; reality: string };

const SYSTEM = `You are Fix, a small, dry, warm presence inside a private weed-pattern app.

You write one "myth vs reality" card at a time. The card is a single belief people hold that stops them LOOKING at their own week, paired with a gentle, concrete reply.

Voice: a friend a few years older. Lowercase, plain, unhurried. Dry when it fits. Never a wellness brand, never a therapist, never a coach, never cheerful.

Scope — every item must be about the LOOKING, not about weed itself. Pick from:
- judgement and shame about tracking
- the honesty of a tap when nobody is watching
- what a pattern can and cannot say
- privacy, data, who sees the log
- what fix does, what it refuses to do (no streaks, no coach, no diagnosis)
- small habit-forming cues versus willpower
- missed nights, imperfect weeks, catch-up anxiety
- "it's either quit or carry on" and the shape in between
- what a card can speak to with three nights versus seven
- the quiet shift from numbers to direction
- adults' right to look at their own life without being told off

FORBIDDEN topics (never produce one of these; refuse and pick a new one):
- cannabis pharmacology, doses, strains, metabolism, interactions
- any claim about health outcomes, mental illness, addiction, recovery
- whether weed is "safe", "healthy", "medicine", "bad for you"
- clinical, treatment, diagnosis or prognosis language
- medical, legal or financial advice

Rules:
- Myth: a full lowercase sentence, 6 to 16 words, in first person or second person as a real belief sounds in a head.
- Reality: 1 to 3 sentences, under 50 words total, lowercase, no exclamation marks, no emoji, no "great question" or "remember that".
- Never use the words: should, must, always, never-ever, clean, relapse, addict, streak, cure, fix (as a verb).
- Keep "fix" lower-case when it appears as the app's name.

Return ONLY a JSON object: {"myth": "...", "reality": "..."}. No prose around it, no markdown fence.`;

function fallback(seed?: string): Reframe {
  const pool = mythItems();
  let idx = 0;
  if (seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
    idx = Math.abs(h) % pool.length;
  } else {
    idx = Math.floor(Math.random() * pool.length);
  }
  return pool[idx];
}

function sanitise(input: Reframe): Reframe | null {
  const myth = (input.myth ?? "").trim();
  const reality = (input.reality ?? "").trim();
  if (!myth || !reality) return null;
  if (myth.length < 10 || myth.length > 180) return null;
  if (reality.length < 20 || reality.length > 400) return null;
  // Guard against drift into substance claims. If any banned word appears in
  // either half, refuse and let the client fall back.
  const banned = /\b(dose|doses|dosage|strain|strains|indica|sativa|cbd|thc|edible|vape|cancer|psychosis|schizophren|addict|addiction|cure|treatment|diagnos|prescrib|medic(ine|al)|clinical|therap(y|ist)|symptom)\b/i;
  const txt = `${myth} ${reality}`;
  if (banned.test(txt)) return null;
  return { myth, reality };
}

type Content = { type: string; text?: string };

async function callModel(key: string, avoid: string[]): Promise<Reframe | null> {
  const avoidLine = avoid.length
    ? `\nThe reader has recently seen cards opening with these phrases — avoid starting the myth the same way:\n${avoid.slice(0, 10).map((s) => `- "${s}"`).join("\n")}`
    : "";
  const user = `Write one fresh card. Not a variation of the examples above — a different belief.${avoidLine}\n\nReturn only the JSON.`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: aiModel(),
        max_tokens: 300,
        temperature: 1,
        system: SYSTEM,
        messages: [{ role: "user", content: user }],
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: Content[] };
    const text = (data.content ?? [])
      .filter((b) => b.type === "text" && b.text)
      .map((b) => b.text as string)
      .join(" ")
      .trim();
    if (!text) return null;
    const first = text.indexOf("{");
    const last = text.lastIndexOf("}");
    if (first < 0 || last <= first) return null;
    const json = text.slice(first, last + 1);
    const parsed = JSON.parse(json) as Partial<Reframe>;
    return sanitise({ myth: parsed.myth ?? "", reality: parsed.reality ?? "" });
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as { avoid?: unknown; seed?: unknown }));
  const avoid = Array.isArray(body?.avoid)
    ? (body.avoid as unknown[]).filter((s): s is string => typeof s === "string").slice(0, 10)
    : [];
  const seed = typeof body?.seed === "string" ? body.seed : undefined;

  const key = aiKey();
  if (!key) {
    // Offline from the server's point of view too — hand back a seed item so
    // the UI still gets something fresh-looking.
    return NextResponse.json({ ...fallback(seed), source: "fallback" });
  }

  // Try twice: one retry if the model ignored the JSON contract or drifted
  // into a banned word. Beyond that, the fallback is fine.
  for (let attempt = 0; attempt < 2; attempt++) {
    const out = await callModel(key, avoid);
    if (out) return NextResponse.json({ ...out, source: "ai" });
  }
  return NextResponse.json({ ...fallback(seed), source: "fallback" });
}
