// One place that reads the Anthropic key.
//
// Why trim: secrets pasted into a dashboard text box often carry a trailing newline or a
// stray space. The Anthropic API then rejects the whole header with
// "invalid x-api-key", which looks exactly like a wrong key. Trimming removes that
// entire class of problem.

export function aiKey(): string | undefined {
  const raw = process.env.ANTHROPIC_API_KEY;
  if (!raw) return undefined;
  const key = raw.trim();
  return key.length ? key : undefined;
}

// Safe to show in a response: every real Console key starts with the same 10 characters,
// so the prefix proves the TYPE of token without revealing any of the secret part.
// Used by /api/config so a key problem can be diagnosed without anyone pasting a key
// into a chat again.
export function keyShape(): { prefix: string; length: number; trimmed: boolean } | null {
  const raw = process.env.ANTHROPIC_API_KEY;
  if (!raw) return null;
  return {
    prefix: raw.trim().slice(0, 10),
    length: raw.trim().length,
    trimmed: raw !== raw.trim(),
  };
}
