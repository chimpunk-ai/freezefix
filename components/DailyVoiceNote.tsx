"use client";

import { useEffect, useRef, useState } from "react";

type SpeechResultList = { length: number; [index: number]: { 0: { transcript: string }; isFinal: boolean } };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: { resultIndex: number; results: SpeechResultList }) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
};

type Props = { value: string; onChange: (value: string) => void };

function createRecognition(): Recognition | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => Recognition;
    webkitSpeechRecognition?: new () => Recognition;
  };
  const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
  return Ctor ? new Ctor() : null;
}

/** Browser-provided speech recognition only. No MediaRecorder or server upload. */
export default function DailyVoiceNote({ value, onChange }: Props) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const recognition = useRef<Recognition | null>(null);
  const finalText = useRef("");
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    setSupported(Boolean(createRecognition()));
    return () => {
      try { recognition.current?.stop(); } catch { /* already stopped */ }
      recognition.current = null;
    };
  }, []);

  function stop() {
    try { recognition.current?.stop(); } catch { /* already stopped */ }
    setRecording(false);
  }

  function start() {
    const engine = createRecognition();
    if (!engine) {
      setMessage("Voice recognition isn't available in this browser. You can skip this.");
      return;
    }
    setMessage(null);
    finalText.current = "";
    engine.lang = navigator.language || "en";
    engine.continuous = true;
    engine.interimResults = true;
    engine.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) finalText.current += result[0].transcript;
        else interim += result[0].transcript;
      }
      const text = `${finalText.current} ${interim}`.trim().slice(0, 500);
      if (text) onChangeRef.current(text);
    };
    engine.onerror = (event) => {
      setRecording(false);
      setMessage(event.error === "not-allowed" || event.error === "service-not-allowed"
        ? "Microphone access was declined. Nothing was recorded."
        : "Voice didn't work this time. You can skip it.");
    };
    engine.onend = () => {
      setRecording(false);
      const text = finalText.current.trim().slice(0, 500);
      if (text) onChangeRef.current(text);
    };
    recognition.current = engine;
    try {
      engine.start();
      setRecording(true);
      window.setTimeout(() => {
        if (recognition.current === engine) stop();
      }, 10_000);
    } catch {
      setRecording(false);
      setMessage("Voice didn't start. You can skip this.");
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-bg/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">A few words, if you want</p>
          <p className="mt-1 text-xs text-ink-faint">Optional · up to 10 seconds</p>
        </div>
        <button
          type="button"
          disabled={!supported && !recording}
          onPointerDown={(event) => {
            event.preventDefault();
            if (event.pointerType === "mouse" && event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            if (!recording) start();
          }}
          onPointerUp={stop}
          onPointerCancel={stop}
          onLostPointerCapture={stop}
          onKeyDown={(event) => {
            if ((event.key === " " || event.key === "Enter") && !recording) {
              event.preventDefault();
              start();
            }
          }}
          onKeyUp={(event) => { if (event.key === " " || event.key === "Enter") stop(); }}
          className="min-h-11 rounded-full border border-line px-4 text-sm text-ink transition-colors hover:border-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
          aria-pressed={recording}
          aria-label={recording ? "Recording. Release to stop." : "Hold to record an optional voice note for up to ten seconds"}
        >
          {recording ? "Listening… release to stop" : supported ? "Hold to speak" : "Unavailable"}
        </button>
      </div>
      {value ? (
        <label className="mt-3 block text-xs text-ink-soft">
          Transcript · editable · saved only in this browser
          <textarea
            value={value}
            onChange={(event) => onChange(event.target.value.slice(0, 500))}
            rows={2}
            maxLength={500}
            className="mt-1 w-full resize-none rounded-xl border border-line bg-card p-3 text-sm text-ink focus:border-accent focus:outline-none"
          />
        </label>
      ) : null}
      <p className="mt-3 text-[11px] leading-relaxed text-ink-faint">
        Your browser provides speech recognition and may process audio through its own service. FreezeFix receives the transcript only; this app does not record or upload audio here.
      </p>
      {message ? <p role="status" className="mt-2 text-xs text-ink-soft">{message}</p> : null}
    </div>
  );
}
