// Every branch of the landing-page demo must lead somewhere: no reply pointing at a node
// that doesn't exist, no node you can't get out of, no dead end that isn't a real ending.
// Run: npm run test:demo
import { DEMOS } from "../lib/demo";

for (const d of DEMOS) {
  if (!d.nodes[d.start]) throw new Error(`${d.id}: start node "${d.start}" is missing`);
  const reachable = new Set<string>([d.start]);
  const queue = [d.start];
  let endings = 0;

  while (queue.length) {
    const key = queue.shift()!;
    const node = d.nodes[key];
    if (!node.fix.trim()) throw new Error(`${d.id}/${key}: Fix says nothing`);
    if (node.fix.length > 110) throw new Error(`${d.id}/${key}: Fix is waffling (${node.fix.length} chars)`);
    if (!node.replies.length) throw new Error(`${d.id}/${key}: no way out of this node`);
    for (const r of node.replies) {
      if (!r.to && !r.end) throw new Error(`${d.id}/${key}: reply "${r.text}" goes nowhere`);
      if (r.to && !d.nodes[r.to]) throw new Error(`${d.id}/${key}: reply points at missing node "${r.to}"`);
      if (r.end) endings++;
      if (r.to && !reachable.has(r.to)) {
        reachable.add(r.to);
        queue.push(r.to);
      }
    }
  }

  if (!endings) throw new Error(`${d.id}: no ending, the demo never finishes`);
  const orphans = Object.keys(d.nodes).filter((k) => !reachable.has(k));
  if (orphans.length) throw new Error(`${d.id}: unreachable nodes ${orphans.join(", ")}`);
}

const total = DEMOS.reduce((n, d) => n + Object.keys(d.nodes).length, 0);
console.log(`Demo: ${DEMOS.length} scripts, ${total} nodes, every branch lands somewhere`);
