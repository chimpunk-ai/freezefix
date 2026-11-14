"use client";

import { useEffect, useState } from "react";
import { readThemePref, writeThemePref, type ThemePref } from "@/lib/theme";

// Appearance: system / light / dark. A three-way radio group that looks like
// a quiet segmented control. Dark is the default; "system" follows the
// device. Persisted in localStorage (ff_theme) via lib/theme.ts; the <head>
// bootstrap in app/layout.tsx applies it before first paint on reload.

const OPTIONS: { value: ThemePref; label: string }[] = [
  { value: "system", label: "system" },
  { value: "light", label: "light" },
  { value: "dark", label: "dark" },
];

export default function ThemeToggle({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const [pref, setPref] = useState<ThemePref>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setPref(readThemePref());
    setReady(true);
  }, []);

  const choose = (v: ThemePref) => {
    setPref(v);
    writeThemePref(v);
  };

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const i = OPTIONS.findIndex((o) => o.value === pref);
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % OPTIONS.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + OPTIONS.length) % OPTIONS.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = OPTIONS.length - 1;
    if (next >= 0) {
      e.preventDefault();
      choose(OPTIONS[next].value);
      const el = (e.currentTarget as HTMLElement).querySelectorAll<HTMLButtonElement>("button")[next];
      el?.focus();
    }
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <span id="ff-theme-label" className={compact ? "ff-sr" : "text-14 text-ink-soft"}>
        appearance
      </span>
      <div
        role="radiogroup"
        aria-labelledby="ff-theme-label"
        onKeyDown={onKey}
        className="inline-flex min-h-11 items-center rounded-pill border border-line bg-card p-1"
      >
        {OPTIONS.map((o) => {
          const on = pref === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              onClick={() => choose(o.value)}
              className={[
                "ff-chip min-h-9 rounded-pill px-3 text-14 transition-colors",
                on ? "bg-accent text-accent-ink" : "text-ink-soft hover:text-ink",
                ready ? "" : "opacity-80",
              ].join(" ")}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
