"use client";

import { useEffect, useRef, useState } from "react";

// Voice notes, up to 60 seconds.
// First choice is the browser's own speech engine: free, instant, no account, and the audio
// never leaves the phone. If the browser can't do it we fall back to the paid transcription
// service (server route), which is where the daily limits apply.
// Either way FreezeFix stores no audio, and the text goes through the same safety check.

const MAX_SECONDS = 60;

type Props = {
  onText: (text: string) => void;
  onLimit: (msg: string) => void;
};

type SpeechResultList = { length: number; [i: number]: { 0: { transcript: string }; isFinal: boolean } };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: SpeechResultList }) => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

function speechEngine(): Recognition | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

function pickMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const t of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"]) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "";
}

export default function VoiceRecorder({ onText, onLimit }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "sending">("idle");
  const [seconds, setSeconds] = useState(0);
  const [heard, setHeard] = useState("");
  const [note, setNote] = useState<string | null>(null);

  const recognition = useRef<Recognition | null>(null);
  const finalText = useRef("");
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const started = useRef(0);

  useEffect(() => () => cleanup(), []);

  function cleanup() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    try {
      recognition.current?.stop();
    } catch {
      /* already stopped */
    }
    recognition.current = null;
  }

  function startTimer(onTimeout: () => void) {
    started.current = Date.now();
    setSeconds(0);
    timer.current = setInterval(() => {
      const s = Math.floor((Date.now() - started.current) / 1000);
      setSeconds(s);
      if (s >= MAX_SECONDS) onTimeout();
    }, 250);
  }

  async function start() {
    setNote(null);
    setHeard("");
    finalText.current = "";

    const engine = speechEngine();
    if (engine) {
      engine.lang = navigator.language || "en-GB";
      engine.continuous = true;
      engine.interimResults = true;
      engine.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) finalText.current += r[0].transcript;
          else interim += r[0].transcript;
        }
        setHeard((finalText.current + interim).trim());
      };
      engine.onerror = (e) => {
        const why = e?.error;
        stopEverything();
        if (why === "not-allowed" || why === "service-not-allowed") {
          setNote("No mic access. Allow it in your browser settings, or just type.");
        } else if (why === "no-speech") {
          setNote("Couldn't catch that. Type it in a few words?");
        } else {
          setNote("Voice didn't work there. You can type instead.");
        }
      };
      engine.onend = () => {
        if (timer.current) finishLocal();
      };
      recognition.current = engine;
      try {
        engine.start();
      } catch {
        setNote("Voice didn't start. You can type instead.");
        return;
      }
      setState("recording");
      startTimer(finishLocal);
      return;
    }

    // No speech engine: record and send to the transcription service.
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setNote("Voice notes don't work in this browser. You can type instead.");
      return;
    }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setNote("No mic access. Allow it in your browser settings, or just type.");
      return;
    }
    const mimeType = pickMimeType();
    const rec = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined);
    chunks.current = [];
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.onstop = () => upload(new Blob(chunks.current, { type: rec.mimeType || mimeType || "audio/webm" }));
    recorder.current = rec;
    rec.start();
    setState("recording");
    startTimer(stopEverything);
  }

  function finishLocal() {
    const text = (finalText.current || heard).trim();
    cleanup();
    setState("idle");
    setSeconds(0);
    if (text) {
      onText(text);
      setHeard("");
    } else {
      setNote("Couldn't catch that. Type it in a few words?");
    }
  }

  function stopEverything() {
    if (recognition.current) {
      finishLocal();
      return;
    }
    if (recorder.current && recorder.current.state === "recording") recorder.current.stop();
    cleanup();
  }

  async function upload(blob: Blob) {
    setState("sending");
    const secs = Math.min(MAX_SECONDS, Math.round((Date.now() - started.current) / 1000));
    if (secs < 1 || blob.size < 1000) {
      setState("idle");
      setNote("Couldn't catch that. Type it in a few words?");
      return;
    }
    const form = new FormData();
    form.append("audio", blob, "voice");
    form.append("seconds", String(secs));
    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: form });
      const data = (await res.json()) as { text?: string; error?: string; used?: number; limit?: number };
      if (res.ok && data.text) {
        onText(data.text);
        const left = (data.limit ?? 0) - (data.used ?? 0);
        setNote(left > 0 ? `${left} voice ${left === 1 ? "note" : "notes"} left today.` : "That was today's last voice note.");
      } else if (data.error === "limit") {
        onLimit("That's today's voice notes. You can still type, and help is always here.");
      } else if (data.error === "voice_off") {
        setNote("Voice isn't switched on in this browser. You can type instead.");
      } else {
        setNote("Couldn't catch that. Type it in a few words?");
      }
    } catch {
      setNote("Couldn't catch that. Type it in a few words?");
    }
    setState("idle");
  }

  return (
    <div className="flex flex-col gap-2">
      {state === "recording" ? (
        <button
          onClick={stopEverything}
          className="flex items-center justify-center gap-3 rounded-2xl border border-accent bg-card px-4 py-4 text-lg font-semibold text-ink"
        >
          <span className="h-3 w-3 animate-pulse rounded-full bg-accent" />
          Stop · {seconds}s / {MAX_SECONDS}s
        </button>
      ) : (
        <button
          onClick={start}
          disabled={state === "sending"}
          className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-card px-4 py-4 text-lg font-medium text-ink disabled:opacity-60"
        >
          <MicIcon />
          {state === "sending" ? "Listening back…" : "Say it instead"}
        </button>
      )}
      {state === "recording" && heard && <p className="px-1 text-base text-ink-soft">{heard}</p>}
      {note && <p className="text-center text-sm text-ink-faint">{note}</p>}
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}
