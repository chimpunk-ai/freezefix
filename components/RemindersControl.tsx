"use client";

import { useEffect, useState } from "react";
import { bedtimeLabel } from "@/lib/profile";
import {
  disable,
  enable,
  getState,
  isSupported,
  needsHomeScreen,
  onBedtimeChange,
  publicKey,
  type RemindersState,
} from "@/lib/reminders";

// Settings block for the two Web Push reminders. Independent switches, both
// off by default, each explained BEFORE the browser's permission prompt with
// the exact lock-screen text so the reader can judge it before saying yes.
// Nothing about weed ever appears on a lock screen — the SW chooses the
// wording from the device clock, not from the log.

type Props = {
  bedtime: number; // 0–23 from the profile
  className?: string;
};

type Working = "" | "sunday" | "nightly";

function permissionLine(p: RemindersState["permission"]): string | null {
  if (p === "denied")
    return "notifications are blocked for this site. unblock them in your browser's site settings, then come back.";
  if (p === "unsupported")
    return "this browser doesn't do notifications. the sunday card still works — it just won't ping you.";
  return null;
}

function homeScreenLine(): string {
  return "on iphone and ipad, add fix to your home screen first (safari → share → add to home screen). notifications can only reach a web app once it's installed.";
}

export default function RemindersControl({ bedtime, className = "" }: Props) {
  const [state, setState] = useState<RemindersState | null>(null);
  const [working, setWorking] = useState<Working>("");
  const [msg, setMsg] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);

  useEffect(() => {
    // NEXT_PUBLIC_VAPID_PUBLIC_KEY is inlined at build time, so its absence is a
    // compile-time fact, not a request. Same honest "not switched on yet" state
    // /plans uses when payments are off.
    if (!publicKey()) {
      setNotConfigured(true);
      setState({ permission: "default", subscribed: false, sunday: false, nightly: false, hour: bedtime });
      return;
    }
    if (!isSupported()) {
      setState({ permission: "unsupported", subscribed: false, sunday: false, nightly: false, hour: bedtime });
      return;
    }
    setState(getState());
  }, [bedtime]);

  // If the user changes bedtime, push it to the server (only if nightly is on).
  useEffect(() => {
    if (!state || !state.nightly) return;
    if (state.hour === bedtime) return;
    void onBedtimeChange(bedtime).then(() => setState((s) => (s ? { ...s, hour: bedtime } : s)));
  }, [bedtime, state]);

  if (!state) return null;

  const toggle = async (kind: "sunday" | "nightly") => {
    if (notConfigured) {
      setMsg("reminders aren't switched on yet. nothing is stored.");
      return;
    }
    if (needsHomeScreen()) {
      setMsg(homeScreenLine());
      return;
    }
    setWorking(kind);
    setMsg(null);
    try {
      const on = kind === "sunday" ? !state.sunday : !state.nightly;
      if (on) {
        const res = await enable(kind, bedtime);
        setState(res.state);
        if (!res.ok) setMsg(enableReasonLine(res.reason));
      } else {
        setState(await disable(kind));
      }
    } catch {
      setMsg("couldn't reach the reminders service. try again in a minute.");
    } finally {
      setWorking("");
    }
  };

  function enableReasonLine(reason: "unsupported" | "home-screen" | "off" | "denied" | "not-ready" | "failed"): string {
    switch (reason) {
      case "off":
        return "reminders aren't switched on yet. nothing is stored.";
      case "home-screen":
        return homeScreenLine();
      case "unsupported":
        return "this browser doesn't do notifications.";
      case "denied":
        return "notifications are blocked. unblock them in your browser's site settings and try again.";
      case "not-ready":
        return "the service worker isn't ready. reload the page and try again.";
      case "failed":
      default:
        return "couldn't set that up right now. try again in a minute.";
    }
  }

  const chipOn = "border-accent/50 bg-accent/15 text-accent";
  const chipOff = "border-line bg-card text-ink-soft";

  return (
    <div className={className}>
      <p className="text-14 text-ink-soft">reminders</p>
      <p className="mt-1 text-12 text-ink-faint">
        both are off by default. turn one on and we&rsquo;ll explain what shows up on your lock screen before
        your browser asks you anything. nothing about weed ever appears there.
      </p>

      {notConfigured ? (
        <p className="mt-3 text-12 text-ink-faint">
          reminders aren&rsquo;t switched on yet &mdash; the sunday card and the chime still work.
        </p>
      ) : null}

      {permissionLine(state.permission) ? (
        <p className="mt-3 rounded-card border border-line bg-card px-3 py-2 text-12 text-ink-soft">
          {permissionLine(state.permission)}
        </p>
      ) : null}

      <div className="mt-4 space-y-4">
        <div className="rounded-card border border-line bg-card/70 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-14 text-ink">sunday, 8:15pm &mdash; your week is ready</p>
              <p className="mt-1 text-12 text-ink-faint">
                lock screen reads: <span className="text-ink-soft">&ldquo;fix: your week is ready.&rdquo;</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggle("sunday")}
              aria-pressed={state.sunday}
              disabled={working !== ""}
              className={[
                "ff-chip min-h-11 shrink-0 rounded-pill border px-3.5 py-2 text-14",
                state.sunday ? chipOn : chipOff,
                working === "sunday" ? "opacity-60" : "",
              ].join(" ")}
            >
              {state.sunday ? "on" : "off"}
            </button>
          </div>
        </div>

        <div className="rounded-card border border-line bg-card/70 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-14 text-ink">a nightly nudge at {bedtimeLabel(bedtime)}</p>
              <p className="mt-1 text-12 text-ink-faint">
                lock screen reads:{" "}
                <span className="text-ink-soft">&ldquo;fix: tonight&rsquo;s three taps, if you want them.&rdquo;</span>{" "}
                silent, no badge. switch off any time.
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggle("nightly")}
              aria-pressed={state.nightly}
              disabled={working !== ""}
              className={[
                "ff-chip min-h-11 shrink-0 rounded-pill border px-3.5 py-2 text-14",
                state.nightly ? chipOn : chipOff,
                working === "nightly" ? "opacity-60" : "",
              ].join(" ")}
            >
              {state.nightly ? "on" : "off"}
            </button>
          </div>
        </div>
      </div>

      {msg ? <p className="mt-3 text-12 text-frost">{msg}</p> : null}
    </div>
  );
}
