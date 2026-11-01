"use client";

import { useEffect, useRef, useState } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import ScreenshotPicker from "@/components/ScreenshotPicker";
import { loadMemory, remember, noteVisit } from "@/lib/memory";
import type { HelpScreen as HelpScreenId, RiskLevel } from "@/lib/risk";
import { MOMENTS, type MomentId } from "@/lib/prompt";
import { NdjsonReader } from "@/lib/ndjson";
import { errorText } from "@/lib/chat-errors";
import { SCENARIOS } from "@/lib/scenarios";

// The buddy chat. Replies stream in, but the server holds every character back until the
// safety verdict has landed, so nothing unsafe can reach the screen.

export type Turn = { role: "user" | "assistant"; text: string };

type Props = {
  moment: MomentId;
  region: string;
  groundingOnly: boolean;
  acknowledged: HelpScreenId[];
  features: { voice: boolean; screenshot: boolean };
  opener?: string;
  /** Scenario card this chat started from, if any. The server turns the id into context. */
  scenario?: string;
  /** Taps shown under the opener, before they've said anything. */
  openerChips?: string[];
  /** When set, this message is auto-sent as the user's first message on mount. */
  initialMessage?: string;
  onRoute: (r: { level: RiskLevel; screen: HelpScreenId; underage: boolean }) => void;
  onPaywall: () => void;
  onTrusted: () => void;
  onHelped: () => void;
};

const OPENERS: Record<MomentId, string> = {
  people: "Alright. Where are you and who's around?",
  alone: "Alright. What's going round your head?",
  task: "Alright. What's the thing you can't start?",
  reply: "Alright. Who are you not replying to, and how long's it been?",
};

const FIRST_CHIPS: Record<MomentId, string[]> = {
  people: ["everyone's looking", "said something stupid", "want to leave"],
  alone: ["can't stop thinking", "replaying earlier", "it's all too much"],
  task: ["can't start", "keep scrolling", "deadline's close"],
  reply: ["dunno what to say", "been hours", "left on read"],
};

// Grounding exercise steps
const GROUNDING_STEPS = [
  { instruction: "Take a slow breath in for 4 seconds", duration: 4 },
  { instruction: "Hold it gently for 4 seconds", duration: 4 },
  { instruction: "Breathe out slowly for 6 seconds", duration: 6 },
  { instruction: "Name 3 things you can see right now", duration: 10 },
  { instruction: "Name 2 things you can hear", duration: 8 },
  { instruction: "Name 1 thing you can feel", duration: 6 },
];

