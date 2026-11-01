"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

// Craving SOS. Not an emergency flow. User-started, user-stoppable, nothing is scored,
// nothing is sent anywhere. The timer runs in the tab only; closing the tab ends it.
//
// Four options follow the reference prototype's shape. "Pause" is the headline — it
// has a timer, Start / Stop, and a reflection line when it ends. The other three are
// in-page prompts rather than full new flows; they expand with suggestions. All of
// this is additive — nothing here changes the risk check, prompt or AI code.

type Mode = "idle" | "pausing" | "pause-ended";

const PAUSE_MINUTES: number[] = [5, 10, 15];

export default function Sos() {
  const [mode, setMode] = useState<Mode>("idle");
  const [minutes, setMinutes] = useState<number>(10);
  const [remaining, setRemaining] = useState<number>(0); // ms left during pause
  const [expanded, setExpanded] = useState<Option | null>(null);
  const endsAt = useRef<number>(0);

  // Tick while a pause is running. Interval is cleared whenever mode changes.
  useEffect(() => {
    if (mode !== "pausing") return;
    const id = window.setInterval(() => {
      const left = endsAt.current - Date.now();
      if (left <= 0) {
        setRemaining(0);
        setMode("pause-ended");
        window.clearInterval(id);
      } else {
        setRemaining(left);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [mode]);

  function startPause() {
    endsAt.current = Date.now() + minutes * 60 * 1000;
    setRemaining(minutes * 60 * 1000);
    setMode("pausing");
    setExpanded(null);
  }

  function stopPause() {
    setMode("idle");
    setRemaining(0);
  }

  function endAgain() {
    setMode("idle");
  }

  return (
    <AppShell showNav={false}>
      {/* Dismiss link (prototype uses a close button; the AppShell has a cog instead,
          so we add a quiet Close that returns home). */}
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-faint">
          Craving SOS · not a medical emergency flow
        </span>
        <Link
          href="/home"
          className="min-h-[36px] rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:text-ink"
        >
          Close
        </Link>
      </div>

      <section className="flex flex-col gap-3">
        <h1
          className="text-[clamp(1.9rem,5.6vw,2.6rem)] leading-tight text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          A craving can feel urgent. You get to choose what happens next.
        </h1>
        <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">
          Pick anything that might help, or close this at any point. Nothing is scored, nothing is
          saved on a server.
        </p>
      </section>

      {/* 4 options */}
      {mode === "idle" && (
        <section className="mt-5 grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() =>
                o.id === "pause"
                  ? setExpanded(expanded === o ? null : o)
                  : setExpanded(expanded === o ? null : o)
              }
              aria-expanded={expanded === o}
              className={`flex flex-col items-start gap-1 rounded-[1.25rem] border p-4 text-left transition active:scale-[0.99] ${
                expanded === o
                  ? "border-accent bg-chip"
                  : "border-line bg-card hover:border-ink-soft"
              }`}
            >
              <span className="flex items-center gap-2 text-base font-medium text-ink">
                {o.icon}
                {o.label}
              </span>
              <span className="text-xs leading-relaxed text-ink-soft">{o.hint}</span>
            </button>
          ))}
        </section>
      )}

      {/* Expanded panels */}
      {mode === "idle" && expanded?.id === "pause" && (
        <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">A short pause</p>
          <p className="mt-2 text-base leading-relaxed text-ink">
            Started by you. You can stop it any time, and decide again when it ends.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {PAUSE_MINUTES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMinutes(m)}
                aria-pressed={minutes === m}
                className={`min-h-[40px] rounded-full border px-4 py-1.5 text-sm transition ${
                  minutes === m
                    ? "border-accent bg-accent text-accent-ink"
                    : "border-line bg-bg text-ink hover:border-ink-soft"
                }`}
              >
                {m} minutes
              </button>
            ))}
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={startPause}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-base font-medium text-accent-ink active:scale-[0.98]"
            >
              Start pause
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      )}

      {mode === "idle" && expanded?.id === "scene" && (
        <OptionPanel title="Change the scene">
          <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-ink">
            <li>Step into a different room, or outside for two minutes.</li>
            <li>Open a window if you can. Fresh air is a reset in itself.</li>
            <li>Put something else on — a different show, a different song, a different light.</li>
            <li>Move your body gently: wall push-ups, stretches, a short walk around the block.</li>
          </ul>
        </OptionPanel>
      )}

      {mode === "idle" && expanded?.id === "contact" && (
        <OptionPanel title="Contact someone I trust">
          <p className="mt-2 text-sm leading-relaxed text-ink">
            Not a drafted message, not an auto-send. Just a nudge to pick someone you already
            trust and say one small true thing. Even "hey, bit of a weird evening — how's yours?"
            counts.
          </p>
          <p className="mt-3 text-xs text-ink-faint">
            If you need urgent help instead, use{" "}
            <Link href="/help" className="text-frost underline-offset-4 hover:underline">
              Get help now
            </Link>
            .
          </p>
        </OptionPanel>
      )}

      {mode === "idle" && expanded?.id === "write" && (
        <OptionPanel title="Write what I'm feeling">
          <p className="mt-2 text-sm leading-relaxed text-ink">
            A craving usually has a story behind it. Writing it down takes some of the pressure
            off, even if nobody else ever reads it.
          </p>
          <Link
            href="/journal"
            className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-full border border-line bg-bg px-4 py-1.5 text-sm text-ink hover:border-ink-soft"
          >
            Open journal
            <span aria-hidden="true">→</span>
          </Link>
        </OptionPanel>
      )}

      {/* Running pause */}
      {mode === "pausing" && (
        <section className="mt-6 rounded-[2rem] border border-accent/60 bg-accent/10 p-6 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">You chose a pause</p>
          <p
            className="mt-3 text-6xl text-ink tabular-nums"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            {formatRemaining(remaining)}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Nothing scored. You can stop any time. The timer only runs while this tab is open.
          </p>
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={stopPause}
              className="min-h-[48px] rounded-full border border-line bg-bg px-6 py-2.5 text-base text-ink hover:border-ink-soft"
            >
              Stop pause
            </button>
          </div>
        </section>
      )}

      {/* Pause ended */}
      {mode === "pause-ended" && (
        <section className="mt-6 rounded-[1.5rem] border border-accent bg-card p-5">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Pause ended</p>
          <h2
            className="mt-2 text-xl text-ink"
            style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
          >
            You stayed with it for {minutes} minute{minutes === 1 ? "" : "s"}.
          </h2>
          <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-ink-soft">
            What happens next is your call. If the craving is quieter, that's useful information.
            If it isn't, that's useful too. Nothing on this screen judges either outcome.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/journal"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-5 py-2 text-sm font-medium text-accent-ink"
            >
              Log this moment
            </Link>
            <button
              type="button"
              onClick={endAgain}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-bg px-5 py-2 text-sm text-ink hover:border-ink-soft"
            >
              Another option
            </button>
            <Link
              href="/home"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-bg px-5 py-2 text-sm text-ink hover:border-ink-soft"
            >
              Back home
            </Link>
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-relaxed text-ink-faint">
        Get help now — for urgent or emergency situations —{" "}
        <Link href="/help" className="text-frost underline-offset-4 hover:underline">
          open the crisis page
        </Link>
        . Crisis help is always free and never behind a paywall.
      </p>
    </AppShell>
  );
}

type Option = { id: "pause" | "scene" | "contact" | "write"; label: string; hint: string; icon: React.ReactNode };

const OPTIONS: Option[] = [
  {
    id: "pause",
    label: "Pause for a few minutes",
    hint: "A short, started-by-you timer. Stop any time.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2M9 2h6" />
      </svg>
    ),
  },
  {
    id: "scene",
    label: "Change the scene",
    hint: "A different room, a window, a short walk.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M4 10h16" />
        <path d="M9 5v14" />
      </svg>
    ),
  },
  {
    id: "contact",
    label: "Contact someone I trust",
    hint: "A short true line to one person. Nothing drafted for you.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
      </svg>
    ),
  },
  {
    id: "write",
    label: "Write what I'm feeling",
    hint: "A line in the journal. Lives on this device.",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 17.5V21h3.5L18 9.5 14.5 6 3 17.5z" />
        <path d="M14 7l3 3" />
      </svg>
    ),
  },
];

function OptionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">{title}</p>
      {children}
    </section>
  );
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
