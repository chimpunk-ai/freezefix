"use client";

import { useEffect, useRef, useState } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import ScreenshotPicker from "@/components/ScreenshotPicker";
import { loadMemory, remember, noteVisit } from "@/lib/memory";
import type { HelpScreen as HelpScreenId, RiskLevel } from "@/lib/risk";
import { MOMENTS, type MomentId } from "@/lib/prompt";

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

export default function Chat({
  moment,
  region,
  groundingOnly,
  acknowledged,
  features,
  opener,
  scenario,
  openerChips,
  onRoute,
  onPaywall,
  onTrusted,
  onHelped,
}: Props) {
  const [turns, setTurns] = useState<Turn[]>([{ role: "assistant", text: opener || OPENERS[moment] }]);
  const [chips, setChips] = useState<string[]>(openerChips ?? FIRST_CHIPS[moment]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [showAttach, setShowAttach] = useState(false);
  const bottom = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  async function send(raw: string, img?: string | null) {
    const clean = raw.trim();
    if ((!clean && !img) || busy) return;
    const history = turns;
    setTurns([...history, { role: "user", text: clean || "(an image)" }]);
    setText("");
    setImage(null);
    setChips([]);
    setShowAttach(false);
    setNote(null);
    setBusy(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moment,
          scenario,
          message: clean,
          image: img || undefined,
          // The opener is included: Fix wrote it, so it needs to know what it already asked
          // rather than opening with the same question twice.
          history,
          memory: loadMemory() ?? undefined,
          groundingOnly,
          country: region,
          acknowledged,
        }),
      });

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setNote(errorText(data.error));
        setBusy(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let open = false; // has the assistant bubble been created yet

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
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            if (handle(JSON.parse(line) as Record<string, unknown>)) {
              stop = true;
              break;
            }
          } catch {
            /* partial line, wait for more */
          }
        }
      }
      if (!open && !stop) setNote("That didn't come through. Try again.");
    } catch {
      setNote("That didn't come through. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <p className="mb-2 text-xs text-ink-faint">
        {MOMENTS[moment]} · Fix is an AI, not a therapist
      </p>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto pb-2">
        {turns.map((t, i) => (
          <div
            key={i}
            className={
              t.role === "assistant"
                ? "max-w-[85%] self-start rounded-[1.4rem] rounded-bl-md bg-card px-4 py-3 text-lg leading-relaxed text-ink"
                : "max-w-[85%] self-end rounded-[1.4rem] rounded-br-md bg-accent px-4 py-3 text-lg leading-relaxed text-accent-ink"
            }
          >
            {t.text}
          </div>
        ))}
        {busy && turns[turns.length - 1]?.role === "user" && (
          <div className="flex max-w-[85%] self-start gap-1.5 rounded-[1.4rem] rounded-bl-md bg-card px-4 py-4">
            <span className="h-2 w-2 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-ink-faint" />
          </div>
        )}
        <div ref={bottom} />
      </div>

      {note && <p className="mb-2 rounded-xl bg-chip px-4 py-3 text-sm text-ink-soft">{note}</p>}

      {chips.length > 0 && !busy && (
        <div className="mb-2 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c}
              onClick={() => send(c)}
              className="rounded-full bg-chip px-4 py-2 text-base text-ink transition active:scale-95"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {showAttach && (
        <div className="mb-2 flex flex-col gap-2">
          {features.voice && <VoiceRecorder onText={(t) => send(t)} onLimit={(m) => setNote(m)} />}
          {features.screenshot && <ScreenshotPicker image={image} onChange={setImage} allowCamera />}
        </div>
      )}

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
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 800))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(text, image);
            }
          }}
          rows={1}
          placeholder="say whatever"
          className="max-h-32 min-h-[52px] flex-1 resize-none rounded-[1.4rem] border border-line bg-card px-4 py-3.5 text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
        />
        <button
          onClick={() => send(text, image)}
          disabled={busy || (!text.trim() && !image)}
          aria-label="Send"
          className="shrink-0 rounded-full bg-accent px-5 py-3.5 text-lg font-bold text-accent-ink transition active:scale-95 disabled:opacity-40"
        >
          ↑
        </button>
      </div>

      {image && <p className="pb-1 text-xs text-ink-faint">Image ready. Hit send.</p>}

      {turns.length > 2 && (
        <div className="flex gap-2 pb-1 pt-1.5">
          <button onClick={onTrusted} className="flex-1 rounded-2xl border border-line px-3 py-2.5 text-sm text-ink-soft">
            Text someone
          </button>
          <button
            onClick={() => {
              noteVisit("lighter");
              onHelped();
            }}
            className="flex-1 rounded-2xl border border-line px-3 py-2.5 text-sm text-ink-soft"
          >
            That helped
          </button>
        </div>
      )}
    </section>
  );
}

function errorText(code?: string): string {
  const map: Record<string, string> = {
    ai_off: "Chat isn't switched on yet.",
    not_usable: "Can't use that one. A chat screenshot or a photo of the place, nothing with people in it.",
    screenshot_limit: "That's today's images. Keep typing though.",
    screenshot_off: "Images aren't switched on yet.",
    bad_image: "Couldn't read that image.",
  };
  return map[code ?? ""] ?? "That didn't come through. Try again.";
}
