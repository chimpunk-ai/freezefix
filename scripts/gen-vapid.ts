// Prints a fresh VAPID keypair in the shape lib/push.ts expects:
//   VAPID_PUBLIC_KEY  = 65-byte uncompressed P-256 point, base64url
//   VAPID_PRIVATE_KEY = raw 32-byte scalar d, base64url
// Run locally (`npx tsx scripts/gen-vapid.ts`), paste the values into
// Cloudflare → Workers → freezefix → Settings → Variables and Secrets, and
// NEXT_PUBLIC_VAPID_PUBLIC_KEY (same value as the public key) as a plain
// variable. Never commit the output.

import { webcrypto } from "node:crypto";

const subtle = webcrypto.subtle;

function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Buffer.from(u8).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const pair = await subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
const jwk = await subtle.exportKey("jwk", pair.privateKey);
const raw = new Uint8Array(await subtle.exportKey("raw", pair.publicKey));

console.log(`VAPID_PUBLIC_KEY=${b64url(raw)}`);
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${b64url(raw)}`);
console.log(`VAPID_PRIVATE_KEY=${jwk.d}`);
console.log(`PUSH_TICK_SECRET=${b64url(webcrypto.getRandomValues(new Uint8Array(32)))}`);
