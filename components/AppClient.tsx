"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { HelpChip, Wordmark } from "@/components/Brand";
import FixSheet from "@/components/FixSheet";
import LogScreen from "@/components/LogScreen";
import Onboarding from "@/components/Onboarding";
import { PatternCard } from "@/components/PatternCard";
import { detectRegion } from "@/lib/country";
import { clearEntries, readEntries, todayISO, type Entries } from "@/lib/entry";
import { dueMirror, latestMirror, markSeen } from "@/lib/mirror";
import { recentWeeks, type WeekStats } from "@/lib/pattern";
import { BEDTIMES, GOAL_EXAMPLES, bedtimeLabel, clearProfile, patchProfile, readProfile, type Profile } from "@/lib/profile";
import { trialState } from "@/lib/trial";

// The app shell. No navigation tree, no home screen, no feed: the log is the
// home, the mirror slides up when it's Sunday, and Fix sits behind one button.
//
// Everything the user writes stays on this device. The only server calls are the
// voice transcript, Fix, and the trial/payment record.

export type View = "log" | "weeks" | "settings";

export default function AppClient({ view = "log" }: { view?: View }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<Entries>({});
  const [paid, setPaid] = useState(false);
  const [fixOpen, setFixOpen] = useState(false);
  const [sheet, setSheet] = useState<WeekStats | null>(null);
  const [region, setRegion] = useState("");

  useEffect(() => {
    setProfile(readProfile());
    setEntries(readEntries());
    setRegion(detectRegion());
    setReady(true);
    fetch("/api/paywall")
      .then((r) => r.json())
      .then((d: { active?: boolean }) => setPaid(Boolean(d.active)))
      .catch(() => setPaid(false));
  }, []);

  // The Sunday card arrives on its own. It does not appear twice.
  useEffect(() => {
    if (!ready || !profile?.onboarded || view !== "log") return;
    const due = dueMirror(entries, profile.goal);
    if (due) setSheet(due);
  }, [ready, profile, entries, view]);

  const closeSheet = useCallback(() => {
    if (sheet) markSeen(sheet.end);
    setSheet(null);
  }, [sheet]);

  const openFix = useCallback(() => setFixOpen(true), []);

  if (!ready || !profile) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-[560px] items-center justify-center px-5">
        <span className="breathe h-3 w-3 rounded-full bg-accent/50" aria-label="loading" />
      </main>
    );
  }

  const trial = trialState(profile);
  const locked = Boolean(profile.onboarded && trial.ended && !paid);
  const stats = latestMirror(entries, profile.goal);

  return (
    <main className="min-h-dvh">
      <header className="mx-auto flex w-full max-w-[560px] items-center justify-between px-5 pb-4 pt-5">
        <Wordmark href={profile?.onboarded ? "/app" : "/"} />
        <div className="flex items-center gap-3">
          <HelpChip compact />
          {profile?.onboarded ? (
            <Link
              href="/app/settings"
              className="text-12 text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft"
            >
              you
            </Link>
          ) : null}
        </div>
      </header>

      {!profile?.onboarded ? (
        <Onboarding
          onDone={(p) => {
            setProfile(p);
            setEntries(readEntries());
          }}
        />
      ) : locked ? (
        <section className="mx-auto w-full max-w-[560px] px-5 py-10">
          <h1 className="font-display text-28 text-ink">the free week is done.</h1>
          <p className="mt-3 text-16 text-ink-soft">
            your log is still here, on this phone, and it isn&rsquo;t going anywhere. the mirror opens
            again when you&rsquo;re ready to keep going.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/plans" className="rounded-pill bg-accent px-5 py-3 text-16 font-medium text-bg no-underline">
              see what it costs
            </Link>
            <Link
              href="/app/settings"
              className="rounded-pill border border-line px-5 py-3 text-16 text-ink-soft no-underline"
            >
              your data
            </Link>
          </div>
          <p className="mt-6 text-12 text-ink-faint">
            the help page stays free, always. no account, no payment, no gate.
          </p>
        </section>
      ) : view === "weeks" ? (
        <WeeksView
          weeks={recentWeeks(entries, profile.goal, 12)}
          name={profile.name}
          onAsk={openFix}
        />
      ) : view === "settings" ? (
        <SettingsView
          profile={profile}
          entries={entries}
          daysLeft={trial?.daysLeft ?? 0}
          ended={Boolean(trial?.ended)}
          paid={paid}
          onChange={(p) => setProfile(p)}
        />
      ) : (
        <>
          <LogScreen
            profile={profile}
            entries={entries}
            onSaved={(next) => setEntries(next)}
            onOpenFix={openFix}
            onOpenMirror={() => {
              const due = dueMirror(entries, profile.goal);
              setSheet(due ?? stats);
            }}
            mirrorReady={Boolean(dueMirror(entries, profile.goal))}
          />
          <nav className="mx-auto flex w-full max-w-[560px] items-center justify-center gap-6 px-5 pb-10 text-12">
            <Link href="/app/weeks" className="text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft">
              the shelf
            </Link>
            <Link href="/plans" className="text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft">
              what it costs
            </Link>
            <span className="text-ink-faint">
              {paid ? "subscribed" : trial?.daysLeft ? `${trial.daysLeft} free days left` : "free week"}
            </span>
          </nav>
        </>
      )}

      {sheet ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60" role="dialog" aria-modal="true" aria-label="your week">
          <button type="button" aria-label="close" onClick={closeSheet} className="absolute inset-0 cursor-default" />
          <div className="ff-sheet relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-t-sheet border border-line bg-bg p-3">
            <PatternCard name={profile.name} stats={sheet} onAsk={() => { closeSheet(); openFix(); }} onClose={closeSheet} />
          </div>
        </div>
      ) : null}

      {stats ? (
        <FixSheet
          open={fixOpen}
          onClose={() => setFixOpen(false)}
          name={profile.name}
          stats={stats}
          entries={entries}
          goal={profile.goal}
          region={region}
          onPaywall={() => setFixOpen(false)}
        />
      ) : null}
    </main>
  );
}

