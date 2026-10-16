"use client";

import { useRef, useState } from "react";

// Lets the user add ONE screenshot (e.g. a chat they can't reply to).
// The image is shrunk on the phone and re-drawn, which also strips location and other hidden
// data. It is sent to the AI once to read the text, then thrown away. Never stored.
// No camera button in the beta: chat screenshots only (founder decision 16 Oct; camera comes later).
// Wording from Safety Pack section 9.

const MAX_SIDE = 1600;

type Props = {
  image: string | null;
  onChange: (dataUrl: string | null) => void;
  allowCamera?: boolean;
};

async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export default function ScreenshotPicker({ image, onChange, allowCamera = false }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const cam = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setNote(null);
    if (!file.type.startsWith("image/")) {
      setNote("That's not an image. Pick a screenshot.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setNote("That image is too big. Try a normal screenshot.");
      return;
    }
    setBusy(true);
    try {
      onChange(await shrink(file));
    } catch {
      setNote("Couldn't open that image. Try another screenshot.");
    }
    setBusy(false);
  }

  if (image) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="Your screenshot" className="h-16 w-16 rounded-lg object-cover" />
        <div className="flex-1 text-sm text-ink-soft">Screenshot added. Only used to read the text, then deleted.</div>
        <button onClick={() => onChange(null)} className="rounded-full px-3 py-1 text-sm text-ink-faint underline">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-center text-xs leading-relaxed text-ink-faint">
        {allowCamera
          ? "A chat screenshot, or a photo of the place or the thing. Nothing with people in it. Read once, then gone."
          : "Chat screenshots only. Crop or cover other people's names and photos first. Read once, then gone."}
      </p>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={pick} />
      <input ref={cam} type="file" accept="image/*" capture="environment" className="hidden" onChange={pick} />
      <button
        onClick={() => input.current?.click()}
        disabled={busy}
        className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-card px-4 py-4 text-lg font-medium text-ink disabled:opacity-60"
      >
        <ImageIcon />
        {busy ? "Getting it ready…" : allowCamera ? "Pick an image" : "Add a screenshot"}
      </button>
      {allowCamera && (
        <button
          onClick={() => cam.current?.click()}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-2xl border border-line bg-card px-4 py-4 text-lg font-medium text-ink disabled:opacity-60"
        >
          <CameraIcon />
          Take a photo
        </button>
      )}

      {note && <p className="text-center text-sm text-ink-faint">{note}</p>}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="m21 16-5-5-9 9" />
    </svg>
  );
}
