import { NextResponse } from "next/server";

/**
 * Retired: Fix does not create user profiles or upload pet-names. Kept as a
 * non-writing tombstone so stale clients cannot recreate the old collection.
 */
export async function POST() {
  return NextResponse.json({ error: "signup_disabled" }, { status: 410 });
}
