// Facts shown on the home screen, one per visit (founder, 16 Oct).
// RULES: every fact here is true and traceable. No scare stats, no shame, no quit pressure
// (Safety Pack §4). If a claim can't be sourced, it doesn't go in.
// Sources are kept in the comments so Safety & Trust can check them.

export type Fact = { text: string; note?: string };

export const FACTS: Fact[] = [
  {
    // Gollwitzer & Sheeran 2006 meta-analysis, d = 0.65 across 94 studies / 8,461 people.
    // https://doi.org/10.1016/S0065-2601(06)38002-1
    text: "Deciding exactly when and where you'll do a thing roughly doubles the odds you actually do it. Vague plans lose.",
    note: "94 studies, 8,461 people",
  },
  {
    // Gollwitzer & Sheeran: effects on intention and self-efficacy were d = 0.10 — the
    // mechanism is cue automaticity, not motivation.
    text: "Plans that work don't work by making you want it more. They work by removing the decision.",
  },
  {
    // Skumlien et al. 2022, Int J Neuropsychopharmacology, n = 274 matched pairs.
    // Found no difference in apathy, effort or reward pleasure vs non-users.
    text: "\"Weed makes you lazy forever\" doesn't hold up. A 274-person study found users no less motivated than anyone else when sober.",
    note: "Skumlien et al., 2022",
  },
  {
    // Lawn et al. 2016, Psychopharmacology. Acute THC reduced high-effort choices (p = .042),
    // but sober dependent users did not differ from controls.
    text: "The can't-be-arsed feeling is a state, not your personality. Same study found it lifts when you're sober.",
  },
  {
    // Steel 2007 meta-analysis: perfectionism r = .03 with procrastination (24 studies, N = 3,884).
    text: "Procrastination isn't perfectionism. Across 24 studies the link was basically zero. You're not too precious, you're just stuck.",
    note: "24 studies, 3,884 people",
  },
  {
    // Wohl, Pychyl & Bennett 2010: self-forgiveness for procrastinating predicted less
    // procrastination later. Self-compassion correlates r = -.31 with procrastination.
    text: "People who forgive themselves for putting something off procrastinate less next time. Beating yourself up is the thing that keeps you stuck.",
  },
  {
    // Schleider et al: single-session interventions g = 0.32 across 50 RCTs / 10,508 youths.
    // Self-administered and therapist-administered did not differ.
    text: "One short session can shift things. And self-guided worked as well as a therapist in the data.",
    note: "50 trials, 10,508 people",
  },
  {
    // Wong et al. 2017 meta-analysis, 74 studies, 19,453 participants.
    // Self-reliance r = .19 with poorer mental health.
    text: "Handling everything alone is the single habit most linked to feeling worse. Not weakness. Just the maths.",
    note: "74 studies, 19,453 men",
  },
  {
    // Freeman et al. THC paranoia trial: the path to paranoia ran through changes in
    // feelings and perception, not memory.
    text: "Paranoia doesn't mean something's wrong with you. In trials it came from how things felt in the moment, nothing more.",
  },
  {
    // Toli et al. 2015: if-then plans in mental-health samples, d+ = 0.99. Plans should
    // normalise the unwanted response rather than instruct suppression.
    text: "Telling yourself to stop thinking about it makes it louder. Giving yourself something else to do actually works.",
  },
  {
    // Peipert et al. 2024: users left to self-generate activities chose 41% sedentary,
    // ~17% overlap with therapist-chosen ones.
    text: "Left to pick your own next move while stuck, most people pick the couch. That's why we hand you three.",
  },
  {
    text: "Nobody's keeping score here. No streaks to break, no guilt if you vanish for a month.",
  },
];

// One fact per visit, rotated by day so it feels fresh without being random noise.
export function factForToday(seen: number): Fact {
  return FACTS[seen % FACTS.length];
}
