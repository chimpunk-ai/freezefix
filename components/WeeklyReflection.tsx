"use client";

import { useEffect, useState } from "react";
import {
  shouldShowCard,
  pickPromptIdx,
  saveReflection,
  dismissThisWeek,
  getThisWeek,
} from "@/lib/reflections";
import { REFLECTIONS_COPY } from "@/lib/reflections-copy";
import { detectRegion } from "@/lib/country";
import type { Locale } from "@/lib/landing-copy";

// Weekly reflection card. Audit P2.9, 3 November 2026.
//
// Lives on the Home tab (components/HomeDashboard). Renders once per ISO
// week — if the user has already saved OR dismissed this week, the card
// returns null and nothing is in the way. State is local (ff_weekly_
// reflections) and separate from the Reduction Program's own reflection
// store, because a user who never starts a program should still get the
// weekly nudge, and a user who DOES have a plan should see distinct
// questions in the two surfaces instead of the same question twice.
//
// Locale
//   Detects the user's region on mount (same path as /de / /program use).
//   DE / AT / CH get the German prompt rotation; everyone else English.
//   Chat localization isn't a concern here because this card doesn't
//   call the chat — it writes to localStorage and returns.

export default function WeeklyReflection() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  const [promptIdx, setPromptIdx] = useState(0);
  const [text, setText] = useState("");
  const [savedState, setSavedState] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    setMounted(true);
    const region = detectRegion();
    const loc: Locale =
      region === "DE" || region === "AT" || region === "CH" ? "de" : "en";
    setLocale(loc);
    const idx = pickPromptIdx(REFLECTIONS_COPY[loc].prompts.length);
    setPromptIdx(idx);
    setVisible(shouldShowCard());
    // Pre-fill if the user partially engaged earlier this week but didn't
    // save — the lib treats a dismissed-no-save as "don't show again this
    // week" so we don't need to re-check that case, only idle re-entry.
    const existing = getThisWeek();
    if (existing?.text) setText(existing.text);
  }, []);

  if (!mounted || !visible) return null;

  const t = REFLECTIONS_COPY[locale];
  const prompt = t.prompts[promptIdx] ?? t.prompts[0];

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (savedState === "saving") return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setSavedState("saving");
    // The write is synchronous (localStorage), but a tiny deliberate pause
    // makes the state change feel intentional rather than instant-and-gone.
    await new Promise((r) => setTimeout(r, 120));
    saveReflection(trimmed, promptIdx);
    setSavedState("saved");
    // Hide after a beat so the card doesn't linger with the saved message
    // forever and clutter the home view.
    setTimeout(() => setVisible(false), 1800);
  }

  function onSkip() {
    dismissThisWeek(promptIdx);
    setVisible(false);
  }

  return (
    <section
      aria-labelledby="weekly-reflection-h"
      className="flex flex-col gap-3 rounded-[1.5rem] border border-line bg-card p-5 sm:p-6"
    >
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
        {t.cardKicker}
      </p>
      <h2
        id="weekly-reflection-h"
        className="text-lg text-ink"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        {t.cardHeading}
      </h2>
      <p className="text-base leading-relaxed text-ink">{prompt}</p>

      <form onSubmit={onSave} className="flex flex-col gap-2">
        <label htmlFor="weekly-ref-input" className="sr-only">
          {prompt}
        </label>
        <input
          id="weekly-ref-input"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.placeholder}
          maxLength={400}
          disabled={savedState === "saving" || savedState === "saved"}
          className="min-h-[44px] rounded-full border border-line bg-bg px-4 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-70"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={!text.trim() || savedState === "saving" || savedState === "saved"}
            className="min-h-[40px] rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {savedState === "saving"
              ? t.savingLabel
              : savedState === "saved"
              ? t.savedLabel
              : t.saveLabel}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={savedState === "saving" || savedState === "saved"}
            className="min-h-[40px] rounded-full border border-line px-4 text-sm text-ink-soft transition hover:text-ink disabled:opacity-60"
          >
            {t.skipLabel}
          </button>
        </div>
        <p className="text-xs leading-relaxed text-ink-faint">{t.oneLineHint}</p>
      </form>
    </section>
  );
}
