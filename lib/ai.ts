// One place that reads the AI provider key and picks the model id.
//
// Why trim: secrets pasted into a dashboard text box often carry a trailing newline or a
// stray space. The API then rejects the whole header with "invalid x-api-key", which looks
// exactly like a wrong key. Trimming removes that entire class of problem.

export function aiKey(): string | undefined {
  const raw = process.env.ANTHROPIC_API_KEY;
  if (!raw) return undefined;
  const key = raw.trim();
  return key.length ? key : undefined;
}

// Model ids get retired. When that happens every chat request comes back 404 not_found_error
// and the app shows "Fix couldn't connect" to everybody, with nothing in the logs saying the
// string was the problem. So the id is a list: AI_MODEL first, then known-good ids. The chat
// route walks the list when the provider reports that the model doesn't exist, so a retired
// id degrades into one extra round trip instead of a dead feature.
const FALLBACK_MODELS = ["claude-haiku-4-5-20251001", "claude-3-5-haiku-20241022"];

function candidates(): string[] {
  const all = [process.env.AI_MODEL, ...FALLBACK_MODELS]
    .map((m) => (m ?? "").trim())
    .filter((m) => m.length > 0);
  return [...new Set(all)];
}

/** Model id to try on the given attempt. Clamped, so callers can pass an index safely. */
export function aiModel(attempt = 0): string {
  const list = candidates();
  return list[Math.min(Math.max(attempt, 0), list.length - 1)];
}

/** How many distinct model ids are available to try. */
export function aiModelCount(): number {
  return candidates().length;
}
