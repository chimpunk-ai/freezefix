import { NextResponse } from "next/server";
import { logEvent } from "@/lib/log";

// "Did it help?" 👍/👎. Stores only yes/no, the moment and the country. No text, no ID.
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { helped?: boolean; moment?: string; country?: string };
    await logEvent({
      kind: "helped",
      value: body.helped ? 1 : 0,
      moment: body.moment ?? null,
      country: body.country ?? null,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
