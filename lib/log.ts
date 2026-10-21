// Minimal, anonymous event log (Safety Pack section 5 "Logging"):
// we record only a kind, a number, the moment, the country and a timestamp.
// NEVER the user's words. Does nothing until Supabase keys are set.

export type EventKind = "risk" | "helped" | "session" | "signup";

export async function logEvent(e: {
  kind: EventKind;
  value: number; // risk level 0-4, or 1/0 for "Did it help?"
  moment?: string | null;
  country?: string | null;
}) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return;
  try {
    await fetch(`${url.replace(/\/$/, "")}/rest/v1/events`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        kind: e.kind,
        value: Math.max(0, Math.min(4, Math.round(e.value))),
        moment: e.moment ? String(e.moment).slice(0, 20) : null,
        country: e.country ? String(e.country).slice(0, 8).toUpperCase() : null,
      }),
      signal: AbortSignal.timeout(4000),
    });
  } catch {
    // Logging must never break the app.
  }
}
