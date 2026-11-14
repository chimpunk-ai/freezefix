"use client";

// Tolerant reader for what is already on the device.
//
// The pattern engine is pure, so something has to hand it the raw taps. This is
// that something, and it is deliberately forgiving: the app has written these
// stores in a few shapes over time (a plain date map, or a map nested under
// log/entries/days, values as strings or small objects), and a phone that has
// been through a couple of versions should still open its own history.

import { buildWeeks, type Checkins, type Nights, type Week } from "@/lib/patterns";

const CHECKINS_KEY = "ff_checkins";
const NIGHTS_KEY = "ff_nights";

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function load(key: string): unknown {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as unknown) : null;
  } catch {
    return null;
  }
}

/** Accepts `{ "2026-11-09": ... }` or `{ log: {...} }` / `{ entries: {...} }`. */
function rows(raw: unknown): Record<string, unknown> {
  if (!isObj(raw)) return {};
  for (const key of ["log", "entries", "days", "nights", "data", "map"]) {
    const inner = raw[key];
    if (isObj(inner)) return inner;
    if (Array.isArray(inner)) {
      const out: Record<string, unknown> = {};
      for (const item of inner) {
        if (!isObj(item)) continue;
        const day = item.day ?? item.date ?? item.iso ?? item.key;
        if (typeof day === "string") out[day] = item;
      }
      return out;
    }
  }
  return raw;
}

function answerOf(v: unknown): "yes" | "no" | null {
  if (v === "yes" || v === true) return "yes";
  if (v === "no" || v === false) return "no";
  if (isObj(v)) {
    const inner = v.answer ?? v.value ?? v.smoked ?? v.used;
    if (inner === "yes" || inner === true) return "yes";
    if (inner === "no" || inner === false) return "no";
  }
  return null;
}

export function readPatternData(): { checkins: Checkins; nights: Nights } {
  const checkins: Checkins = {};
  for (const [key, value] of Object.entries(rows(load(CHECKINS_KEY)))) {
    if (!DAY_RE.test(key)) continue;
    const a = answerOf(value);
    if (a) checkins[key] = a;
  }

  const nights: Nights = {};
  for (const [key, value] of Object.entries(rows(load(NIGHTS_KEY)))) {
    if (!DAY_RE.test(key) || !isObj(value)) continue;
    const mood = typeof value.mood === "number" ? value.mood : undefined;
    const rawTriggers = value.triggers ?? value.ctx ?? value.contexts ?? value.tags;
    const triggers = Array.isArray(rawTriggers)
      ? rawTriggers.filter((t): t is string => typeof t === "string")
      : [];
    nights[key] = mood === undefined ? { triggers } : { mood, triggers };
  }

  return { checkins, nights };
}

/** The last `count` weeks, oldest first, straight from the device. */
export function readWeeks(count = 8, now: Date = new Date()): Week[] {
  const { checkins, nights } = readPatternData();
  return buildWeeks(checkins, nights, now, count);
}
