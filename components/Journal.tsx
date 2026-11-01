"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  add,
  allNewestFirst,
  clearAll,
  CONTEXTS,
  remove,
  TYPE_LABEL,
  USE_LABEL,
  type Entry,
  type EntryType,
  type UseStatus,
} from "@/lib/journal";

// The journal screen. Three "Log" buttons open an inline form at the top of the page
// (no modal — nothing nags). Entries render newest-first below. Nothing is uploaded.

const TYPE_ORDER: { id: EntryType; blurb: string }[] = [
  { id: "general", blurb: "Note what happened — anything you'd like to look back on." },
  { id: "after-use", blurb: "A short reflection after you used." },
  { id: "craving", blurb: "A craving — whether or not you acted on it." },
];

export default function Journal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [openType, setOpenType] = useState<EntryType | null>(null);
  const [used, setUsed] = useState<UseStatus>("prefer-not-to-say");
  const [contexts, setContexts] = useState<string[]>([]);
  const [note, setNote] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setEntries(allNewestFirst());
    setMounted(true);
  }, []);

  function openForm(type: EntryType) {
    setOpenType(type);
    // Sensible defaults for the Yes/No/Prefer rows based on type.
    setUsed(type === "after-use" ? "yes" : type === "craving" ? "no" : "prefer-not-to-say");
    setContexts([]);
    setNote("");
  }

  function cancelForm() {
    setOpenType(null);
    setContexts([]);
    setNote("");
  }

  function toggleCtx(id: string) {
    setContexts((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    if (!openType) return;
    add({ type: openType, used, contexts, note });
    setEntries(allNewestFirst());
    cancelForm();
  }

  function del(id: string) {
    remove(id);
    setEntries(allNewestFirst());
  }

  function doClearAll() {
    clearAll();
    setEntries([]);
    setConfirmClear(false);
  }

  const title = useMemo(() => (entries.length === 0 ? "Nothing logged yet." : "Journal"), [entries.length]);

  return (
    <AppShell>
      <section className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Journal · on this device only</p>
        <h1
          className="text-[clamp(1.9rem,5.6vw,2.6rem)] leading-tight text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          {title}
        </h1>
        <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">
          For things that already happened — not for planning use. Entries live in this browser
          only. Nothing is sent anywhere; delete one or all whenever you want.
        </p>
      </section>

      {/* Three log CTAs */}
      <section className="mt-5 grid gap-3 sm:grid-cols-3">
        {TYPE_ORDER.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => openForm(t.id)}
            className={`flex flex-col items-start gap-1 rounded-[1.25rem] border p-4 text-left transition active:scale-[0.99] ${
              openType === t.id ? "border-accent bg-chip" : "border-line bg-card hover:border-ink-soft"
            }`}
          >
            <span className="text-sm font-semibold text-ink">{TYPE_LABEL[t.id]}</span>
            <span className="text-xs leading-relaxed text-ink-soft">{t.blurb}</span>
          </button>
        ))}
      </section>

      {/* Inline log form */}
      {openType && (
        <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">New: {TYPE_LABEL[openType]}</p>
            <button
              type="button"
              onClick={cancelForm}
              className="min-h-[36px] rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>

          {/* Use status row */}
          <div className="mt-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">Use</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["yes", "no", "prefer-not-to-say"] as UseStatus[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUsed(u)}
                  aria-pressed={used === u}
                  className={`min-h-[36px] rounded-full border px-3 py-1 text-sm transition ${
                    used === u
                      ? "border-accent bg-accent text-accent-ink"
                      : "border-line bg-bg text-ink hover:border-ink-soft"
                  }`}
                >
                  {USE_LABEL[u]}
                </button>
              ))}
            </div>
          </div>

          {/* Contexts */}
          <div className="mt-4">
            <p className="font-mono text-[11px] uppercase tracking-wider text-ink-soft">What was going on? (optional)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CONTEXTS.map((c) => {
                const on = contexts.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCtx(c.id)}
                    aria-pressed={on}
                    className={`min-h-[36px] rounded-full border px-3 py-1 text-sm transition ${
                      on
                        ? "border-accent bg-accent text-accent-ink"
                        : "border-line bg-bg text-ink hover:border-ink-soft"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Free text */}
          <div className="mt-4">
            <label className="font-mono text-[11px] uppercase tracking-wider text-ink-soft" htmlFor="journal-note">
              A line in your own words (optional)
            </label>
            <textarea
              id="journal-note"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="How did it feel, what helped, anything you want to remember…"
              className="mt-2 w-full resize-none rounded-2xl border border-line bg-bg p-3 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
            <div className="mt-1 flex justify-end text-[11px] text-ink-faint">{note.length}/500</div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              className="min-h-[48px] rounded-full bg-accent px-6 py-2.5 text-base font-medium text-accent-ink active:scale-[0.98]"
            >
              Save entry
            </button>
            <p className="text-xs text-ink-faint">Lives on this device. No upload.</p>
          </div>
        </section>
      )}

      {/* Timeline */}
      <section className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
            Timeline{mounted ? ` (${entries.length})` : ""}
          </p>
          {entries.length > 0 &&
            (confirmClear ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-ink-soft">Delete all entries?</span>
                <button
                  type="button"
                  onClick={doClearAll}
                  className="min-h-[32px] rounded-full border border-frost px-3 py-1 text-frost"
                >
                  Yes, delete all
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="min-h-[32px] rounded-full border border-line px-3 py-1 text-ink-soft"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="min-h-[32px] text-xs text-ink-faint underline-offset-4 hover:text-ink hover:underline"
              >
                Delete all
              </button>
            ))}
        </div>

        {!mounted ? null : entries.length === 0 ? (
          <div className="mt-3 rounded-[1.25rem] border border-dashed border-line/60 p-5 text-sm text-ink-soft">
            Pick one of the three above to log something. Nothing is sent anywhere, and you can
            delete entries one at a time or all at once.
          </div>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {entries.map((e) => (
              <li
                key={e.id}
                className="rounded-[1.25rem] border border-line bg-card p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] uppercase tracking-wider text-ink-faint">
                      {formatWhen(e.ts)}
                    </p>
                    <p className="text-sm font-medium text-ink">{TYPE_LABEL[e.type]}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => del(e.id)}
                    aria-label="Delete entry"
                    className="min-h-[32px] rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-wider text-ink-faint hover:text-ink"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="rounded-full bg-chip px-2 py-0.5 text-ink">{USE_LABEL[e.used]}</span>
                  {e.contexts.map((c) => {
                    const label = CONTEXTS.find((x) => x.id === c)?.label ?? c;
                    return (
                      <span key={c} className="rounded-full border border-line/70 px-2 py-0.5 text-ink-soft">
                        {label}
                      </span>
                    );
                  })}
                </div>
                {e.note && (
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink">{e.note}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function formatWhen(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  const dayDiff = Math.round((now.getTime() - d.getTime()) / 86400000);
  const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return `Today · ${time}`;
  if (dayDiff === 1) return `Yesterday · ${time}`;
  const date = d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  return `${date} · ${time}`;
}
