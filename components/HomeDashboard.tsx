"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import DailyVoiceNote from "@/components/DailyVoiceNote";
import WeeklyMirrorSheet from "@/components/WeeklyMirrorSheet";
import { MoodFace } from "@/components/MoodFace";
import {
  currentWeekDays,
  getDay,
  last14Days,
  saveToday,
  todayISO,
  type Answer,
  type DayShape,
  type Mood,
  type TriggerId,
} from "@/lib/checkins";
import { readWeeklyGoal, writeWeeklyGoal, type WeeklyGoal } from "@/lib/weekly-goal";

const TRIGGERS: Array<{ id: TriggerId; label: string }> = [
  { id: "after-work", label: "After work" },
  { id: "bored", label: "Bored" },
  { id: "friends", label: "With friends" },
  { id: "sleep", label: "Couldn’t sleep" },
  { id: "after-person", label: "After someone" },
  { id: "alone", label: "Alone" },
  { id: "other", label: "Something else" },
];

export default function HomeDashboard() {
  const [ready, setReady] = useState(false);
  const [gate, setGate] = useState<"age" | "consent" | "blocked" | null>(null);
  const [adultChecked, setAdultChecked] = useState(false);
  const [healthConsent, setHealthConsent] = useState(false);
  const [blockedUntil, setBlockedUntil] = useState(0);
  const [now, setNow] = useState(new Date());
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [triggers, setTriggers] = useState<TriggerId[]>([]);
  const [voiceText, setVoiceText] = useState("");
  const [goalDone, setGoalDone] = useState<boolean | undefined>(undefined);
  const [goal, setGoal] = useState<WeeklyGoal | null>(null);
  const [goalText, setGoalText] = useState("");
  const [goalTarget, setGoalTarget] = useState(2);
  const [goalEditorOpen, setGoalEditorOpen] = useState(false);
  const [days, setDays] = useState<DayShape[]>([]);
  const [days14, setDays14] = useState<DayShape[]>([]);
  const [saved, setSaved] = useState(false);
  const [mirrorOpen, setMirrorOpen] = useState(false);
  const [petName, setPetName] = useState("");
  const [goalPulse, setGoalPulse] = useState(false);

  useEffect(() => {
    const date = new Date();
    setNow(date);
    const storage = window.localStorage;
    const until = Number(storage.getItem("ff_block_until") || 0);
    setBlockedUntil(until);
    if (until > Date.now()) setGate("blocked");
    else if (storage.getItem("ff_adult") !== "yes") setGate("age");
    else if (!storage.getItem("ff_health_consent")) setGate("consent");
    else setGate(null);

    const existing = getDay(todayISO(date));
    if (existing) {
      setAnswer(existing.answer);
      setMood(existing.mood ?? null);
      setTriggers(existing.triggers ?? []);
      setVoiceText(existing.voiceText ?? "");
      setGoalDone(existing.goalDone);
      setSaved(true);
    }
    const currentGoal = readWeeklyGoal();
    setGoal(currentGoal);
    setGoalText(currentGoal?.text ?? "");
    setGoalTarget(currentGoal?.target ?? 2);
    setPetName((storage.getItem("ff_name") || "").trim().slice(0, 24));
    setDays(currentWeekDays(date));
    setDays14(last14Days(date));
    setReady(true);
  }, []);

  const dateLabel = useMemo(
    () => now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }),
    [now]
  );
  const completedThisWeek = days.filter((day) => day.goalDone === true).length;

  function changeAnswer(next: Answer) {
    setAnswer(next);
    if (next === "no") setTriggers([]);
    setSaved(false);
  }

  function toggleTrigger(id: TriggerId) {
    setTriggers((current) => {
      if (current.includes(id)) return current.filter((x) => x !== id);
      return current.length >= 3 ? current : [...current, id];
    });
    setSaved(false);
  }

  function chooseMood(next: Mood) {
    setMood(next);
    setSaved(false);
  }

  function save() {
    if (!answer || !mood) return;
    const previousCount = days.filter((day) => day.goalDone === true).length;
    saveToday({
      answer,
      mood,
      triggers: answer === "yes" ? triggers : [],
      voiceText: voiceText.trim() || undefined,
      goalDone,
    }, now);
    const fresh = currentWeekDays(now);
    setDays(fresh);
    setDays14(last14Days(now));
    setSaved(true);
    const nextCount = fresh.filter((day) => day.goalDone === true).length;
    if (goal && previousCount < goal.target && nextCount >= goal.target) {
      setGoalPulse(true);
      window.setTimeout(() => setGoalPulse(false), 650);
    }
  }

  function saveGoal() {
    const next = goalText.trim() ? { text: goalText.trim().slice(0, 120), target: goalTarget } : null;
    writeWeeklyGoal(next);
    setGoal(next);
    setGoalEditorOpen(false);
  }

  function confirmAdult() {
    if (!adultChecked) return;
    try {
      window.localStorage.setItem("ff_adult", "yes");
      window.localStorage.setItem("ff_adult_date", todayISO());
    } catch { /* no storage; the user can still continue this visit */ }
    setGate("consent");
  }

  function declineAdult() {
    const until = Date.now() + 24 * 60 * 60 * 1000;
    try {
      window.localStorage.setItem("ff_adult", "no");
      window.localStorage.setItem("ff_block_until", String(until));
    } catch { /* best effort block */ }
    setBlockedUntil(until);
    setGate("blocked");
  }

  function confirmHealthConsent() {
    if (!healthConsent) return;
    try { window.localStorage.setItem("ff_health_consent", new Date().toISOString()); } catch { /* best effort */ }
    setGate(null);
  }

  const closeMirror = useCallback(() => setMirrorOpen(false), []);

  if (!ready) return <AppShell showNav={false} wide><div className="min-h-40" aria-label="Loading" /></AppShell>;
  if (gate === "blocked") return <ConsentGate blocked until={blockedUntil} />;
  if (gate === "age") {
    return (
      <AppShell showNav={false} wide>
        <ConsentGateContent
          step="age"
          checked={adultChecked}
          onCheck={setAdultChecked}
          onContinue={confirmAdult}
          onDecline={declineAdult}
        />
      </AppShell>
    );
  }
  if (gate === "consent") {
    return (
      <AppShell showNav={false} wide>
        <ConsentGateContent
          step="consent"
          checked={healthConsent}
          onCheck={setHealthConsent}
          onContinue={confirmHealthConsent}
        />
      </AppShell>
    );
  }

  return (
    <AppShell showNav={false} wide>
      <section className="mx-auto flex w-full max-w-xl flex-col gap-5 pb-10">
        <header className="flex flex-col gap-1">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">Today · a few taps</p>
          <h1 className="text-[clamp(1.9rem,5.6vw,2.5rem)] leading-tight text-ink">{dateLabel}</h1>
          <p className="text-sm text-ink-soft">Three small taps. Skip anything you don’t want to answer.</p>
        </header>

        <section className="rounded-[1.25rem] border border-line bg-card p-5 sm:p-6" aria-labelledby="daily-log-title">
          <h2 id="daily-log-title" className="sr-only">Daily log</h2>
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">1 · Did you use cannabis today?</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <AnswerButton label="Yes" active={answer === "yes"} onClick={() => changeAnswer("yes")} />
            <AnswerButton label="No" active={answer === "no"} onClick={() => changeAnswer("no")} />
          </div>

          {answer ? (
            <div className="mt-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">2 · How did today feel?</p>
              <div className="mt-3 grid grid-cols-5 gap-1.5 sm:gap-2">
                {([1, 2, 3, 4, 5] as Mood[]).map((value) => (
                  <MoodFace key={value} mood={value} selected={mood === value} onClick={() => chooseMood(value)} />
                ))}
              </div>
            </div>
          ) : null}

          {answer === "yes" ? (
            <div className="mt-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">3 · What was around it? <span className="normal-case tracking-normal text-ink-faint">optional · pick up to 3</span></p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TRIGGERS.map((item) => {
                  const active = triggers.includes(item.id);
                  const disabled = !active && triggers.length >= 3;
                  return (
                    <button key={item.id} type="button" aria-pressed={active} disabled={disabled} onClick={() => toggleTrigger(item.id)} className={`min-h-10 rounded-full border px-3.5 py-2 text-sm transition-colors disabled:opacity-45 ${active ? "border-accent bg-accent text-accent-ink" : "border-line bg-bg text-ink hover:border-ink-soft"}`}>
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {goal ? (
            <div className={`mt-5 rounded-xl border border-line bg-bg/50 p-4 ${goalPulse ? "ff-goal-pulse" : ""}`}>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">Your thing this week</p>
              <p className="mt-1 text-sm text-ink">{goal.text} · {completedThisWeek} of {goal.target}</p>
              <p className="mt-3 text-sm text-ink-soft">Did you do it today? <span className="text-ink-faint">optional</span></p>
              <div className="mt-2 flex gap-2">
                <ChoiceButton label="Yes" selected={goalDone === true} onClick={() => { setGoalDone(true); setSaved(false); }} />
                <ChoiceButton label="Not today" selected={goalDone === false} onClick={() => { setGoalDone(false); setSaved(false); }} />
                <ChoiceButton label="Skip" selected={goalDone === undefined} onClick={() => { setGoalDone(undefined); setSaved(false); }} />
              </div>
            </div>
          ) : null}

          {answer && mood ? (
            <div className="mt-5">
              <DailyVoiceNote value={voiceText} onChange={(value) => { setVoiceText(value); setSaved(false); }} />
            </div>
          ) : null}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={save} disabled={!answer || !mood} className="min-h-12 w-full rounded-full bg-accent px-6 py-3 text-base font-medium text-accent-ink transition-colors disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto">
              {saved ? "Update today’s log" : "Save"}
            </button>
            {saved ? <p role="status" className="text-sm text-ink-soft">Saved. Your week is taking shape.</p> : null}
          </div>
          <p className="mt-4 text-[11px] leading-relaxed text-ink-faint">Saved in this browser on this device. No streaks. A blank day stays blank.</p>
        </section>

        {!goal ? (
          <section className="rounded-[1.25rem] border border-line bg-card p-5">
            {!goalEditorOpen ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">One small thing you want to do more this week?</p>
                  <p className="mt-1 text-xs text-ink-faint">Optional. Your words, your pace.</p>
                </div>
                <button type="button" onClick={() => setGoalEditorOpen(true)} className="min-h-10 rounded-full border border-line px-4 text-sm text-ink">Set a goal</button>
              </div>
            ) : <GoalEditor text={goalText} target={goalTarget} onText={setGoalText} onTarget={setGoalTarget} onSave={saveGoal} onCancel={() => setGoalEditorOpen(false)} />}
          </section>
        ) : (
          <section className="flex items-center justify-between gap-3 text-xs text-ink-faint">
            <span>Your goal is optional and lives in this browser.</span>
            <button type="button" onClick={() => setGoalEditorOpen((value) => !value)} className="underline underline-offset-4 hover:text-ink">Change goal</button>
            {goalEditorOpen ? <GoalEditor text={goalText} target={goalTarget} onText={setGoalText} onTarget={setGoalTarget} onSave={saveGoal} onCancel={() => setGoalEditorOpen(false)} onClear={() => { writeWeeklyGoal(null); setGoal(null); setGoalText(""); setGoalEditorOpen(false); }} /> : null}
          </section>
        )}

        <section className="rounded-[1.25rem] border border-line bg-card p-5" aria-labelledby="two-week-title">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">Your last 14 days</p>
              <h2 id="two-week-title" className="mt-1 text-lg text-ink" style={{ fontFamily: "var(--font-display)" }}>A row of dots. Nothing resets.</h2>
            </div>
            <button type="button" onClick={() => setMirrorOpen(true)} className="min-h-10 rounded-full border border-line px-4 text-sm text-ink hover:border-ink-soft">This week</button>
          </div>
          <ol className="mt-5 grid grid-cols-7 gap-x-2 gap-y-3 sm:grid-cols-14" aria-label="Last fourteen days of check-ins">
            {days14.map((day) => (
              <li key={day.day} className="flex flex-col items-center gap-1" title={`${day.day}: ${day.answer === "yes" ? "use logged" : day.answer === "no" ? "no use logged" : "no check-in"}`}>
                <span className={`h-5 w-5 rounded-full border ${day.answer === "yes" ? "border-accent bg-accent/20" : day.answer === "no" ? "border-accent/50 bg-accent" : "border-line bg-transparent"}`} aria-hidden="true" />
                <span className="text-[9px] text-ink-faint">{new Date(`${day.day}T12:00:00`).getDate()}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs leading-relaxed text-ink-faint">Use logged · no use logged · no check-in</p>
            <Link href="/patterns" className="text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline">Past weeks →</Link>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/fix" className="min-h-11 rounded-full border border-line px-5 py-3 text-sm text-ink hover:border-ink-soft">I need Fix now</Link>
          <Link href="/journal" className="min-h-11 px-4 py-3 text-sm text-ink-soft underline-offset-4 hover:text-ink hover:underline">Open journal</Link>
        </div>
        <p className="text-center text-[11px] leading-relaxed text-ink-faint">Fix is a tool, not healthcare. Get human help any time from the button at the top.</p>
      </section>

      <WeeklyMirrorSheet open={mirrorOpen} onClose={closeMirror} days={days} goal={goal} petName={petName} />
    </AppShell>
  );
}

function AnswerButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" aria-pressed={active} onClick={onClick} className={`min-h-14 rounded-2xl border px-5 py-3 text-lg font-medium transition-colors ${active ? "border-accent bg-accent text-accent-ink" : "border-line bg-bg text-ink hover:border-ink-soft"}`}>{label}</button>;
}

function ChoiceButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return <button type="button" aria-pressed={selected} onClick={onClick} className={`min-h-9 rounded-full border px-3 text-xs transition-colors ${selected ? "border-accent bg-accent text-accent-ink" : "border-line bg-bg text-ink-soft hover:text-ink"}`}>{label}</button>;
}

function GoalEditor({
  text, target, onText, onTarget, onSave, onCancel, onClear,
}: {
  text: string; target: number; onText: (value: string) => void; onTarget: (value: number) => void;
  onSave: () => void; onCancel: () => void; onClear?: () => void;
}) {
  return (
    <div className="w-full rounded-2xl border border-line bg-card p-4">
      <label htmlFor="weekly-goal" className="text-sm font-medium text-ink">What’s one small thing you’d like to do more this week?</label>
      <p className="mt-1 text-xs text-ink-faint">A run, a proper dinner, a chapter, calling someone back. Not a promise.</p>
      <input id="weekly-goal" value={text} onChange={(event) => onText(event.target.value.slice(0, 120))} maxLength={120} placeholder="e.g. go for a run" className="mt-3 min-h-11 w-full rounded-xl border border-line bg-bg px-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none" />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label htmlFor="goal-target" className="text-xs text-ink-soft">How many times this week?</label>
        <select id="goal-target" value={target} onChange={(event) => onTarget(Number(event.target.value))} className="min-h-9 rounded-lg border border-line bg-bg px-2 text-sm text-ink">
          {[1, 2, 3, 4, 5, 6, 7].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={!text.trim()} onClick={onSave} className="min-h-10 rounded-full bg-accent px-4 text-sm font-medium text-accent-ink disabled:opacity-40">Save goal</button>
        <button type="button" onClick={onCancel} className="min-h-10 rounded-full border border-line px-4 text-sm text-ink-soft">Cancel</button>
        {onClear ? <button type="button" onClick={onClear} className="min-h-10 px-3 text-sm text-ink-faint underline">Clear</button> : null}
      </div>
    </div>
  );
}

function ConsentGate({ blocked, until }: { blocked: boolean; until: number }) {
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
  useEffect(() => {
    if (!blocked) return;
    const interval = window.setInterval(() => setSecondsLeft(Math.max(0, Math.ceil((until - Date.now()) / 1000))), 1000);
    return () => window.clearInterval(interval);
  }, [blocked, until]);
  return (
    <AppShell showNav={false}>
      <section className="mx-auto max-w-lg rounded-[1.25rem] border border-line bg-card p-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">Fix · 18+</p>
        <h1 className="mt-3 text-2xl text-ink">This app is for adults.</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">If you need help now, the Get help button remains available without using the app.</p>
        <Link href="/help" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-frost/60 px-4 text-sm text-frost">Get help now</Link>
        {secondsLeft > 0 ? <p className="mt-5 text-xs text-ink-faint">This device can try again after the 24-hour waiting period.</p> : null}
      </section>
    </AppShell>
  );
}

function ConsentGateContent({
  step, checked, onCheck, onContinue, onDecline,
}: {
  step: "age" | "consent"; checked: boolean; onCheck: (value: boolean) => void; onContinue: () => void; onDecline?: () => void;
}) {
  return (
    <section className="mx-auto max-w-lg rounded-[1.25rem] border border-line bg-card p-6">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-soft">Fix · private pattern mirror · 18+</p>
      {step === "age" ? (
        <>
          <h1 className="mt-3 text-2xl text-ink">Before you begin</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">Fix is designed for adults aged 18 or over. It is a personal reflection tool, not medical care or a crisis service.</p>
          <label className="mt-5 flex items-start gap-3 rounded-xl border border-line p-4 text-sm leading-relaxed text-ink">
            <input type="checkbox" checked={checked} onChange={(event) => onCheck(event.target.checked)} className="mt-1 accent-[var(--color-accent)]" />
            I confirm I’m 18 or older.
          </label>
          <button type="button" disabled={!checked} onClick={onContinue} className="mt-4 min-h-12 w-full rounded-full bg-accent px-5 text-sm font-medium text-accent-ink disabled:opacity-45">Continue</button>
          <button type="button" onClick={onDecline} className="mt-3 min-h-10 w-full text-sm text-ink-faint underline underline-offset-4">I’m under 18</button>
        </>
      ) : (
        <>
          <h1 className="mt-3 text-2xl text-ink">Your log stays here</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">Your check-ins, mood, triggers, goal and any transcript are stored in this browser on this device. They are not sent to Fix. If you choose the separate Fix chat, only what you type there is sent to its AI provider. Clearing site data can erase your local log.</p>
          <label className="mt-5 flex items-start gap-3 rounded-xl border border-line p-4 text-sm leading-relaxed text-ink">
            <input type="checkbox" checked={checked} onChange={(event) => onCheck(event.target.checked)} className="mt-1 accent-[var(--color-accent)]" />
            I consent to storing these sensitive check-ins locally so Fix can show my private weekly mirror. I can delete them in Settings.
          </label>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">Voice recognition is optional and handled by your browser. See the <Link href="/privacy" className="underline">Privacy Policy</Link> for details.</p>
          <button type="button" disabled={!checked} onClick={onContinue} className="mt-4 min-h-12 w-full rounded-full bg-accent px-5 text-sm font-medium text-accent-ink disabled:opacity-45">Agree and continue</button>
          <Link href="/" className="mt-3 inline-flex min-h-10 w-full items-center justify-center text-sm text-ink-faint underline underline-offset-4">Not now</Link>
        </>
      )}
    </section>
  );
}
