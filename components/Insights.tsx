"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  computeInsights,
  hide as hideInsight,
  readHidden,
  unhideAll,
  type Insight,
  type InsightId,
  type WeekBar,
} from "@/lib/insights";

// The Insights (/patterns) page. Reads only this device's storage; nothing is sent
// anywhere. Each card has a "Why am I seeing this?" explainer and a Hide button so
// the surface is yours to shape. "Honest" is the only rule: an insight that doesn't
// have enough data to be honest simply doesn't render.

export default function InsightsPage() {
  const [mounted, setMounted] = useState(false);
  const [weeks, setWeeks] = useState<WeekBar[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [totalCheckins, setTotalCheckins] = useState(0);
  const [firstDay, setFirstDay] = useState<string | null>(null);
  const [lastDay, setLastDay] = useState<string | null>(null);
  const [hidden, setHidden] = useState<Set<InsightId>>(new Set());

  useEffect(() => {
    const r = computeInsights();
    setWeeks(r.weeks);
    setInsights(r.insights);
    setTotalEntries(r.entries.length);
    setTotalCheckins(r.totalCheckins);
    setFirstDay(r.firstEntryDay);
    setLastDay(r.lastEntryDay);
    setHidden(readHidden());
    setMounted(true);
  }, []);

  function onHide(id: InsightId) {
    hideInsight(id);
    setHidden(new Set([...hidden, id]));
  }

  function onShowAll() {
    unhideAll();
    setHidden(new Set());
  }

  const visible = useMemo(() => insights.filter((i) => !hidden.has(i.id)), [insights, hidden]);
  const hasAny = totalEntries > 0 || totalCheckins > 0;

  return (
    <AppShell wide>
      <section className="flex flex-col gap-3 pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Insights · on this device only</p>
        <h1
          className="text-[clamp(2rem,6vw,3rem)] leading-[1.08] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          A quiet look at what keeps coming up.
        </h1>
        <p className="max-w-[55ch] text-base leading-relaxed text-ink-soft">
          This is a pattern in the entries you chose to save — not a diagnosis or proof of cause.
          Nothing is sent anywhere. An insight only renders when there is enough data for it to
          be honest; the rest of the page stays empty rather than inventing a story.
        </p>
      </section>

      {!mounted ? null : !hasAny ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-6">
          {/* 4-week bar — always on top when any check-in exists, so the shape of recent
              weeks is visible even when there are no journal entries yet. */}
          {totalCheckins > 0 && <FourWeekBar weeks={weeks} />}

          {/* Insight cards */}
          {visible.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {visible.map((i) => (
                <InsightCard key={i.id} insight={i} onHide={() => onHide(i.id)} />
              ))}
            </div>
          )}

          {/* Nothing met the honesty gate yet. Say so plainly. */}
          {visible.length === 0 && insights.length === 0 && (
            <section className="rounded-[1.5rem] border border-line bg-card p-5 text-sm text-ink-soft">
              The check-in on Home has a start, but there isn't enough yet to say more.
              Logging a few journal entries (and tagging the context) is what fills these cards.
              <br />
              <Link href="/journal" className="mt-3 inline-block text-ink underline-offset-4 hover:underline">
                Open journal →
              </Link>
            </section>
          )}

          {/* Hidden-insights control */}
          {hidden.size > 0 && (
            <div className="flex items-center justify-between rounded-[1.25rem] border border-dashed border-line/70 p-4 text-sm text-ink-soft">
              <span>{hidden.size} insight{hidden.size === 1 ? "" : "s"} hidden on this device.</span>
              <button
                type="button"
                onClick={onShowAll}
                className="min-h-[36px] rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:text-ink"
              >
                Show all again
              </button>
            </div>
          )}

          {/* Footer context */}
          <p className="text-xs leading-relaxed text-ink-faint">
            {totalEntries > 0 && firstDay && lastDay
              ? `Based on ${totalEntries} journal entr${totalEntries === 1 ? "y" : "ies"} · ${firstDay} → ${lastDay}. `
              : ""}
            Want to change what's counted? Add, edit or delete entries from the{" "}
            <Link href="/journal" className="text-ink-soft underline-offset-4 hover:text-ink">
              journal
            </Link>
            , or clear your check-ins and plans from Settings.
          </p>
        </div>
      )}
    </AppShell>
  );
}

