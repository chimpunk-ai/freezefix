"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TRIGGER_LABEL, type Entries } from "@/lib/entry";
import { buildFixContext, numberWord, type WeekStats } from "@/lib/pattern";
import type { Goal } from "@/lib/profile";

// Fix: a knife beside the mirror. It answers one question about the user's own
// week, from the user's own log, in a few sentences, and then stops.
//
// The opener is written from the log on the device, so no model call is spent
// on saying hello. The crisis path is handled by the server, in code, and comes
// back with real phone numbers for the user's country.

type Turn = { role: "user" | "assistant"; text: string };

type CrisisLine = { label: string; display: string; tel?: string; url?: string; note?: string };

function opener(name: string, stats: WeekStats): string {
  const who = name.trim() || "you";
  if (stats.topTrigger && stats.topTriggerCount >= 2) {
    const trigger = TRIGGER_LABEL[stats.topTrigger];
    const after =
      stats.moodAfterNoSmoke !== null && stats.moodAfterSmoke !== null && stats.moodAfterNoSmoke > stats.moodAfterSmoke
        ? ` the morning after a night you didn't smoke read a little better.`
        : "";
    return `hey ${who}. you tapped “${trigger}” ${numberWord(stats.topTriggerCount)} times this week.${after} that's the shape, nothing more.`;
  }
  if (stats.logged > 0) {
    return `hey ${who}. ${numberWord(stats.smoked)} of your ${numberWord(stats.logged)} logged nights were smoke. ask me something about the week, or don't.`;
  }
  return `hey ${who}. there's not much in the log yet. one more week and there'll be a shape to look at.`;
}

