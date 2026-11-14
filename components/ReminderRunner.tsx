"use client";

import { useEffect } from "react";

// Fires the daily reminder.
//
// The honest constraint: a browser cannot wake itself up to notify you. Only a
// server-side push subscription can do that, and this product deliberately has
// no server that knows your schedule. So the reminder fires when the app is
// opened at or after the time you picked — which, for a phone with the icon on
// the home screen, is usually the moment you were going to log anyway.
//
// This is stated plainly on the install page rather than promised as something
// it can't do.

export const K_REMINDER_TIME = "ff_reminder_time";
export const K_REMINDER_ON = "ff_reminder_on";
export const K_REMINDER_LAST = "ff_reminder_last";

export function todayKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function reminderTime(): string {
  try {
    return window.localStorage.getItem(K_REMINDER_TIME) || "21:30";
  } catch {
    return "21:30";
  }
}

export function reminderOn(): boolean {
  try {
    return window.localStorage.getItem(K_REMINDER_ON) === "yes";
  } catch {
    return false;
  }
}

/** Ask the service worker to show the reminder. Falls back to a direct notification. */
export async function showReminder(body?: string): Promise<boolean> {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return false;
  const title = "three taps when you're ready";
  const text = body || "no rush.";
  try {
    const reg = await navigator.serviceWorker?.ready;
    if (reg?.active) {
      reg.active.postMessage({ type: "reminder", title, body: text, url: "/app" });
      return true;
    }
  } catch {
    /* fall through to the direct path */
  }
  try {
    new Notification(title, { body: text, icon: "/icon-192.png" });
    return true;
  } catch {
    return false;
  }
}

export default function ReminderRunner() {
  useEffect(() => {
    if (typeof Notification === "undefined") return;

    const run = () => {
      if (!reminderOn()) return;
      if (Notification.permission !== "granted") return;
      try {
        // Once a day, at the time they chose, and never a second time.
        if (window.localStorage.getItem(K_REMINDER_LAST) === todayKey()) return;
        const [rawH, rawM] = reminderTime().split(":");
        const due = new Date();
        due.setHours(Number(rawH) || 21, Number(rawM) || 30, 0, 0);
        if (Date.now() < due.getTime()) return;
        void showReminder();
        window.localStorage.setItem(K_REMINDER_LAST, todayKey());
      } catch {
        /* storage blocked: stay silent rather than risk a loop of notifications */
      }
    };

    run();
    // Coming back to the app later the same evening is the common case: the
    // timer was throttled in the background, so re-check on becoming visible.
    const onVisible = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  return null;
}
