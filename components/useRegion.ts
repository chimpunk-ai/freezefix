"use client";

import { useSyncExternalStore } from "react";
import { detectRegion } from "@/lib/country";

// The region is a device fact, not React state: it comes from the browser's own
// time zone and language list and does not change during a session. Reading it
// through useSyncExternalStore keeps the server render deterministic (empty
// string, so no hydration mismatch) and the client render honest, without a
// setState-in-effect cascade on mount.

const subscribe = () => () => {};
const getSnapshot = () => detectRegion();
const getServerSnapshot = () => "";

export function useRegion(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
