"use client";

import { useEffect, useRef, useState } from "react";

// Records a voice note up to 60 seconds, sends it to /api/transcribe, and hands back the text.
// The text is shown to the user before anything else happens. Audio is never saved.

const MAX_SECONDS = 60;

type Props = {
  onText: (text: string) => void;
  onLimit: (msg: string) => void;
};

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
  const [note, setNote] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const started = useRef(0);
  const stream = useRef<MediaStream | null>(null);

  useEffect(() => () => cleanup(), []);

  function cleanup() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  }

  async function start() {
    setNote(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setNote("Voice notes don't work in this browser. You can type instead.");
      return;
    }
    try {
      stream.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setNote("No mic access. You can allow it in your browser settings, or just type.");
      return;
    }
    const mimeType = pickMimeType();
    const rec = new MediaRecorder(stream.current, mimeType ? { mimeType } : undefined);
    chunks.current = [];
    rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    rec.onstop = () => send(new Blob(chunks.current, { type: rec.mimeType || mimeType || "audio/webm" }));
    recorder.current = rec;
    rec.start();
    started.current = Date.now();
    setSeconds(0);
    setState("recording");
    timer.current = setInterval(() => {
      const s = Math.floor((Date.now() - started.current) / 1000);
      setSeconds(s);
      if (s >= MAX_SECONDS) stop();
    }, 250);
  }

  function stop() {
    if (recorder.current && recorder.current.state === "recording") recorder.current.stop();
    cleanup();
  }

  async function send(blob: Blob) {
    setState("sending");
    const secs = Math.min(MAX_SECONDS, Math.round((Date.now() - started.current) / 1000));
    if (secs < 1 || blob.size < 1000) {
      setState("idle");
      setNote("That was too short. Hold on a sec and try again.");
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
        setNote("Voice notes aren't switched on yet. You can type instead.");
      } else if (data.error === "empty") {
        setNote("Couldn't catch any words. Try again a bit closer to the mic.");
      } else {
        setNote("That didn't go through. Try again, or type instead.");
      }
    } catch {
      setNote("That didn't go through. Try again, or type instead.");
    }
    setState("idle");
  }

  return (
    <div className="flex flex-col gap-2">
      {state === "recording" ? (
        <button
          onClick={stop}
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
          {state === "sending" ? "Listening back…" : "Say it instead (up to 60s)"}
        </button>
      )}
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
