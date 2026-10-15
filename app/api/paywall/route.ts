import { NextResponse } from "next/server";
import { readDeviceId, newDeviceId, deviceCookie, deviceRef, getEntitlement } from "@/lib/quota";
import { checkoutConfig, paymentsOn } from "@/lib/plans";

// Tells the app whether this device has an active trial or plan, and gives the checkout what it
// needs. `ref` is a one-way hash of the device ID; it goes to the payment provider as custom
// data so the webhook can link the subscription back to this device.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let deviceId = readDeviceId(req);
  const isNew = !deviceId;
  if (!deviceId) deviceId = newDeviceId();

  const ent = await getEntitlement(deviceId);
  const res = NextResponse.json({
    active: ent.active,
    status: ent.status,
    ref: await deviceRef(deviceId),
    paymentsOn: paymentsOn(),
    checkout: checkoutConfig(),
  });
  res.headers.set("Cache-Control", "no-store");
  if (isNew) res.headers.append("Set-Cookie", deviceCookie(deviceId));
  return res;
}