export default function FixSheet({
  open,
  onClose,
  name,
  stats,
  entries,
  goal,
  region,
  onPaywall,
  banner,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  stats: WeekStats;
  entries: Entries;
  goal: Goal | null;
  region: string;
  onPaywall: () => void;
  /** One line under the header, e.g. when the week being asked about is a sample. */
  banner?: string;
}) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(5);
  const [note, setNote] = useState<string | null>(null);
  const [crisis, setCrisis] = useState<{ say: string; lines: CrisisLine[] } | null>(null);
  const [breathe, setBreathe] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [turns, crisis, sending]);

  if (!open) return null;

  // The opener is derived from the log instead of being pushed into state by an
  // effect: no extra render, and it stays true if the week's stats change under
  // an open sheet. `turns` holds only what was actually said after it.
  const thread: Turn[] = [{ role: "assistant", text: opener(name, stats) }, ...turns];

  const capped = used >= limit;

  async function send(text: string) {
    const message = text.trim();
    if (!message || sending || capped || crisis) return;
    setInput("");
    setNote(null);
    const history = thread.slice(-8);
    setTurns((t) => [...t, { role: "user", text: message }]);
    setSending(true);
    try {
      const res = await fetch("/api/fix", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message,
          history,
          context: buildFixContext(stats, entries, goal),
          region,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        reply?: string;
        used?: number;
        limit?: number;
        crisis?: boolean;
        say?: string;
        lines?: CrisisLine[];
        paywall?: boolean;
        error?: string;
      };
      if (data.crisis && data.say) {
        setCrisis({ say: data.say, lines: data.lines ?? [] });
        setTurns((t) => [...t, { role: "assistant", text: data.say as string }]);
        return;
      }
      if (data.paywall) {
        setNote("your free week is over. the mirror still works, Fix doesn't.");
        return;
      }
      if (data.reply) {
        setTurns((t) => [...t, { role: "assistant", text: data.reply as string }]);
        if (typeof data.used === "number") setUsed(data.used);
        if (typeof data.limit === "number") setLimit(data.limit);
        return;
      }
      if (data.error === "limit") {
        setUsed(limit);
        setNote("that's today's turns. the mirror is still here on sunday.");
      } else {
        setNote("fix is quiet right now. try again in a minute.");
      }
    } catch {
      setNote("fix is quiet right now. try again in a minute.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="Fix">
      <button type="button" aria-label="close" onClick={onClose} className="absolute inset-0 cursor-default" />
      <div className="ff-sheet relative flex max-h-[88vh] w-full max-w-[560px] flex-col rounded-t-sheet border border-line bg-bg md:max-h-[80vh] md:rounded-sheet">
        <div className="flex items-center justify-between border-b border-line/70 px-5 py-3">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-20 text-ink">fix</span>
            <span aria-hidden className="mb-0.5 h-1 w-1 rounded-full bg-accent" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-12 text-ink-faint">
              {used}/{limit} today
            </span>
            <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center text-14 text-ink-faint hover:text-ink-soft">
              close
            </button>
          </div>
        </div>

        {banner ? (
          <p className="border-b border-line/70 bg-card/60 px-5 py-2 text-12 text-ink-faint">{banner}</p>
        ) : null}

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4" role="log" aria-live="polite" aria-label="conversation">
          {thread.map((t, i) => (
            <p
              key={i}
              className={[
                "max-w-[92%] rounded-card px-4 py-3 text-14",
                t.role === "assistant"
                  ? "bg-card text-ink-soft"
                  : "ml-auto bg-accent/15 text-ink",
              ].join(" ")}
            >
              <span className="ff-sr">{t.role === "assistant" ? "fix: " : "you: "}</span>
              {t.text}
            </p>
          ))}

          {sending ? <p className="text-12 text-ink-faint" role="status">fix is reading your week…</p> : null}

          {crisis ? (
            <div className="rounded-card border border-frost/40 bg-frost/10 p-4">
              <p className="text-14 text-ink">these are free, and they&rsquo;re people:</p>
              <ul className="mt-3 space-y-2">
                {crisis.lines.map((l) => (
                  <li key={l.label} className="text-14">
                    <span className="text-ink">{l.label}</span>
                    {l.tel ? (
                      <a href={`tel:${l.tel}`} className="ml-2 text-frost underline decoration-frost/40 underline-offset-4">
                        {l.display}
                      </a>
                    ) : (
                      <span className="ml-2 text-ink-soft">{l.display}</span>
                    )}
                    {l.note ? <span className="block text-12 text-ink-faint">{l.note}</span> : null}
                  </li>
                ))}
              </ul>
              <Link href="/help?screen=crisis" className="mt-3 inline-block text-14 text-frost underline decoration-frost/40 underline-offset-4">
                everything else on the help page
              </Link>
            </div>
          ) : null}

          {note ? <p className="text-12 text-frost" role="status">{note}</p> : null}

          {note?.includes("free week") ? (
            <button type="button" onClick={onPaywall} className="text-14 text-accent underline decoration-accent/40 underline-offset-4">
              see what it costs
            </button>
          ) : null}

          <div ref={endRef} />
        </div>

        {breathe ? (
          <div className="border-t border-line/70 px-5 py-6 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center">
              <span className="breathe h-16 w-16 rounded-full bg-accent/25" />
            </div>
            <p className="mt-3 text-14 text-ink-soft">in for four. out for six.</p>
            <button type="button" onClick={() => setBreathe(false)} className="mt-2 text-12 text-ink-faint hover:text-ink-soft">
              done
            </button>
          </div>
        ) : null}

        {!crisis ? (
          <div className="border-t border-line/70 px-5 py-3">
            {!capped ? (
              <div className="flex flex-wrap gap-2 pb-3">
                {["why did i smoke so much?", "does the goal line mean anything?"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    disabled={sending}
                    className="ff-chip rounded-pill border border-line px-3 py-1.5 text-12 text-ink-soft hover:border-accent/40"
                  >
                    {s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setBreathe((b) => !b)}
                  className="ff-chip rounded-pill border border-line px-3 py-1.5 text-12 text-ink-faint hover:border-accent/40"
                >
                  i need a minute
                </button>
              </div>
            ) : null}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 600))}
                disabled={capped || sending}
                aria-label="ask about your week"
                autoComplete="off"
                placeholder={capped ? "that's today's turns" : "ask about your week"}
                className="min-w-0 flex-1 rounded-pill border border-line bg-card px-4 py-3 text-14 text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={capped || sending || !input.trim()}
                className="ff-chip rounded-pill bg-accent px-4 py-3 text-14 font-medium text-bg disabled:opacity-40"
              >
                ask
              </button>
            </form>
            <p className="mt-2 text-12 text-ink-faint">
              fix answers from your own log. it ends when you do.{" "}
              <Link href="/help" className="text-frost underline decoration-frost/40 underline-offset-4">
                more help
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
