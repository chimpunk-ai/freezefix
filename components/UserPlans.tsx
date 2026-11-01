"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  add,
  allNewestFirst,
  clearAll,
  remove,
  toggleReminder,
  type Plan,
} from "@/lib/tomorrow-plans";

// User's "Tomorrow Loop" if–then plans. Reads/writes ff_tomorrow_plans. The reminder
// toggle intentionally has NO effect — notifications are not wired up anywhere in the
// app, and this component makes that honest in copy. The toggle is kept so the user can
// mark which plans would want a reminder once reminders exist, without implying one is
// scheduled now.

const TRIGGER_SUGGESTIONS = [
  "After dinner",
  "When I get in from work",
  "Before bed",
  "First thing in the morning",
  "At the weekend",
  "If I'm alone with the laptop",
];

export default function UserPlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [mounted, setMounted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [when, setWhen] = useState<string>("");
  const [then, setThen] = useState<string>("");
  const [reminder, setReminder] = useState<boolean>(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setPlans(allNewestFirst());
    setMounted(true);
  }, []);

  function openForm() {
    setFormOpen(true);
    setWhen("");
    setThen("");
    setReminder(false);
  }

  function closeForm() {
    setFormOpen(false);
  }

  function save() {
    const p = add({ when, then, reminder });
    if (p) {
      setPlans(allNewestFirst());
      closeForm();
    }
  }

  function del(id: string) {
    remove(id);
    setPlans(allNewestFirst());
  }

  function flipReminder(id: string) {
    toggleReminder(id);
    setPlans(allNewestFirst());
  }

  function doClearAll() {
    clearAll();
    setPlans([]);
    setConfirmClear(false);
  }

  return (
    <AppShell>
      <section className="flex flex-col gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">Plans · Tomorrow Loop</p>
        <h1
          className="text-[clamp(1.9rem,5.6vw,2.6rem)] leading-tight text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400, letterSpacing: "-0.015em" }}
        >
          One tiny plan for tomorrow.
        </h1>
        <p className="max-w-[52ch] text-base leading-relaxed text-ink-soft">
          A single if–then — only if you'd like one. Lives in this browser; nothing is scheduled
          and no notifications are sent. No streaks, no scoreboard. A skipped or unfinished plan
          isn't a failure.
        </p>
      </section>

      {!formOpen && (
        <section className="mt-5">
          <button
            type="button"
            onClick={openForm}
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-medium text-accent-ink active:scale-[0.98]"
          >
            Make one tiny plan
            <span aria-hidden="true">→</span>
          </button>
        </section>
      )}

      {formOpen && (
        <section className="mt-5 rounded-[1.5rem] border border-line bg-card p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink">New plan</p>
            <button
              type="button"
              onClick={closeForm}
              className="min-h-[36px] rounded-full border border-line px-3 py-1 text-xs text-ink-soft hover:text-ink"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4">
            <label className="font-mono text-[11px] uppercase tracking-wider text-ink-soft" htmlFor="plan-when">
              When / if
            </label>
            <input
              id="plan-when"
              type="text"
              value={when}
              onChange={(e) => setWhen(e.target.value.slice(0, 120))}
              placeholder="e.g. After dinner"
              className="mt-2 w-full rounded-2xl border border-line bg-bg px-3 py-2.5 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {TRIGGER_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setWhen(s)}
                  className={`min-h-[32px] rounded-full border px-3 py-0.5 text-xs transition ${
                    when === s
                      ? "border-accent bg-accent/80 text-accent-ink"
                      : "border-line bg-bg text-ink-soft hover:text-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="font-mono text-[11px] uppercase tracking-wider text-ink-soft" htmlFor="plan-then">
              Then I will…
            </label>
            <textarea
              id="plan-then"
              value={then}
              onChange={(e) => setThen(e.target.value.slice(0, 240))}
              rows={3}
              placeholder="e.g. Pause for ten minutes and decide again."
              className="mt-2 w-full resize-none rounded-2xl border border-line bg-bg p-3 text-base text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
            />
            <div className="mt-1 flex justify-end text-[11px] text-ink-faint">{then.length}/240</div>
          </div>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-line bg-bg/60 p-3 text-sm text-ink">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-[color:var(--color-accent)]"
              checked={reminder}
              onChange={(e) => setReminder(e.target.checked)}
            />
            <span>
              <span className="font-medium">Remind me when this hits.</span>{" "}
              <span className="text-ink-soft">
                Marked for later — notifications aren't wired up in this version, so nothing is
                actually scheduled.
              </span>
            </span>
          </label>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={!then.trim()}
              className="min-h-[48px] rounded-full bg-accent px-6 py-2.5 text-base font-medium text-accent-ink disabled:opacity-40 active:scale-[0.98]"
            >
              Save plan
            </button>
            <p className="text-xs text-ink-faint">Stays on this device.</p>
          </div>
        </section>
      )}

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
            Your plans{mounted ? ` (${plans.length})` : ""}
          </p>
          {plans.length > 0 &&
            (confirmClear ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-ink-soft">Delete all plans?</span>
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

        {!mounted ? null : plans.length === 0 ? (
          <div className="mt-3 rounded-[1.25rem] border border-dashed border-line/60 p-5 text-sm text-ink-soft">
            Nothing here yet. One tiny plan — only if you want one.
          </div>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {plans.map((p) => (
              <li key={p.id} className="rounded-[1.25rem] border border-line bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    {p.when && (
                      <p className="text-[11px] uppercase tracking-wider text-ink-faint">{p.when}</p>
                    )}
                    <p className="text-base leading-relaxed text-ink">{p.then}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => del(p.id)}
                    aria-label="Delete plan"
                    className="min-h-[32px] rounded-full border border-line px-3 py-1 text-[11px] uppercase tracking-wider text-ink-faint hover:text-ink"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-ink-soft">
                  <button
                    type="button"
                    onClick={() => flipReminder(p.id)}
                    aria-pressed={p.reminder}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 ${
                      p.reminder ? "border-accent bg-accent/15 text-ink" : "border-line text-ink-soft"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 rounded-full ${p.reminder ? "bg-accent" : "bg-ink-faint"}`}
                    />
                    Reminder marked {p.reminder ? "on" : "off"}
                  </button>
                  <span className="text-ink-faint">
                    (reminders aren't scheduled yet)
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
