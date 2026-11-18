"use client";

import { useState } from "react";
import {
  addMoment,
  MOMENT_MAX,
  MOMENT_TAG_LABEL,
  todayMomentsRemaining,
  type Moment,
  type MomentTag,
} from "@/lib/moments";

// A small button on the log screen: "add a moment." Opens a sheet with a
// short text box and four tag chips (note / flag / good / hard). Tap save,
// the moment is appended to localStorage and the week picks it up.
//
// Why this exists: some users want to capture "something happened at 3pm"
// without waiting for the nightly ritual. The nightly log stays as it is —
// three taps, one card on sunday — and moments live alongside it as context.
// Fix AI reads the last seven days' moments into its answer, same as it reads
// the log.
//
// Deliberately NOT: a feed, a social surface, a timeline you scroll. The
// moments are a context pool for yourself and for Fix. The week view shows
// them inline with the nights they belong to; that's the whole visual.

type Props = {
  onSaved?: (moment: Moment) => void;
  className?: string;
};

export default function AddMoment({ onSaved, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [tag, setTag] = useState<MomentTag>("note");
  const [saved, setSaved] = useState<null | "ok" | "full">(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  function openSheet() {
    setRemaining(todayMomentsRemaining());
    setSaved(null);
    setText("");
    setTag("note");
    setOpen(true);
  }

  function save() {
    const next = addMoment(text, tag);
    if (!next) {
      setSaved("full");
      return;
    }
    setSaved("ok");
    onSaved?.(next);
    // Close after a brief confirmation so the user knows it landed.
    window.setTimeout(() => setOpen(false), 700);
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={openSheet}
        className="ff-chip inline-flex min-h-11 items-center rounded-pill border border-line bg-card px-4 text-14 text-ink hover:border-accent/40"
      >
        + add a moment
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 md:items-center md:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="add a moment"
        >
          <button
            type="button"
            aria-label="close"
            onClick={() => setOpen(false)}
            className="absolute inset-0 cursor-default"
          />
          <div className="relative w-full max-w-[520px] rounded-t-sheet border border-line bg-bg p-5 md:rounded-sheet md:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-20 text-ink">add a moment</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-9 text-12 text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft"
              >
                close
              </button>
            </div>
            <p className="mt-1 text-13 text-ink-faint">
              something you want to note, outside tonight&rsquo;s log. up to {MOMENT_MAX} characters.
              stays on this phone.
            </p>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MOMENT_MAX))}
              rows={3}
              placeholder="what happened?"
              aria-label="the moment, in your own words"
              autoComplete="off"
              autoCapitalize="sentences"
              autoCorrect="off"
              spellCheck
              enterKeyHint="done"
              className="mt-3 w-full resize-y rounded-card border border-line bg-card px-4 py-3 text-14 text-ink focus:border-accent/50 focus:outline-none"
            />
            <div className="mt-1 flex items-center justify-between text-12 text-ink-faint">
              <span>{text.length}/{MOMENT_MAX}</span>
              {remaining !== null ? <span>{remaining} left today</span> : null}
            </div>

            <fieldset className="mt-4">
              <legend className="text-12 text-ink-faint">tag it, if you want</legend>
              <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="moment tag">
                {(Object.keys(MOMENT_TAG_LABEL) as MomentTag[]).map((t) => {
                  const on = tag === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setTag(t)}
                      className={[
                        "ff-chip min-h-9 rounded-pill border px-3 text-13",
                        on ? "border-accent/50 bg-accent/15 text-accent" : "border-line bg-card text-ink-soft",
                      ].join(" ")}
                    >
                      {MOMENT_TAG_LABEL[t]}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={save}
                disabled={!text.trim() || saved === "ok"}
                className="ff-chip min-h-11 rounded-pill bg-accent px-5 text-14 font-medium text-bg hover:opacity-90 disabled:opacity-50"
              >
                {saved === "ok" ? "saved" : "save"}
              </button>
              {saved === "full" ? (
                <span className="text-12 text-frost">today&rsquo;s already full ({`${1 + 19}+`} moments).</span>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
