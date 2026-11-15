"use client";

import { useState } from "react";
import { readEntries } from "@/lib/entry";
import { readProfile } from "@/lib/profile";
import { readChimePref } from "@/lib/chime-pref";

// Export the whole on-device log as JSON. Everything Fix stores for this
// person is in localStorage; this just reads it, wraps it with a schema
// version + a timestamp, and hands it to the browser as a file download.
//
// Why JSON (not CSV, not PDF): the entries have variable fields (a note of up
// to 160 chars, 0-3 trigger chips, a goal tick, a mood face, a date). JSON
// keeps that shape. A later version can add a CSV path from the same source
// of truth. The format is documented at the top of the file so a GP, a
// researcher or the reader can read it without us.
//
// What IS in the export:
//   - every night logged (date, smoked y/n, mood, chips, goal tick, note)
//   - the device profile (made-up name, bedtime, "one thing", goal history)
//   - the chime preference
// What is NOT in the export (because it was never on the device):
//   - anything Fix AI said back; no server-side record exists
//   - the Sunday mirror cards (those are computed on-the-fly from entries)
//
// No network: the function runs entirely client-side. No server sees the
// export; the browser's save dialog is where it goes.

type ExportBundle = {
  app: "Fix";
  schema: 1;
  exportedAt: string;
  profile: ReturnType<typeof readProfile>;
  chime: ReturnType<typeof readChimePref>;
  entries: ReturnType<typeof readEntries>;
  notes: string[];
};

function buildBundle(): ExportBundle {
  return {
    app: "Fix",
    schema: 1,
    exportedAt: new Date().toISOString(),
    profile: readProfile(),
    chime: readChimePref(),
    entries: readEntries(),
    notes: [
      "This file is everything Fix stores on this device.",
      "Dates are local calendar dates (YYYY-MM-DD). Missing dates are days never logged.",
      "mood: 1 (worst) to 5 (best). smoked: true/false. chips: short tags from a fixed list.",
      "goalDone: true/false/null (null when no 'one thing' was set that day).",
      "There is no server copy. Deleting this file deletes the only copy.",
    ],
  };
}

function filename(now: Date): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `fix-export-${y}-${m}-${d}.json`;
}

export default function ExportButton({ className = "" }: { className?: string }) {
  const [state, setState] = useState<"idle" | "working" | "done">("idle");

  function run() {
    setState("working");
    try {
      const bundle = buildBundle();
      const text = JSON.stringify(bundle, null, 2);
      const blob = new Blob([text], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename(new Date());
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke on the next frame so the download has actually started.
      requestAnimationFrame(() => URL.revokeObjectURL(url));
      setState("done");
      window.setTimeout(() => setState("idle"), 4000);
    } catch {
      setState("idle");
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={run}
        disabled={state === "working"}
        className="ff-chip inline-flex min-h-11 items-center rounded-pill border border-line bg-card px-4 text-14 text-ink no-underline hover:border-ink-faint"
      >
        {state === "done" ? "saved to your downloads" : state === "working" ? "building…" : "download your log"}
      </button>
      <p className="mt-2 max-w-[42ch] text-12 text-ink-faint">
        a json file of every night you&rsquo;ve logged, your name, your bedtime and your one thing. nothing is sent;
        the file goes straight to your downloads and can be opened in a text editor, a spreadsheet (via a json-to-csv
        step) or shown to a doctor.
      </p>
    </div>
  );
}
