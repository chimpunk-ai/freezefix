// A single, honest "this came up a lot" callout for the Sunday card (task
// 39/step 23 of the 50-step plan, 20 Nov 2026) — "a person/topic that keeps
// coming up," read straight from the person's own notes, not inferred or
// diagnosed. Same rule as lib/pattern.ts: plain arithmetic on the user's own
// words, no model, no psychoanalysis. If a word shows up in several of the
// week's notes, we say so and name the word; we never guess why, and we
// never say anything when nothing actually recurs.
//
// Deliberately NOT folded into lib/pattern.ts's WeekStats: that type (and
// everything downstream of it — Fix's context, the shelf cards) is keyed off
// DayCell, which has no note text. Reading straight from Entries keeps this
// self-contained and easy to test in isolation.

import type { Entries } from "./entry";

export type RecurringTheme = {
  /** The word itself, lowercased, as it should be shown (quoted) to the person. */
  word: string;
  /** How many distinct nights in the window it showed up in. */
  nights: number;
};

/** A night needs to repeat a word across at least this many DIFFERENT
 *  nights before it counts as "keeps coming up" — one rambly note using a
 *  word five times is one night, not a pattern. Three is the same
 *  conservative bar lib/pattern.ts's MIN_MOOD_SAMPLES uses for "enough to
 *  say something." */
const MIN_RECURRING_NIGHTS = 3;

/** Words too short to carry a topic or a name on their own ("in", "out",
 *  "mom" is 3 and stays). Filters noise without needing a dictionary. */
const MIN_WORD_LENGTH = 3;

// Function words and app-generic filler that would otherwise dominate every
// week's notes without saying anything real. NOT mood/trigger words
// ("stressed", "anxious", "tired") — those are real signal and already have
// their own chip-based surface (WeekInsights' trigger mix); excluding them
// here too would just hide the same fact twice over, so they're left in.
const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "so", "if", "of", "to", "in", "on",
  "at", "by", "for", "with", "about", "against", "between", "into",
  "through", "during", "before", "after", "above", "below", "from", "up",
  "down", "out", "off", "over", "under", "again", "further", "then", "once",
  "here", "there", "when", "where", "why", "how", "all", "any", "both",
  "each", "few", "more", "most", "other", "some", "such", "no", "nor",
  "not", "only", "own", "same", "than", "too", "very", "can", "will",
  "just", "should", "now", "i", "im", "ive", "id", "me", "my", "myself",
  "we", "our", "ours", "you", "your", "yours", "he", "him", "his", "she",
  "her", "hers", "it", "its", "they", "them", "their", "this", "that",
  "these", "those", "am", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "having", "do", "does", "did", "doing",
  "would", "could", "might", "must", "shall", "today", "tonight",
  "yesterday", "day", "night", "really", "still", "also", "like",
  "felt", "feel", "feeling", "feels", "bit", "lot", "much", "went", "got",
  "get", "didnt", "dont", "wasnt", "couldnt",
]);

/** Pull the set of qualifying words out of one note -- lowercased,
 *  punctuation stripped, stopwords and short words dropped, deduplicated
 *  (so a word used twice in one note still counts once toward "how many
 *  nights"). */
function wordsIn(note: string): Set<string> {
  const out = new Set<string>();
  for (const raw of note.toLowerCase().split(/[^a-z0-9']+/)) {
    const w = raw.replace(/^'+|'+$/g, "");
    if (w.length < MIN_WORD_LENGTH) continue;
    if (STOPWORDS.has(w)) continue;
    out.add(w);
  }
  return out;
}

/**
 * The single word that recurred most across the week's notes, or null when
 * nothing clears the bar (most weeks, by design — this is for the genuine
 * "huh, that keeps coming up" moment, not a word cloud of every week).
 *
 * `start`/`end` are inclusive YYYY-MM-DD bounds, same convention as
 * lib/pattern.ts's WeekStats. Ties break on whichever word was said first
 * in the window, so the result is stable across re-renders of the same log.
 */
export function recurringTheme(entries: Entries, start: string, end: string): RecurringTheme | null {
  const nightsFor = new Map<string, number>();
  const firstSeenAt = new Map<string, number>(); // word -> index of the day it first appeared, for a stable tie-break
  let dayIndex = 0;

  for (const [day, entry] of Object.entries(entries).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))) {
    if (day < start || day > end) continue;
    const note = entry.note;
    if (!note) {
      dayIndex++;
      continue;
    }
    for (const w of wordsIn(note)) {
      nightsFor.set(w, (nightsFor.get(w) ?? 0) + 1);
      if (!firstSeenAt.has(w)) firstSeenAt.set(w, dayIndex);
    }
    dayIndex++;
  }

  let best: RecurringTheme | null = null;
  let bestFirstSeen = Infinity;
  for (const [word, nights] of nightsFor) {
    if (nights < MIN_RECURRING_NIGHTS) continue;
    const seenAt = firstSeenAt.get(word) ?? Infinity;
    if (!best || nights > best.nights || (nights === best.nights && seenAt < bestFirstSeen)) {
      best = { word, nights };
      bestFirstSeen = seenAt;
    }
  }
  return best;
}
