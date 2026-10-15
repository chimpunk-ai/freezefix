"use client";

import { useState } from "react";
import { TRUSTED_MESSAGE } from "@/lib/resources";
import { smsHref } from "@/components/HelpScreen";
import type { HelpScreen as HelpScreenId } from "@/lib/risk";

// Helps someone text a mate when they can't find the words.
// They type fragments, we phrase it, they send it from their own messages app.
// FreezeFix never sends anything and never touches contacts (Safety Pack §2).

type Props = {
  onRoute: (screen: HelpScreenId, underage: boolean) => void;
  onClose: () => void;
};

const PROMPTS = ["can't explain it", "had a rough one", "don't wanna be alone", "need you to call", "just come over"];

export default function TrustedMessage({ onRoute, onClose }: Props) {
  const [notes, setNotes] = useState("");
  const [draft, setDraft] = useState<{ message: string; alt?: string } | null>(null);
  const [picked, setPicked] = useState<string>("");
  const [state, setState] = useState<"writing" | "thinking" | "ready">("writing");
  const [note, setNote] = useState<string | null>(null);

  async function phraseIt() {
    if (!notes.trim()) return;
    setState("thinking");
    setNote(null);
    try {
      const res = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = (await res.json()) as {
        route?: boolean;
        screen?: HelpScreenId;
        underage?: boolean;
        message?: string;
        alt?: string;
      };
      if (data.route && data.screen) {
        onRoute(data.screen, Boolean(data.underage));
        return;
      }
      if (!data.message) throw new Error("empty");
      setDraft({ message: data.message, alt: data.alt });
      setPicked(data.message);
      setState("ready");
    } catch {
      setState("writing");
      setNote("That didn't go through. You can still send it in your own words.");
    }
  }

  if (state === "ready" && draft) {
    return (
      <section className="flex flex-col">
        <h1 className="text-[2.6rem] font-extrabold leading-[0.95] text-ink">Sound like you?</h1>
        <p className="mt-2 text-lg text-ink-soft">Change anything. Then send it from your own messages.</p>

        <textarea
          value={picked}
          onChange={(e) => setPicked(e.target.value.slice(0, 300))}
          rows={3}
          className="mt-5 w-full resize-none rounded-2xl border border-line bg-card p-4 text-lg text-ink focus:border-accent focus:outline-none"
        />

        {draft.alt && draft.alt !== draft.message && (
          <button
            onClick={() => setPicked(draft.alt!)}
            className="mt-2 self-start rounded-full bg-chip px-4 py-2 text-sm text-ink-soft"
          >
            Try shorter: &ldquo;{draft.alt}&rdquo;
          </button>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <a
            href={smsHref(undefined, picked)}
            className="w-full rounded-[1.75rem] bg-accent px-5 py-5 text-center text-xl font-bold text-accent-ink shadow-[0_14px_36px_-14px_rgba(255,138,216,0.8)]"
          >
            Open messages
          </a>
          <button
            onClick={() => {
              setState("writing");
              setDraft(null);
            }}
            className="w-full rounded-[1.75rem] border border-line px-5 py-4 text-lg font-medium text-ink-soft"
          >
            Redo it
          </button>
          <button onClick={onClose} className="self-center py-2 text-sm text-ink-faint underline underline-offset-4">
            Back
          </button>
        </div>
        <p className="mt-6 text-center text-xs text-ink-faint">
          You pick who it goes to. We never see your contacts and never send anything ourselves.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col">
      <h1 className="text-[2.6rem] font-extrabold leading-[0.95] text-ink">What do you want them to know?</h1>
      <p className="mt-2 text-lg text-ink-soft">Half sentences are fine. We&apos;ll make it sound like a text.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        {PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => setNotes((t) => (t.trim() ? `${t.trim()}, ${p}` : p).slice(0, 400))}
            className="rounded-full bg-chip px-4 py-2 text-base text-ink transition active:scale-95"
          >
            {p}
          </button>
        ))}
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value.slice(0, 400))}
        rows={3}
        placeholder="rough night... don't wanna say why... can you call"
        className="mt-3 w-full resize-none rounded-2xl border border-line bg-card p-4 text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        autoFocus
      />

      {note && <p className="mt-3 rounded-xl bg-chip px-4 py-3 text-sm text-ink-soft">{note}</p>}

      <div className="mt-5 flex flex-col gap-3">
        <button
          onClick={phraseIt}
          disabled={!notes.trim() || state === "thinking"}
          className="w-full rounded-[1.75rem] bg-accent px-5 py-5 text-xl font-bold text-accent-ink shadow-[0_14px_36px_-14px_rgba(255,138,216,0.8)] transition active:scale-[0.98] disabled:opacity-40"
        >
          {state === "thinking" ? "Writing it…" : "Word it for me"}
        </button>
        <a
          href={smsHref(undefined, TRUSTED_MESSAGE)}
          className="w-full rounded-[1.75rem] border border-line px-5 py-4 text-center text-lg font-medium text-ink-soft"
        >
          Skip, I&apos;ll type it
        </a>
        <button onClick={onClose} className="self-center py-2 text-sm text-ink-faint underline underline-offset-4">
          Back
        </button>
      </div>
    </section>
  );
}
