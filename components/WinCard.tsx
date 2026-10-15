"use client";

import { useEffect, useRef, useState } from "react";
import type { MomentId } from "@/lib/prompt";

// A private win card someone can share after a move worked (founder's growth plan, #8).
// Drawn on the phone, never uploaded. It carries NOTHING about what they typed, what they
// took, or who they messaged: just the kind of moment and the brand. Nothing is stored.

const LINES: Record<MomentId, string> = {
  people: "I walked back into the room.",
  alone: "I stopped the spiral.",
  task: "I finally started the thing.",
  reply: "I sent the message.",
};

const BG = "#1a1033";
const INK = "#f7f2ff";
const PINK = "#ff8ad8";
const FAINT = "#a898cc";

type Props = { moment: MomentId; wins: number; onClose: () => void };

export default function WinCard({ moment, wins, onClose }: Props) {
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const [url, setUrl] = useState<string>("");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const W = 1080;
    const H = 1350;
    c.width = W;
    c.height = H;
    const g = c.getContext("2d");
    if (!g) return;

    g.fillStyle = BG;
    g.fillRect(0, 0, W, H);

    // Aurora glows, same as the app.
    const glow = (x: number, y: number, r: number, color: string, alpha: number) => {
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, color);
      grad.addColorStop(1, "rgba(26,16,51,0)");
      g.globalAlpha = alpha;
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      g.globalAlpha = 1;
    };
    glow(220, 180, 620, "#7b5cff", 0.55);
    glow(900, 380, 520, PINK, 0.4);
    glow(540, 1350, 700, "#39e0c8", 0.22);

    const font = '-apple-system, "Segoe UI", Roboto, sans-serif';

    g.fillStyle = FAINT;
    g.font = `600 34px ${font}`;
    g.fillText("freezefix", 90, 140);

    // The line, wrapped by hand so it never clips.
    g.fillStyle = INK;
    g.font = `800 92px ${font}`;
    const words = LINES[moment].split(" ");
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const next = line ? `${line} ${w}` : w;
      if (g.measureText(next).width > W - 180 && line) {
        lines.push(line);
        line = w;
      } else line = next;
    }
    if (line) lines.push(line);
    let y = H / 2 - (lines.length - 1) * 56 - 40;
    for (const l of lines) {
      g.fillText(l, 90, y);
      y += 112;
    }

    if (wins > 1) {
      g.fillStyle = PINK;
      g.font = `700 40px ${font}`;
      g.fillText(`${wins} times unfrozen`, 90, y + 40);
    }

    g.fillStyle = FAINT;
    g.font = `500 36px ${font}`;
    g.fillText("getfreezefix.com", 90, H - 100);

    try {
      setUrl(c.toDataURL("image/png"));
    } catch {
      setNote("Couldn't make the image here. Screenshot works fine.");
    }
  }, [moment, wins]);

  async function share() {
    if (!url) return;
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], "freezefix.png", { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
      if (nav.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch {
      /* fall through to download */
    }
    const a = document.createElement("a");
    a.href = url;
    a.download = "freezefix.png";
    a.click();
  }

  return (
    <section className="flex flex-col">
      <h1 className="text-[2.6rem] font-extrabold leading-[0.95] text-ink">Keep this one</h1>
      <p className="mt-2 text-lg text-ink-soft">Nothing you typed is on it. Share it or don&apos;t.</p>

      <canvas ref={canvas} className="mt-5 w-full rounded-[1.75rem] border border-line" />
      {note && <p className="mt-3 text-sm text-ink-faint">{note}</p>}

      <div className="mt-5 flex flex-col gap-3">
        <button
          onClick={share}
          className="w-full rounded-[1.75rem] bg-accent px-5 py-5 text-xl font-bold text-accent-ink shadow-[0_14px_36px_-14px_rgba(255,138,216,0.8)] transition active:scale-[0.98]"
        >
          Save or share
        </button>
        <button onClick={onClose} className="w-full rounded-[1.75rem] border border-line px-5 py-4 text-lg font-medium text-ink-soft">
          Nah, I&apos;m good
        </button>
      </div>
    </section>
  );
}
