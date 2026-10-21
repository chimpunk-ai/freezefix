import { NextResponse } from "next/server";
import { logEvent } from "@/lib/log";

// Logs a signup event when someone enters their name after consent.
// We record only the kind + timestamp — never the name itself.
export async function POST() {
  try {
    await logEvent({ kind: "signup", value: 1 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
