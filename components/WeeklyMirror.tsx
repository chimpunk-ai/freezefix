"use client";

// The weekly mirror card — the magic moment (brief, section 5).
//
// Two pieces of surface:
//   1. a quiet card on the home screen that shows the week's shape in one line
//      and offers the mirror;
//   2. the sheet itself, which slides up from the bottom over 350ms and draws
//      its seven-night grid in, night by night.
//
// The engine in lib/mirror.ts does all the thinking; this file is only the
// paper the mirror is written on. No streaks, no scores, no trophies, and the
// only accent colour used for "this matters" is the sage token.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  buildMirror,
  readThing,
  writeThing,
  toggleThingToday,
  thingDoneThisWeek,
  type Mirror,
  type Thing,
} from "@/lib/mirror";
import { buildPatterns, series, type Pattern, type Week } from "@/lib/patterns";
import { readWeeks } from "@/lib/pattern-data";
import MirrorGraphs from "@/components/MirrorGraphs";
import {
  enableNudges,
  mirrorSeenThisWeek,
  markMirrorSeen,
  notificationsSupported,
  readNudgePrefs,
  runWeeklyAutomation,
  scheduleNudges,
  writeNudgePrefs,
  type NudgePrefs,
} from "@/lib/automation";

function nightClass(n: Mirror["nights"][number]): string {
  if (n.future) return "ff-night ff-night-future";
  if (n.smoked === true) return "ff-night ff-night-smoked";
  if (n.smoked === false) return "ff-night ff-night-clear";
  return "ff-night ff-night-empty";
}

function nightLabel(n: Mirror["nights"][number]): string {
  if (n.future) return `${n.initial} — still to come`;
  if (n.smoked === true) return `${n.initial} — smoked`;
  if (n.smoked === false) return `${n.initial} — didn't`;
  return `${n.initial} — nothing logged`;
}

