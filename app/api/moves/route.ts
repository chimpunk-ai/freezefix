import { NextResponse } from "next/server";
import { keywordCheck, highest, type RiskLevel, type RiskResult, type HelpScreen } from "@/lib/risk";
import { buildSystemPrompt, buildUserMessage, MOMENTS, type MomentId } from "@/lib/prompt";
import { BUILT_IN_MOVES, GROUNDING_MOVES, cleanMoves, type Move } from "@/lib/moves";
import { logEvent } from "@/lib/log";

// What the browser sends. We never store `text`.
type Body = {
  moment?: string;
  text?: string;
  groundingOnly?: boolean;
  country?: string;
  acknowledged?: string[]; // urgent help screens the user already saw and tapped "Back" on
};

type Reply = {
  level: RiskLevel;
  screen: HelpScreen | null;
  underage: boolean;
  checkQuestion: string | null;
  moves: Move[];
  source: "ai" | "built-in" | "none";
};

const MAX_CHARS = 400;
const VALID_FLAGS: HelpScreen[] = ["emergency", "crisis", "psychosis", "mixed", "doctor", "under18"];

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const moment = (body.moment && body.moment in MOMENTS ? body.moment : "alone") as MomentId;
  const text = String(body.text ?? "").slice(0, MAX_CHARS);
  const groundingOnly = Boolean(body.groundingOnly);
  const country = String(body.country ?? "").slice(0, 8);
  const acked = Array.isArray(body.acknowledged)
    ? body.acknowledged.filter((s): s is HelpScreen => VALID_FLAGS.includes(s as HelpScreen))
    : [];
  // Help first: under-18 and crisis/emergency always stop the flow; an urgent (level 2)
  // screen stops it until the user has seen that screen and tapped "Back to FreezeFix".
  const mustRoute = (r: RiskResult) =>
    r.underage || r.level >= 3 || (r.level === 2 && !!r.screen && !acked.includes(r.screen));

  // 1) Keyword check in code, BEFORE the model (Safety Pack section 5).
  const keyword = keywordCheck(text);
  if (mustRoute(keyword)) {
    await logEvent({ kind: "risk", value: keyword.level, moment, country });
    return NextResponse.json(routeOnly(keyword));
  }

  const grounding = groundingOnly || acked.includes("mixed") || keyword.screen === "mixed";
  const fallback = grounding ? GROUNDING_MOVES : BUILT_IN_MOVES[moment];

  // 2) No AI key yet (local testing): use safe built-in moves.
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const reply: Reply = {
      level: keyword.level,
      screen: null,
      underage: false,
      checkQuestion: keyword.level === 1 ? "Are you safe right now?" : null,
      moves: fallback,
      source: "built-in",
    };
    if (keyword.level > 0) await logEvent({ kind: "risk", value: keyword.level, moment, country });
    return NextResponse.json(reply);
  }

  // 3) Ask the AI. The model also checks risk; we use the HIGHER of the two.
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "claude-haiku-5-5",
        max_tokens: 600,
        temperature: 0.4,
        system: buildSystemPrompt({ groundingOnly: grounding }),
        messages: [{ role: "user", content: buildUserMessage(moment, text) }],
      }),
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`ai_status_${res.status}`);

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const raw = (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
    const parsed = parseJson(raw);

    const modelLevel = clampLevel(parsed?.risk_level);
    const flag = VALID_FLAGS.includes(parsed?.flag as HelpScreen) ? (parsed!.flag as HelpScreen) : null;
    // A flag always lifts the level to at least the level that flag belongs to.
    const flagLevel: RiskLevel =
      flag === "emergency" || flag === "under18" ? 4 : flag === "crisis" ? 3 : flag ? 2 : 0;
    const level = Math.max(modelLevel, flagLevel) as RiskLevel;
    const modelResult: RiskResult = {
      level,
      screen: flag ?? (level >= 4 ? "emergency" : level === 3 ? "crisis" : null),
      underage: flag === "under18",
    };
    // Level 2 with no named screen: show the urgent mental-health screen (it lists the
    // country's urgent line and the emergency number).
    if (modelResult.level === 2 && !modelResult.screen) modelResult.screen = "psychosis";

    const final = highest([keyword, modelResult]);
    if (final.level > 0) await logEvent({ kind: "risk", value: final.level, moment, country });

    if (mustRoute(final)) return NextResponse.json(routeOnly(final));

    const reply: Reply = {
      level: final.level,
      screen: null,
      underage: false,
      checkQuestion: final.level === 1 ? "Are you safe right now?" : null,
      moves: cleanMoves(parsed?.moves, fallback),
      source: "ai",
    };
    return NextResponse.json(reply);
  } catch {
    // Safety Pack: if the AI call fails, show the emergency link and "Try again", never a blank screen.
    return NextResponse.json({ error: "ai_unavailable" }, { status: 503 });
  }
}

function routeOnly(r: RiskResult): Reply {
  return {
    level: r.level,
    screen: r.screen ?? (r.level >= 4 ? "emergency" : "crisis"),
    underage: r.underage,
    checkQuestion: null,
    moves: [],
    source: "none",
  };
}

function clampLevel(v: unknown): RiskLevel {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(4, Math.round(n))) as RiskLevel;
}

function parseJson(raw: string): { risk_level?: number; flag?: string; moves?: unknown } | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}
