// The strongest myths people hold that stop them looking at their own weeks.
// Every item here is about the LOOKING — judgement, privacy, the habit of
// noticing, what the app does and doesn't do — and never a claim about
// cannabis pharmacology, doses or health outcomes. The product vision rules
// those out; this file keeps us on that side of the line.
//
// Grown from 6 to 14 on 20 Nov 2026: the daily reframe card (below) falls
// back to this pool whenever the AI route is unreachable or not configured,
// and 6 items repeat inside a single week of daily opens — "never show the
// same generic quotation repeatedly" doesn't hold at that size. 14 covers
// two weeks before a repeat, and DailyReframe still avoids the ones a
// person has seen recently on top of that.
//
// Used in two places: the landing accordion (components/MythsSection.tsx) and
// the once-a-day reframe card at the top of the log (components/DailyReframe.tsx).
// The long-form Markdown version still lives in lib/myths.ts for /myths.

export type MythItem = {
  myth: string;    // what people believe
  reality: string; // the gentle-not-preachy reply
};

export function mythItems(): MythItem[] {
  return [
    {
      myth: "if i'm not quitting, there's no point tracking.",
      reality:
        "noticing is its own thing. most people who look at a pattern change something small — or decide they're fine — without needing a plan.",
    },
    {
      myth: "an app like this is going to judge me.",
      reality:
        "fix has no counter, no clean days, no relapse, no red. a night you smoked shows as a leaf, not a mark. the word “should” doesn't appear in anything fix says.",
    },
    {
      myth: "if i miss a few nights the whole thing is ruined.",
      reality:
        "a missed night is a dot. it's never counted as a no, and there's no catch-up quiz. three logged nights is already a pattern the card can speak to.",
    },
    {
      myth: "weed isn't a problem for me, so this isn't for me.",
      reality:
        "fix isn't for people with a problem. it's for people with a pattern — which is everyone who does anything regularly. a card saying “steady” is a complete answer.",
    },
    {
      myth: "an app with my smoking history is a leak waiting to happen.",
      reality:
        "there is nothing to leak from us. no account, no email, no server copy of the log — it lives in your browser on your device.",
    },
    {
      myth: "the ai is going to lecture me or play therapist.",
      reality:
        "fix is a chart that answers from your log. it quotes your own numbers, ends on a statement rather than a question, and stops after five a day. it won't diagnose and never messages you first.",
    },
    {
      myth: "if i can't just will myself to stop, something's wrong with me.",
      reality: "most repeated habits run on small cues, not willpower. naming the cue does more than arguing with yourself about it.",
    },
    {
      myth: "a messy week means the week was wasted.",
      reality: "a messy week still has nights in it. a pattern can show up in an imperfect week the same as a tidy one.",
    },
    {
      myth: "it's either quit completely or there's no point tracking.",
      reality: "most people land somewhere in the middle. fix doesn't ask you to pick a side before it'll show you anything.",
    },
    {
      myth: "three logged nights isn't enough to say anything real.",
      reality: "three nights is enough to notice a trigger repeating. it's not enough yet to say how often — the card is honest about that difference.",
    },
    {
      myth: "if i fall behind on logging, catching up will throw everything off.",
      reality: "there's no catch-up quiz and nothing recalculates to punish a gap. a night you didn't log is just a night with nothing in it.",
    },
    {
      myth: "the weekly card is basically a report card.",
      reality: "no grade, no pass or fail — just what you told it, read back in one place, ending on a line that leaves the meaning to you.",
    },
    {
      myth: "looking this closely at my own habit means something's wrong with me.",
      reality: "paying attention to something you do regularly isn't a verdict. it's just attention — plenty of people track things they're completely fine with.",
    },
    {
      myth: "once i see the numbers, i'll feel pressured to bring them down.",
      reality: "there's no target on screen unless you typed one in yourself. the only goal here is the one you set, in your own words.",
    },
  ];
}