function EmptyState() {
  return (
    <section className="rounded-[1.5rem] border border-line bg-card p-6 text-ink-soft">
      <h2 className="mb-2 font-serif text-xl text-ink" style={{ fontFamily: "var(--font-display)" }}>
        Nothing to show yet
      </h2>
      <p className="mb-4 max-w-[48ch] text-sm leading-relaxed">
        Use the check-in on Home for a few days, or log a journal entry or two. This page fills
        from what you keep — still on your phone, still nowhere else.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/home"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink"
        >
          Open Home
          <span aria-hidden="true">→</span>
        </Link>
        <Link
          href="/journal"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-bg px-5 py-2 text-sm text-ink hover:border-ink-soft"
        >
          Open Journal
        </Link>
      </div>
    </section>
  );
}

function FourWeekBar({ weeks }: { weeks: WeekBar[] }) {
  const max = Math.max(1, ...weeks.map((w) => w.use));
  return (
    <section className="rounded-[1.5rem] border border-line bg-card p-5">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
        Use days per week · from your check-ins
      </p>
      <ul className="mt-5 flex items-end justify-between gap-4" aria-label="Use days per week, last four weeks">
        {weeks.map((w, idx) => {
          const h = w.recorded === 0 ? 2 : Math.max(w.use > 0 ? 10 : 4, (w.use / max) * 110);
          return (
            <li key={idx} className="flex min-w-[52px] flex-1 flex-col items-center gap-2">
              <div
                className={`w-full rounded-md ${w.recorded === 0 ? "bg-line/60" : w.use === 0 ? "bg-accent/40" : "bg-accent/80"}`}
                style={{ height: `${h}px` }}
                aria-hidden="true"
              />
              <span
                className="font-serif text-2xl text-ink tabular-nums"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {w.recorded === 0 ? "–" : w.use}
              </span>
              <span className="text-[11px] text-ink-faint">{w.label}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        Days without a check-in aren&apos;t counted. Not a score, and nothing resets. "–" means that
        week had zero check-ins recorded.
      </p>
    </section>
  );
}

function InsightCard({ insight, onHide }: { insight: Insight; onHide: () => void }) {
  const [showWhy, setShowWhy] = useState(false);
  return (
    <article className="flex flex-col gap-3 rounded-[1.5rem] border border-line bg-card p-5">
      {insight.basis && (
        <p className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">{insight.basis}</p>
      )}
      <h3
        className="text-lg leading-snug text-ink"
        style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.01em" }}
      >
        {insight.title}
      </h3>
      <p className="text-sm leading-relaxed text-ink-soft">{insight.body}</p>

      {showWhy ? (
        <div className="rounded-xl border border-line/70 bg-bg/60 p-3 text-xs leading-relaxed text-ink-soft">
          <p className="font-medium text-ink">Why am I seeing this?</p>
          <p className="mt-1">{insight.explanation}</p>
          <button
            type="button"
            onClick={() => setShowWhy(false)}
            className="mt-2 text-[11px] uppercase tracking-wider text-ink-faint hover:text-ink"
          >
            Hide explainer
          </button>
        </div>
      ) : null}

      <div className="mt-1 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setShowWhy((v) => !v)}
          className="text-ink-soft underline-offset-4 hover:text-ink hover:underline"
          aria-expanded={showWhy}
        >
          Why am I seeing this?
        </button>
        <button
          type="button"
          onClick={onHide}
          className="min-h-[32px] rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-wider text-ink-faint hover:text-ink"
        >
          Hide this insight
        </button>
      </div>
    </article>
  );
}
