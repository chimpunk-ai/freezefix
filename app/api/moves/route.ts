import { NextResponse } from "next/server";
import { keywordCheck, othersCheck, highest, type RiskLevel, type RiskResult, type HelpScreen } from "@/lib/risk";
import { buildSystemPrompt, buildUserMessage, SCREENSHOT_READER_PROMPT, MOMENTS, type MomentId } from "@/lib/prompt";
import { BUILT_IN_MOVES, GROUNDING_MOVES, cleanMoves, type Move } from "@/lib/moves";
import { logEvent } from "@/lib/log";
import { consumeQuota, refundQuota, readDeviceId, newDeviceId, deviceCookie, getEntitlement, claimFreeSession } from "@/lib/quota";
import { screenshotsOn } from "@/lib/features";

// What the browser sends. We never store any of it.
type Body = {
  moment?: string;
  text?: string; // typed words
  voice?: string; // voice-note transcript (from /api/transcribe, shown to the user first)
  image?: string; // screenshot as a data URL (resized on the phone, metadata stripped)
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
const MAX_VOICE_CHARS = 1200;
const MAX_IMAGE_CHARS = 2_800_000; // ~2 MB image as base64
const VALID_FLAGS: HelpScreen[] = ["emergency", "crisis", "psychosis", "mixed", "doctor", "under18", "worried"];
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const moment = (body.moment && body.moment in MOMENTS ? body.moment : "alone") as MomentId;
  const text = String(body.text ?? "").slice(0, MAX_CHARS);
  const voice = String(body.voice ?? "").slice(0, MAX_VOICE_CHARS);
  const groundingOnly = Boolean(body.groundingOnly);
  const country = String(body.country ?? "").slice(0, 8);
  const acked = Array.isArray(body.acknowledged)
    ? body.acknowledged.filter((s): s is HelpScreen => VALID_FLAGS.includes(s as HelpScreen))
    : [];
  const apiKey = process.env.ANTHROPIC_API_KEY;

  // Device cookie (only needed for the screenshot daily limit).
  let deviceId = readDeviceId(req);
  const isNewDevice = !deviceId;
  if (!deviceId) deviceId = newDeviceId();
  const respond = (payload: unknown, status = 200) => {
    const res = NextResponse.json(payload, { status });
    if (isNewDevice) res.headers.append("Set-Cookie", deviceCookie(deviceId!));
    return res;
  };

  // Help first: under-18 and crisis/emergency always stop the flow; an urgent (level 2)
  // screen stops it until the user has seen that screen and tapped "Back to FreezeFix".
  const mustRoute = (r: RiskResult) =>
    r.underage || r.level >= 3 || (r.level === 2 && !!r.screen && !acked.includes(r.screen));

  // 0) Screenshot: read it as text FIRST, so the safety check can run on it.
  let shotMe = "";
  let shotThem = "";
  if (body.image) {
    const img = parseImage(body.image);
    if (!img) return respond({ error: "bad_image" }, 400);
    if (!apiKey || !screenshotsOn()) return respond({ error: "screenshot_off" }, 503);
    const quota = await consumeQuota(req, deviceId, "screenshot");
    if (!quota.allowed) {
      return respond({ error: quota.reason === "limit" ? "screenshot_limit" : "screenshot_off", limit: quota.limit }, 429);
    }
    try {
      const raw = await callClaude(apiKey, SCREENSHOT_READER_PROMPT, [
        { type: "image", source: { type: "base64", media_type: img.type, data: img.data } },
        { type: "text", text: "Read this screenshot." },
      ], 900);
      const parsed = parseJson(raw) as { kind?: string; me?: string; them?: string } | null;
      if (!parsed || parsed.kind !== "chat") {
        // Rejected kindly, never described, never stored (Safety Pack section 9).
        if (parsed?.kind === "sexual_minor") await logEvent({ kind: "risk", value: 4, moment, country });
        await refundQuota(req, deviceId, "screenshot");
        return respond({ error: "not_chat" }, 422);
      }
      shotMe = String(parsed.me ?? "").slice(0, 1500);
      shotThem = String(parsed.them ?? "").slice(0, 1500);
    } catch {
      await refundQuota(req, deviceId, "screenshot");
      return respond({ error: "ai_unavailable" }, 503);
    }
  }

  // 1) Keyword check in code, BEFORE the model (Safety Pack section 5),
  //    on everything the user sent: typed words, voice transcript and screenshot text.
  //    Other people's words in a screenshot are checked too (a friend in crisis, a threat).
  const userText = [text, voice, shotMe].filter(Boolean).join("\n");
  const keyword = highest([keywordCheck(userText), othersCheck(shotThem)]);
  if (mustRoute(keyword)) {
    await logEvent({ kind: "risk", value: keyword.level, moment, country });
    return respond(routeOnly(keyword));
  }

  const grounding = groundingOnly || acked.includes("mixed") || keyword.screen === "mixed";
  const fallback = grounding ? GROUNDING_MOVES : BUILT_IN_MOVES[moment];

  // Paywall (founder decision 16 Oct): first unfreeze free, then a trial or plan is needed.
  // Checked HERE, on the server, and only AFTER the safety check above, so help screens are
  // never behind it. People at the paywall still get the AI's safety check below.
  const ent = await getEntitlement(deviceId);
  const entitled = ent.active || (await claimFreeSession(deviceId));
  const paywall = () => respond({ paywall: true, level: keyword.level });

  // 2) No AI key yet (local testing): use safe built-in moves.
  if (!apiKey) {
    if (!entitled) return paywall();
    const reply: Reply = {
      level: keyword.level,
      screen: null,
      underage: false,
      checkQuestion: keyword.level === 1 ? "Are you safe right now?" : null,
      moves: fallback,
      source: "built-in",
    };
    if (keyword.level > 0) await logEvent({ kind: "risk", value: keyword.level, moment, country });
    return respond(reply);
  }

  // 3) Ask the AI. The model also checks risk; we use the HIGHER of the two.
  //    For someone at the paywall the AI call is only a safety check (cost-capped per day).
  if (!entitled) {
    const q = await consumeQuota(req, deviceId, "check");
    if (!q.allowed) return paywall();
  }
  try {
    const raw = await callClaude(
      apiKey,
      buildSystemPrompt({ groundingOnly: grounding }),
      buildUserMessage(moment, text, { voice, screenshotMe: shotMe, screenshotThem: shotThem }),
      700
    );
    const parsed = parseJson(raw) as { risk_level?: number; flag?: string; moves?: unknown } | null;

    const modelLevel = clampLevel(parsed?.risk_level);
    const flag = VALID_FLAGS.includes(parsed?.flag as HelpScreen) ? (parsed!.flag as HelpScreen) : null;
    // A flag always lifts the level to at least the level that flag belongs to.
    const flagLevel: RiskLevel =
      flag === "emergency" || flag === "under18" ? 4 : flag === "crisis" || flag === "worried" ? 3 : flag ? 2 : 0;
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

    if (mustRoute(final)) return respond(routeOnly(final));
    if (!entitled) return paywall();

    const reply: Reply = {
      level: final.level,
      screen: null,
      underage: false,
      checkQuestion: final.level === 1 ? "Are you safe right now?" : null,
      moves: cleanMoves(parsed?.moves, fallback),
      source: "ai",
    };
    return respond(reply);
  } catch {
    // Safety Pack: if the AI call fails, show the emergency link and "Try again", never a blank screen.
    return respond({ error: "ai_unavailable" }, 503);
  }
}

type ContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

async function callClaude(apiKey: string, system: string, content: string | ContentBlock[], maxTokens: number) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.AI_MODEL || "claude-haiku-5-5",
      max_tokens: maxTokens,
      temperature: 0.4,
      system,
      messages: [{ role: "user", content }],
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`ai_status_${res.status}`);
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  return (data.content ?? []).filter((c) => c.type === "text").map((c) => c.text ?? "").join("");
}

function parseImage(dataUrl: string): { type: string; data: string } | null {
  if (typeof dataUrl !== "string" || dataUrl.length > MAX_IMAGE_CHARS) return null;
  const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
  if (!m || !IMAGE_TYPES.includes(m[1])) return null;
  return { type: m[1], data: m[2] };
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

function parseJson(raw: string): Record<string, unknown> | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}
