"use client";

import type { Memory } from "@/lib/persona";

// What Fix remembers. It lives on this device only: nothing is uploaded, nothing is kept on
// our servers. It travels in the prompt for one call and is gone again.
// That means it doesn't follow someone to a new phone, which is the honest trade for not
// holding a profile of anyone.

const KEY = "ff_memory";
const ON = "ff_memory_on";

export function memoryOn(): boolean {
  try {
    return window.localStorage.getItem(ON) !== "no";
  } catch {
    return false;
  }
}

export function setMemoryOn(on: boolean) {
  try {
    window.localStorage.setItem(ON, on ? "yes" : "no");
    if (!on) window.localStorage.removeItem(KEY);
  } catch {
    /* storage can be blocked; the app still works without memory */
  }
}

export function loadMemory(): Memory | null {
  if (!memoryOn()) return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Memory) : null;
  } catch {
    return null;
  }
}

export function saveMemory(m: Memory) {
  if (!memoryOn()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(m));
  } catch {
    /* ignore */
  }
}

export function forgetAll() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

// Adds one thing Fix suggested keeping, newest last, oldest dropped.
export function remember(line: string) {
  const m = loadMemory() ?? {};
  const worked = [...(m.worked ?? []), line].slice(-8);
  saveMemory({ ...m, worked });
}

export function forgetOne(index: number) {
  const m = loadMemory();
  if (!m?.worked) return;
  saveMemory({ ...m, worked: m.worked.filter((_, i) => i !== index) });
}

// Everything Fix knows, as plain lines the user can read and delete one by one.
export type MemoryLine = { label: string; value: string; clear: () => void };

export function readableMemory(): MemoryLine[] {
  const m = loadMemory();
  if (!m) return [];
  const out: MemoryLine[] = [];
  const drop = (k: keyof Memory) => () => {
    const cur = loadMemory() ?? {};
    delete cur[k];
    saveMemory(cur);
  };
  if (m.name) out.push({ label: "Your name", value: m.name, clear: drop("name") });
  if (m.triggers) out.push({ label: "What sets it off", value: m.triggers, clear: drop("triggers") });
  if (m.when) out.push({ label: "When it hits", value: m.when, clear: drop("when") });
  if (m.wants) out.push({ label: "What you want help with", value: m.wants, clear: drop("wants") });
  (m.people ?? []).forEach((p, i) =>
    out.push({
      label: p.who ? `Someone you mentioned (${p.who})` : "Someone you mentioned",
      value: [p.name, p.note].filter(Boolean).join(" — "),
      clear: () => {
        const cur = loadMemory() ?? {};
        saveMemory({ ...cur, people: (cur.people ?? []).filter((_, j) => j !== i) });
      },
    })
  );
  (m.coming ?? []).forEach((c, i) =>
    out.push({
      label: "Coming up",
      value: `${c.what} (${c.when})`,
      clear: () => {
        const cur = loadMemory() ?? {};
        saveMemory({ ...cur, coming: (cur.coming ?? []).filter((_, j) => j !== i) });
      },
    })
  );
  (m.worked ?? []).forEach((w, i) =>
    out.push({ label: "Worth remembering", value: w, clear: () => forgetOne(i) })
  );
  return out;
}

// Called when a session ends well, so the greeting can pick up where things left off.
export function noteVisit(mood?: string) {
  const m = loadMemory();
  if (!m && !memoryOn()) return;
  saveMemory({ ...(m ?? {}), lastSeen: new Date().toISOString().slice(0, 10), lastMood: mood });
}

export function greeting(name?: string): string {
  const m = loadMemory();
  const displayName = name || m?.name;
  const hour = new Date().getHours();
  const part = hour < 5 ? "Late one" : hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  return displayName ? `${part}, ${displayName}.` : `${part}.`;
}
