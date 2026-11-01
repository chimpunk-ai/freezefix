"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import ThemeToggle from "@/components/ThemeToggle";
import { clearAll as clearJournal, count as journalCount } from "@/lib/journal";
import { clearAll as clearPlans, count as planCount } from "@/lib/tomorrow-plans";
import { unhideAll as unhideInsights } from "@/lib/insights";
import { allWins, clearWins } from "@/lib/wins";

// Settings & more. The real controls that used to live inside /app.
//
// "Delete all my data" scope is explicit (see KEYS_WIPED). It wipes the on-device
// stores this app writes — check-ins, goal, journal, plans, wins, memory, insights
// hidden-set — and leaves the 18+ gate / consent alone because losing those would
// re-stage onboarding when the user said "clear my data", not "forget who I am".
//
// Payments-related keys and the AI API key are NOT touched because this component
// does not read them and they are not in localStorage. Secret handling is unchanged.

const KEYS_WIPED = [
  "ff_checkins",
  "ff_goal",
  "ff_journal_entries",
  "ff_tomorrow_plans",
  "ff_insights_hidden",
  "ff_wins_log",
  "ff_recent_scenarios",
  "ff_memory",
  "ff_name",
  "ff_session_level",
  "ff_session_mixed",
  "ff_session_ack",
];

const SUB_PAGES: { href: string; label: string; blurb: string }[] = [
  { href: "/sos", label: "Craving SOS", blurb: "A short, started-by-you pause." },
  { href: "/tools", label: "Everyday tools", blurb: "Respectful message, task unfreeze, decision pause." },
  { href: "/privacy", label: "How privacy works", blurb: "What stays on this device, and what gets sent." },
  { href: "/future-plan", label: "Future plan preview", blurb: "What might be paid one day — and what never will be." },
  { href: "/scenarios", label: "Prototype scenarios", blurb: "Founder-only test scripts. Not for general use." },
];

const DATA_TABLE: { what: string; where: string; delete: string }[] = [
  {
    what: "Chat messages (Fix)",
    where: "Sent to the AI provider to generate a reply. Not stored by FreezeFix.",
    delete: "Nothing to delete here. Provider retention is in the Privacy Policy.",
  },
  {
    what: "Daily check-ins, goal, journal entries, Tomorrow Loop plans",
    where: "This browser's local storage.",
    delete: "Delete all my data below, or Delete all inside each surface.",
  },
  {
    what: "Wins log and memory",
    where: "This browser's local storage.",
    delete: "Delete all my data below, or Delete inside Fix.",
  },
  {
    what: "Anonymous counts, daily rate limits",
    where: "A privacy-first database in the EU. No raw identifiers.",
    delete: "Rate-limit rows are deleted after two days automatically.",
  },
  {
    what: "Theme preference, consent, 18+ gate",
    where: "This browser's local storage.",
    delete: "Theme: tap System below. Consent / age stay unless you clear browser data.",
  },
];

type Caps = { free: number; paid: number };
type Config = {
  ai?: boolean;
  beta?: boolean;
  voice?: boolean;
  screenshot?: boolean;
  limits?: { voice?: Caps; screenshot?: Caps; check?: Caps };
};

