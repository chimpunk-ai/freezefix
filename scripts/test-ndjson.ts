// A reply must rebuild identically however the network splits it. Run: npm run test:ndjson
import { NdjsonReader } from "../lib/ndjson";

const events = [
  { level: 0 },
  { delta: "Ah so it's dead in there." },
  { delta: " Can you get out for a bit?" },
  { delta: " Emoji check: 🫠 and a quote \"like this\"" },
  { done: true, chips: ["going now", "can't leave"] },
];
const wire = events.map((e) => JSON.stringify(e)).join("\n") + "\n";

function rebuild(chunks: string[]) {
  const r = new NdjsonReader();
  const got: Record<string, unknown>[] = [];
  for (const c of chunks) got.push(...r.push(c));
  got.push(...r.end());
  return got;
}

// Every single split point, including mid-object and mid-character runs.
for (let i = 0; i <= wire.length; i++) {
  const got = rebuild([wire.slice(0, i), wire.slice(i)]);
  if (JSON.stringify(got) !== JSON.stringify(events)) {
    throw new Error(`split at ${i} lost or mangled the reply: ${JSON.stringify(got)}`);
  }
}

// Random splits, the way a real network behaves.
for (let trial = 0; trial < 500; trial++) {
  const chunks: string[] = [];
  let rest = wire;
  while (rest.length) {
    const n = 1 + Math.floor(Math.random() * 12);
    chunks.push(rest.slice(0, n));
    rest = rest.slice(n);
  }
  const got = rebuild(chunks);
  if (JSON.stringify(got) !== JSON.stringify(events)) {
    throw new Error(`random split lost the reply: ${JSON.stringify(chunks)}`);
  }
}

// A stream that ends without a trailing newline still yields its last object.
const noTrailing = wire.trimEnd();
if (JSON.stringify(rebuild([noTrailing])) !== JSON.stringify(events)) {
  throw new Error("a final line without a newline was dropped");
}

// A single broken line must not take the rest of the reply with it.
const withJunk = '{"level":0}\nnot json at all\n{"done":true}\n';
const got = rebuild([withJunk]);
if (got.length !== 2) throw new Error(`junk line broke the stream: ${JSON.stringify(got)}`);

console.log("NDJSON: every split point and 500 random splits rebuild the reply exactly");
