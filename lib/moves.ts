import type { MomentId } from "./prompt";

export type Move = { title: string; detail: string };

// Safe built-in moves. Used when no AI key is set yet (local testing) and to replace
// any AI move that breaks a safety rule. Every move here follows Safety Pack section 4.
export const BUILT_IN_MOVES: Record<MomentId, Move[]> = {
  people: [
    { title: "Slow breath out", detail: "Breathe in for 4, out for 6. Do it three times. Nobody can tell." },
    { title: "One easy line", detail: "Say: \"I'm just gonna grab some water, back in a sec.\"" },
    { title: "Water and a reset", detail: "Get a glass of water and stand somewhere quieter for two minutes." },
  ],
  alone: [
    { title: "Feet on the floor", detail: "Press both feet down and name five things you can see." },
    { title: "Text someone you trust", detail: "Send: \"Hey, can you talk for a bit?\" to one person." },
    { title: "Sip some water", detail: "Get a glass of water and sit somewhere comfy while you drink it." },
  ],
  task: [
    { title: "Shrink it", detail: "Open the thing and do only the first tiny step. Just that." },
    { title: "Two-minute timer", detail: "Set a timer for 2 minutes. Stop when it rings if you want." },
    { title: "Breathe first", detail: "In for 4, out for 6, three times. Then start the tiny step." },
  ],
  reply: [
    { title: "Send the short one", detail: "Reply: \"Hey! Just seen this, give me a bit and I'll get back to you.\"" },
    { title: "Draft, don't send", detail: "Type the reply in your notes first. Send it later if it still feels right." },
    { title: "Breathe out slowly", detail: "In for 4, out for 6, three times before you look at the chat again." },
  ],
};

export const GROUNDING_MOVES: Move[] = [
  { title: "Slow breath out", detail: "Breathe in for 4, out for 6. Do it three times." },
  { title: "Sip some water", detail: "Small sips, sitting down somewhere comfortable." },
  { title: "Stay with someone", detail: "Text someone you trust and ask them to come and sit with you." },
];

// Phrases the AI must never say (Safety Pack section 4). If a move contains one,
// we swap it for a built-in move.
const BANNED = [
  /you'?re (?:fine|okay|ok)\b/i,
  /just anxiety/i,
  /only a panic attack/i,
  /can'?t overdose/i,
  /it'?ll pass in/i,
  /\bcbd\b/i,
  /black pepper/i,
  /lemon/i,
  /\bstrain\b/i,
  /\bthc\b/i,
  /wake and bake/i,
  /stop smoking|quit (?:weed|smoking)|cut down/i,
  /\bdose\b|\bmg\b/i,
  /alcohol|\bbeer|\bbooze|drink to calm/i,
  /cold shower|\bice\b|cold water/i,
  /psychosis|anxiety disorder|\bgad\b|\bchs\b|diagnos/i,
  /therap(?:y|ist)|\btreat(?:s|ment)?\b|\bcures?\b|\bheal(?:s|ed|ing)?\b/i,
  /https?:|www\.|\.com\b|\.org\b/i,
  /\d{3,}/, // never a phone number
];

export function isSafeMove(m: Move): boolean {
  const text = `${m.title} ${m.detail}`;
  return !BANNED.some((re) => re.test(text));
}

// Keeps up to 3 safe moves, filling gaps from the built-in set.
export function cleanMoves(raw: unknown, fallback: Move[]): Move[] {
  const out: Move[] = [];
  if (Array.isArray(raw)) {
    for (const item of raw) {
      if (out.length >= 3) break;
      if (!item || typeof item !== "object") continue;
      const title = String((item as Move).title ?? "").trim().slice(0, 60);
      const detail = String((item as Move).detail ?? "").trim().slice(0, 200);
      if (!title || !detail) continue;
      const move = { title, detail };
      if (isSafeMove(move)) out.push(move);
    }
  }
  for (const f of fallback) {
    if (out.length >= 3) break;
    if (!out.some((m) => m.title === f.title)) out.push(f);
  }
  return out.slice(0, 3);
}