function WeeksView({ weeks, name, onAsk }: { weeks: WeekStats[]; name: string; onAsk: () => void }) {
  return (
    <section className="mx-auto w-full max-w-[560px] px-5 pb-16">
      <p className="text-12 uppercase tracking-[0.14em] text-ink-faint">the shelf</p>
      <h1 className="mt-2 font-display text-28 text-ink">your weeks</h1>
      <p className="mt-2 text-14 text-ink-faint">newest first. quiet, not a feed.</p>

      {weeks.length === 0 ? (
        <p className="mt-8 rounded-card border border-line bg-card px-4 py-5 text-14 text-ink-soft">
          nothing here yet. log a few nights and the first week will land on sunday.
        </p>
      ) : (
        <div className="mt-6 space-y-4">
          {weeks.map((w) => (
            <PatternCard key={w.end} name={name} stats={w} onAsk={onAsk} dimmed />
          ))}
        </div>
      )}

      <Link href="/app" className="mt-8 inline-block text-14 text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft">
        back to tonight
      </Link>
    </section>
  );
}

function SettingsView({
  profile,
  entries,
  daysLeft,
  ended,
  paid,
  onChange,
}: {
  profile: Profile;
  entries: Entries;
  daysLeft: number;
  ended: boolean;
  paid: boolean;
  onChange: (p: Profile) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [bedtime, setBedtime] = useState(profile.bedtime);
  const [goalText, setGoalText] = useState(profile.goal?.text ?? "");
  const [target, setTarget] = useState(profile.goal?.target ?? 2);
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const logged = Object.keys(entries).length;

  function save() {
    const p = patchProfile({
      name: name.trim().slice(0, 24),
      bedtime,
      goal: goalText.trim()
        ? { text: goalText.trim().slice(0, 80), target, madeAt: profile.goal?.madeAt ?? todayISO() }
        : null,
    });
    onChange(p);
    setSaved(true);
  }

  function forget() {
    clearEntries();
    clearProfile();
    window.location.href = "/";
  }

  return (
    <section className="mx-auto w-full max-w-[560px] px-5 pb-16">
      <p className="text-12 uppercase tracking-[0.14em] text-ink-faint">you</p>
      <h1 className="mt-2 font-display text-28 text-ink">the small stuff</h1>

      <div className="mt-6 space-y-6">
        <label className="block">
          <span className="text-14 text-ink-soft">the name the mirror uses</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 24))}
            className="mt-2 w-full rounded-card border border-line bg-card px-4 py-3 font-display text-20 text-ink focus:border-accent/50 focus:outline-none"
          />
        </label>

        <div>
          <p className="text-14 text-ink-soft">the one ping</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BEDTIMES.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setBedtime(h)}
                aria-pressed={bedtime === h}
                className={[
                  "ff-chip rounded-pill border px-3.5 py-2 text-14",
                  bedtime === h ? "border-accent/50 bg-accent/15 text-accent" : "border-line bg-card text-ink-soft",
                ].join(" ")}
              >
                {bedtimeLabel(h)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-14 text-ink-soft">your thing</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GOAL_EXAMPLES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoalText(g)}
                aria-pressed={goalText === g}
                className={[
                  "ff-chip rounded-pill border px-3 py-1.5 text-12",
                  goalText === g ? "border-accent/50 bg-accent/15 text-accent" : "border-line bg-card text-ink-soft",
                ].join(" ")}
              >
                {g}
              </button>
            ))}
          </div>
          <input
            value={goalText}
            onChange={(e) => setGoalText(e.target.value.slice(0, 80))}
            placeholder="in your words"
            className="mt-2 w-full rounded-card border border-line bg-card px-4 py-3 text-14 text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTarget(n)}
                aria-pressed={target === n}
                className={[
                  "ff-chip h-9 w-9 rounded-full border text-14",
                  target === n ? "border-accent/50 bg-accent/15 text-accent" : "border-line bg-card text-ink-soft",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
            <span className="self-center text-12 text-ink-faint">times a week</span>
          </div>
        </div>

        <button type="button" onClick={save} className="w-full rounded-pill bg-accent px-6 py-3 text-16 font-medium text-bg">
          save
        </button>
        {saved ? <p className="text-center text-12 text-ink-faint">saved.</p> : null}
      </div>

      <div className="mt-10 rounded-card border border-line bg-card px-4 py-4">
        <p className="text-14 text-ink">
          {paid ? "subscribed" : ended ? "the free week is over" : `${daysLeft} of 7 free days left`}
        </p>
        <p className="mt-1 text-12 text-ink-faint">
          {logged} {logged === 1 ? "night" : "nights"} logged on this phone. nothing here has an email
          attached, and there is nothing on our side to look up.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-12">
          <Link href="/plans" className="text-accent underline decoration-accent/40 underline-offset-4">
            what it costs
          </Link>
          <Link href="/privacy" className="text-ink-faint underline decoration-line underline-offset-4">
            privacy
          </Link>
          <Link href="/help" className="text-frost underline decoration-frost/40 underline-offset-4">
            get help now
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {confirming ? (
          <div className="rounded-card border border-frost/30 bg-frost/[0.06] px-4 py-4">
            <p className="text-14 text-ink">forget everything on this phone?</p>
            <p className="mt-1 text-12 text-ink-faint">
              every night, every note, your name and your thing. there is no copy anywhere else.
            </p>
            <div className="mt-3 flex gap-3">
              <button type="button" onClick={forget} className="rounded-pill border border-frost/40 px-4 py-2 text-14 text-frost">
                forget it
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-pill border border-line px-4 py-2 text-14 text-ink-soft"
              >
                keep it
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-14 text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft"
          >
            forget everything
          </button>
        )}
      </div>
    </section>
  );
}
