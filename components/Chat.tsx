"use client";

import { useEffect, useRef, useState } from "react";
import VoiceRecorder from "@/components/VoiceRecorder";
import ScreenshotPicker from "@/components/ScreenshotPicker";
import type { HelpScreen as HelpScreenId, RiskLevel } from "@/lib/risk";
import { MOMENTS, type MomentId } from "@/lib/prompt";

// The chat (founder, 16 Oct). Replaces the three fixed move cards.
// Every message the user sends goes through the code safety check on the server BEFORE the
// model sees it. Nothing is stored. The Emergency button stays in the header all the way.

export type Turn = { role: "user" | "assistant"; text: string };

type Props = {
  moment: MomentId;
  region: string;
  groundingOnly: boolean;
  acknowledged: HelpScreenId[];
  features: { voice: boolean; screenshot: boolean };
  onRoute: (r: { level: RiskLevel; screen: HelpScreenId; underage: boolean }) => void;
  onPaywall: () => void;
  onTrusted: () => void;
  onHelped: () => void;
};

const OPENERS: Record<MomentId, string> = {
  people: "Alright. Where are you and who's around?",
  alone: "Alright. What's going round your head right now?",
  task: "Alright. What's the thing you can't start?",
  reply: "Alright. Who are you not replying to, and how long's it been?",
};

const QUICK: Record<MomentId, string[]> = {
  people: ["everyone's looking at me", "said something weird", "want to leave"],
  alone: ["can't stop overthinking", "replaying earlier", "it's all too much"],
  task: ["can't start", "keep scrolling", "deadline's close"],
  reply: ["don't know what to say", "been hours", "left them on read"],
};

export default function Chat({
  moment,
  region,
  groundingOnly,
  acknowledged,
  features,
  onRoute,
  onPaywall,
  onTrusted,
  onHelped,
}: Props) {
  const [turns, setTurns] = useState<Turn[]>([{ role: "assistant", text: OPENERS[moment] }]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [showAttach, setShowAttach] = useState(false);
  const bottom = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, busy]);

  async function send(body: string, img?: string | null) {
    const clean = body.trim();
    if (!clean && !img) return;
    const mine: Turn = { role: "user", text: clean || "(sent an image)" };
    const history = turns;
    setTurns([...history, mine]);
    setText("");
    setImage(null);
    setShowAttach(false);
    setNote(null);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          moment,
          message: clean,
          image: img || undefined,
          history: history.slice(1),
          groundingOnly,
          country: region,
          acknowledged,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        paywall?: boolean;
        level?: RiskLevel;
        screen?: HelpScreenId | null;
        underage?: boolean;
        reply?: string;
      };

      if (data.paywall) {
        onPaywall();
        return;
      }
      if (data.screen) {
        if (data.reply) setTurns((t) => [...t, { role: "assistant", text: data.reply! }]);
        onRoute({ level: (data.level ?? 3) as RiskLevel, screen: data.screen, underage: Boolean(data.underage) });
        return;
      }
      if (!res.ok || !data.reply) {
        const messages: Record<string, string> = {
          ai_off: "Chat isn't switched on yet.",
          not_usable: "Can't use that one. Chat screenshots or a photo of the place, nothing with people in it.",
          screenshot_limit: "That's today's images. Keep typing though.",
          screenshot_off: "Images aren't switched on yet.",
          bad_image: "Couldn't read that image.",
        };
        setNote(messages[data.error ?? ""] ?? "That didn't go through. Try again.");
        return;
      }
      setTurns((t) => [...t, { role: "assistant", text: data.reply! }]);
    } catch {
      setNote("That didn't go through. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col">
      <p className="mb-3 text-sm text-ink-faint">{MOMENTS[moment]}</p>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pb-2">
        {turns.map((t, i) => (
          <div
            key={i}
            className={
              t.role === "assistant"
                ? "max-w-[85%] self-start rounded-[1.5rem] rounded-bl-md bg-card px-4 py-3 text-lg leading-relaxed text-ink"
                : "max-w-[85%] self-end rounded-[1.5rem] rounded-br-md bg-accent px-4 py-3 text-lg leading-relaxed text-accent-ink"
            }
          >
            {t.text}
          </div>
        ))}
        {busy && (
          <div className="flex max-w-[85%] self-start gap-1.5 rounded-[1.5rem] rounded-bl-md bg-card px-4 py-4">
            <span className="h-2 w-2 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.3s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-ink-faint [animation-delay:-0.15s]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-ink-faint" />
          </div>
        )}
        <div ref={bottom} />
      </div>

      {note && <p className="mb-2 rounded-xl bg-chip px-4 py-3 text-sm text-ink-soft">{note}</p>}

      {turns.length <= 1 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {QUICK[moment].map((q) => (
            <button
              key={q}
              onClick={() => send(q)}
              className="rounded-full bg-chip px-4 py-2 text-base text-ink transition active:scale-95"
            >
              {q}
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
            aria-label="Add a voice note or image"
            className="shrink-0 rounded-full bg-chip px-4 py-3 text-xl font-semibold text-ink"
          >
            {showAttach ? "×" : "+"}
          </button>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 600))}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(text, image);
            }
          }}
          rows={1}
          placeholder="type whatever"
          className="max-h-32 min-h-[52px] flex-1 resize-none rounded-[1.5rem] border border-line bg-card px-4 py-3.5 text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
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

      {image && <p className="pb-1 text-xs text-ink-faint">Image attached. Hit send.</p>}

      {turns.length > 2 && (
        <div className="flex gap-2 pb-1 pt-2">
          <button onClick={onTrusted} className="flex-1 rounded-2xl border border-line px-3 py-2.5 text-sm text-ink-soft">
            Text someone
          </button>
          <button onClick={onHelped} className="flex-1 rounded-2xl border border-line px-3 py-2.5 text-sm text-ink-soft">
            That helped
          </button>
        </div>
      )}
    </section>
  );
}
