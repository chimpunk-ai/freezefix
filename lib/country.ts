// Detects the user's country from the DEVICE's settings (time zone, then region),
// never GPS (Safety Pack section 2). The user can always change it with the switcher.

const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  "Europe/London": "GB",
  "Europe/Belfast": "GB",
  "Europe/Dublin": "IE",
  "Europe/Amsterdam": "NL",
  "Europe/Berlin": "DE",
  "Europe/Busingen": "DE",
  "Asia/Kolkata": "IN",
  "Asia/Calcutta": "IN",
};

export function detectRegion(): string {
  if (typeof window === "undefined") return "";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (TIMEZONE_TO_COUNTRY[tz]) return TIMEZONE_TO_COUNTRY[tz];
    if (tz.startsWith("America/") && isUsTimeZone(tz)) return "US";
  } catch {
    /* ignore */
  }
  const langs = [...(navigator.languages || []), navigator.language].filter(Boolean);
  for (const l of langs) {
    const m = /[-_]([A-Za-z]{2})\b/.exec(l);
    if (m) {
      const r = m[1].toUpperCase();
      return r === "UK" ? "GB" : r;
    }
  }
  return "";
}

function isUsTimeZone(tz: string): boolean {
  return [
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Phoenix", "America/Anchorage", "America/Detroit", "America/Boise",
    "America/Indiana/Indianapolis", "America/Kentucky/Louisville", "America/Adak",
  ].includes(tz) || tz.startsWith("America/Indiana/") || tz.startsWith("America/Kentucky/") || tz.startsWith("America/North_Dakota/");
}
