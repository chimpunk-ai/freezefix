// Appearance. Two choices: light and dark. Dark is the brand default.
//
// The reader picks one; their choice lives in localStorage as ff_theme and is
// applied as `data-theme` on <html>, which the CSS in app/globals.css keys on.
//
// When nothing is stored yet (first visit, or after forget-everything cleared
// it), the page follows the operating system's dark/light preference instead
// of defaulting blindly. The inline bootstrap in app/layout.tsx does this
// before first paint so there is no flash of the wrong theme on reload.

export type ThemePref = "light" | "dark";

export const THEME_KEY = "ff_theme";

/** The user's stored choice, or null if they haven't picked. */
export function readThemePref(): ThemePref | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

/** What's actually being shown right now: the stored choice, else the OS preference. */
export function resolvedTheme(): ThemePref {
  const stored = readThemePref();
  if (stored) return stored;
  try {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
      return "light";
    }
  } catch {
    /* no-op */
  }
  return "dark";
}

export function applyTheme(pref: ThemePref): void {
  document.documentElement.setAttribute("data-theme", pref);
}

export function writeThemePref(pref: ThemePref): void {
  try {
    localStorage.setItem(THEME_KEY, pref);
  } catch {
    // storage blocked: the choice holds for this page only
  }
  applyTheme(pref);
}

/** Runs inline in <head>, before the stylesheet paints, so there is no flash
 *  of the wrong theme on reload. Mirrors readThemePref + applyTheme; kept
 *  dependency-free because it is serialised into the HTML. */
export const THEME_BOOTSTRAP = `(function(){try{var v=localStorage.getItem("${THEME_KEY}");if(v!=="light"&&v!=="dark"){v=window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"}document.documentElement.setAttribute("data-theme",v)}catch(e){}})();`;
