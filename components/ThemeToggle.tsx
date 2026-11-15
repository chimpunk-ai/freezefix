"use client";

import { useEffect, useState } from "react";
import { readThemePref, resolvedTheme, writeThemePref, type ThemePref } from "@/lib/theme";

// Two buttons: light / dark. Nothing more.
//
// Where it lives: directly under the wordmark in the site header, small and
// quiet. Every page that renders SiteHeader shows one, so the choice is a tap
// away wherever the reader is.
//
// Default behaviour: before the user picks, the active side reflects the
// system theme (what the page is actually showing). After they pick, the
// choice is stored under ff_theme and survives reloads.

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<ThemePref>("dark");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Highlight whatever is actually showing — stored choice if there is one,
    // otherwise the OS preference the bootstrap script picked at first paint.
    setTheme(readThemePref() ?? resolvedTheme());
    setReady(true);
  }, []);

  const choose = (v: ThemePref) => {
    setTheme(v);
    writeThemePref(v);
  };

  return (
    <div
      role="group"
      aria-label="appearance"
      className={`inline-flex items-center rounded-pill border border-line bg-card/70 p-[3px] text-12 ${className}`.trim()}
    >
      {(["light", "dark"] as const).map((v) => {
        const on = theme === v;
        return (
          <button
            key={v}
            type="button"
            aria-pressed={on}
            onClick={() => choose(v)}
            className={[
              "ff-chip inline-flex min-h-7 items-center rounded-pill px-2.5 transition-colors",
              on ? "bg-ink text-bg" : "text-ink-faint hover:text-ink-soft",
              ready ? "" : "opacity-80",
            ].join(" ")}
          >
            <span aria-hidden className="mr-1.5 inline-block h-[10px] w-[10px]">
              {v === "light" ? <SunIcon /> : <MoonIcon />}
            </span>
            {v}
          </button>
        );
      })}
    </div>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="currentColor" aria-hidden className="block h-full w-full">
      <circle cx="5" cy="5" r="2" />
      <g stroke="currentColor" strokeWidth="1" strokeLinecap="round">
        <line x1="5" y1="0.5" x2="5" y2="1.8" />
        <line x1="5" y1="8.2" x2="5" y2="9.5" />
        <line x1="0.5" y1="5" x2="1.8" y2="5" />
        <line x1="8.2" y1="5" x2="9.5" y2="5" />
        <line x1="1.8" y1="1.8" x2="2.7" y2="2.7" />
        <line x1="7.3" y1="7.3" x2="8.2" y2="8.2" />
        <line x1="8.2" y1="1.8" x2="7.3" y2="2.7" />
        <line x1="2.7" y1="7.3" x2="1.8" y2="8.2" />
      </g>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="currentColor" aria-hidden className="block h-full w-full">
      <path d="M8.2 6.5a3.5 3.5 0 0 1-4.7-4.7 3.9 3.9 0 1 0 4.7 4.7z" />
    </svg>
  );
}
