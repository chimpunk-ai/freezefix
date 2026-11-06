import { NextResponse } from "next/server";
import {
  deviceCookie,
  newDeviceId,
  readDeviceId,
  serverTrialActive,
  startTrialOnServer,
} from "@/lib/quota";

export const dynamic = "force-dynamic";

// Starts the seven free days. No card, no email: the device key is the whole account.
// Recorded on the server too, so clearing cookies doesn't restart the clock once the
// database is configured. Before that, the browser keeps its own copy and this is a no-op.

export async function POST(req: Request) {
  const deviceId = readDeviceId(req) || newDeviceId();
  const startedAt = await startTrialOnServer(deviceId);
  return NextResponse.json(
    { startedAt: startedAt ?? new Date().toISOString(), active: true },
    { headers: { "set-cookie": deviceCookie(deviceId) } }
  );
}

export async function GET(req: Request) {
  const deviceId = readDeviceId(req);
  if (!deviceId) return NextResponse.json({ active: null });
  return NextResponse.json({ active: await serverTrialActive(deviceId) });
}
