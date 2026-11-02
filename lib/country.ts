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

// Countries where we ship properly localized resources today. When the browser
// hands us a multi-tag Accept-Language like "en-US,en,de-DE" (very common for
// expats, international students and anyone whose OS language is English but
// who lives in continental Europe), the ORDER of those tags does NOT reliably
// tell us where they are — macOS, Windows and Chrome build the list from
// different inputs. Taking the first tag's suffix was routing an English-
// speaking Berlin resident ("Raj") to US resources (NSPL + American phrasing)
// instead of DE (Nummer gegen Kummer + 112), which is both wrong and quietly
// breaks our European product-market fit.
//
// Fix (fix/country-prefer-verified, P0.3 of the Europe-persona audit,
// 3 November 2026): when scanning the language list we prefer any suffix that
// matches a region we actually localize for over an earlier unverified one.
// If none of the tags carry a preferred-region suffix we fall back to the
// first match, so a genuine en-US user still gets US. FR is in the list even
// though it isn't fully resourced yet (that's audit item P1.6) so the shape
// is right before P1.6 lands.
const PREFERRED_REGIONS = new Set(["GB", "IE", "NL", "DE", "FR"]);

export function detectRegion(): string {
  if (typeof window === "undefined") return "";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (TIMEZONE_TO_COUNTRY[tz]) return TIMEZONE_TO_COUNTRY[tz];
    if (tz.startsWith("America/") && isUsTimeZone(tz)) return "US";
  } catch {
    /* ignore */
  }
  const langs = [
    ...((typeof navigator !== "undefined" && navigator.languages) || []),
    typeof navigator !== "undefined" ? navigator.language : "",
  ].filter(Boolean) as string[];
  return pickRegionFromLanguages(langs);
}

// Exported so scripts/test-country.ts can unit-test the fallback logic without
// needing a browser. Pure function: never reads window / navigator / globalThis.
export function pickRegionFromLanguages(langs: readonly string[]): string {
  let firstMatch = "";
  for (const l of langs) {
    const m = /[-_]([A-Za-z]{2})\b/.exec(l);
    if (!m) continue;
    const r = m[1].toUpperCase();
    const canonical = r === "UK" ? "GB" : r;
    if (PREFERRED_REGIONS.has(canonical)) {
      // First preferred-region hit wins — do not keep scanning. Prevents
      // "de-DE,fr-FR" from being resolved as FR when the user is clearly DE.
      return canonical;
    }
    if (!firstMatch) firstMatch = canonical;
  }
  return firstMatch;
}

function isUsTimeZone(tz: string): boolean {
  return [
    "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
    "America/Phoenix", "America/Anchorage", "America/Detroit", "America/Boise",
    "America/Indiana/Indianapolis", "America/Kentucky/Louisville", "America/Adak",
  ].includes(tz) || tz.startsWith("America/Indiana/") || tz.startsWith("America/Kentucky/") || tz.startsWith("America/North_Dakota/");
}