function GroundingSection() {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startGrounding() {
    setActiveStep(0);
    setTimer(GROUNDING_STEPS[0].duration);
  }

  useEffect(() => {
    if (activeStep < 0 || activeStep >= GROUNDING_STEPS.length) return;
    intervalRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          const next = activeStep + 1;
          if (next >= GROUNDING_STEPS.length) {
            setActiveStep(-1);
            return 0;
          }
          setActiveStep(next);
          return GROUNDING_STEPS[next].duration;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeStep]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-2 flex w-full items-center gap-2 rounded-2xl border border-line bg-card/50 px-4 py-3 text-sm text-ink-soft transition hover:border-ink-faint"
      >
        <span className="text-base" aria-hidden="true">{"🫁"}</span>
        <span className="font-medium">60-second grounding</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="ml-auto text-ink-faint" aria-hidden="true">
          <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    );
  }

  return (
    <div className="mb-2 rounded-2xl border border-line bg-card/50 px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base" aria-hidden="true">{"🫁"}</span>
          <span className="text-sm font-medium text-ink">60-second grounding</span>
        </div>
        <button
          onClick={() => { setOpen(false); setActiveStep(-1); }}
          className="text-xs text-ink-faint hover:text-ink-soft"
          aria-label="Close grounding"
        >
          {"✕"}
        </button>
      </div>

      {activeStep < 0 ? (
        <button
          onClick={startGrounding}
          className="w-full rounded-xl bg-frost/15 px-4 py-3 text-sm font-medium text-frost transition hover:bg-frost/20"
        >
          Start grounding exercise
        </button>
      ) : (
        <div className="flex flex-col items-center gap-2 py-2">
          <p className="text-center text-base font-medium text-ink">
            {GROUNDING_STEPS[activeStep].instruction}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tabular-nums text-frost">{timer}</span>
            <span className="text-xs text-ink-faint">
              {activeStep + 1}/{GROUNDING_STEPS.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Chat({
  moment,
  region,
  groundingOnly,
  acknowledged,
  features,
  opener,
  scenario,
  openerChips,
  initialMessage,
  onRoute,
  onPaywall,
  onTrusted,
  onHelped,
}: Props) {
  // When an initialMessage is provided (from a Sound Familiar card), start with no opener —
  // the user's message appears immediately and Fix starts responding.
  const [turns, setTurns] = useState<Turn[]>(
    initialMessage ? [] : [{ role: "assistant", text: opener || OPENERS[moment] }]
  );
  const [chips, setChips] = useState<string[]>(initialMessage ? [] : (openerChips ?? FIRST_CHIPS[moment]));
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [showAttach, setShowAttach] = useState(false);
  // Held when a reply never arrived, so the message is never lost.
  const [pending, setPending] = useState<{ text: string; image: string | null } | null>(null);
  const bottom = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const autoSent = useRef(false);

  // Auto-send the initial message from a Sound Familiar card tap.
  useEffect(() => {
    if (initialMessage && !autoSent.current) {
      autoSent.current = true;
      send(initialMessage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  // Auto-grow the textarea to fit its content, up to the CSS max-height.
  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }

  async function send(raw: string, img?: string | null, attempt = 0) {
    const clean = raw.trim();
    if ((!clean && !img) || busy) return;
    // A retry replaces the user bubble it already drew rather than adding a second one.
    if (attempt > 0) setTurns((t) => t.slice(0, -1));
    setPending(null);
    const history = turns;
    setTurns([...history, { role: "user", text: clean || "(an image)" }]);
    setText("");
    setImage(null);
    setChips([]);
    setShowAttach(false);
    setNote(null);
    setBusy(true);
    // Reset the auto-grown textarea back to one row.
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      navigator.vibrate?.(8);
    } catch {
      /* iPhones ignore this; nothing depends on it */
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moment,
          scenario,
          message: clean,
          image: img || undefined,
          history,
          memory: loadMemory() ?? undefined,
          groundingOnly,
          country: region,
          acknowledged,
        }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string; detail?: string };
        setNote(errorText(data.error, data.detail));
        setBusy(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      const nd = new NdjsonReader();
      let open = false;

      const handle = (evt: Record<string, unknown>) => {
        if (evt.route) {
          onRoute({
            level: (evt.level ?? 3) as RiskLevel,
            screen: evt.screen as HelpScreenId,
            underage: Boolean(evt.underage),
          });
          return true;
        }
        if (evt.paywall) {
          onPaywall();
          return true;
        }
        if (evt.error) {
          // Preserve the user's message so "Tap to resend" appears instead of a dead end.
          setPending({ text: raw, image: img ?? null });
          setNote(errorText(String(evt.error)));
          return true;
        }
        if (typeof evt.delta === "string") {
          const piece = evt.delta;
          setTurns((t) => {
            if (!open) {
              open = true;
              return [...t, { role: "assistant", text: piece.replace(/^\s+/, "") }];
            }
            const copy = [...t];
            copy[copy.length - 1] = { role: "assistant", text: copy[copy.length - 1].text + piece };
            return copy;
          });
        }
        if (evt.done) {
          const next = Array.isArray(evt.chips) ? (evt.chips as string[]) : [];
          setChips(next);
          if (typeof evt.remember === "string" && evt.remember.trim()) remember(evt.remember.trim());
        }
        return false;
      };

      let stop = false;
      while (!stop) {
        const { done, value } = await reader.read();
        if (done) {
          for (const evt of nd.end()) if (handle(evt)) break;
          break;
        }
        for (const evt of nd.push(decoder.decode(value, { stream: true }))) {
          if (handle(evt)) {
            stop = true;
            break;
          }
        }
      }
      if (!open && !stop) throw new Error("empty");
    } catch {
      if (attempt === 0) {
        setBusy(false);
        return send(raw, img, 1);
      }
      setPending({ text: raw, image: img ?? null });
      setNote("Lost signal for a sec.");
    } finally {
      setBusy(false);
    }
  }

  const scenarioData = scenario ? SCENARIOS.find((s) => s.id === scenario) : null;
  const situationLabel = scenarioData?.label;
  // Show follow-up actions after Fix has replied at least once
  const hasExchange = turns.length >= 2 && turns[turns.length - 1]?.role === "assistant";

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      {/* Chat header — Fix identity + situation context */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-frost/20">
            <span className="text-sm font-bold text-frost">F</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold text-ink">Fix</span>
              <span className="h-2 w-2 rounded-full bg-accent" />
            </div>
            {situationLabel && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                {situationLabel}
              </span>
            )}
          </div>
        </div>
        {/* Start fresh */}
        <button
          onClick={() => {
            noteVisit("fresh");
            window.location.href = "/app";
          }}
          className="rounded-full border border-line px-3 py-2.5 min-h-[44px] text-xs text-ink-soft hover:text-ink"
        >
          Start fresh
        </button>
      </div>
      <p className="mb-2 text-xs text-ink-faint">Fix is an AI, not a therapist</p>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-2">
        {turns.map((t, i) =>
          t.role === "user" ? (
            <div
              key={i}
              className="ff-bubble max-w-[80%] self-end rounded-[1.4rem] rounded-br-md bg-frost/20 px-4 py-3 text-base leading-relaxed text-ink"
            >
              {t.text}
            </div>
          ) : (
            <div
              key={i}
              className="ff-bubble max-w-[88%] self-start rounded-2xl rounded-bl-md bg-card/60 px-4 py-3 text-[1.05rem] leading-[1.6] text-ink"
            >
              <span className={busy && i === turns.length - 1 ? "ff-caret" : undefined}>
                {t.text}
              </span>
            </div>
          )
        )}
        {busy && turns[turns.length - 1]?.role === "user" && (
          <div className="ff-bubble flex max-w-[88%] items-center gap-2 self-start rounded-2xl rounded-bl-md bg-card/60 px-4 py-3" role="status" aria-live="polite">
            <span className="h-2 w-2 animate-bounce rounded-full bg-frost [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-frost [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-frost" />
            <span className="ml-1 text-sm text-ink-soft">{`Fix is thinking…`}</span>
          </div>
        )}
        <div ref={bottom} />
      </div>

      <div role="status" aria-live="polite">
        {note &&
          (pending ? (
            <button
              onClick={() => {
                const p = pending;
                setNote(null);
                setPending(null);
                // The failed send already pushed a "user" bubble into `turns`. Drop
                // it here so `send()` can re-add it as a single bubble, otherwise
                // each tap of "Tap to resend" stacks another copy of the same
                // message under the error (visible in the 2026-11-01 screenshot).
                setTurns((t) =>
                  t.length > 0 && t[t.length - 1].role === "user" ? t.slice(0, -1) : t
                );
                send(p.text, p.image);
              }}
              className="mb-2 w-full rounded-xl bg-chip px-4 py-3 text-left text-sm text-ink"
            >
              {note} <span className="font-semibold underline underline-offset-2">Tap to resend</span>
            </button>
          ) : (
            <p className="mb-2 rounded-xl bg-chip px-4 py-3 text-sm text-ink-soft">{note}</p>
          ))}
      </div>

      {/* Opener chips — only before the first exchange */}
      {chips.length > 0 && !busy && !hasExchange && (
        <div className="mb-2 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => send(c)}
              className="ff-chip rounded-full bg-chip px-4 py-2.5 min-h-[44px] text-base text-ink"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Follow-up action buttons — always shown after Fix has replied */}
      {!busy && hasExchange && (
        <div className="mb-2 flex flex-wrap gap-2">
          <button onClick={() => send("I'll try that")} className="ff-chip rounded-full border border-frost/40 bg-frost/15 px-3.5 py-2.5 min-h-[44px] text-sm font-semibold text-frost">
            Try it
          </button>
          <button onClick={() => send("give me another idea")} className="ff-chip rounded-full border border-line bg-chip px-3.5 py-2.5 min-h-[44px] text-sm text-ink">
            Another idea
          </button>
          <button onClick={() => send("help me draft a message for this")} className="ff-chip rounded-full border border-line bg-chip px-3.5 py-2.5 min-h-[44px] text-sm text-ink">
            Draft a message
          </button>
          <button onClick={() => send("can you clarify that?")} className="ff-chip rounded-full border border-line bg-chip px-3.5 py-2.5 min-h-[44px] text-sm text-ink">
            Clarify
          </button>
          <button
            onClick={() => {
              noteVisit("done");
              onHelped();
            }}
            className="ff-chip rounded-full border border-line bg-chip px-3.5 py-2.5 min-h-[44px] text-sm text-ink-soft"
          >
            I&apos;m done for now
          </button>
        </div>
      )}

      {/* Grounding exercise */}
      <GroundingSection />

      {showAttach && (
        <div className="mb-2 flex flex-col gap-2">
          {features.voice && <VoiceRecorder onText={(t) => send(t)} onLimit={(m) => setNote(m)} />}
          {features.screenshot && <ScreenshotPicker image={image} onChange={setImage} allowCamera />}
        </div>
      )}

      {/* Composer */}
      <div className="flex items-end gap-2 pb-1">
        {(features.voice || features.screenshot) && (
          <button
            onClick={() => setShowAttach((v) => !v)}
            aria-label={showAttach ? "Close attachments" : "Add a voice note or image"}
            className="shrink-0 rounded-full bg-chip px-4 py-3 text-xl font-semibold text-ink"
          >
            {showAttach ? "×" : "+"}
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value.slice(0, 800));
            autoResize();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(text, image);
            }
          }}
          rows={1}
          placeholder="Tell Fix more, or reply..."
          className="max-h-32 min-h-[52px] flex-1 resize-none rounded-[1.4rem] border border-line bg-card px-4 py-3.5 text-base text-ink placeholder:text-ink-faint focus:border-frost focus:outline-none"
        />
        <button
          onClick={() => send(text, image)}
          disabled={busy || (!text.trim() && !image)}
          aria-label="Send"
          className="shrink-0 rounded-full bg-frost px-5 py-3.5 text-lg font-bold text-bg transition active:scale-95 disabled:opacity-40"
        >
          {"↑"}
        </button>
      </div>

      {image && <p className="pb-1 text-xs text-ink-faint">Image ready. Hit send.</p>}

      {turns.length > 4 && !busy && (
        <div className="flex justify-center pb-1 pt-0.5">
          <button onClick={onTrusted} className="min-h-[44px] px-2 text-xs text-ink-faint underline underline-offset-2 hover:text-ink-soft">
            Text someone instead
          </button>
        </div>
      )}
    </section>
  );
}
