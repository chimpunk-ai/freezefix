// Risk routing: the keyword check that runs IN CODE, BEFORE the AI model.
// SOURCE: FreezeFix Safety Pack v1.0, sections 1 and 5.
// Rule for doubt: if a message could be a red flag, treat it as one.
// The final level is always the HIGHER of this check and the AI model's own check.

export type RiskLevel = 0 | 1 | 2 | 3 | 4;
// 0 Normal · 1 Watch · 2 Urgent · 3 Crisis · 4 Emergency

export type HelpScreen =
  | "emergency" // R1, R2, R6, R7, R4 with plan/means/action
  | "crisis" // R4
  | "psychosis" // R5
  | "mixed" // R3
  | "doctor" // R9 repeated vomiting
  | "under18"; // R8

export type RiskResult = {
  level: RiskLevel;
  screen: HelpScreen | null;
  underage: boolean;
};

export const NO_RISK: RiskResult = { level: 0, screen: null, underage: false };

const CANT = "(?:can'?t|cannot|can not|cant)";
const WONT = "(?:won'?t|will not|wont|doesn'?t|does not)";

const PATTERNS = {
  // R1 chest pain / heart that won't settle / fainting -> Emergency
  r1: new RegExp(
    [
      "chest (?:pain|hurts?|is hurting|feels? (?:tight|heavy|weird)|pressure|tight)",
      "(?:tight|crushing|heavy) chest",
      "heart attack",
      `heart(?:'s| is)? (?:\\w+ )?(?:${WONT} (?:slow|settle|stop|calm))`,
      "heart(?:'s| is)? going (?:crazy|mental|mad|1\\d\\d|2\\d\\d)",
      "heart(?:'s| is)? (?:racing|pounding|thumping|hammering)",
      "heart (?:race|pound)",
      "(?:i )?think i'?m dying",
      "arm (?:feels? )?(?:weird|numb|tingl)",
      "(?:nearly|almost|about to) (?:pass(?:ed)? out|faint(?:ed)?)",
      "\\bfaint(?:ed|ing)?\\b",
      "blacking out",
      "passed out",
    ].join("|")
  ),
  // R2 trouble breathing -> Emergency
  r2: new RegExp(
    [
      `${CANT} (?:breathe|breath|catch my breath|get (?:air|my breath))`,
      "(?:struggling|hard|trouble) (?:to )?breath(?:e|ing)",
      "throat (?:is )?(?:closing|swelling)",
      "not breathing",
    ].join("|")
  ),
  // R6 collapse / seizure / can't stay awake -> Emergency
  r6: new RegExp(
    [
      `${WONT} wake(?: up)?`,
      `${CANT} wake (?:him|her|them|up)`,
      "unconscious",
      "not responding",
      "unresponsive",
      "seizure",
      "\\bfitting\\b",
      "convuls",
      "shaking on the floor",
      "collapsed",
      `${CANT} stay awake`,
      `(?:${CANT}|barely|struggling to) keep (?:my|his|her|their) eyes open`,
    ].join("|")
  ),
  // R7 harm to others or being in danger -> Emergency
  r7: new RegExp(
    [
      "(?:want|going|gonna|about) to (?:hurt|kill|stab|attack|beat up) (?:him|her|them|someone|somebody|my|that)",
      "threaten(?:ing|ed) (?:me|to)",
      "(?:telling|told|tell) me to (?:hurt|kill|stab|attack)",
      "smash (?:his|her|their|someone'?s|somebody'?s|your) (?:face|head)",
      "(?:want|going|gonna) to (?:smash|batter|punch|deck|glass|knock out) (?:him|her|them|someone|somebody)",
      "(?:i'?m|i am) not safe",
      "not safe (?:here|at home)",
      "(?:i'?m|i am) in danger",
      "going to hurt me",
      "(?:someone|somebody|he|she|they|he'?s|she'?s|they'?re) (?:attacked|hit|is hurting|are hurting|hurting|beating) me",
    ].join("|")
  ),
  // R4 suicide or self-harm thoughts -> Crisis (Emergency if plan/means/action)
  r4: new RegExp(
    [
      "(?:want|wanna|wanted) to die",
      "kill my ?self",
      "\\bkms\\b",
      "unaliv",
      "\\bends? it\\b(?! (?:with|off|for now))",
      "\\bends? (?:his|her|their) (?:own )?life",
      "how (?:to|do you|would you|do i) (?:kill|end|hang|overdose)",
      "end (?:it all|my life|everything|myself)",
      "suicid",
      "hurt (?:my ?self)",
      "self[- ]?harm",
      "cut(?:ting)? (?:my ?self|my (?:arm|wrist|leg)s?)",
      "better off without me",
      "(?:don'?t|do not) want to (?:be here|live|exist|wake up|be alive)",
      "no (?:reason|point) (?:to|in) liv",
      "(?:wish|want) (?:i was|i were|to be) dead",
    ].join("|")
  ),
  // R4 escalators: a plan, means, or it's happening now
  r4Plan: new RegExp(
    [
      "\\bplan\\b",
      "tonight",
      "right now",
      "\\bpills\\b",
      "\\btook\\b",
      "\\btaken\\b",
      "\\brope\\b",
      "bridge",
      "\\bjump",
      "knife",
      "overdose",
      "\\bod\\b",
      "goodbye",
      "wrote a note",
      "\\bblade",
    ].join("|")
  ),
  // Hopelessness that, with means nearby, counts as R4 with a plan (S05, S08)
  hopeless: new RegExp(
    [
      `${CANT} do (?:this|it) any ?more`,
      "what'?s the point",
      "(?:nobody|no one|noone) (?:cares|would care|would notice|would miss me)",
      "give up on everything",
      "done with (?:it all|everything|life)",
    ].join("|")
  ),
  means: /\bpills\b|\brope\b|bridge|\bjump|knife|\bblade|overdose|highest|tallest|roof|train tracks/,
  // R3 mixed with something else -> Urgent
  r3: new RegExp(
    [
      "alcohol",
      "\\bdrunk\\b",
      "booze",
      "\\bbeers?\\b",
      "\\bpints?\\b",
      "\\bcans?\\b(?: of)? (?:lager|cider|beer)",
      "\\bcider\\b",
      "\\blager\\b",
      "did (?:a|some) lines?",
      "\\ba line\\b",
      "\\bbump\\b",
      "sertraline|fluoxetine|citalopram|escitalopram|prozac|zoloft|lexapro|\\bssris?\\b|antidepressant|lithium|quetiapine|olanzapine",
      "adderall|ritalin|vyvanse|elvanse|concerta|adhd meds",
      "(?:pen|vape|cart) (?:my mate|a mate|someone|somebody|he|she|they|a guy) gave me",
      "vodka",
      "\\bwine\\b",
      "whiske?y",
      "tequila",
      "\\brum\\b",
      "(?:been|was|were|i'?ve been) drinking",
      "\\bpills?\\b",
      "xanax",
      "\\bxans?\\b",
      "benzo",
      "valium",
      "diazepam",
      "\\boxy",
      "codeine",
      "\\blean\\b",
      "tramadol",
      "prescription",
      "meds\\b",
      "medication",
      "\\bcoke\\b",
      "cocaine",
      "\\bket\\b",
      "ketamine",
      "mdma",
      "molly",
      "ecstasy",
      "\\bmandy\\b",
      "pingers",
      "\\bacid\\b",
      "\\blsd\\b",
      "shrooms",
      "mushrooms",
      "spice",
      "\\bk2\\b",
      "\\bspeed\\b",
      "\\bmeth\\b",
      "\\bcrack\\b",
      "heroin",
      "fentanyl",
      "laced",
      "pen i don'?t know",
      "tast(?:ed|es|ing) (?:weird|strange|off|wrong|chemical|funny|like chemicals)",
    ].join("|")
  ),
  // R5 signs of psychosis -> Urgent
  r5: new RegExp(
    [
      "hear(?:ing)? voices",
      "voices (?:in my head|telling|talking)",
      "seeing things",
      "see(?:ing)? (?:people|things|shapes|shadows) (?:that )?(?:aren'?t|isn'?t|nobody|no one)",
      "hallucinat",
      "hear(?:ing)? .{0,40}(?:no ?one'?s?|nobody'?s?|noones?) (?:here|there|around|in the room)",
      "(?:everything|it all|all of it) (?:feels|seems|is) like (?:a )?(?:sign|message|code)",
      "(?:haven'?t|havent|not) slept (?:in|for) (?:[3-9]|three|four|five|six|days)",
      "walls? (?:are|is) (?:moving|breathing|melting)",
      "(?:watched|watching me|listening|spying) (?:through|via|on|with) (?:my |the )?(?:phone|tv|telly|camera|laptop|wifi|devices?|walls)",
      "(?:phone|tv|telly|camera|laptop) is (?:watching|listening|recording|controlling)",
      "(?:being |am |i'?m )controlled",
      "controlling (?:me|my (?:mind|thoughts|body))",
      "(?:messages?|signs?|songs?|posts?) (?:are |is )?(?:meant|just|only) for me",
      "(?:tv|telly|radio|songs?) (?:is |are )?(?:talking to|sending|speaking to) me",
      "plotting (?:against|to)",
      "(?:they'?re|they are|everyone'?s|everyone is) in on it",
      "reading my (?:mind|thoughts)",
      "put (?:a )?(?:chip|tracker|implant)",
      `${CANT} tell what'?s real`,
      "lost track of (?:what'?s )?real",
      "nothing (?:feels|is|seems) real",
      "not real anymore",
    ].join("|")
  ),
  // R9 repeated vomiting -> Urgent
  r9: new RegExp(
    [
      "(?:throwing up|vomiting|being sick|puking) (?:all day|all night|for hours|nonstop|non-stop|since)",
      `${CANT} stop (?:throwing up|vomiting|being sick|puking)`,
      "keep (?:throwing up|vomiting|being sick|puking)",
      "only hot showers help",
    ].join("|")
  ),
  // R8 under 18 -> Stop
  r8: new RegExp(
    [
      "(?:i'?m|i am|im) (?:only )?1[0-7]\\b",
      "\\b1[0-7] (?:years? old|yo|y/o)\\b",
      "\\baged? 1[0-7]\\b",
      "\\byear (?:7|8|9|10|11|12)\\b",
      "\\b(?:6|7|8|9|10|11)th grade",
      "(?:freshman|sophomore|junior) (?:in|at) (?:high )?school",
      "\\bgcses?\\b",
      "secondary school",
      "\\bmiddle school",
      "(?:my )?(?:mum|mom|parents|dad) (?:will|might|is gonna|is going to) find out.*(?:school|teacher|class|homework)",
      "(?:school|teacher|class|homework).*(?:my )?(?:mum|mom|parents|dad) (?:will|might) find out",
      "(?:mum|mom|dad|parents) (?:will|would|is gonna|are gonna|gonna|is going to) (?:kill|murder) me.*(?:school|teacher|class|homework|exam)",
      "(?:school|teacher|class|homework|exam).*(?:mum|mom|dad|parents) (?:will|would|is gonna|are gonna|gonna) (?:kill|murder) me",
    ].join("|")
  ),
  // Level 1 Watch: vague hopelessness, very high distress, heavy edible and scared
  watch: new RegExp(
    [
      "what'?s the point",
      "overdos",
      "hopeless",
      `${CANT} (?:do|take) (?:this|it) any ?more`,
      "give up on everything",
      "edible",
      "took too much",
      "way too high",
      "too high",
      "greening",
      "heart(?:'s| is)? (?:a bit |kinda |kind of |quite |so )?fast",
      "heart(?:'s| is)? beating (?:so |really |a bit )?fast",
      "losing my mind",
      "going crazy",
      "freaking out (?:so )?bad",
    ].join("|")
  ),
} as const;

