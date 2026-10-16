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
