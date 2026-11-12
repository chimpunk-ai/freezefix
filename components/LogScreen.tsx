"use client";

import { useEffect, useRef, useState } from "react";
import { MoodFace } from "@/components/MoodFace";
import {
  MAX_TRIGGERS,
  MOODS,
  MOOD_LABEL,
  TRIGGER_LABEL,
  addDays,
  orderedTriggers,
  prettyDay,
  saveEntry,
  todayISO,
  type Entries,
  type Mood,
  type TriggerId,
} from "@/lib/entry";
import type { Profile } from "@/lib/profile";

// The log. The whole app for the two minutes it is used.
//
// Three taps: yes or no, one face, up to three chips. A voice note if they feel
// like it, a tick for their own goal if they feel like that. Save, and the app
// says one line and gets out of the way. No streak, no count, no praise.

// A scripted state for the landing-page demo. When `demo` is set the screen
// mirrors it instead of storage: nothing is saved, no microphone is opened.
// The markup is the real log, so the demo can't drift from the product.
export type LogDemoState = {
  smoked: boolean | null;
  mood: Mood | null;
  triggers: TriggerId[];
  goalDone?: boolean;
  saved: boolean;
};

export default function LogScreen({
  profile,
  entries,
  onSaved,
  onOpenFix,
  onOpenMirror,
  mirrorReady,
  demo,
}: {
  profile: Profile;
  entries: Entries;
  onSaved: (entries: Entries) => void;
  onOpenFix: () => void;
  onOpenMirror: () => void;
  mirrorReady: boolean;
  demo?: LogDemoState;
}) {
  const today = todayISO();
  const existing = entries[today];

  // Trigger chips are shown in the order the user chose during onboarding,
  // then the rest. Every trigger is still present; this list controls order,
  // not availability — so a user whose life changed can still tap one of the
  // ones they didn't pick, just without having to scan the row twice.
  const triggerOrder = orderedTriggers(profile.preferredTriggers);

  const [smoked, setSmoked] = useState<boolean | null>(demo ? demo.smoked : existing ? existing.smoked : null);
  const [mood, setMood] = useState<Mood | null>(demo ? demo.mood : existing ? existing.mood : null);
  const [triggers, setTriggers] = useState<TriggerId[]>(demo ? demo.triggers : existing ? existing.triggers : []);
  const [note, setNote] = useState(existing?.note ?? "");
  const [goalDone, setGoalDone] = useState<boolean | undefined>(demo ? demo.goalDone : existing?.goalDone);
  const [saved, setSaved] = useState(demo ? demo.saved : Boolean(existing));

  // Demo mode: follow the script whenever it moves on.
  useEffect(() => {
    if (!demo) return;
    setSmoked(demo.smoked);
    setMood(demo.mood);
    setTriggers(demo.triggers);
    setGoalDone(demo.goalDone);
    setSaved(demo.saved);
  }, [demo]);

  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [voiceMsg, setVoiceMsg] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);

  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedRef = useRef(0);
  const tickRef = useRef<number | null>(null);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const stopRec = () => {
    if (tickRef.current !== null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
    const rec = recRef.current;
    recRef.current = null;
    if (rec && rec.state !== "inactive") rec.stop();
  };

  useEffect(() => {
    return () => {
      if (tickRef.current !== null) window.clearInterval(tickRef.current);
      const rec = recRef.current;
      if (rec && rec.state !== "inactive") rec.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function upload(blob: Blob, secs: number) {
    try {
      const fd = new FormData();
      fd.append("audio", blob, "voice.webm");
      fd.append("seconds", String(secs));
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      if (res.ok && data.text) {
        setNote(data.text);
        setVoiceMsg(null);
        return;
      }
      if (data.error === "voice_off") setVoiceMsg("voice notes aren't switched on yet. type instead.");
      else if (data.error === "voice_limit") setVoiceMsg("that's today's voice notes. type instead.");
      else setVoiceMsg("that didn't come through. type instead.");
      setTyping(true);
    } catch {
      setVoiceMsg("that didn't come through. type instead.");
      setTyping(true);
    }
  }

  async function startRec() {
    if (recording || demo) return;
    setVoiceMsg(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setVoiceMsg("this phone won't record here. type instead.");
      setTyping(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const rec = new MediaRecorder(stream);
      recRef.current = rec;
      chunksRef.current = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const secs = Math.max(1, Math.min(10, Math.round((Date.now() - startedRef.current) / 1000)));
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        stopStream();
        setRecording(false);
        setSeconds(0);
        if (blob.size > 0) void upload(blob, secs);
      };
      startedRef.current = Date.now();
      rec.start();
      setRecording(true);
      setSeconds(0);
      tickRef.current = window.setInterval(() => {
        const s = Math.round((Date.now() - startedRef.current) / 1000);
        setSeconds(s);
        if (s >= 10) stopRec();
      }, 200);
    } catch {
      setVoiceMsg("no microphone. you can type instead.");
      setTyping(true);
    }
  }

  function toggleTrigger(t: TriggerId) {
    setTriggers((cur) => {
      if (cur.includes(t)) return cur.filter((x) => x !== t);
      if (cur.length >= MAX_TRIGGERS) return cur;
      return [...cur, t];
    });
  }

  function onSave() {
    if (smoked === null || mood === null) return;
    if (demo) {
      setSaved(true);
      return;
    }
    const next = saveEntry({
      smoked,
      mood,
      triggers: smoked ? triggers : [],
      note: note.trim() ? note.trim() : undefined,
      goalDone,
    });
    setSaved(true);
    onSaved(next);
  }

  const dots = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));

  return (
    <div className="mx-auto w-full max-w-[560px] px-5 pb-16 pt-2">
      <p className="text-12 uppercase tracking-[0.14em] text-ink-faint">
        today · {prettyDay(today)}
      </p>

      {saved ? (
        <div className="mt-6">
          <h1 className="font-display text-28 text-ink">saved. see you sunday.</h1>
          <p className="mt-2 text-14 text-ink-faint">
            {smoked ? "logged as a night you smoked." : "logged as a night you didn't."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setSaved(false)}
              className="ff-chip rounded-pill border border-line px-4 py-2 text-14 text-ink-soft hover:border-accent/40"
            >
              change it
            </button>
            {mirrorReady ? (
              <button
                type="button"
                onClick={onOpenMirror}
                className="ff-chip rounded-pill border border-accent/40 bg-accent/10 px-4 py-2 text-14 font-medium text-accent hover:bg-accent/15"
              >
                your week is ready
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <>
          <h1 className="mt-2 font-display text-28 text-ink">did you smoke today?</h1>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSmoked(true)}
              aria-pressed={smoked === true}
              className={[
                "ff-chip col-span-2 flex h-24 items-center justify-center rounded-card border text-20 font-medium",
                smoked === true
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-line bg-card text-ink hover:border-accent/40",
              ].join(" ")}
            >
              yes
            </button>
            <button
              type="button"
              onClick={() => setSmoked(false)}
              aria-pressed={smoked === false}
              className={[
                "ff-chip flex h-24 items-center justify-center rounded-card border text-16",
                smoked === false
                  ? "border-accent/60 bg-accent/10 text-ink"
                  : "border-line bg-card text-ink-soft hover:border-accent/30",
              ].join(" ")}
            >
              no
            </button>
          </div>

          {smoked !== null ? (
            <section className="ff-rise mt-8">
              <p className="text-14 text-ink-soft">how was the day?</p>
              <div className="mt-3 flex items-start justify-between gap-1">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    aria-label={MOOD_LABEL[m]}
                    aria-pressed={mood === m}
                    className={[
                      "ff-chip flex flex-1 flex-col items-center gap-1.5 rounded-card border py-3",
                      mood === m
                        ? "border-accent/50 bg-accent/10 text-accent"
                        : "border-transparent text-ink-faint hover:border-line hover:text-ink-soft",
                    ].join(" ")}
                  >
                    <MoodFace mood={m} size={30} filled={mood === m} />
                    <span className="text-12">{MOOD_LABEL[m]}</span>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {smoked === true ? (
            <section className="ff-rise mt-8">
              <p className="text-14 text-ink-soft">what was around it?</p>
              <p className="mt-1 text-12 text-ink-faint">up to three. skip it if nothing fits.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {triggerOrder.map((t) => {
                  const on = triggers.includes(t);
                  const full = !on && triggers.length >= MAX_TRIGGERS;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTrigger(t)}
                      disabled={full}
                      aria-pressed={on}
                      className={[
                        "ff-chip rounded-pill border px-3.5 py-2 text-14",
                        on
                          ? "border-accent/50 bg-accent/15 text-accent"
                          : full
                            ? "border-line/60 text-ink-faint opacity-50"
                            : "border-line bg-card text-ink-soft hover:border-accent/30",
                      ].join(" ")}
                    >
                      {TRIGGER_LABEL[t]}
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          {profile.goal ? (
            <section className="ff-rise mt-8">
              <p className="text-14 text-ink-soft">
                did you get to &ldquo;{profile.goal.text}&rdquo; today?
              </p>
              <div className="mt-3 flex gap-2">
                {[
                  { v: true, label: "yes" },
                  { v: false, label: "no" },
                ].map((o) => (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => setGoalDone(o.v)}
                    aria-pressed={goalDone === o.v}
                    className={[
                      "ff-chip rounded-pill border px-4 py-2 text-14",
                      goalDone === o.v
                        ? "border-accent/50 bg-accent/15 text-accent"
                        : "border-line bg-card text-ink-soft hover:border-accent/30",
                    ].join(" ")}
                  >
                    {o.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setGoalDone(undefined)}
                  className="ff-chip rounded-pill px-3 py-2 text-14 text-ink-faint hover:text-ink-soft"
                >
                  skip
                </button>
              </div>
            </section>
          ) : null}

          <section className="mt-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onPointerDown={() => void startRec()}
                onPointerUp={stopRec}
                onPointerLeave={stopRec}
                onPointerCancel={stopRec}
                aria-label="hold to talk, up to ten seconds"
                className={[
                  "ff-chip flex h-14 w-14 shrink-0 items-center justify-center rounded-full border",
                  recording
                    ? "breathe border-accent bg-accent/20 text-accent"
                    : "border-line bg-card text-ink-soft hover:border-accent/40",
                ].join(" ")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <div className="min-w-0 flex-1">
                <p className="text-14 text-ink-soft">
                  {recording ? `listening · 0:${String(seconds).padStart(2, "0")}` : "hold to say something"}
                </p>
                <p className="mt-0.5 text-12 text-ink-faint">
                  {note ? "words kept, audio thrown away" : "ten seconds, if you want. it isn't required."}
                </p>
              </div>
            </div>

            {note ? (
              <p className="mt-3 rounded-card border border-line bg-card px-4 py-3 text-14 text-ink-soft">
                {note}
              </p>
            ) : null}

            {voiceMsg ? <p className="mt-3 text-12 text-frost">{voiceMsg}</p> : null}

            {typing ? (
              <input
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                placeholder="a few words"
                className="mt-3 w-full rounded-card border border-line bg-card px-4 py-3 text-14 text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setTyping(true)}
                className="mt-3 text-12 text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft"
              >
                type instead
              </button>
            )}
          </section>

          <button
            type="button"
            onClick={onSave}
            disabled={smoked === null || mood === null}
            className={[
              "mt-8 w-full rounded-pill px-6 py-4 text-16 font-medium",
              smoked !== null && mood !== null
                ? "bg-accent text-bg hover:opacity-90"
                : "border border-line bg-card text-ink-faint",
            ].join(" ")}
          >
            save
          </button>
          <p className="mt-3 text-center text-12 text-ink-faint">three taps is enough.</p>
        </>
      )}

      <section className="mt-10">
        <p className="text-12 uppercase tracking-[0.14em] text-ink-faint">the last fourteen days</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {dots.map((d) => {
            const e = entries[d];
            return (
              <span
                key={d}
                title={prettyDay(d)}
                className={[
                  "h-5 w-5 rounded-full border",
                  !e
                    ? "border-line/60 bg-chip/40"
                    : e.smoked
                      ? "border-accent bg-accent/70"
                      : "border-accent/60 bg-transparent",
                ].join(" ")}
              />
            );
          })}
        </div>
        <p className="mt-3 text-12 text-ink-faint">a filled dot is a night you smoked. an open one isn&rsquo;t.</p>
      </section>

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-line/60 pt-5">
        <button type="button" onClick={onOpenFix} className="text-14 text-ink-faint hover:text-ink-soft">
          i need fix now
        </button>
        <button type="button" onClick={onOpenMirror} className="text-14 text-ink-faint hover:text-ink-soft">
          the weeks
        </button>
      </div>
    </div>
  );
}
