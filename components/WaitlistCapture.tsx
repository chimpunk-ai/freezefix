"use client";

import { useState } from "react";
import { detectRegion } from "@/lib/country";
import { LANDING_COPY, type Locale } from "@/lib/landing-copy";

// Waitlist email capture — ships 3 November 2026, Europe-audit P1.4.
//
// The audit of 2 November showed every European persona (Marcus, Sophie, Lars,
// Emma, Raj) landing on getfreezefix.com, not booking a Fix session, and
// leaving with no way for us to notify them when the DE/FR/NL localization,
// the Reduction Program, or a paid plan ships. This component is the single
// capture surface. It is deliberately understated: no gradient hero, no
// countdown timer, no "join 10,000 others" social proof we would have to
// invent, no "early-bird discount" we don't have.
//
// What it collects: an email. That's it.
// What it also sends to the server: region (from detectRegion — the client
// locale sniff that P0.3 just fixed) and browser locale, so the founder can
// see at a glance how many signups are DE/NL/FR vs GB/US. Those are server-
// side only; the user never has to type a country.
//
// Not stored anywhere: name, phone, device id, IP, referrer, user agent, or
// anything that would let a captured email be joined back to a Fix session.
// The API route and the Supabase add_waitlist() function both refuse to do
// that join. See app/api/waitlist/route.ts and supabase/schema.sql.

type Variant = "compact" | "full";

type Props = {
  /** Which page this is on — the backend uses it for a per-source daily
   * count on the waitlist_summary view. Must be a known source or the API
   * normalizes it to null (not an error) so the signup still saves. */
  source: "home" | "future-plan" | "pricing";
  /** Compact: single-line, inline-with-CTAs on the landing page.
   * Full: stacked, with the explanation line, used on /future-plan. */
  variant?: Variant;
  /** Added 3 Nov 2026 for feat/de-landing. "en" by default; "de" for /de.
   * Pulls the whole copy block from lib/landing-copy.ts so the strings on the
   * form stay in step with the headline next to it. */
  locale?: Locale;
};

type Status = "idle" | "sending" | "done" | "throttled" | "not_collecting" | "error";

export default function WaitlistCapture({ source, variant = "compact", locale = "en" }: Props) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const t = LANDING_COPY[locale].waitlist;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: clean,
          region: detectRegion(),
          locale: typeof navigator !== "undefined" ? navigator.language : "",
          source,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; throttled?: boolean; error?: string };
      if (data.ok && data.throttled) {
        setStatus("throttled");
      } else if (data.ok) {
        setStatus("done");
      } else if (data.error === "not_collecting") {
        setStatus("not_collecting");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  // ────────────────────── Final states (shared) ──────────────────────
  if (status === "done") {
    return (
      <div
        role="status"
        className={
          variant === "compact"
            ? "text-sm text-ink"
            : "rounded-[1.25rem] border border-line bg-card p-4 text-sm text-ink"
        }
      >
        {t.done}
      </div>
    );
  }

  if (status === "not_collecting") {
    return (
      <div
        role="status"
        className={
          variant === "compact"
            ? "text-sm text-ink-soft"
            : "rounded-[1.25rem] border border-line bg-card p-4 text-sm text-ink-soft"
        }
      >
        {t.notCollecting}
      </div>
    );
  }

  if (status === "throttled") {
    return (
      <div
        role="status"
        className={
          variant === "compact"
            ? "text-sm text-ink-soft"
            : "rounded-[1.25rem] border border-line bg-card p-4 text-sm text-ink-soft"
        }
      >
        {t.throttled}
      </div>
    );
  }

  // ─────────────────────────── Compact form ───────────────────────────
  // Lives on the landing page under the "Open Fix" row. One line of label,
  // one input, one button. No preamble.
  if (variant === "compact") {
    return (
      <form
        onSubmit={submit}
        className="flex flex-col gap-2 border-t border-line pt-6"
        aria-label="Waitlist signup"
      >
        <label htmlFor="waitlist-email-compact" className="text-sm text-ink">
          {t.label}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id="waitlist-email-compact"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={t.placeholder}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            disabled={status === "sending"}
            required
            maxLength={254}
            className="min-h-[44px] flex-1 rounded-full border border-line bg-card px-4 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={status === "sending" || !email}
            className="min-h-[44px] rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "sending" ? t.submitting : t.submit}
          </button>
        </div>
        {status === "error" && (
          <p role="alert" className="text-xs text-ink-soft">
            {t.error}
          </p>
        )}
        <p className="text-xs leading-relaxed text-ink-faint">
          {t.footnote}
        </p>
      </form>
    );
  }

  // ─────────────────────────── Full form ───────────────────────────
  // Lives on /future-plan. Framed as "tell me when the paid plan is real".
  return (
    <form
      onSubmit={submit}
      className="rounded-[1.5rem] border border-line bg-card p-5 sm:p-6"
      aria-label="Waitlist signup"
    >
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">{t.label}</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          id="waitlist-email-full"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t.placeholder}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (status === "error") setStatus("idle");
          }}
          disabled={status === "sending"}
          required
          maxLength={254}
          className="min-h-[44px] flex-1 rounded-full border border-line bg-bg px-4 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "sending" || !email}
          className="min-h-[44px] rounded-full bg-accent px-5 text-sm font-medium text-accent-ink transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "sending" ? t.submitting : t.submit}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-2 text-xs text-ink-soft">
          {t.error}
        </p>
      )}
      <p className="mt-3 text-xs leading-relaxed text-ink-faint">
        {t.footnote}
      </p>
    </form>
  );
}