export default function WeeklyMirror() {
  const [mirror, setMirror] = useState<Mirror | null>(null);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [open, setOpen] = useState(false);
  const [thing, setThing] = useState<Thing | null>(null);
  const [done, setDone] = useState(0);
  const [prefs, setPrefs] = useState<NudgePrefs>({ nightly: false, weekly: true, bedtimeHour: 22 });
  const [draft, setDraft] = useState("");
  const [draftTarget, setDraftTarget] = useState(2);
  const [editingThing, setEditingThing] = useState(false);

  const refresh = useCallback(() => {
    const { current } = runWeeklyAutomation();
    setMirror(current);
    const recent = readWeeks(5);
    setWeeks(recent);
    setPatterns(buildPatterns(recent));
    setThing(readThing());
    setDone(thingDoneThisWeek());
    setPrefs(readNudgePrefs());
    return current;
  }, []);

  useEffect(() => {
    const current = refresh();
    scheduleNudges();
    // The mirror is an appointment, not a nag: on Sunday evening it opens
    // itself once, if there is enough logged to be worth opening.
    const now = new Date();
    if (
      current.hasEnough &&
      now.getDay() === 0 &&
      now.getHours() >= 20 &&
      !mirrorSeenThisWeek(current.weekKey)
    ) {
      setOpen(true);
    }
  }, [refresh]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = useCallback(() => {
    setOpen(false);
    if (mirror) markMirrorSeen(mirror.weekKey);
  }, [mirror]);

  const onToggleThing = useCallback(() => {
    toggleThingToday();
    setThing(readThing());
    setDone(thingDoneThisWeek());
  }, []);

  const saveThing = useCallback(() => {
    writeThing(draft, draftTarget);
    setThing(readThing());
    setDone(thingDoneThisWeek());
    setEditingThing(false);
    setDraft("");
  }, [draft, draftTarget]);

  const onNudge = useCallback(async () => {
    const granted = await enableNudges();
    const next = writeNudgePrefs({ weekly: true, nightly: granted ? true : prefs.nightly });
    setPrefs(next);
    scheduleNudges();
  }, [prefs.nightly]);

  const goalHit = useMemo(
    () => Boolean(thing && done >= thing.target),
    [thing, done],
  );

  // The shelf: the weeks before this one, read straight from the same taps. No
  // snapshot to drift out of date, no feed, no sharing — just the last few weeks
  // there to look at when you want to see whether anything is actually changing.
  const shelf = useMemo(() => series(weeks).slice(0, -1).reverse(), [weeks]);

  if (!mirror) {
    return (
      <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5" aria-busy="true">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Your week · the mirror</p>
        <p className="mt-2 text-sm text-ink-soft">Reading the week…</p>
      </section>
    );
  }

  return (
    <>
      <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Your week · the mirror</p>
          {mirror.hasEnough && (
            <p className="text-xs text-ink-faint">
              {mirror.smoked} of {mirror.recorded} logged
            </p>
          )}
        </div>

        <p className="mt-3 text-[0.95rem] leading-relaxed text-ink">{mirror.sentence}</p>

        <div className="mt-4 flex gap-1.5" aria-hidden="true">
          {mirror.nights.map((n, i) => (
            <span
              key={n.day}
              className={nightClass(n)}
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-ink transition active:scale-[0.97]"
          >
            Open the mirror
          </button>
          <Link href="/app" className="text-sm text-ink-soft underline-offset-4 hover:underline">
            log tonight
          </Link>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" role="dialog" aria-modal="true" aria-label="Your week">
          <button
            type="button"
            aria-label="Close the mirror"
            onClick={close}
            className="ff-scrim absolute inset-0 bg-black/60"
          />
          <div className="ff-sheet ff-sheet-in relative w-full max-w-[34rem] rounded-t-[1.25rem] border border-line bg-card px-5 pb-8 pt-4">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" aria-hidden="true" />
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Sunday · your week</p>
            <h2 className="mt-2 font-serif text-2xl leading-snug text-ink">
              {mirror.hasEnough ? "here's the shape of it." : "not enough taps yet."}
            </h2>

            <p className="mt-5 text-[0.95rem] leading-relaxed text-ink">{mirror.sentence}</p>

            {weeks.length > 0 ? (
              <MirrorGraphs weeks={weeks} patterns={patterns} />
            ) : (
              <div className="mt-5 grid grid-cols-7 gap-2">
                {mirror.nights.map((n, i) => (
                  <div key={n.day} className="flex flex-col items-center gap-1.5">
                    <span
                      className={nightClass(n)}
                      style={{ animationDelay: `${120 + i * 70}ms` }}
                      aria-hidden="true"
                    />
                    <span className="text-[0.65rem] uppercase tracking-wide text-ink-faint" aria-hidden="true">
                      {n.initial}
                    </span>
                    <span className="sr-only">{nightLabel(n)}</span>
                  </div>
                ))}
              </div>
            )}

            {patterns.length === 0 && (
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{mirror.observation}</p>
            )}

            {mirror.direction && (
              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-ink-faint">{mirror.direction}</p>
            )}

            {/* The goal line. The user's own words, their own counter, invisible
                everywhere except here and on their own log screen. */}
            <div className={`mt-5 rounded-[1rem] border border-line/70 bg-chip/60 p-4 ${goalHit ? "ff-goal-pulse" : ""}`}>
              {thing ? (
                <>
                  <p className="text-sm text-ink">{mirror.thingLine}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={onToggleThing}
                      className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition active:scale-[0.97]"
                    >
                      did it today
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(thing.label);
                        setDraftTarget(thing.target);
                        setEditingThing(true);
                      }}
                      className="text-xs text-ink-faint underline-offset-4 hover:underline"
                    >
                      change
                    </button>
                    <span className="ml-auto text-xs text-ink-faint">
                      {done}/{thing.target} this week
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-sm text-ink-soft">
                  {mirror.goal ? `Your goal: ${mirror.goal}. ` : ""}
                  No small thing set. That's allowed — the mirror works without one.
                </p>
              )}

              {!thing && !editingThing && (
                <button
                  type="button"
                  onClick={() => setEditingThing(true)}
                  className="mt-3 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition active:scale-[0.97]"
                >
                  add one small thing
                </button>
              )}

              {editingThing && (
                <div className="mt-3 flex flex-col gap-2">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="go for a run"
                    maxLength={60}
                    className="w-full rounded-[0.75rem] border border-line bg-bg px-3 py-2 text-sm text-ink placeholder:text-ink-faint"
                    aria-label="One small thing you'd like to do more of"
                  />
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-ink-faint" htmlFor="thing-target">
                      times a week
                    </label>
                    <select
                      id="thing-target"
                      value={draftTarget}
                      onChange={(e) => setDraftTarget(Number(e.target.value))}
                      className="rounded-[0.75rem] border border-line bg-bg px-2 py-1.5 text-sm text-ink"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={saveThing}
                      className="ml-auto rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-ink transition active:scale-[0.97]"
                    >
                      save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingThing(false)}
                      className="text-xs text-ink-faint underline-offset-4 hover:underline"
                    >
                      cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {shelf.length > 0 && (
              <section className="mt-5" aria-label="Sundays past">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-faint">sundays past</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {shelf.map((w) => (
                    <li key={w.key} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="text-ink-soft">{w.label}</span>
                      <span className="text-ink-faint">
                        {w.recorded > 0 ? `${w.smoked} of ${w.recorded} nights` : "no taps"}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href="/fix"
                className="rounded-full border border-line px-4 py-2 text-sm text-ink transition active:scale-[0.97]"
              >
                ask Fix about this week
              </Link>
              {notificationsSupported() && (
                <button
                  type="button"
                  onClick={onNudge}
                  className="text-sm text-ink-soft underline-offset-4 hover:underline"
                >
                  {prefs.weekly ? "Sunday nudge is on" : "turn on the Sunday nudge"}
                </button>
              )}
              <button
                type="button"
                onClick={close}
                className="ml-auto text-sm text-ink-soft underline-offset-4 hover:underline"
              >
                close
              </button>
            </div>

            <p className="mt-4 text-xs leading-relaxed text-ink-faint">
              Saved on this device only. Nothing here leaves your phone unless you ask it to.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
