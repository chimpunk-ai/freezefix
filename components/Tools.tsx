"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";

// Everyday tools. Four small, client-only utilities. Nothing is sent anywhere.
//
// Scope deliberately kept small:
//   • Respectful message — a tone-aware template drafter. The TEMPLATES are plain
//     strings composed with the user's own words — no AI call, so there's no round-
//     trip, no cost, and no network dependency.
//   • Task unfreeze     — a 60-second "just open it" timer with the first-step copy.
//   • Decision pause    — a two-option list the user types themselves, with a
//                         countdown and a sealed "pick one" button at the end.
//   • Movies & sports   — a light "nothing's wrong, just be good company" chat
//                         starter that routes to /app with the `talk` scenario.

type ToolId = "message" | "unfreeze" | "decision" | "chat";

const TABS: { id: ToolId; label: string }[] = [
  { id: "message", label: "Respectful message" },
  { id: "unfreeze", label: "Task unfreeze" },
  { id: "decision", label: "Decision pause" },
  { id: "chat", label: "Movies & sports" },
];

export default function Tools() {
  const [tab, setTab] = useState<ToolId>("message");
  return (
    <AppShell>
      <section className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Everyday tools</p>
        <h1
          className="text-[clamp(1.9rem,5.6vw,2.6rem)] leading-tight text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          Small help for real moments.
        </h1>
        <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">
          A respectful message, a first step on a task, a calm look at two options, or just a
          chat about nothing in particular. Nothing on this page is sent anywhere; the message
          drafter composes text in your own browser.
        </p>
      </section>

      {/* Tool tabs */}
      <nav aria-label="Everyday tools" className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={active ? "page" : undefined}
              className={`min-h-[40px] flex-shrink-0 rounded-full border px-4 py-1.5 text-sm transition ${
                active
                  ? "border-accent bg-accent text-accent-ink"
                  : "border-line bg-bg text-ink hover:border-ink-soft"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <section className="mt-5">
        {tab === "message" && <RespectfulMessage />}
        {tab === "unfreeze" && <TaskUnfreeze />}
        {tab === "decision" && <DecisionPause />}
        {tab === "chat" && <MoviesSports />}
      </section>
    </AppShell>
  );
}

// ───────────────── Respectful message ─────────────────

type Tone = "warm" | "direct" | "brief";

const TONE_PREFIX: Record<Tone, string> = {
  warm: "Hey — I wanted to say this directly rather than let it hang.",
  direct: "A quick one, in case it helps be clear:",
  brief: "Short one:",
};

const TONE_SUFFIX: Record<Tone, string> = {
  warm: "No pressure to reply right away. Thanks for reading.",
  direct: "Let me know what works for you.",
  brief: "Thanks.",
};

function compose(message: string, tone: Tone): string {
  const body = (message || "").trim();
  if (!body) return "";
  return `${TONE_PREFIX[tone]}\n\n${body}\n\n${TONE_SUFFIX[tone]}`;
}

function RespectfulMessage() {
  const [text, setText] = useState("");
  const [tone, setTone] = useState<Tone>("warm");
  const [copied, setCopied] = useState(false);
  const draft = compose(text, tone);

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard can be blocked; the textarea stays selectable manually */
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-line bg-card p-5">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">What do you want to communicate?</p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.slice(0, 500))}
        rows={4}
        placeholder="One or two sentences in your own words. The tool wraps it with a short opening and sign-off."
        className="mt-2 w-full resize-none rounded-2xl border border-line bg-bg p-3 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
      />
      <div className="mt-1 flex justify-end text-[11px] text-ink-faint">{text.length}/500</div>

      <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-ink-soft">Tone</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(["warm", "direct", "brief"] as Tone[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTone(t)}
            aria-pressed={tone === t}
            className={`min-h-[36px] rounded-full border px-3 py-1 text-sm capitalize transition ${
              tone === t
                ? "border-accent bg-accent text-accent-ink"
                : "border-line bg-bg text-ink hover:border-ink-soft"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {draft && (
        <div className="mt-5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Draft</p>
          <pre className="mt-2 whitespace-pre-wrap rounded-2xl border border-accent/60 bg-bg/60 p-4 text-sm leading-relaxed text-ink">
{draft}
          </pre>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copy}
              className="min-h-[40px] rounded-full bg-accent px-5 py-1.5 text-sm font-medium text-accent-ink active:scale-[0.98]"
            >
              {copied ? "Copied" : "Copy draft"}
            </button>
            <p className="text-xs text-ink-faint">
              Composed in this browser. Nothing is sent anywhere.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

// ───────────────── Task unfreeze ─────────────────

function TaskUnfreeze() {
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(60);
  const endsAt = useRef(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0) {
        setRunning(false);
        window.clearInterval(id);
      }
    }, 250);
    return () => window.clearInterval(id);
  }, [running]);

  function start() {
    endsAt.current = Date.now() + 60 * 1000;
    setRemaining(60);
    setRunning(true);
  }
  function stop() {
    setRunning(false);
    setRemaining(60);
  }

  return (
    <section className="rounded-[1.5rem] border border-line bg-card p-5">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Task unfreeze · 60 seconds</p>
      <p className="mt-2 text-base leading-relaxed text-ink">
        The trick isn't finishing — it's starting. Open the doc, the inbox, the folder, whatever
        it is. One minute. Nothing fancy.
      </p>
      <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed text-ink-soft">
        <li>Name the task in one sentence.</li>
        <li>Open the file / tab / app for it. Just open it.</li>
        <li>Add one line, one bullet, one subject. Anything.</li>
        <li>When the minute's up, stop and decide if you want five more.</li>
      </ol>
      <div className="mt-5 flex items-center gap-4">
        <div
          className="font-serif text-5xl text-ink tabular-nums"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          00:{String(remaining).padStart(2, "0")}
        </div>
        {running ? (
          <button
            type="button"
            onClick={stop}
            className="min-h-[44px] rounded-full border border-line bg-bg px-5 py-1.5 text-sm text-ink hover:border-ink-soft"
          >
            Stop
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="min-h-[44px] rounded-full bg-accent px-5 py-1.5 text-sm font-medium text-accent-ink active:scale-[0.98]"
          >
            Start 60s
          </button>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-faint">
        Timer runs in this tab only. Closing the tab ends it.
      </p>
    </section>
  );
}

// ───────────────── Decision pause ─────────────────

function DecisionPause() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [note, setNote] = useState("");

  const ready = a.trim() && b.trim();

  return (
    <section className="rounded-[1.5rem] border border-line bg-card p-5">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Decision pause</p>
      <p className="mt-2 text-base leading-relaxed text-ink">
        Lay the two options side by side and look at them for a minute. Not a committee decision —
        just the pause before you choose.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Option A</span>
          <input
            type="text"
            value={a}
            onChange={(e) => setA(e.target.value.slice(0, 120))}
            placeholder="e.g. Smoke now"
            className="rounded-2xl border border-line bg-bg px-3 py-2.5 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Option B</span>
          <input
            type="text"
            value={b}
            onChange={(e) => setB(e.target.value.slice(0, 120))}
            placeholder="e.g. Wait an hour and decide again"
            className="rounded-2xl border border-line bg-bg px-3 py-2.5 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-1">
        <span className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">What's actually at stake? (optional)</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 400))}
          rows={3}
          placeholder="Half a sentence is enough."
          className="resize-none rounded-2xl border border-line bg-bg p-3 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />
      </label>

      {ready && (
        <div className="mt-4 rounded-2xl border border-accent/50 bg-bg/60 p-4 text-sm leading-relaxed text-ink">
          <p>
            Both options are in front of you now. Try{" "}
            <Link
              href="/sos"
              className="font-medium text-ink underline underline-offset-4 hover:text-ink"
            >
              a short pause
            </Link>{" "}
            before picking. Whichever you choose, it isn&apos;t a verdict — you can decide again.
          </p>
        </div>
      )}
      <p className="mt-3 text-xs text-ink-faint">Lives in this tab only. Nothing is saved or sent.</p>
    </section>
  );
}

// ───────────────── Movies & sports ─────────────────

function MoviesSports() {
  return (
    <section className="rounded-[1.5rem] border border-line bg-card p-5">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Just be company</p>
      <p className="mt-2 text-base leading-relaxed text-ink">
        Nothing's wrong — you just want to chat about a match, a show, a film, whatever. Fix is
        happy to be good company. No agenda, no plan.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/app?s=talk"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-accent px-5 py-1.5 text-sm font-medium text-accent-ink"
        >
          Open chat
          <span aria-hidden="true">→</span>
        </Link>
        <Link
          href="/journal"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-bg px-5 py-1.5 text-sm text-ink hover:border-ink-soft"
        >
          Log something that happened
        </Link>
      </div>
      <p className="mt-4 text-xs text-ink-faint">
        Fix is an AI tool and can be wrong. Nothing you type goes anywhere until you send it from
        the chat.
      </p>
    </section>
  );
}
