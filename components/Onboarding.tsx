"use client";

import { useState } from "react";
import { loadMemory, saveMemory, memoryOn } from "@/lib/memory";

// Four questions, asked once, so the first conversation doesn't start from nothing.
// Every one is skippable: somebody who opened this app mid-freeze should be able to get
// past it in two taps. The answers go into device memory, never to a server.

type Props = { onDone: () => void };

const WHEN = ["Late at night", "Around people", "When I've got stuff to do", "All sorts"];
const WANTS = ["Getting unstuck", "Overthinking less", "Saying the thing", "Just someone to talk to"];
const TRIGGERS = ["Big groups", "Messages I owe", "Work or uni", "No idea"];

export default function Onboarding({ onDone }: Props) {
  const [q, setQ] = useState(0);
  const [name, setName] = useState("");
  const [triggers, setTriggers] = useState("");
  const [when, setWhen] = useState("");
  const [wants, setWants] = useState("");

  const total = 4;

  function finish(last?: { wants?: string }) {
    // Memory off means memory off. Nothing is written, and the questions were still harmless.
    if (memoryOn()) {
      const m = loadMemory() ?? {};
      const next = { ...m };
      if (name.trim()) next.name = name.trim().slice(0, 24);
      if (triggers) next.triggers = triggers;
      if (when) next.when = when;
      const w = last?.wants ?? wants;
      if (w) next.wants = w;
      saveMemory(next);
    }
    onDone();
  }

  const step = (n: number, body: React.ReactNode) =>
    q === n ? <div className="flex flex-1 flex-col gap-5">{body}</div> : null;

  const Choices = ({ options, onPick }: { options: string[]; onPick: (v: string) => void }) => (
    <div className="flex flex-col gap-2.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onPick(o)}
          className="rounded-2xl border border-line bg-card px-5 py-4 text-left text-lg text-ink transition active:scale-[0.98]"
        >
          {o}
        </button>
      ))}
    </div>
  );

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-6">
      <div className="flex items-center gap-3 pt-2">
        <div className="flex gap-1.5" role="progressbar" aria-valuenow={q + 1} aria-valuemin={1} aria-valuemax={total}>
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`h-1.5 w-8 rounded-full ${i <= q ? "bg-accent" : "bg-chip"}`} />
          ))}
        </div>
        <button onClick={() => finish()} className="ml-auto text-sm text-ink-faint underline underline-offset-4">
          Skip all
        </button>
      </div>

      {step(
        0,
        <>
          <h1 className="text-3xl font-extrabold leading-tight text-ink">What should Fix call you?</h1>
          <p className="text-base text-ink-faint">Anything. A nickname, one letter, nothing at all.</p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 24))}
            onKeyDown={(e) => e.key === "Enter" && setQ(1)}
            placeholder="type a name"
            autoComplete="off"
            className="rounded-2xl border border-line bg-card px-5 py-4 text-xl text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
          <button
            onClick={() => setQ(1)}
            className="rounded-[1.75rem] bg-accent px-5 py-4 text-xl font-bold text-accent-ink transition active:scale-[0.98]"
          >
            {name.trim() ? "Next" : "Skip"}
          </button>
        </>
      )}

      {step(
        1,
        <>
          <h1 className="text-3xl font-extrabold leading-tight text-ink">What usually sets it off?</h1>
          <Choices
            options={TRIGGERS}
            onPick={(v) => {
              setTriggers(v);
              setQ(2);
            }}
          />
        </>
      )}

      {step(
        2,
        <>
          <h1 className="text-3xl font-extrabold leading-tight text-ink">When does it hit most?</h1>
          <Choices
            options={WHEN}
            onPick={(v) => {
              setWhen(v);
              setQ(3);
            }}
          />
        </>
      )}

      {step(
        3,
        <>
          <h1 className="text-3xl font-extrabold leading-tight text-ink">What do you want out of this?</h1>
          <Choices
            options={WANTS}
            onPick={(v) => {
              // Passed straight through: setWants wouldn't have landed before finish() reads it.
              setWants(v);
              finish({ wants: v });
            }}
          />
        </>
      )}

      <div className="mt-auto flex items-center justify-between pt-2">
        {q > 0 ? (
          <button onClick={() => setQ(q - 1)} className="text-base text-ink-soft underline underline-offset-4">
            Back
          </button>
        ) : (
          <span />
        )}
        {q > 0 && q < 3 && (
          <button onClick={() => setQ(q + 1)} className="text-base text-ink-faint underline underline-offset-4">
            Skip this
          </button>
        )}
      </div>

      <p className="text-center text-sm leading-relaxed text-ink-faint">
        All of this stays on your phone. You can change or wipe it any time in settings.
      </p>
    </section>
  );
}
