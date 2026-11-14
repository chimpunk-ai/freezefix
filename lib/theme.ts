// Appearance. Dark is the default; the warm-paper light theme follows the
// system unless the reader picks one. The choice lives in localStorage under
// ff_theme ("light" | "dark"; absent = follow the system) and is applied as
// data-theme on <html>, which the CSS in app/globals.css keys on.
//
// forget-everything should clear ff_theme along with the rest (see
// components/AppClient.tsx).

export type ThemePref = "system" | "light" | "dark";

export const THEME_KEY = "ff_theme";

export function readThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function applyTheme(pref: ThemePref): void {
  const root = document.documentElement;
  if (pref === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", pref);
}

export function writeThemePref(pref: ThemePref): void {
  try {
    if (pref === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    // storage blocked: the choice holds for this page only
  }
  applyTheme(pref);
}

/** Runs inline in <head>, before the stylesheet paints, so there is no flash
 *  of the wrong theme on reload. Mirrors readThemePref + applyTheme; kept
 *  dependency-free because it is serialised into the HTML. */
export const THEME_BOOTSTRAP = `(function(){try{var v=localStorage.getItem("${THEME_KEY}");if(v==="light"||v==="dark"){document.documentElement.setAttribute("data-theme",v)}}catch(e){}})();`;
