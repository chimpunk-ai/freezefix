import { NextResponse } from "next/server";
import { DEVICE_COOKIE } from "@/lib/quota";

// Settings → Delete everything: removes the anonymous device cookie.
// The only server-side records tied to it are one-way hashed daily counters that delete
// themselves within 2 days. There is no account and no message text to delete.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.headers.append("Set-Cookie", `${DEVICE_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
  return res;
}
