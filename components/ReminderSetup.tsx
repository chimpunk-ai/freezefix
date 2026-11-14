"use client";

import { useEffect, useState } from "react";
import {
  K_REMINDER_LAST,
  K_REMINDER_ON,
  K_REMINDER_TIME,
  reminderOn,
  reminderTime,
  showReminder,
} from "./ReminderRunner";

// The control for the one notification this app is allowed to send.
//
// Deliberately one switch and one time. There is no "how often", no weekday
// picker, no second reminder — the product promise is that the app is silent
// except at bedtime, so the settings surface can't grow into a place where you
// configure a stream of pings.

export default function ReminderSetup() {
  const [on, setOn] = useState(false);
  const [time, setTime] = useState("21:30");
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [note, setNote] = useState("");

  useEffect(() => {
    setOn(reminderOn());
    setTime(reminderTime());
    if (typeof Notification === "undefined") {
      setPermission("unsupported");
    } else {
      setPermission(Notification.permission);
    }
  }, []);

  async function enable() {
    if (typeof Notification === "undefined") {
      setNote("This browser can't show notifications. On iPhone, add Fix to your Home Screen first.");
      return;
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result !== "granted") {
      setNote("No notifications then. Everything still works without them.");
      return;
    }
    persist(true);
    setNote("On. One quiet nudge a day, at the time you picked.");
    void showReminder("that's what it'll look like.");
  }

  function persist(nextOn: boolean, nextTime?: string) {
    try {
      window.localStorage.setItem(K_REMINDER_ON, nextOn ? "yes" : "no");
      if (nextTime) window.localStorage.setItem(K_REMINDER_TIME, nextTime);
      // Turning it on should not be blocked by yesterday's "already sent" flag.
      if (nextOn) window.localStorage.removeItem(K_REMINDER_LAST);
    } catch {
      setNote("This browser is blocking local storage, so the setting can't be saved.");
    }
  }

  function turnOff() {
    persist(false);
    setOn(false);
    setNote("Off. Nothing will buzz.");
  }

  const blocked = permission === "denied" || permission === "unsupported";

  return (
    <div className="rounded-[1.75rem] border border-line bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold leading-snug text-ink">Evening nudge</p>
          <p className="mt-1 text-base leading-relaxed text-ink-soft">
            One notification a day, at the time you usually log. No streaks, no reminders about
            missing days.
          </p>
        </div>
        <span
          className={`mt-1 shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
            on ? "bg-accent text-accent-ink" : "border border-line text-ink-soft"
          }`}
        >
          {on ? "on" : "off"}
        </span>
      </div>

      <label className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3">
        <span className="text-base text-ink">Time</span>
        <input
          type="time"
          value={time}
          onChange={(e) => {
            setTime(e.target.value);
            persist(on, e.target.value);
          }}
          className="rounded-xl bg-transparent text-base font-semibold text-ink outline-none"
        />
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        {on ? (
          <button
            onClick={turnOff}
            className="rounded-2xl border border-line px-4 py-3 text-base font-semibold text-ink"
          >
            Turn off
          </button>
        ) : (
          <button
            onClick={enable}
            disabled={permission === "unsupported"}
            className="rounded-2xl bg-accent px-4 py-3 text-base font-bold text-accent-ink disabled:opacity-50"
          >
            Turn on
          </button>
        )}
        {on && (
          <button
            onClick={() => void showReminder()}
            className="rounded-2xl border border-line px-4 py-3 text-base font-semibold text-ink"
          >
            Send one now
          </button>
        )}
      </div>

      {note && <p className="mt-3 text-sm leading-relaxed text-ink-soft">{note}</p>}

      {blocked && !note && (
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          {permission === "unsupported"
            ? "On iPhone, notifications only work after you add Fix to your Home Screen."
            : "Notifications are blocked for this site in your browser settings. You can allow them there."}
        </p>
      )}

      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Reminders arrive when you open the app, or while it&apos;s open in the evening. No server
        holds your schedule, so there&apos;s nothing to leak.
      </p>
    </div>
  );
}
