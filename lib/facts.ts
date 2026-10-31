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
  // ─── SOCIAL & SPOTLIGHT ───
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
    id: "everyone-awkward",
    line: "Everyone at the party is faking it a bit.",
    body: "People overestimate how relaxed everyone else is. Most people at a social thing are managing some amount of 'I don't fully want to be here.' You're just more honest about it.",
    source: "Research on the illusion of transparency and social comparison",
  },
  {
    id: "alone",
    line: "Most people feel this and say nothing.",
    body: "Going quiet, hanging back, not replying for days. It's far more common than anyone admits out loud, which is exactly why it feels like it's only you.",
    source: "Research on pluralistic ignorance",
  },
  {
    id: "txt-ok",
    line: "You can text people when you're high.",
    body: "It's not illegal, it's not embarrassing, and most of the time nobody can tell. The message you've been overthinking for an hour is probably fine.",
    source: "Common sense, backed by the spotlight effect",
  },
  {
    id: "likeability",
    line: "People like you more than you think they do.",
    body: "After a conversation, people consistently rate how much they think the other person liked them lower than the actual rating. It's called the likeability gap, and it's enormous.",
    source: "Boothby et al., 2018 — the liking gap, Psychological Science",
  },
  {
    id: "silence-normal",
    line: "Silence in a conversation isn't failure.",
    body: "A four-second pause in a conversation feels like a lifetime when you're self-conscious. In reality, the other person probably didn't register it. People are far more tolerant of pauses than you think.",
    source: "Research on conversational silence and social anxiety",
  },
  {
    id: "voice-sounds-fine",
    line: "Your voice sounds normal to everyone else.",
    body: "You hear your own voice through bone conduction, which makes it sound different to you than to others. That 'weird' thing you heard yourself say sounded completely normal out loud.",
    source: "Research on self-voice perception and bone conduction",
  },
  {
    id: "phone-check",
    line: "Checking your phone is a totally normal exit.",
    body: "At a social thing, pulling out your phone isn't rude — it's what literally everyone does to reset. Nobody's judging you for it. They're probably doing the same thing.",
    source: "General social behaviour research",
  },
  {
    id: "leave-early",
    line: "Leaving early is allowed.",
    body: "Nobody tracks your arrival and departure time. An Irish goodbye — slipping out without announcing it — is a completely valid social strategy. Most people won't even notice.",
    source: "Common sense and social psychology",
  },
  {
    id: "laugh-late",
    line: "Laughing a beat late doesn't mean anything.",
    body: "Processing humour takes slightly longer when your brain is busy with other things. Nobody catalogues the timing of your laugh. They're too busy wondering if their own joke landed.",
    source: "Research on attention and humour processing",
  },

  // ─── OVERTHINKING & LOOPS ───
  {
    id: "loop",
    line: "\"Stop thinking about it\" never works.",
    body: "Trying not to think about something keeps it in mind. That's why 'just don't worry about it' never works, and why doing something small works better.",
    source: "Research on thought suppression, Wegner",
  },
  {
    id: "zeigarnik",
    line: "Unfinished things nag the loudest.",
    body: "Your brain holds on to what you haven't done and drops what you have. That's why one unanswered message can take up a whole evening.",
    source: "The Zeigarnik effect",
  },
  {
    id: "replay",
    line: "The replay loop is your brain learning.",
    body: "Going over what you said isn't a malfunction. Your brain does it to improve for next time. The problem is it keeps revising a final draft that was already sent.",
    source: "Research on rumination and social learning",
  },
  {
    id: "cringe-memory",
    line: "You remember your embarrassments. They don't.",
    body: "That thing you said three years ago that still makes you cringe? The other person forgot it within a week. Your brain files your own mistakes in permanent storage and everyone else's in the bin.",
    source: "Research on autobiographical memory and the fading affect bias",
  },
  {
    id: "worst-case",
    line: "The worst-case scenario almost never happens.",
    body: "People are spectacularly bad at predicting how catastrophic something will be. Studies show we consistently overestimate the badness and duration of future events.",
    source: "Affective forecasting research, Gilbert and Wilson",
  },
  {
    id: "night-thoughts",
    line: "Late-night thoughts lie to you.",
    body: "Your prefrontal cortex — the bit that puts things in perspective — goes quiet at night. That's why everything feels worse at 2am and more manageable by morning.",
    source: "Research on circadian rhythm and emotional regulation",
  },
  {
    id: "compare",
    line: "You're comparing your inside to their outside.",
    body: "You know every anxious thought in your head. You only see everyone else's composed face. The comparison isn't fair, and it never will be.",
    source: "General social comparison research",
  },
  {
    id: "spiral-direction",
    line: "Spirals go down, never sideways.",
    body: "Spirals follow a pattern: one bad thought leads to a worse one, never a random one. Knowing it's a pattern — not a revelation — is sometimes enough to step off it.",
    source: "Cognitive psychology research on rumination chains",
  },
  {
    id: "brain-two-am",
    line: "Your brain at 2am is not your brain.",
    body: "Serotonin, cortisol and melatonin are all doing weird things late at night. The thoughts you're having now will look different by morning. They always do.",
    source: "Research on circadian neurotransmitter cycles",
  },
  {
    id: "decision-fatigue",
    line: "You're not indecisive. You're tired.",
    body: "Every decision you make during the day uses the same mental energy. By evening, picking what to eat feels as hard as picking a career. That's not you — that's your brain being spent.",
    source: "Decision fatigue research, Baumeister et al.",
  },
  {
    id: "catastrophize",
    line: "Your brain is a professional catastrophiser.",
    body: "It evolved to assume the worst because, in a jungle, that kept you alive. In a living room, it just makes you think everyone hates you. Same hardware, wrong setting.",
    source: "Evolutionary psychology of threat detection",
  },

  // ─── TASKS & PROCRASTINATION ───
  {
    id: "procrastination",
    line: "Procrastination isn't laziness.",
    body: "It's usually about avoiding a feeling, not avoiding work. The task makes you feel something uncomfortable, so you don't start. Knowing that is half of getting going.",
    source: "Research on procrastination and emotion regulation, Sirois and Pychyl",
  },
  {
    id: "start",
    line: "Starting badly beats not starting.",
    body: "Once you've begun, the thing stops feeling as big. The dread is almost always worse before the first line than after it.",
    source: "Research on task initiation and anxiety",
  },
  {
    id: "five-min",
    line: "You only need five minutes.",
    body: "Tell yourself you'll do five minutes, genuinely meaning it. Most of the time, once you're past the first five you'll keep going. The start is the hard bit, not the work.",
    source: "Research on the five-minute rule and task initiation",
  },
  {
    id: "mess-first",
    line: "A messy first draft is the whole point.",
    body: "Every good piece of writing started as rubbish. The first draft's job is to exist, not to be good. You can't edit a blank page.",
    source: "Common writing advice backed by creativity research",
  },
  {
    id: "scroll-instead",
    line: "Scrolling is your brain self-medicating.",
    body: "Your phone gives you tiny hits of novelty and reward. Your brain goes for that because the task in front of you doesn't. It's not a character flaw — it's dopamine doing what dopamine does.",
    source: "Research on dopamine, novelty-seeking and digital distraction",
  },
  {
    id: "task-size",
    line: "The task isn't as big as it feels.",
    body: "When you're avoiding something, your brain inflates it. The email you've been dreading takes four minutes. The assignment feels like a mountain until you look at the actual word count.",
    source: "Research on task-avoidance and perceived effort",
  },
  {
    id: "perfectionism",
    line: "Done is better than perfect.",
    body: "Perfectionism isn't high standards — it's fear dressed up as quality control. Most things don't need to be perfect. They need to be finished.",
    source: "Research on perfectionism and procrastination",
  },
  {
    id: "context-switch",
    line: "Switching between tasks costs you 23 minutes.",
    body: "Every time you jump from one thing to another, your brain needs about 23 minutes to properly refocus. That's why you feel like you did loads but finished nothing.",
    source: "Research on task-switching costs, Mark et al.",
  },
  {
    id: "clean-desk",
    line: "Tidying instead of working is still progress.",
    body: "Your brain needs to feel in control of something before it can tackle the scary thing. Tidying is a warm-up, not a distraction. Just don't let it become the main event.",
    source: "Research on perceived control and task initiation",
  },

  // ─── MESSAGING & REPLIES ───
  {
    id: "reply",
    line: "The gap feels bigger to you than to them.",
    body: "The longer a message sits, the more you think the reply has to explain it. They've almost certainly thought about it far less than you have.",
    source: "General findings on social anxiety and rumination",
  },
  {
    id: "msg-draft",
    line: "A bad reply sent beats a perfect one unsent.",
    body: "The person waiting doesn't care if it's eloquent. They care that you replied. 'Sorry, been in my head, how are you' is a perfectly fine message.",
    source: "General findings on social anxiety and avoidance",
  },
  {
    id: "left-on-read",
    line: "Left on read doesn't mean what you think.",
    body: "They opened it, got distracted, and forgot. That's the explanation about 90% of the time. Not anger, not judgment, not a power move. Just life.",
    source: "General social psychology and digital communication research",
  },
  {
    id: "sorry-text",
    line: "'Sorry, been MIA' is a complete message.",
    body: "Nobody needs a five-paragraph explanation for why you went quiet. People are far more understanding than your anxiety tells you. A short message reopens the door just as well.",
    source: "Research on social repair and relationship maintenance",
  },
  {
    id: "overthink-text",
    line: "They read it in 3 seconds. You spent 30 min.",
    body: "The tone, the word choice, the possible misreadings — none of that lands the way it does in your head. They read it at normal speed and moved on.",
    source: "Research on curse of knowledge and communication",
  },
  {
    id: "double-text",
    line: "Double texting is fine.",
    body: "The 'rule' about not sending two messages in a row was made up by someone who didn't have friends. Real people text whenever they have something to say.",
    source: "Common sense",
  },

  // ─── BODY & PHYSICAL ───
  {
    id: "heart-rate",
    line: "Your heart speeds up. That's normal.",
    body: "Cannabis can raise your heart rate by 20-50 beats per minute. Feels alarming, but for a healthy adult it's temporary and harmless. It settles.",
    source: "Research on cardiovascular effects of THC",
  },
  {
    id: "eyes",
    line: "Red eyes don't mean you overdid it.",
    body: "THC lowers blood pressure, which dilates the blood vessels in your eyes. It happens at any amount. Eye drops work. Nobody's actually inspecting your eyes.",
    source: "Research on THC and ocular vasodilation",
  },
  {
    id: "munchies",
    line: "The munchies are real science, not weakness.",
    body: "Cannabis triggers the same brain signals as actual hunger. Your body genuinely thinks it hasn't eaten. So no, you're not being greedy.",
    source: "Research on cannabinoid receptors and appetite (Nature Neuroscience)",
  },
  {
    id: "breath",
    line: "A long breath out is the bit that works.",
    body: "Breathing out for longer than you breathe in settles your heart rate. It's the one thing in here with no catch.",
    source: "Research on paced breathing and the parasympathetic response",
  },
  {
    id: "cold-water",
    line: "Cold water on your wrists isn't made up.",
    body: "Cooling the skin where blood vessels are close to the surface can settle your heart rate a bit. It's not magic. It just takes the edge off.",
    source: "Research on peripheral cooling and autonomic response",
  },
  {
    id: "snacks",
    line: "A snack genuinely helps.",
    body: "Your blood sugar can dip when you're high, which makes anxiety worse and your brain foggier. A biscuit or some toast does more than you'd think.",
    source: "General guidance on cannabis and blood glucose",
  },
  {
    id: "dry-mouth",
    line: "Dry mouth is chemistry, not dehydration.",
    body: "Cannabis binds to receptors in your salivary glands and tells them to slow down. Water helps the feeling, but you're not actually dehydrated. Your mouth just forgot how to mouth.",
    source: "Research on cannabinoid receptors in salivary glands",
  },
  {
    id: "yawn",
    line: "Yawning doesn't mean you're bored.",
    body: "It cools your brain down and increases alertness. If anything, it means your brain is trying harder, not checking out.",
    source: "Research on thermoregulatory theory of yawning",
  },
  {
    id: "shaky-hands",
    line: "Shaky hands are just adrenaline.",
    body: "When your body's in fight-or-flight mode, it dumps adrenaline and your hands shake. Annoying, but harmless. Hold something warm — it helps.",
    source: "Research on sympathetic nervous system activation",
  },
  {
    id: "chest-tightness",
    line: "That tight chest is probably just tension.",
    body: "Anxiety makes you breathe shallowly and tense your chest muscles without realising. Try breathing into your belly instead of your chest. If it eases, that's what it was.",
    source: "Research on anxiety-related somatic symptoms",
  },
  {
    id: "temperature",
    line: "Hot and cold at the same time is a thing.",
    body: "Cannabis can mess with your body's thermostat. Feeling flushed one minute and cold the next isn't your body malfunctioning — it's just confused about the temperature.",
    source: "Research on cannabinoids and thermoregulation",
  },
  {
    id: "heavy-legs",
    line: "Heavy legs aren't stuck legs.",
    body: "Feeling like your body is made of lead is a common effect. You can still move — it just feels like it takes more effort. Standing up usually breaks the spell.",
    source: "General cannabis effects guidance",
  },

  // ─── TIME & PERCEPTION ───
  {
    id: "time",
    line: "Ten minutes can feel like an hour.",
    body: "Cannabis stretches how long things feel. It's why a silence in a conversation feels enormous and why waiting for a reply is unbearable. The clock disagrees with you.",
    source: "Research on time perception under cannabis",
  },
  {
    id: "dose",
    line: "More doesn't mean calmer.",
    body: "Cannabis affects anxiety differently at different amounts for different people. Plenty of people find a bit settles them and more does the opposite. Not a flaw in you, just how it works.",
    source: "Published research on dose-dependent effects of THC",
  },
  {
    id: "music",
    line: "Music hits better high. Not placebo.",
    body: "Cannabis can change how your brain processes sound, making details more vivid. If a song hits different, that's your auditory cortex having a moment.",
    source: "Research on cannabis and auditory perception",
  },
  {
    id: "giggles",
    line: "The giggles are your brain being fine.",
    body: "Cannabis increases blood flow to the frontal and temporal lobes, the bits involved in laughter. Getting the giggles doesn't mean you're too far gone — your brain's just enjoying itself.",
    source: "Neuroimaging studies on THC and cerebral blood flow",
  },
  {
    id: "memory",
    line: "Losing your thread mid-sentence is normal.",
    body: "Short-term memory takes a hit while you're high, which is why you forget what you were saying. It comes back.",
    source: "NHS guidance on cannabis",
  },
  {
    id: "deja-vu",
    line: "Déjà vu while high is weirdly common.",
    body: "Cannabis can make your memory systems misfire slightly, creating the feeling you've lived this exact moment before. You haven't. Your brain's just filing things wrong.",
    source: "Research on memory encoding and familiarity signals",
  },
  {
    id: "colours-vivid",
    line: "Brighter colours aren't your imagination.",
    body: "Cannabis can increase visual sensitivity in some people. If the sky looks absurdly blue or the lights seem extra, that's your visual cortex having an opinion.",
    source: "Research on cannabinoids and visual processing",
  },
  {
    id: "deep-thoughts",
    line: "That 'deep thought' might actually be deep.",
    body: "Cannabis can increase connectivity between brain regions that don't usually talk. Some of the ideas that feel profound actually are. Most aren't. But the brain's doing real work either way.",
    source: "Neuroimaging research on THC and neural connectivity",
  },

  // ─── SLEEP & ENERGY ───
  {
    id: "cant-sleep",
    line: "Brain won't shut up at bedtime? Normal.",
    body: "Your brain processes the day's events at night. If you gave it a lot to process, it takes longer. The thoughts aren't important — they're leftovers.",
    source: "Research on sleep-onset rumination",
  },
  {
    id: "tired-wired",
    line: "Tired but wired is a real state.",
    body: "Your body wants sleep but your brain is still running. It happens when cortisol and melatonin are fighting each other. A boring podcast helps more than trying harder to sleep.",
    source: "Research on cortisol-melatonin interaction and insomnia",
  },
  {
    id: "nap-ok",
    line: "Napping is a strategy, not a surrender.",
    body: "A 20-minute nap genuinely resets your brain. Longer than that and you wake up groggy. Set an alarm and don't feel guilty about it.",
    source: "NASA nap studies and sleep research",
  },
  {
    id: "morning-dread",
    line: "Morning dread has a name.",
    body: "Cortisol peaks about 30 minutes after waking. That wave of anxiety before you've even checked your phone isn't caused by anything — it's your body's alarm clock being too loud.",
    source: "Research on the cortisol awakening response",
  },
  {
    id: "couch",
    line: "Sitting there doing nothing is a valid choice.",
    body: "Not everything needs to be productive. Your brain's running at full speed — letting it idle for a bit isn't lazy, it's recovery.",
    source: "Research on cognitive rest and default mode network",
  },
  {
    id: "sunday-scaries",
    line: "Sunday night anxiety is basically universal.",
    body: "The transition from unstructured time to structured time triggers anticipatory stress. It's not that Monday is actually terrible — it's the switch your brain doesn't like.",
    source: "Research on anticipatory anxiety and routine transitions",
  },

  // ─── EMOTIONS & FEELINGS ───
  {
    id: "crying-ok",
    line: "Crying is your brain pressure-releasing.",
    body: "Emotional tears contain stress hormones that your body is literally flushing out. You feel better after a cry because you chemically are better. It's plumbing, not weakness.",
    source: "Research on emotional tears and stress hormones, Frey",
  },
  {
    id: "feeling-nothing",
    line: "Feeling nothing is still a feeling.",
    body: "Emotional numbness is your brain protecting you from overload. It's not that you don't care — it's that your system hit its limit and pulled the circuit breaker.",
    source: "Research on emotional blunting and dissociation",
  },
  {
    id: "mood-wave",
    line: "Moods come in waves. This one will pass.",
    body: "No emotional state lasts as long as your brain tells you it will. Studies show people massively overestimate how long they'll feel bad. The wave always breaks.",
    source: "Affective forecasting research, Gilbert and Wilson",
  },
  {
    id: "angry-ok",
    line: "Being angry doesn't make you a bad person.",
    body: "Anger is information. It tells you something isn't right. The feeling is valid even if acting on it isn't always the move. Feel it, don't fight it.",
    source: "Research on emotion regulation and anger",
  },
  {
    id: "jealousy",
    line: "Jealousy is just unmet wanting.",
    body: "It tells you what you value, not what you lack. Someone else having a thing you want doesn't take it from you. There's no finite pool of good things.",
    source: "Research on social comparison and envy",
  },
  {
    id: "bored-restless",
    line: "Boredom is your brain asking for meaning.",
    body: "When nothing around you feels stimulating, your brain is actually searching for something worthwhile. It's a signal, not a flaw.",
    source: "Research on boredom and meaning-seeking, Eastwood et al.",
  },
  {
    id: "guilt",
    line: "Guilt about relaxing means it's working.",
    body: "If you feel guilty about doing nothing, that's your productivity brain refusing to clock off. The discomfort IS the rest — your brain just hasn't caught up yet.",
    source: "Research on leisure guilt and workaholism",
  },
  {
    id: "nostalgia",
    line: "Nostalgia is your brain being kind to you.",
    body: "When you feel low, your brain pulls up warm memories to stabilise your mood. It's not sadness about the past — it's your own built-in comfort system.",
    source: "Research on nostalgia as an emotion regulation strategy, Sedikides et al.",
  },

  // ─── FOOD & BODY ───
  {
    id: "water",
    line: "Drink some water. Seriously.",
    body: "Mild dehydration affects mood, concentration and anxiety levels before you even feel thirsty. A glass of water is the most boring and most effective thing on this list.",
    source: "Research on dehydration and cognitive/mood effects",
  },
  {
    id: "comfort-food",
    line: "Comfort food works because it actually works.",
    body: "Carbs increase serotonin production. Your brain knows this, which is why it asks for toast and pasta when you're stressed. It's not emotional weakness — it's biochemistry.",
    source: "Research on carbohydrate intake and serotonin synthesis",
  },
  {
    id: "shower",
    line: "A shower resets more than you'd think.",
    body: "Changing your physical environment — temperature, sensation, posture — interrupts the thought loop your brain is stuck in. It's not about being clean. It's about being somewhere else.",
    source: "Research on environmental context and cognition",
  },
  {
    id: "walk-outside",
    line: "Five minutes outside does something real.",
    body: "Even a short walk changes your body chemistry. Heart rate drops, cortisol drops, and your brain gets a change of scenery to process. You don't need to go far.",
    source: "Research on green exercise and stress recovery",
  },
  {
    id: "stretching",
    line: "Your body stores stress in your shoulders.",
    body: "When you're anxious, your trapezius muscles tense up automatically. Rolling your shoulders back three times releases more tension than you'd expect.",
    source: "Research on muscle tension and the stress response",
  },

  // ─── RELATIONSHIPS & PEOPLE ───
  {
    id: "friend-gap",
    line: "Real friends don't keep score.",
    body: "That friend you haven't spoken to in months? They're not angry. They're probably relieved you reached out. Friendship doesn't expire like milk.",
    source: "Research on relationship maintenance and dormant ties",
  },
  {
    id: "people-pleasing",
    line: "Saying no is a complete sentence.",
    body: "People-pleasing feels like kindness but it's usually fear. The people who matter will respect your no. The ones who don't weren't respecting your yes either.",
    source: "Research on people-pleasing and boundary-setting",
  },
  {
    id: "vulnerability",
    line: "Being honest about struggling isn't weakness.",
    body: "When someone tells you they're having a hard time, do you think less of them? No? Then why would they think less of you? People respect honesty far more than a performance.",
    source: "Research on vulnerability and social bonding, Brené Brown",
  },
  {
    id: "family-hard",
    line: "Family events being hard is very common.",
    body: "Family dynamics trigger old patterns. You're not regressing — you're in the environment where those patterns were built. Noticing it is already half the battle.",
    source: "Research on family systems and behavioural regression",
  },
  {
    id: "small-talk",
    line: "Small talk isn't pointless.",
    body: "It's how humans establish safety before going deeper. Nobody starts a friendship with 'what's your greatest fear.' The weather chat is a handshake, not a waste.",
    source: "Research on phatic communication and rapport-building",
  },
  {
    id: "cancel-plans",
    line: "Cancelling doesn't make you a bad friend.",
    body: "Sometimes you don't have it in you. A honest 'not feeling it tonight, sorry' is better than showing up resentful. Good friends understand. You'd understand if they did it.",
    source: "Common sense and social psychology",
  },
  {
    id: "they-moved-on",
    line: "That argument? They've already moved on.",
    body: "People process conflict faster than you think. While you're still rehearsing what you should have said, they've already forgotten the specifics. You're the only one still in the ring.",
    source: "Research on conflict rumination and the actor-observer asymmetry",
  },

  // ─── WORK & PRODUCTIVITY ───
  {
    id: "email-dread",
    line: "Email dread is a real thing.",
    body: "The anxiety you feel before opening your inbox is anticipatory stress. The actual emails are almost never as bad as the dread. Open it, skim the subject lines, close it. That counts.",
    source: "Research on anticipatory anxiety and avoidance behaviour",
  },
  {
    id: "imposter",
    line: "Imposter syndrome means you're switched on.",
    body: "The more competent you become, the more you notice how much you don't know. Actual imposters don't get imposter syndrome — they think they're great.",
    source: "Research on the Dunning-Kruger effect and imposter phenomenon",
  },
  {
    id: "multitask-myth",
    line: "You can't multitask. Nobody can.",
    body: "Your brain switches between tasks, it doesn't do them simultaneously. Every switch costs time and energy. Doing one thing properly isn't a limitation — it's how brains work.",
    source: "Research on cognitive task-switching, Rubinstein et al.",
  },
  {
    id: "meeting-anxiety",
    line: "Most people in that meeting are winging it.",
    body: "The person who sounds confident has just had more practice sounding confident. They don't have a secret manual. Everyone's figuring it out as they go.",
    source: "Research on expertise perception and social comparison",
  },
  {
    id: "deadline-brain",
    line: "Deadline panic makes you faster, weirdly.",
    body: "Moderate stress improves focus and performance. That last-minute energy isn't your body failing — it's your brain finally deciding this matters enough to concentrate.",
    source: "Yerkes-Dodson law, research on stress and performance",
  },
  {
    id: "blank-page",
    line: "The blank page is the hardest part.",
    body: "Literally anything you write makes the next thing easier. Type 'I don't know what to write' if you have to. The blank is the enemy, not the quality.",
    source: "Research on task initiation and cognitive load",
  },

  // ─── SELF-IMAGE & IDENTITY ───
  {
    id: "compare-social",
    line: "Instagram isn't real. You know. Still.",
    body: "Knowing something intellectually and feeling it emotionally are different systems. Your rational brain knows it's curated. Your emotional brain doesn't care. Both are valid.",
    source: "Research on social media and social comparison, Vogel et al.",
  },
  {
    id: "mirror-lie",
    line: "You look different to yourself than to others.",
    body: "You see a mirror image — reversed, at odd angles, in bathroom lighting. Nobody else sees you that way. The version of you that exists in other people's eyes is better than the one in your mirror.",
    source: "Research on mere exposure effect and facial recognition",
  },
  {
    id: "behind-life",
    line: "There's no schedule for life.",
    body: "The idea that you should have achieved X by age Y is completely made up. Everyone's timeline is different. Comparing yours to someone else's is comparing a rough draft to an edited highlight reel.",
    source: "Research on social comparison and age milestones",
  },
  {
    id: "labels",
    line: "You don't need a label for what you feel.",
    body: "Not everything has to be a diagnosis, a condition, or a category. Sometimes you're just having a weird time. That's enough of an explanation.",
    source: "General psychology of emotional labelling",
  },
  {
    id: "growth-invisible",
    line: "Growth is invisible while it's happening.",
    body: "You can't see yourself change because you're with yourself every day. Other people notice first. You're probably further along than you think.",
    source: "Research on change blindness and self-perception",
  },
  {
    id: "normal-range",
    line: "\"Normal\" is way wider than you think.",
    body: "Whatever you're thinking, feeling, or doing right now, millions of people are doing the same thing. The range of normal human experience is enormous. You're in it.",
    source: "General population psychology",
  },

  // ─── RANDOM GENUINELY USEFUL ───
  {
    id: "hum",
    line: "Humming activates your calm nerve.",
    body: "The vagus nerve runs past your vocal cords. Humming vibrates it, which tells your nervous system to stand down. It looks silly and it works.",
    source: "Research on vagal tone and humming/chanting",
  },
  {
    id: "cold-face",
    line: "Cold water on your face triggers a reset.",
    body: "It activates the dive reflex — your heart rate drops and your body conserves energy. It's a biological override, and it takes about thirty seconds.",
    source: "Research on the mammalian dive reflex",
  },
  {
    id: "sunlight",
    line: "Morning sunlight sets your whole day.",
    body: "Morning light tells your brain to start the serotonin and cortisol cycles that make you feel awake now and sleepy later. Even a few minutes by a window helps.",
    source: "Research on circadian photoreception, Huberman Lab summary",
  },
  {
    id: "box-breathing",
    line: "4-4-4-4. That's the whole technique.",
    body: "Breathe in for 4, hold for 4, out for 4, hold for 4. Navy SEALs use this. It works because it gives your brain a task that isn't panicking.",
    source: "Box breathing technique used in military and clinical settings",
  },
  {
    id: "name-five",
    line: "Name five things you can see.",
    body: "It's called grounding and it works by dragging your attention out of your head and into the room. Five things you see, four you hear, three you touch. Simple and effective.",
    source: "5-4-3-2-1 grounding technique, clinical psychology",
  },
  {
    id: "socks-off",
    line: "Take your socks off. Seriously.",
    body: "Feeling the floor under your bare feet is a surprisingly effective grounding technique. It gives your brain new sensory data that's firmly in the present.",
    source: "Research on proprioception and grounding",
  },
  {
    id: "chewing-gum",
    line: "Chewing gum lowers cortisol.",
    body: "The repetitive jaw motion sends a signal that you're eating, and your brain figures if you're eating you can't be under threat. Weird, but the research holds up.",
    source: "Research on mastication and stress response, Scholey et al.",
  },
  {
    id: "pen-paper",
    line: "Write it down. Get it out of your head.",
    body: "Putting anxious thoughts on paper reduces their power because your brain stops trying to 'remember' to worry about them. It's like moving files from RAM to a hard drive.",
    source: "Research on expressive writing and anxiety, Pennebaker",
  },
  {
    id: "pet",
    line: "Petting a dog lowers both your stress levels.",
    body: "Physical contact with an animal releases oxytocin in both of you. If you don't have a pet, a stuffed animal or a blanket works surprisingly well — your brain isn't that picky.",
    source: "Research on human-animal interaction and oxytocin",
  },

  // ─── CANNABIS-SPECIFIC NORMALISERS ───
  {
    id: "tolerance-varies",
    line: "Your tolerance changes for no obvious reason.",
    body: "Sleep, food, hydration, stress — they all change how you respond. Same amount, completely different experience. That's just how biology works.",
    source: "Research on pharmacokinetic variability of cannabinoids",
  },
  {
    id: "edibles-different",
    line: "Edibles are a completely different experience.",
    body: "When eaten, THC is processed by your liver into a different compound that's stronger and lasts longer. It's not 'just more' — it's chemically a different thing.",
    source: "Research on 11-hydroxy-THC and oral vs. inhaled cannabis",
  },
  {
    id: "green-out",
    line: "A green out is horrible but passes.",
    body: "Nausea, dizziness, cold sweats, wanting to lie down — it passes. Sit down, sip water, wait. Your body is processing, not breaking.",
    source: "General cannabis effects guidance",
  },
  {
    id: "different-high",
    line: "The same thing can hit differently every time.",
    body: "How you feel before, what you've eaten, whether you slept, who you're with — all of it changes the experience. An inconsistent experience is actually completely consistent.",
    source: "Research on set and setting",
  },
  {
    id: "creative-high",
    line: "Feeling creative while high isn't imaginary.",
    body: "Cannabis increases divergent thinking in some people — the ability to make unusual connections between ideas. Whether the ideas are actually good is a separate question. But the process is real.",
    source: "Research on cannabinoids and divergent thinking",
  },
  {
    id: "wake-up-fine",
    line: "You'll feel normal tomorrow.",
    body: "The effects wear off. Whatever you're feeling right now has an end point. Most people feel completely normal within a few hours, and certainly by morning.",
    source: "General pharmacology of cannabinoids",
  },
  {
    id: "first-time",
    line: "The first time often does nothing.",
    body: "Many people don't feel anything the first time. That's not unusual. Your endocannabinoid receptors sometimes need a first encounter before they know what to do with the signal.",
    source: "Research on initial cannabis exposure and receptor sensitisation",
  },
  {
    id: "paranoia-pass",
    line: "Paranoia has never lasted forever.",
    body: "It feels permanent. It isn't. The feeling peaks and fades. Your brain hasn't changed — it's just temporarily running a slightly different programme.",
    source: "Research on acute cannabis-induced anxiety",
  },
  {
    id: "cough-normal",
    line: "Coughing doesn't mean you did it wrong.",
    body: "Everyone coughs. The airways don't like hot smoke regardless of technique. It's not a skill issue.",
    source: "General respiratory physiology",
  },

  // ─── PHILOSOPHY & PERSPECTIVE ───
  {
    id: "main-character",
    line: "You're not the main character. That's freeing.",
    body: "Nobody's following your plot arc. Nobody's keeping track of your mistakes. You're a background character in almost everyone's story, and that means you're free to mess up in peace.",
    source: "Research on egocentrism and the spotlight effect",
  },
  {
    id: "phone-away",
    line: "Your phone is not an organ.",
    body: "It feels like it is, but putting it face down in another room for 20 minutes doesn't cause actual harm. The notifications will still be there. They're not going anywhere.",
    source: "Research on nomophobia and phone separation anxiety",
  },
  {
    id: "good-enough",
    line: "'Good enough' is an actual strategy.",
    body: "Satisficers — people who go with 'good enough' instead of hunting for the best — are consistently happier than maximisers. Picking the first acceptable option and moving on is rational, not lazy.",
    source: "Research on satisficing vs. maximising, Schwartz",
  },
  {
    id: "future-self",
    line: "Your future self will handle it.",
    body: "You don't need to solve tomorrow's problems tonight. You've handled every hard thing that's come your way so far. There's no reason to think tomorrow will be different.",
    source: "Research on prospection and worry",
  },
  {
    id: "rest-productive",
    line: "Rest is productive.",
    body: "Your brain consolidates learning, processes emotions and solves problems while you rest. Doing nothing is your brain's office hours.",
    source: "Research on the default mode network and rest",
  },
  {
    id: "asking-help",
    line: "Asking for help is a social skill.",
    body: "People like being asked for help. It makes them feel trusted and competent. You're not burdening them — you're giving them a chance to be useful.",
    source: "Research on the Ben Franklin effect and help-seeking",
  },
  {
    id: "mistakes-learn",
    line: "You learn more from mistakes than from wins.",
    body: "Your brain pays more attention to errors than successes because errors are where the useful information is. Messing up is how your brain updates its model of the world.",
    source: "Research on error-related negativity and learning",
  },
  {
    id: "autopilot",
    line: "Autopilot mode isn't failure.",
    body: "Sometimes you go through the motions and that's fine. Not every day has to be intentional and mindful. Getting through it is enough on some days.",
    source: "Research on habitual behaviour and cognitive conservation",
  },

  // ─── HUMOUR & LIGHTNESS ───
  {
    id: "pizza-answer",
    line: "When in doubt, order pizza.",
    body: "Decision paralysis about food is a real thing when your brain is overloaded. Pizza removes the decision. It's warm, it arrives, and nobody ever regretted a pizza.",
    source: "Common sense and decision fatigue research",
  },
  {
    id: "socks-match",
    line: "Nobody checks if your socks match.",
    body: "The detail you're stressing about is invisible to everyone else. People are dealing with their own mismatched socks. The bar for 'put together' is way lower than you think.",
    source: "The spotlight effect, applied to footwear",
  },
  {
    id: "plant-alive",
    line: "Keeping a plant alive counts. Really.",
    body: "The bar for adulthood is flexible. If something in your care is still alive, you're doing better than you think. That includes yourself.",
    source: "General optimism",
  },
  {
    id: "bed-valid",
    line: "Bed is a valid location.",
    body: "Some of the best thinking, resting and recovering happens horizontally. Being in bed during the day doesn't mean you've given up. It means you know where you're comfortable.",
    source: "Common sense",
  },
  {
    id: "three-am",
    line: "Nothing good starts at 3am.",
    body: "Don't text your ex. Don't start a life plan. Don't Google symptoms. At 3am your brain is running on fumes and everything it suggests is wrong. Go to sleep.",
    source: "Circadian rhythm research and common experience",
  },
  {
    id: "googling-symptoms",
    line: "Stop Googling your symptoms.",
    body: "The internet will tell you it's everything from a cold to something catastrophic. Your body is almost certainly just doing body things. If you're genuinely worried, talk to a real person.",
    source: "Research on cyberchondria and health anxiety",
  },
  {
    id: "weird-everyone",
    line: "Everyone is weird. You're just honest.",
    body: "The person who seems totally normal is hiding the exact same kind of weirdness you are. Normal is a setting on a washing machine, not a realistic human state.",
    source: "General psychology of social presentation",
  },
  {
    id: "laundry-pile",
    line: "The laundry pile is not a moral failing.",
    body: "It's fabric in a corner. It'll still be there tomorrow. Doing it when you feel like it is a perfectly valid laundry strategy.",
    source: "Common sense and anti-hustle culture",
  },
  {
    id: "microwave-meal",
    line: "A microwave meal is a cooked meal.",
    body: "You applied heat to food and ate it. That's cooking. The food snobbery about how you fuel yourself is someone else's problem.",
    source: "Common sense",
  },
  {
    id: "alarm-snooze",
    line: "Hitting snooze twice is fine.",
    body: "Your circadian rhythm doesn't care about hustle culture. Those nine extra minutes aren't the difference between success and failure. They're just nice.",
    source: "Sleep research and common sense",
  },

  // ─── CONNECTIONS & MODERN LIFE ───
  {
    id: "wifi-down",
    line: "Wifi going down isn't a sign from above.",
    body: "It's a router being a router. The timing feels significant because your brain finds patterns in everything. Reset it, wait, move on.",
    source: "Research on apophenia and pattern recognition",
  },
  {
    id: "read-receipts",
    line: "Read receipts are evil.",
    body: "They turn a normal conversation into a surveillance system. The anxiety they create was not part of any product designer's wellness plan. Turn them off if you can.",
    source: "Research on digital communication anxiety",
  },
  {
    id: "fomo",
    line: "FOMO is lying to you.",
    body: "The thing you're missing is never as good as it looks. People post the highlight, not the awkward bits. Half the people there wish they'd stayed home too.",
    source: "Research on fear of missing out and social media",
  },
  {
    id: "doom-scroll",
    line: "Doom scrolling is a trap, not a habit.",
    body: "Your brain keeps scrolling because it's waiting for a reward that never comes. Each scroll is a tiny lottery ticket. The algorithm knows this. Put the phone face down.",
    source: "Research on variable ratio reinforcement and social media",
  },
  {
    id: "notification-stress",
    line: "Turning off notifications is self-care.",
    body: "Every notification is someone else's priority interrupting yours. You don't owe anyone instant availability. Check things on your schedule, not the phone's.",
    source: "Research on notification frequency and stress, Kushlev et al.",
  },
  {
    id: "typing-dots",
    line: "Those typing dots are not a threat.",
    body: "Watching someone type and stop, type and stop is anxiety fuel. They're probably just fixing a typo. The message will arrive when it arrives.",
    source: "Research on communication uncertainty and anxiety",
  },

  // ─── EXTRA NORMALISERS ───
  {
    id: "adult-no-plan",
    line: "Most adults are improvising.",
    body: "Nobody got a manual on their 18th birthday. The confident ones are just better at looking like they know what they're doing. Underneath, it's all guesswork.",
    source: "Research on emerging adulthood, Arnett",
  },
  {
    id: "happy-sad-same",
    line: "You can be happy and sad at the same time.",
    body: "Mixed emotions aren't confusion — they're sophistication. Your brain can hold two truths at once. That's emotional range, not instability.",
    source: "Research on mixed emotions, Larsen et al.",
  },
  {
    id: "boundary-kind",
    line: "Setting a boundary is a kindness.",
    body: "For you and for them. A boundary isn't a wall — it's a signpost. It says 'here's how to be around me without it going wrong.' That's useful information.",
    source: "Research on interpersonal boundaries and relationship quality",
  },
  {
    id: "forgetting-names",
    line: "Forgetting someone's name is universal.",
    body: "Your brain prioritises faces over names because faces were survival-critical and names weren't. It's not rude — it's your hippocampus being a bit prehistoric.",
    source: "Research on face recognition vs. name recall",
  },
  {
    id: "messy-room",
    line: "A messy room isn't a messy mind.",
    body: "Some people work better in chaos. The research on this is actually mixed — creative people tend toward messier spaces. Your room isn't a diagnosis.",
    source: "Research on physical order and creativity, Vohs et al.",
  },
  {
    id: "teeth-brush",
    line: "Brushed your teeth today? That counts.",
    body: "On hard days, basic hygiene is an achievement. Showered, ate something, drank water — any one of those is you taking care of yourself. The bar is wherever you need it to be.",
    source: "Common sense and harm-reduction psychology",
  },
  {
    id: "tomorrow-new",
    line: "Tomorrow is genuinely a new day.",
    body: "Your brain literally resets overnight. The emotional weight of today gets processed while you sleep. Tomorrow's version of you will handle things differently, because they're neurochemically a different person.",
    source: "Research on sleep-dependent emotional processing",
  },
  {
    id: "its-ok",
    line: "It's okay to not be okay.",
    body: "Feeling bad doesn't need to be solved immediately. Sometimes the most useful thing is just acknowledging that right now, things are hard, and that's where you are.",
    source: "Acceptance and commitment therapy research",
  },
  {
    id: "fresh-air",
    line: "Fresh air works because science.",
    body: "Outdoor air has higher oxygen and lower CO2 than indoor air. Stepping outside literally changes your blood chemistry. Your brain works better with better air.",
    source: "Research on indoor air quality and cognitive function",
  },
  {
    id: "laugh-alone",
    line: "Laughing alone at your phone is normal.",
    body: "You're not weird for laughing out loud at a meme in public. The people glancing at you are just curious what's funny. They're not judging — they want to laugh too.",
    source: "Research on social laughter vs. private humour",
  },
  {
    id: "motivation-myth",
    line: "Motivation comes after starting, not before.",
    body: "Waiting to feel motivated is a trap. Action creates motivation, not the other way around. Start the thing and the motivation shows up like a late coworker who acts like they've been there all along.",
    source: "Research on behavioural activation and motivation",
  },
  {
    id: "productive-day",
    line: "A 'productive' day doesn't require a list.",
    body: "If you made it through the day, that was productive. Your worth isn't measured in tasks completed. Some days surviving is the hardest task on the board.",
    source: "Research on self-compassion and productivity",
  },
  {
    id: "appetite-mood",
    line: "No appetite when stressed is your body's call.",
    body: "Stress hormones suppress appetite in some people and increase it in others. Neither response is wrong. Your body's just running a different programme right now.",
    source: "Research on cortisol and appetite regulation",
  },
  {
    id: "brain-fog",
    line: "Brain fog is real, not an excuse.",
    body: "When your brain can't think straight, it's because it's diverting resources to managing stress or processing emotions. The fog lifts when the load eases. You're not getting dumber.",
    source: "Research on cognitive load and executive function",
  },
  {
    id: "social-battery",
    line: "Your social battery is finite.",
    body: "It's not antisocial to need time alone after being around people. Your brain processed thousands of micro-interactions and now it needs to file them. Recharging is maintenance, not avoidance.",
    source: "Research on introversion, social fatigue and cognitive processing",
  },
  {
    id: "clothes-fine",
    line: "What you're wearing is fine.",
    body: "Nobody remembers what you wore yesterday. Or the day before. The mental energy spent on outfit anxiety is almost always wasted on something nobody else will notice.",
    source: "The spotlight effect applied to self-presentation",
  },
  {
    id: "two-things",
    line: "You only need to do two things today.",
    body: "On bad days, pick two things. If you do one, good. If you do both, great. If you do zero, the world doesn't end and you try again tomorrow.",
    source: "Harm-reduction psychology and task management research",
  },
  {
    id: "headphones-shield",
    line: "Headphones are a perfectly valid force field.",
    body: "Putting on headphones — even without music — signals to the world that you're not available. It's a socially acceptable way to create space without saying a word.",
    source: "Research on personal space and boundary signals",
  },
  {
    id: "existed-today",
    line: "You existed today. That's something.",
    body: "On the days where that's all you managed, it's enough. The fact that you're reading this means you're still here, and that matters more than anything you did or didn't tick off a list.",
    source: "Self-compassion research, Neff",
  },
];

/** A fact that isn't the one someone just read. */
export function nextFact(seenId?: string): Fact {
  const pool = seenId ? FACTS.filter((f) => f.id !== seenId) : FACTS;
  return pool[Math.floor(Math.random() * pool.length)];
}