function normalise(text: string): string {
  return (text || "")
    .toLowerCase()
    .replace(/[‘’ʼ`]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// Returns the highest risk found in one message.
export function keywordCheck(text: string): RiskResult {
  const t = normalise(text);
  if (!t) return NO_RISK;

  const hits: RiskResult[] = [];

  if (PATTERNS.r8.test(t)) hits.push({ level: 4, screen: "under18", underage: true });
  if (PATTERNS.r1.test(t) || PATTERNS.r2.test(t) || PATTERNS.r6.test(t) || PATTERNS.r7.test(t)) {
    hits.push({ level: 4, screen: "emergency", underage: false });
  }
  if (PATTERNS.r4.test(t)) {
    hits.push(
      PATTERNS.r4Plan.test(t)
        ? { level: 4, screen: "emergency", underage: false }
        : { level: 3, screen: "crisis", underage: false }
    );
  }
  if (PATTERNS.hopeless.test(t) && PATTERNS.means.test(t)) {
    hits.push({ level: 4, screen: "emergency", underage: false });
  }
  if (PATTERNS.r5.test(t)) hits.push({ level: 2, screen: "psychosis", underage: false });
  if (PATTERNS.r3.test(t)) hits.push({ level: 2, screen: "mixed", underage: false });
  if (PATTERNS.r9.test(t)) hits.push({ level: 2, screen: "doctor", underage: false });
  if (PATTERNS.watch.test(t)) hits.push({ level: 1, screen: null, underage: false });

  return highest(hits);
}

// Picks the most serious result. Under-18 always wins (no AI chat for under-18s).
export function highest(results: RiskResult[]): RiskResult {
  let best: RiskResult = NO_RISK;
  for (const r of results) {
    if (r.underage) return r;
    if (r.level > best.level) best = r;
    // Same level: emergency screen beats others; crisis beats psychosis/mixed/doctor.
    else if (r.level === best.level && rank(r.screen) > rank(best.screen)) best = r;
  }
  return best;
}

function rank(s: HelpScreen | null): number {
  switch (s) {
    case "under18":
      return 6;
    case "emergency":
      return 5;
    case "crisis":
      return 4;
    case "psychosis":
      return 3;
    case "mixed":
      return 2;
    case "doctor":
      return 1;
    default:
      return 0;
  }
}

// Maps a one-tap safety-check button to its help screen (Safety Pack section 2).
export const SAFETY_BUTTONS: { id: string; label: string; result: RiskResult }[] = [
  { id: "chest", label: "Chest pain or my heart won't settle", result: { level: 4, screen: "emergency", underage: false } },
  { id: "breathe", label: "I can't breathe properly", result: { level: 4, screen: "emergency", underage: false } },
  { id: "mixed", label: "I've also had alcohol, pills or something else", result: { level: 2, screen: "mixed", underage: false } },
  { id: "selfharm", label: "I'm thinking about hurting myself or ending my life", result: { level: 3, screen: "crisis", underage: false } },
  { id: "psychosis", label: "Hearing or seeing things others don't, or feeling controlled", result: { level: 2, screen: "psychosis", underage: false } },
  { id: "collapse", label: "Someone's collapsed or won't wake up", result: { level: 4, screen: "emergency", underage: false } },
];
