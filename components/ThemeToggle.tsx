"use client";

import { useEffect, useState, type ReactElement } from "react";

const K_THEME = "ff_theme"; // "light" | "dark" | absent (= system)

export type ThemePref = "system" | "light" | "dark";

/** Read the stored theme preference without triggering a render. */
export function storedTheme(): ThemePref {
  try {
    const v = window.localStorage.getItem(K_THEME);
    if (v === "light" || v === "dark") return v;
  } catch {
    /* storage can be blocked */
  }
  return "system";
}

/** Apply the theme to the document root. Call once on page load and on every change. */
export function applyTheme(pref: ThemePref) {
  const root = document.documentElement;
  if (pref === "light" || pref === "dark") {
    root.setAttribute("data-theme", pref);
  } else {
    root.removeAttribute("data-theme");
  }

  // Update <meta name="theme-color"> so the browser chrome matches
  const isDark =
    pref === "dark" || (pref === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", isDark ? "#141218" : "#faf8f5");
}

function saveTheme(pref: ThemePref) {
  try {
    if (pref === "system") window.localStorage.removeItem(K_THEME);
    else window.localStorage.setItem(K_THEME, pref);
  } catch {
    /* ignore */
  }
}

const OPTIONS: { value: ThemePref; label: string; icon: ReactElement }[] = [
  {
    value: "system",
    label: "System",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M6 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 13v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "light",
    label: "Light",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path
          d="M9 2.5v1.5M9 14v1.5M2.5 9H4M14 9h1.5M4.4 4.4l1.1 1.1M12.5 12.5l1.1 1.1M13.6 4.4l-1.1 1.1M5.5 12.5l-1.1 1.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Dark",
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
        <path
          d="M15 10.6A6.5 6.5 0 017.4 3a6.5 6.5 0 107.6 7.6z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    ),
  },
];

/**
 * A three-way theme toggle: System / Light / Dark.
 * Renders as a segmented pill in the settings screen.
 */
export default function ThemeToggle() {
  const [pref, setPref] = useState<ThemePref>("system");

  useEffect(() => {
    setPref(storedTheme());
  }, []);

  function pick(next: ThemePref) {
    setPref(next);
    saveTheme(next);
    applyTheme(next);
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-ink-soft">Appearance</legend>
      <div className="flex rounded-2xl border border-line bg-card p-1" role="radiogroup" aria-label="Appearance">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={pref === o.value}
            onClick={() => pick(o.value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              pref === o.value
                ? "bg-chip text-ink shadow-sm"
                : "text-ink-faint hover:text-ink-soft"
            }`}
          >
            {o.icon}
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
