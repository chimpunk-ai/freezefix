// "Is this normal?" — the facts that surface while someone's waiting or scrolling.
//
// The whole point of this product is that nobody gets told off. So these explain what's
// happening in someone's head and why it isn't a character flaw. They never warn, never
// moralise, never mention quitting, and never give a dose, an amount or a comparison
// between substances.
//
// Rules for anything added here:
//  - General, published, uncontroversial. No numbers we can't stand behind.
//  - Hedged honestly ("tends to", "for most people"). No medical claims, no cures.
//  - It must make the reader feel more normal, not more worried. If it could scare someone
//    at 2am, it doesn't go in.
//
// Reviewed against the Safety Pack tone rules. Any new fact needs ST sign-off.

export type Fact = {
  id: string;
  /** The hook. Short enough to read in a second. */
  line: string;
  /** One or two sentences of why. Plain words, no jargon. */
  body: string;
  /** Where it comes from, in plain language. Shown to the reader. */
  source: string;
};

export const FACTS: Fact[] = [
  {
    id: "spotlight",
    line: "Nobody noticed. Genuinely.",
    body: "People consistently overestimate how much others clock what they said or did. Psychologists call it the spotlight effect, and it's one of the most reliable findings there is. Everyone's in their own head.",
    source: "Spotlight effect, Gilovich et al., social psychology research",
  },
  {
    id: "paranoia",
    line: "Feeling watched is common, and it passes.",
    body: "Feeling self-conscious or like people are looking at you is one of the most reported short-term effects of cannabis. It tends to fade as the high does.",
    source: "FRANK and NHS guidance on cannabis",
  },
  {
    id: "dose",
    line: "More doesn't mean calmer.",
    body: "Cannabis affects anxiety differently at different amounts for different people. Plenty of people find a bit settles them and more does the opposite. Not a flaw in you, just how it works.",
    source: "Published research on dose-dependent effects of THC",
  },
  {
    id: "time",
    line: "Ten minutes can feel like an hour.",
    body: "Cannabis stretches how long things feel. It's why a silence in a conversation feels enormous and why waiting for a reply is unbearable. The clock disagrees with you.",
    source: "Research on time perception under cannabis",
  },
  {
    id: "memory",
    line: "Losing your thread mid-sentence is normal.",
    body: "Short-term memory takes a hit while you're high, which is why you forget what you were saying. It comes back.",
    source: "NHS guidance on cannabis",
  },
  {
    id: "procrastination",
    line: "Procrastination isn't laziness.",
    body: "It's usually about avoiding a feeling, not avoiding work. The task makes you feel something uncomfortable, so you don't start. Knowing that is half of getting going.",
    source: "Research on procrastination and emotion regulation, Sirois and Pychyl",
  },
  {
    id: "zeigarnik",
    line: "Unfinished things nag the loudest.",
    body: "Your brain holds on to what you haven't done and drops what you have. That's why one unanswered message can take up a whole evening.",
    source: "The Zeigarnik effect",
  },
  {
    id: "start",
    line: "Starting badly beats not starting.",
    body: "Once you've begun, the thing stops feeling as big. The dread is almost always worse before the first line than after it.",
    source: "Research on task initiation and anxiety",
  },
  {
    id: "reply",
    line: "The gap feels bigger to you than to them.",
    body: "The longer a message sits, the more you think the reply has to explain it. They've almost certainly thought about it far less than you have.",
    source: "General findings on social anxiety and rumination",
  },
  {
    id: "loop",
    line: "\"Stop thinking about it\" never works.",
    body: "Trying not to think about something keeps it in mind. That's why 'just don't worry about it' never works, and why doing something small works better.",
    source: "Research on thought suppression, Wegner",
  },
  {
    id: "alone",
    line: "Most people feel this and say nothing.",
    body: "Going quiet, hanging back, not replying for days. It's far more common than anyone admits out loud, which is exactly why it feels like it's only you.",
    source: "Research on pluralistic ignorance",
  },
  {
    id: "breath",
    line: "A long breath out is the bit that works.",
    body: "Breathing out for longer than you breathe in settles your heart rate. It's the one thing in here with no catch.",
    source: "Research on paced breathing and the parasympathetic response",
  },
];

/** A fact that isn't the one someone just read. */
export function nextFact(seenId?: string): Fact {
  const pool = seenId ? FACTS.filter((f) => f.id !== seenId) : FACTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
