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
import { MODEL_SIZE_LABEL, VoiceError, cancel as cancelModel, isSupported as voiceSupported, languageName, preload, transcribe } from "@/lib/transcribe";

// The log. The whole app for the two minutes it is used.
//
// Three taps: yes or no, one face, up to three chips. A voice note if they feel
// like it, a tick for their own goal if they feel like that. Save, and the app
// says one line and gets out of the way. No streak, no count, no praise.
//
// Voice notes never leave the phone: recorded here, turned into text here by a
// small speech model (lib/transcribe.ts), audio dropped. The flow asks before
// it touches the microphone, shows the one-time model download with a cancel,
// and always shows the words for review before they go anywhere near the log.

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

  // Voice. One state machine, so every branch has a line of copy and a way out.
  //   idle → explain (first tap: what happens, ok / not now)
  //   ready → recording → transcribing → review (use it / discard)
  //   any → trouble (a calm message and "type instead")
  type VoicePhase = "idle" | "explain" | "ready" | "recording" | "transcribing" | "review" | "trouble";
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [seconds, setSeconds] = useState(0);
  const [download, setDownload] = useState<number | null>(null); // percent while the model loads
  const [voiceMsg, setVoiceMsg] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [heard, setHeard] = useState<string | undefined>(undefined);
  const [typing, setTyping] = useState(false);
  const recording = phase === "recording";

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

  function trouble(msg: string) {
    setVoiceMsg(msg);
    setPhase("trouble");
    setTyping(true);
  }

  function explainVoiceError(err: unknown): string {
    const kind = err instanceof VoiceError ? err.kind : "decode-failed";
    switch (kind) {
      case "unsupported":
        return "this browser can't do voice on the phone itself, and fix won't send audio anywhere. type instead.";
      case "permission-denied":
        return "the microphone is blocked for this site. that's fine — type instead. (you can allow it in your browser settings if you change your mind.)";
      case "model-download-failed":
        return "couldn't fetch the speech model — maybe no connection right now. try later, or type.";
      case "too-short":
        return "that was too quick to catch. hold a little longer, or type.";
      case "cancelled":
        return "ok, no download. you can type instead.";
      default:
        return "didn't catch that — try again or type.";
    }
  }

  // Start the one-time model download in the background after "ok".
  function agreeToVoice() {
    setVoiceMsg(null);
    setPhase("ready");
    setDownload(0);
    preload((p) => setDownload(p.percent))
      .then(() => setDownload(null))
      .catch((err) => {
        setDownload(null);
        if (err instanceof VoiceError && err.kind === "cancelled") {
          setPhase("idle");
          return;
        }
        trouble(explainVoiceError(err));
      });
  }

  function cancelDownload() {
    cancelModel();
    setDownload(null);
    setPhase("idle");
  }

  async function finish(blob: Blob) {
    setPhase("transcribing");
    try {
      const out = await transcribe(blob, (p) => setDownload(p.percent < 100 ? p.percent : null));
      setDownload(null);
      if (!out.text) {
        setVoiceMsg("didn't catch that — try again or type.");
        setPhase("ready");
        return;
      }
      setDraft(out.text.slice(0, 500));
      setHeard(out.language && out.language !== "en" ? languageName(out.language) : undefined);
      setVoiceMsg(null);
      setPhase("review");
    } catch (err) {
      setDownload(null);
      if (err instanceof VoiceError && err.kind === "too-short") {
        setVoiceMsg(explainVoiceError(err));
        setPhase("ready");
        return;
      }
      trouble(explainVoiceError(err));
    }
  }

  async function startRec() {
    if (demo || phase === "recording" || phase === "transcribing") return;
    if (phase === "idle" || phase === "trouble") {
      // First touch: say what will happen before asking for anything.
      if (!voiceSupported()) {
        trouble(explainVoiceError(new VoiceError("unsupported")));
        return;
      }
      setVoiceMsg(null);
      setPhase("explain");
      return;
    }
    if (phase !== "ready") return;
    setVoiceMsg(null);
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
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        chunksRef.current = [];
        stopStream();
        setSeconds(0);
        if (blob.size > 0) void finish(blob);
        else setPhase("ready");
      };
      startedRef.current = Date.now();
      rec.start();
      setPhase("recording");
      setSeconds(0);
      tickRef.current = window.setInterval(() => {
        const s = Math.round((Date.now() - startedRef.current) / 1000);
        setSeconds(s);
        if (s >= 10) stopRec();
      }, 200);
    } catch (err) {
      stopStream();
      const denied = err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError");
      trouble(explainVoiceError(new VoiceError(denied ? "permission-denied" : "unsupported")));
    }
  }

  function useDraft() {
    setNote(draft.trim().slice(0, 500));
    setDraft("");
    setHeard(undefined);
    setPhase("ready");
  }

  function discardDraft() {
    setDraft("");
    setHeard(undefined);
    setPhase("ready");
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

          <section className="mt-8" aria-label="a few words, if you want">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onPointerDown={() => void startRec()}
                onPointerUp={stopRec}
                onPointerLeave={stopRec}
                onPointerCancel={stopRec}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    if (phase === "recording") stopRec();
                    else void startRec();
                  }
                }}
                aria-label={phase === "recording" ? "listening — release to stop" : "say a few words, up to ten seconds, kept on this phone"}
                aria-pressed={phase === "recording"}
                disabled={phase === "transcribing"}
                className={[
                  "ff-chip flex h-14 w-14 shrink-0 items-center justify-center rounded-full border",
                  phase === "recording"
                    ? "breathe border-accent bg-accent/20 text-accent"
                    : phase === "transcribing"
                      ? "border-line bg-card text-ink-faint"
                      : "border-line bg-card text-ink-soft hover:border-accent/40",
                ].join(" ")}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" />
                  <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
              <div className="min-w-0 flex-1" aria-live="polite">
                <p className="text-14 text-ink-soft">
                  {phase === "recording"
                    ? `listening · 0:${String(seconds).padStart(2, "0")}`
                    : phase === "transcribing"
                      ? download !== null
                        ? `getting the speech model · ${download}%`
                        : "turning it into words, here on your phone…"
                      : phase === "ready"
                        ? "hold to say something"
                        : "tap to say something"}
                </p>
                <p className="mt-0.5 text-12 text-ink-faint">
                  {phase === "ready" && download !== null
                    ? `getting the speech model once · ${download}%`
                    : note
                      ? "words kept on this phone. audio already gone."
                      : "ten seconds, if you want. it isn't required, and it never leaves this phone."}
                </p>
              </div>
              {phase === "ready" && download !== null ? (
                <button
                  type="button"
                  onClick={cancelDownload}
                  className="ff-chip min-h-11 shrink-0 rounded-pill border border-line px-3 text-12 text-ink-soft hover:border-accent/40"
                >
                  cancel
                </button>
              ) : null}
            </div>

            {phase === "ready" && download !== null ? (
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-chip" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={download} aria-label="speech model download">
                <div className="h-full rounded-full bg-accent/70 transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${download}%` }} />
              </div>
            ) : null}

            {phase === "explain" ? (
              <div className="ff-rise mt-3 rounded-card border border-line bg-card p-4" role="group" aria-label="before the microphone">
                <p className="text-14 text-ink">
                  fix will listen for up to ten seconds, turn it into text on this phone, and throw the audio
                  away. nothing is sent anywhere.
                </p>
                <p className="mt-2 text-12 text-ink-faint">
                  the first time, it downloads a small speech model once ({MODEL_SIZE_LABEL}). after that it works
                  offline. your browser will ask about the microphone when you hold the button.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={agreeToVoice}
                    className="ff-chip min-h-11 rounded-pill bg-accent px-5 text-14 font-medium text-bg hover:opacity-90"
                  >
                    ok
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPhase("idle");
                      setTyping(true);
                    }}
                    className="ff-chip min-h-11 rounded-pill border border-line px-4 text-14 text-ink-soft hover:border-accent/40"
                  >
                    not now, i&rsquo;ll type
                  </button>
                </div>
              </div>
            ) : null}

            {phase === "review" ? (
              <div className="ff-rise mt-3 rounded-card border border-accent/30 bg-card p-4" role="group" aria-label="check the words">
                <p className="text-12 text-ink-faint">
                  here&rsquo;s what it heard{heard ? ` — in ${heard}, so check it` : ". change anything, or drop it"}.
                </p>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value.slice(0, 500))}
                  rows={3}
                  aria-label="the words it heard"
                  className="mt-2 w-full resize-y rounded-card border border-line bg-bg px-4 py-3 text-14 text-ink focus:border-accent/50 focus:outline-none"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={useDraft}
                    disabled={!draft.trim()}
                    className="ff-chip min-h-11 rounded-pill bg-accent px-5 text-14 font-medium text-bg hover:opacity-90 disabled:opacity-50"
                  >
                    use it
                  </button>
                  <button
                    type="button"
                    onClick={discardDraft}
                    className="ff-chip min-h-11 rounded-pill border border-line px-4 text-14 text-ink-soft hover:border-accent/40"
                  >
                    discard
                  </button>
                </div>
              </div>
            ) : null}

            {note && phase !== "review" ? (
              <div className="mt-3 flex items-start gap-3 rounded-card border border-line bg-card px-4 py-3">
                <p className="min-w-0 flex-1 text-14 text-ink-soft">{note}</p>
                <button
                  type="button"
                  onClick={() => setNote("")}
                  aria-label="remove these words"
                  className="ff-chip -mr-1 min-h-11 shrink-0 px-2 text-12 text-ink-faint hover:text-ink-soft"
                >
                  remove
                </button>
              </div>
            ) : null}

            {voiceMsg ? <p className="mt-3 text-12 text-frost" role="status">{voiceMsg}</p> : null}

            {typing ? (
              <input
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 500))}
                placeholder="a few words"
                aria-label="a few words, typed"
                className="mt-3 w-full rounded-card border border-line bg-card px-4 py-3 text-14 text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setTyping(true)}
                className="mt-3 min-h-11 text-12 text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft"
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
