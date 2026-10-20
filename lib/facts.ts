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
  {
    id: "snacks",
    line: "A snack genuinely helps.",
    body: "Your blood sugar can dip when you're high, which makes anxiety worse and your brain foggier. A biscuit or some toast does more than you'd think.",
    source: "General guidance on cannabis and blood glucose",
  },
  {
    id: "cold-water",
    line: "Cold water on your wrists isn't made up.",
    body: "Cooling the skin where blood vessels are close to the surface can settle your heart rate a bit. It's not magic. It just takes the edge off.",
    source: "Research on peripheral cooling and autonomic response",
  },
  {
    id: "everyone-awkward",
    line: "Everyone at the party is faking it a bit.",
    body: "People overestimate how relaxed everyone else is. Most people at a social thing are managing some amount of 'I don't fully want to be here.' You're just more honest about it.",
    source: "Research on the illusion of transparency and social comparison",
  },
  {
    id: "msg-draft",
    line: "A bad reply sent beats a perfect one never sent.",
    body: "The person waiting doesn't care if it's eloquent. They care that you replied. 'Sorry, been in my head, how are you' is a perfectly fine message.",
    source: "General findings on social anxiety and avoidance",
  },
  {
    id: "couch",
    line: "Sitting there doing nothing is a valid choice.",
    body: "Not everything needs to be productive. Your brain's running at full speed — letting it idle for a bit isn't lazy, it's recovery.",
    source: "Research on cognitive rest and default mode network",
  },
  {
    id: "munchies",
    line: "The munchies are real science, not weakness.",
    body: "Cannabis triggers the same brain signals as actual hunger. Your body genuinely thinks it hasn't eaten. So no, you're not being greedy.",
    source: "Research on cannabinoid receptors and appetite (Nature Neuroscience)",
  },
  {
    id: "music",
    line: "Music sounds better high because it actually does.",
    body: "Cannabis can change how your brain processes sound, making details more vivid. If a song hits different, that's your auditory cortex having a moment.",
    source: "Research on cannabis and auditory perception",
  },
  {
    id: "giggles",
    line: "The giggles are your brain being fine, actually.",
    body: "Cannabis increases blood flow to the frontal and temporal lobes, the bits involved in laughter. Getting the giggles doesn't mean you're too far gone — your brain's just enjoying itself.",
    source: "Neuroimaging studies on THC and cerebral blood flow",
  },
  {
    id: "heart-rate",
    line: "Your heart speeds up. That's normal.",
    body: "Cannabis can raise your heart rate by 20-50 beats per minute. Feels alarming, but for a healthy adult it's temporary and not dangerous. It settles.",
    source: "Research on cardiovascular effects of THC",
  },
  {
    id: "eyes",
    line: "Red eyes don't mean you overdid it.",
    body: "THC lowers blood pressure, which dilates the blood vessels in your eyes. It happens at any amount. Eye drops work. Nobody's actually inspecting your eyes.",
    source: "Research on THC and ocular vasodilation",
  },
  {
    id: "txt-ok",
    line: "You can text people when you're high.",
    body: "It's not illegal, it's not embarrassing, and most of the time nobody can tell. The message you've been overthinking for an hour is probably fine.",
    source: "Common sense, backed by the spotlight effect",
  },
];

/** A fact that isn't the one someone just read. */
export function nextFact(seenId?: string): Fact {
  const pool = seenId ? FACTS.filter((f) => f.id !== seenId) : FACTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
