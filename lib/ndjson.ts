// Rebuilding NDJSON from a network stream.
//
// Pulled out of the chat component so it can be tested directly: a JSON object split across
// two network chunks must never be lost, and a chunk boundary can fall anywhere, including
// in the middle of a multi-byte character.
//
// This is the bug that broke the server side of the chat earlier: each chunk was split on
// newlines on its own, so whichever line straddled the join was silently discarded.

export class NdjsonReader {
  private buffer = "";

  /** Feed one decoded chunk; get back the objects that are now complete. */
  push(chunk: string): Record<string, unknown>[] {
    this.buffer += chunk;
    const lines = this.buffer.split("\n");
    // The last piece may be half a line; it waits for the next chunk.
    this.buffer = lines.pop() ?? "";
    return parseAll(lines);
  }

  /** Call once the stream ends, in case the last line had no trailing newline. */
  end(): Record<string, unknown>[] {
    const rest = this.buffer;
    this.buffer = "";
    return parseAll([rest]);
  }
}

function parseAll(lines: string[]): Record<string, unknown>[] {
  const out: Record<string, unknown>[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      out.push(JSON.parse(trimmed) as Record<string, unknown>);
    } catch {
      // A complete line that isn't JSON is the server's problem, not ours; skip it rather
      // than killing a reply that is otherwise arriving fine.
    }
  }
  return out;
}