export default function SettingsHub() {
  const [mounted, setMounted] = useState(false);
  const [journal, setJournal] = useState(0);
  const [plans, setPlans] = useState(0);
  const [wins, setWins] = useState(0);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [wiped, setWiped] = useState(false);
  // Server-side config: feature flags + daily caps. Fetched once on mount so we don't
  // keep hitting /api/config while the user flips around settings. "undefined" means
  // "we haven't been told", so the UI shows "–" rather than a confident "0".
  const [cfg, setCfg] = useState<Config | null>(null);

  useEffect(() => {
    setJournal(journalCount());
    setPlans(planCount());
    setWins(allWins().length);
    setMounted(true);
    // Fire and forget. If the fetch fails, the section just doesn't render the caps.
    fetch("/api/config", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Config | null) => setCfg(d))
      .catch(() => setCfg(null));
  }, []);

  function wipe() {
    // Clear the structured stores through their own helpers (keeps future refactors
    // honest) and remove any other known keys directly.
    try {
      clearJournal();
      clearPlans();
      clearWins();
      unhideInsights();
      for (const k of KEYS_WIPED) {
        try {
          window.localStorage.removeItem(k);
        } catch {
          /* storage can be blocked for a key */
        }
      }
    } catch {
      /* ignore */
    }
    setJournal(0);
    setPlans(0);
    setWins(0);
    setConfirmWipe(false);
    setWiped(true);
    window.setTimeout(() => setWiped(false), 2500);
  }

  return (
    <AppShell>
      <section className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Settings & more</p>
        <h1
          className="text-[clamp(1.9rem,5.6vw,2.6rem)] leading-tight text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          Everything you can tune.
        </h1>
        <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">
          Theme, data, memory, and delete-everything live on this screen. Nothing on this page is a
          placeholder for controls that already work.
        </p>
      </section>

      {/* Theme */}
      <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Theme</p>
        <p className="mt-2 text-sm text-ink-soft">
          Saved in this browser. Motion follows your device&apos;s reduced-motion setting.
        </p>
        <div className="mt-3">
          <ThemeToggle />
        </div>
      </section>

      {/* Data */}
      <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Your data</p>
        <ul className="mt-3 grid grid-cols-3 gap-3 text-center">
          <Stat label="Check-ins" value={mounted ? "set" : "–"} />
          <Stat label="Journal entries" value={mounted ? String(journal) : "–"} />
          <Stat label="Plans" value={mounted ? String(plans) : "–"} />
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          Everything above lives on this device. There is no server copy to delete.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {!confirmWipe ? (
            <button
              type="button"
              onClick={() => setConfirmWipe(true)}
              className="min-h-[44px] rounded-full border border-frost/70 bg-bg px-5 py-1.5 text-sm text-frost transition hover:border-frost hover:bg-frost/10"
            >
              Delete all my data on this device
            </button>
          ) : (
            <>
              <span className="text-sm text-ink">Delete journal, plans, wins, check-ins, memory, hidden insights?</span>
              <button
                type="button"
                onClick={wipe}
                className="min-h-[40px] rounded-full border border-frost bg-frost/15 px-4 py-1.5 text-sm text-frost"
              >
                Yes, delete all
              </button>
              <button
                type="button"
                onClick={() => setConfirmWipe(false)}
                className="min-h-[40px] rounded-full border border-line bg-bg px-4 py-1.5 text-sm text-ink-soft"
              >
                Cancel
              </button>
            </>
          )}
          {wiped && (
            <span role="status" className="text-xs text-accent">
              Done — this device is empty again.
            </span>
          )}
        </div>
        <p className="mt-3 text-xs text-ink-faint">
          Consent and the 18+ gate stay — asking you to redo them on a cleared device would feel
          like a bug, not a feature. Clear your browser data to wipe them too.
        </p>
      </section>

      {/* Daily limits — what the server caps today. Chat itself is open to everyone
          while payments are frozen; voice and screenshots stay feature-flagged off
          at build time. "–" means we don't have a number from the server. */}
      <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Daily limits</p>
          {cfg?.beta && (
            <span className="rounded-full border border-accent/60 bg-accent/10 px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-accent">
              Open beta · unlimited chat
            </span>
          )}
        </div>
        <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <LimitRow
            label="Chat"
            cap={cfg?.beta ? "Unlimited" : "First unfreeze free, then paywall"}
            on={cfg?.ai ?? false}
            offLabel="AI key not set"
          />
          <LimitRow
            label="Voice notes"
            cap={cfg?.limits?.voice ? `${cfg.limits.voice.free}/day free · ${cfg.limits.voice.paid} on paid` : "–"}
            on={cfg?.voice ?? false}
            offLabel="Not switched on"
          />
          <LimitRow
            label="Screenshots"
            cap={
              cfg?.limits?.screenshot
                ? `${cfg.limits.screenshot.free}/day free · ${cfg.limits.screenshot.paid} on paid`
                : "–"
            }
            on={cfg?.screenshot ?? false}
            offLabel="Not switched on"
          />
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          Caps are static — the server enforces them per device per day. &quot;Remaining today&quot;
          needs a database read we have not wired yet; the error message when a cap trips
          names which cap it was.
        </p>
      </section>

      {/* Reminders — honest */}
      <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Reminders</p>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Notifications are not connected. The reminder toggle on a Tomorrow Loop plan is
          prototype-only and never sends anything — once reminders exist they&apos;ll switch on
          for any plan already marked.
        </p>
      </section>

      {/* Sub-page nav */}
      <section className="mt-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">More</p>
        <ul className="mt-2 flex flex-col divide-y divide-line/70 rounded-[1.5rem] border border-line bg-card">
          {SUB_PAGES.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="flex items-center justify-between gap-4 p-4 transition hover:bg-chip/40"
              >
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-ink">{l.label}</span>
                  <span className="text-xs text-ink-soft">{l.blurb}</span>
                </span>
                <span aria-hidden="true" className="text-ink-faint">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Data table */}
      <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">What is stored, and where</p>
        <ul className="mt-3 flex flex-col divide-y divide-line/70">
          {DATA_TABLE.map((row) => (
            <li
              key={row.what}
              className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[1.1fr_1.4fr_1.2fr] sm:gap-5"
            >
              <p className="text-sm font-medium text-ink">{row.what}</p>
              <p className="text-sm text-ink-soft">{row.where}</p>
              <p className="text-sm text-ink-soft">{row.delete}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-ink-faint">
          The full{" "}
          <Link href="/privacy" className="text-ink-soft underline-offset-4 hover:text-ink">
            Privacy Policy
          </Link>{" "}
          is the authoritative version on anything that disagrees with the quick summary here.
        </p>
      </section>

      {/* About */}
      <section className="mt-5 text-xs leading-relaxed text-ink-faint">
        <p>
          Wins carried over on this device: {mounted ? wins : "–"}. FreezeFix is adults-only (18+)
          · nothing is sold or shared · crisis help is always free and never behind a paywall.
        </p>
      </section>
    </AppShell>
  );
}

function LimitRow({
  label,
  cap,
  on,
  offLabel,
}: {
  label: string;
  cap: string;
  on: boolean;
  offLabel: string;
}) {
  return (
    <li className="flex flex-col gap-1 rounded-2xl border border-line/70 bg-bg/60 p-3">
      <p className="text-xs uppercase tracking-wider text-ink-faint">{label}</p>
      <p className="text-sm text-ink">{on ? cap : offLabel}</p>
      <span
        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${
          on ? "border border-accent/40 text-accent" : "border border-line text-ink-faint"
        }`}
      >
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full ${on ? "bg-accent" : "bg-ink-faint"}`}
        />
        {on ? "On" : "Off"}
      </span>
    </li>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <li className="rounded-2xl border border-line/70 bg-bg/60 p-3">
      <p
        className="font-serif text-2xl text-ink tabular-nums"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
      >
        {value}
      </p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-faint">{label}</p>
    </li>
  );
}
