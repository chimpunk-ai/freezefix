"use client";

import { useState } from "react";
import { detectRegion } from "@/lib/country";
import type { HelpScreen as HelpScreenId, RiskLevel } from "@/lib/risk";

// "Is this even needed?" — asked while the app and payments are being finished.
//
// Three honest answers, including no, which is the one worth having. Someone who says no
// gets the cause explained once, quietly, and is then thanked and left alone. No argument,
// no second ask, no guilt. If we can't change their mind in four sentences we haven't
// earned it.

type Props = {
  /** Shown when the box is used to say something urgent. */
  onRoute?: (r: { level: RiskLevel; screen: HelpScreenId; underage: boolean }) => void;
  compact?: boolean;
};

type Answer = "yes" | "maybe" | "no";

const PROMPTS: Record<Answer, { heading: string; placeholder: string }> = {
  yes: { heading: "Nice one. What would make it actually useful?", placeholder: "e.g. I'd want it to remember my mates' names" },
  maybe: { heading: "Fair. What's the bit you're not sure about?", placeholder: "e.g. not sure I'd open it when I'm actually in it" },
  no: { heading: "Fair enough. What would you tell us?", placeholder: "say whatever, we'd rather know" },
};

export default function Suggest({ onRoute, compact = false }: Props) {
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [words, setWords] = useState("");
  const [contact, setContact] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function send() {
    if (!answer || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ needed: answer, words, contact, country: detectRegion() }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        route?: boolean;
        level?: RiskLevel;
        screen?: HelpScreenId;
        underage?: boolean;
      };
      if (data.route && data.screen && onRoute) {
        onRoute({ level: data.level ?? 3, screen: data.screen, underage: Boolean(data.underage) });
        return;
      }
      setState(data.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className={box(compact)}>
        <p className="text-xl font-semibold leading-snug text-ink">Thanks. Properly.</p>
        <p className="mt-2 text-base leading-relaxed text-ink-soft">
          {answer === "no"
            ? "We'd rather hear that now than build the wrong thing for a year."
            : "That goes straight to the person building it. No mailing list, no follow-up spam."}
        </p>
      </div>
    );
  }

  return (
    <div className={box(compact)}>
      <p className="text-xs uppercase tracking-widest text-ink-faint">Help us build it</p>
      <h3 className="mt-2 text-2xl font-extrabold leading-tight text-ink">10-second feedback</h3>
      <p className="mt-1 text-base text-ink-soft">Is this actually needed?</p>
      <p className="mt-2 text-base leading-relaxed text-ink-soft">
        Honest answer please. No is a real option and it&apos;s the useful one.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["yes", "maybe", "no"] as Answer[]).map((a) => (
          <button
            key={a}
            onClick={() => setAnswer(a)}
            aria-pressed={answer === a}
            className={`ff-chip rounded-full px-5 py-2.5 text-base font-medium ${
              answer === a ? "bg-accent text-accent-ink" : "bg-chip text-ink"
            }`}
          >
            {a === "yes" ? "Yeah, I'd use it" : a === "maybe" ? "Maybe" : "Nah, not for me"}
          </button>
        ))}
      </div>

      {/* Said once, quietly, and never repeated. */}
      {answer === "no" && (
        <div className="ff-bubble mt-4 rounded-2xl border border-line bg-card p-4">
          <p className="text-base leading-relaxed text-ink-soft">
            Fair enough, and thanks for being straight about it.
          </p>
          <p className="mt-2 text-base leading-relaxed text-ink-soft">
            We built it because a lot of people have a smoke, go quiet, and then can&apos;t start the thing or answer the
            message, and there&apos;s nowhere to say that without someone making it a problem. If that&apos;s not you,
            that&apos;s genuinely good news.
          </p>
          <p className="mt-2 text-base leading-relaxed text-ink-faint">
            Still worth a minute of your time to tell us why not.
          </p>
        </div>
      )}

      {answer && (
        <div className="ff-bubble mt-4 flex flex-col gap-3">
          <label className="text-base font-medium text-ink">{PROMPTS[answer].heading}</label>
          <textarea
            value={words}
            onChange={(e) => setWords(e.target.value.slice(0, 600))}
            rows={3}
            placeholder={PROMPTS[answer].placeholder}
            className="resize-none rounded-2xl border border-line bg-card px-4 py-3 text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value.slice(0, 120))}
            placeholder="email or @handle, only if you want a reply"
            autoComplete="off"
            className="rounded-2xl border border-line bg-card px-4 py-3 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
          <button
            onClick={send}
            disabled={state === "sending"}
            className="rounded-[1.6rem] bg-accent px-5 py-3.5 text-lg font-bold text-accent-ink transition active:scale-[0.98] disabled:opacity-50"
          >
            {state === "sending" ? "Sending…" : "Send it"}
          </button>
          {state === "error" && (
            <p className="text-sm text-ink-soft">
              That didn&apos;t send. Try again in a moment, or email hello@getfreezefix.com.
            </p>
          )}
          <p className="text-xs leading-relaxed text-ink-faint">
            We store what you write and nothing else. No account, no tracking, and we don&apos;t link it to anything you
            said in the app.
          </p>
        </div>
      )}
    </div>
  );
}

function box(compact: boolean) {
  return compact
    ? "rounded-[1.75rem] border border-line bg-card p-5"
    : "rounded-[2rem] border border-line bg-card p-7 sm:p-9";
}
