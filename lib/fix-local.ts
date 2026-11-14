// Fix, without a model.
//
// When the server has no model key — or the provider rejects the one it has — the
// chat used to answer with an error and nothing else. That is the worst possible
// outcome for the one button on the mirror card: the user asked one question, at
// 11:47pm, and got a dead end.
//
// This module is the honest floor. It reads the same on-device log the mirror card
// reads, and says what the numbers are, in Fix's voice: plain, lowercase, two to
// four sentences, under eighty words, ending on a statement, never a question.
// It does not pretend to be the model. It quotes the log and stops.
//
// Nothing here leaves the device, and nothing here is invented: if the week is too
// thin to say anything true, it says exactly that.

import { buildPatterns, series } from "@/lib/patterns";
import { readWeeks } from "@/lib/pattern-data";
import { enforceFixReply } from "@/lib/fix-voice";

/** Small helper so a stray "?" can never be the last character. */
function endOnStatement(text: string): string {
  let out = text.trim();
  if (!out) return "";
  out = out.replace(/\?+\s*$/, ".");
  if (!/[.!]$/.test(out)) out += ".";
  return out;
}

function spokenNumbers(weeks: ReturnType<typeof readWeeks>) {
  const s = series(weeks);
  if (!s.length) return null;
  const thisWeek = s[s.length - 1];
  const logged = thisWeek.recorded;
  const smoked = thisWeek.smoked;
  const clear = Math.max(0, logged - smoked);
  return { logged, smoked, clear, weeks: s.length };
}

/**
 * A reply built only from the user's own week. Safe to call on the client: it reads
 * localStorage and does arithmetic, nothing more.
 */
export function localFixLine(): string {
  let weeks: ReturnType<typeof readWeeks> = [];
  try {
    weeks = readWeeks(4);
  } catch {
    weeks = [];
  }

  const counts = spokenNumbers(weeks);

  // Nothing logged yet. Say so plainly rather than guessing at a pattern.
  if (!counts || counts.logged === 0) {
    return enforceFixReply(
      endOnStatement(
        "I can only see what's in your log, and this week hasn't got anything in it yet. Tap a few nights and the shape turns up on its own. Nothing to read until then."
      )
    );
  }

  const patterns = buildPatterns(weeks);

  // Enough nights to count, not enough on one side to compare. Give the count only.
  if (!patterns.length) {
    const nights = counts.logged === 1 ? "one night" : `${counts.logged} nights`;
    const smoke = counts.smoked === 1 ? "one of them" : `${counts.smoked} of them`;
    return enforceFixReply(
      endOnStatement(
        `you've logged ${nights} this week, and smoked on ${smoke}. that's the whole shape so far, and it isn't enough of a run for me to compare anything. a few more nights and the pattern does the talking.`
      )
    );
  }

  const first = patterns[0];
  const headline = first.headline.trim().replace(/\s+/g, " ");
  const detail = (first.detail || "").trim().replace(/\s+/g, " ");

  // Two sentences of the real observation, then the posture: the numbers are theirs
  // to read. Ends on a statement, never a question, and never a grade.
  const body = detail ? `${headline}. ${detail}.` : `${headline}.`;
  const close =
    "that's what the log says. I'm just a chart with manners, so the reading is yours.";

  return enforceFixReply(endOnStatement(`${body} ${close}`));
}
