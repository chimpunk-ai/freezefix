"use client";

import { useEffect, useState } from "react";
import HelpScreen, { ContactButton } from "@/components/HelpScreen";
import { SAFETY_BUTTONS, keywordCheck, type HelpScreen as HelpScreenId, type RiskLevel, type RiskResult } from "@/lib/risk";
import { MOMENTS, type MomentId } from "@/lib/prompt";
import { detectRegion } from "@/lib/country";
import { resourcesFor, VERIFIED_COUNTRIES } from "@/lib/resources";
import type { Move } from "@/lib/moves";

type Step =
  | "loading-app"
  | "gate"
  | "blocked"
  | "home"
  | "moment"
  | "check"
  | "words"
  | "thinking"
  | "moves"
  | "doing"
  | "thanks"
  | "error"
  | "help";

// Browser storage keys. Nothing here leaves the phone.
const K_ADULT = "ff_adult"; // "yes" once the 18+ gate is passed
const K_BLOCK = "ff_block_until"; // under-18 answer blocks this device for 24h
const K_REGION = "ff_region"; // country picked in the switcher
const K_LEVEL = "ff_session_level"; // highest risk level this session (sessionStorage)
const K_MIXED = "ff_session_mixed"; // user told us they mixed substances this session
const K_ACK = "ff_session_ack"; // urgent help screens the user has seen and tapped "Back" on

const DAY_MS = 24 * 60 * 60 * 1000;

const PLACEHOLDERS: Record<MomentId, string> = {
  people: "e.g. at a mate's place, everyone's talking and I think they're looking at me",
  alone: "e.g. can't stop replaying what I said earlier",
  task: "e.g. need to email my manager and I just keep staring at it",
  reply: "e.g. she messaged 3 hours ago and I don't know what to say",
};

function store(kind: "local" | "session") {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}
function get(kind: "local" | "session", key: string) {
  try {
    return store(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}
function set(kind: "local" | "session", key: string, value: string) {
  try {
    store(kind)?.setItem(key, value);
  } catch {
    /* storage can be blocked; the app still works for this visit */
  }
}

export default function FreezeFixApp() {
  const [step, setStep] = useState<Step>("loading-app");
  const [region, setRegion] = useState("");
  const [detected, setDetected] = useState("");
  const [moment, setMoment] = useState<MomentId>("alone");
  const [text, setText] = useState("");
  const [moves, setMoves] = useState<Move[]>([]);
  const [picked, setPicked] = useState<Move | null>(null);
  const [checkQuestion, setCheckQuestion] = useState<string | null>(null);
  const [sessionLevel, setSessionLevel] = useState<RiskLevel>(0);
  const [mixed, setMixed] = useState(false);
  const [help, setHelp] = useState<{ screen: HelpScreenId; returnTo: Step | "continue" | "words-ack" | null } | null>(null);
  const [helped, setHelped] = useState<boolean | null>(null);
  const [acked, setAcked] = useState<HelpScreenId[]>([]);

  // First load: 18+ gate, 24h block, country, session risk level.
  useEffect(() => {
    const d = detectRegion();
    setDetected(d);
    setRegion(get("local", K_REGION) || d);
    setSessionLevel((Number(get("session", K_LEVEL)) || 0) as RiskLevel);
    setMixed(get("session", K_MIXED) === "1");
    try {
      setAcked(JSON.parse(get("session", K_ACK) || "[]"));
    } catch {
      setAcked([]);
    }

    const blockUntil = Number(get("local", K_BLOCK) || 0);
    if (blockUntil > Date.now()) {
      setStep("blocked");
    } else if (get("local", K_ADULT) === "yes") {
      setStep("home");
    } else {
      setStep("gate");
    }
  }, []);

  function changeRegion(r: string) {
    // "Somewhere else" keeps the device's own region so we can still show its emergency number.
    const next = r === "OTHER" && !(VERIFIED_COUNTRIES as string[]).includes(detected) ? detected || "OTHER" : r;
    setRegion(next);
    set("local", K_REGION, next);
  }

  // The highest risk level seen in a session sticks for the rest of that session.
  function raiseLevel(level: RiskLevel) {
    if (level > sessionLevel) {
      setSessionLevel(level);
      set("session", K_LEVEL, String(level));
    }
  }

  function showHelp(screen: HelpScreenId, returnTo: Step | "continue" | "words-ack" | null) {
    setHelp({ screen, returnTo });
    setStep("help");
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }

  // Routes a risk result to its help screen. Returns true if the normal flow must stop.
  function route(r: RiskResult, ack: HelpScreenId[] = acked): boolean {
    if (r.underage) {
      blockDevice();
      return true;
    }
    if (r.level > 0) raiseLevel(r.level);
    if (r.screen === "mixed") {
      setMixed(true);
      set("session", K_MIXED, "1");
    }
    if (r.level >= 3 && r.screen) {
      // Crisis (3) / Emergency (4): no moves; back goes home with help one tap away.
      showHelp(r.screen, "home");
      return true;
    }
    if (r.level === 2 && r.screen && !ack.includes(r.screen)) {
      // Urgent (2): help first, normal flow only after "Back to FreezeFix".
      // From the safety check, back goes to the words screen; from a message, back continues to moves.
      showHelp(r.screen, step === "check" ? "words-ack" : "continue");
      return true;
    }
    return false;
  }

  function acknowledge(screen: HelpScreenId): HelpScreenId[] {
    const next = acked.includes(screen) ? acked : [...acked, screen];
    setAcked(next);
    set("session", K_ACK, JSON.stringify(next));
    return next;
  }

  function blockDevice() {
    set("local", K_BLOCK, String(Date.now() + DAY_MS));
    set("local", K_ADULT, "no");
    setStep("blocked");
  }

  function resetFlow() {
    setText("");
    setMoves([]);
    setPicked(null);
    setCheckQuestion(null);
    setHelped(null);
  }

  async function getMoves(ack: HelpScreenId[] = acked) {
    // Crisis or emergency earlier in this session: help stays first, no AI moves.
    if (sessionLevel >= 3) {
      showHelp(sessionLevel >= 4 ? "emergency" : "crisis", "home");
      return;
    }
    // Same keyword check in the browser first, so help shows instantly even offline.
    if (route(keywordCheck(text), ack)) return;

    setStep("thinking");
    try {
      const res = await fetch("/api/moves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moment, text, groundingOnly: mixed || ack.includes("mixed"), country: region, acknowledged: ack }),
      });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as {
        level: RiskLevel;
        screen: HelpScreenId | null;
        underage: boolean;
        checkQuestion: string | null;
        moves: Move[];
      };
      if (route({ level: data.level, screen: data.screen, underage: data.underage }, ack)) return;
      if (data.level > 0) raiseLevel(data.level);
      setMoves(data.moves);
      setCheckQuestion(data.checkQuestion);
      setStep("moves");
    } catch {
      setStep("error");
    }
  }

  function sendFeedback(value: boolean) {
    setHelped(value);
    setStep("thanks");
    fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ helped: value, moment, country: region }),
    }).catch(() => {});
  }

  const res = resourcesFor(region);
  const showHelpCard = sessionLevel >= 1 && step !== "help" && step !== "blocked" && step !== "gate";

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-8 pt-4">
      {/* Top bar: brand + the Emergency link that sits on every screen, free, no login. */}
      <header className="mb-8 flex items-center justify-between">
        <button
          onClick={() => {
            if (step === "gate" || step === "blocked") return;
            resetFlow();
            setStep("home");
          }}
          className="text-lg font-bold tracking-tight text-ink"
          aria-label="FreezeFix home"
        >
          Freeze<span className="text-accent">Fix</span>
        </button>
        {step !== "loading-app" && !(step === "help" && help?.screen === "emergency") && (
          <button
            onClick={() => showHelp("emergency", step === "blocked" ? null : step === "help" ? help?.returnTo ?? "home" : step)}
            className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink-soft"
          >
            Emergency
          </button>
        )}
      </header>

      <main className="flex flex-1 flex-col">
        {step === "loading-app" && <div className="flex-1" />}

        {step === "gate" && (
          <Screen title="First things first">
            <p className="text-lg text-ink-soft">FreezeFix is for adults 18 and over. Are you 18 or older?</p>
            <div className="mt-6 flex flex-col gap-3">
              <BigButton
                onClick={() => {
                  set("local", K_ADULT, "yes");
                  setStep("home");
                }}
              >
                Yes, I&apos;m 18+
              </BigButton>
              <GhostButton onClick={blockDevice}>No</GhostButton>
            </div>
          </Screen>
        )}

        {step === "blocked" && (
          <HelpScreen screen="under18" region={region} onRegionChange={changeRegion} />
        )}

        {step === "home" && (
          <div className="flex flex-1 flex-col justify-between gap-10">
            <div className="flex flex-col gap-4 pt-6">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-ink">
                Frozen right now?
              </h1>
              <p className="text-lg text-ink-soft">
                One safe next step in under 60 seconds. No lectures, no judgment.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  resetFlow();
                  setStep("moment");
                }}
                className="w-full rounded-3xl bg-accent px-6 py-7 text-2xl font-bold text-accent-ink shadow-lg transition active:scale-[0.98]"
              >
                Unfreeze me
              </button>
              <p className="text-center text-sm text-ink-faint">Can&apos;t change you. Still got you.</p>
            </div>
            <Footer />
          </div>
        )}

        {step === "moment" && (
          <Screen title="What's the moment?">
            <div className="flex flex-col gap-3">
              {(Object.keys(MOMENTS) as MomentId[]).map((m) => (
                <OptionButton
                  key={m}
                  onClick={() => {
                    setMoment(m);
                    setStep("check");
                  }}
                >
                  {MOMENTS[m]}
                </OptionButton>
              ))}
            </div>
          </Screen>
        )}

        {step === "check" && (
          <Screen title="Quick check first" subtitle="Tap anything that's true right now.">
            <div className="flex flex-col gap-2">
              {SAFETY_BUTTONS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => route(b.result)}
                  className="rounded-2xl border border-line bg-card px-4 py-3 text-left text-base text-ink transition active:scale-[0.99]"
                >
                  {b.label}
                </button>
              ))}
              {/* "None of these" is the largest button, never pre-selected. */}
              <button
                onClick={() => setStep("words")}
                className="mt-2 rounded-3xl bg-accent px-5 py-5 text-xl font-bold text-accent-ink transition active:scale-[0.98]"
              >
                None of these, keep going
              </button>
            </div>
          </Screen>
        )}

        {step === "words" && (
          <Screen title="Say it in a few words" subtitle={MOMENTS[moment]}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 400))}
              rows={4}
              placeholder={PLACEHOLDERS[moment]}
              className="w-full resize-none rounded-2xl border border-line bg-card p-4 text-lg text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
              autoFocus
            />
            <div className="mt-1 text-right text-xs text-ink-faint">{text.length}/400</div>
            <div className="mt-4 flex flex-col gap-3">
              <BigButton onClick={() => getMoves()}>Get my moves</BigButton>
              {!text.trim() && (
                <GhostButton onClick={() => getMoves()}>Skip, just give me moves</GhostButton>
              )}
            </div>
            <p className="mt-6 text-center text-xs leading-relaxed text-ink-faint">
              Your notes stay on your phone. What you type goes to our AI to get your moves and isn&apos;t stored.
            </p>
          </Screen>
        )}

        {step === "thinking" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-line border-t-accent" />
            <p className="text-lg text-ink-soft">Breathe out slowly while I think…</p>
          </div>
        )}

        {step === "error" && (
          <Screen title="That didn't load">
            <p className="text-lg text-ink-soft">Give it another go. If things feel serious, the Emergency button is up top.</p>
            <div className="mt-6 flex flex-col gap-3">
              <BigButton onClick={() => getMoves()}>Try again</BigButton>
              <GhostButton onClick={() => showHelp("emergency", "error")}>Emergency help</GhostButton>
            </div>
          </Screen>
        )}

        {step === "moves" && (
          <Screen title={checkQuestion ? "First, one thing" : "Pick one move"}>
            {checkQuestion ? (
              <div className="flex flex-col gap-3">
                <p className="text-xl text-ink">{checkQuestion}</p>
                <BigButton onClick={() => setCheckQuestion(null)}>Yes, I&apos;m safe</BigButton>
                <GhostButton
                  onClick={() => {
                    raiseLevel(3);
                    showHelp("crisis", "home");
                  }}
                >
                  Not really
                </GhostButton>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {moves.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setPicked(m);
                      setStep("doing");
                    }}
                    className="flex flex-col gap-1 rounded-2xl border border-line bg-card px-5 py-4 text-left transition active:scale-[0.99]"
                  >
                    <span className="text-lg font-semibold text-ink">{m.title}</span>
                    <span className="text-base text-ink-soft">{m.detail}</span>
                  </button>
                ))}
              </div>
            )}
          </Screen>
        )}

        {step === "doing" && picked && (
          <Screen title={picked.title}>
            <p className="text-xl leading-relaxed text-ink">{picked.detail}</p>
            <p className="mt-3 text-ink-faint">Take your time. Come back when you&apos;ve done it.</p>
            <div className="mt-10 flex flex-col gap-3">
              <p className="text-center text-lg font-medium text-ink">Did it help?</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => sendFeedback(true)}
                  className="rounded-2xl border border-line bg-card py-5 text-3xl"
                  aria-label="Yes, it helped"
                >
                  👍
                </button>
                <button
                  onClick={() => sendFeedback(false)}
                  className="rounded-2xl border border-line bg-card py-5 text-3xl"
                  aria-label="No, it didn't help"
                >
                  👎
                </button>
              </div>
            </div>
          </Screen>
        )}

        {step === "thanks" && (
          <Screen title={helped ? "Nice one." : "Thanks for saying."}>
            <p className="text-lg text-ink-soft">
              {helped ? "That's your 0.5% today. Small moves count." : "Not every move lands. Want to try a different one?"}
            </p>
            <div className="mt-6 flex flex-col gap-3">
              {!helped && moves.length > 1 && <BigButton onClick={() => setStep("moves")}>Try another move</BigButton>}
              <GhostButton
                onClick={() => {
                  resetFlow();
                  setStep("home");
                }}
              >
                Done
              </GhostButton>
            </div>
          </Screen>
        )}

        {step === "help" && help && (
          <HelpScreen
            screen={help.screen}
            region={region}
            onRegionChange={changeRegion}
            onBack={
              help.returnTo
                ? () => {
                    const to = help.returnTo!;
                    const screen = help.screen;
                    setHelp(null);
                    if (to === "continue") {
                      getMoves(acknowledge(screen));
                    } else if (to === "words-ack") {
                      acknowledge(screen);
                      setStep("words");
                    } else {
                      setStep(to);
                    }
                  }
                : undefined
            }
          />
        )}

        {/* Level 1+ this session: a help card stays one tap away (Safety Pack section 5). */}
        {showHelpCard && step !== "home" && res.crisis[0] && (
          <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-line p-4">
            <p className="text-sm text-ink-soft">If it gets heavier, talk to someone now, free:</p>
            <ContactButton contact={res.crisis[0]} />
          </div>
        )}
        {showHelpCard && step === "home" && sessionLevel >= 3 && res.crisis[0] && (
          <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-line p-4">
            <p className="text-sm text-ink-soft">You don&apos;t have to carry this alone. Free, right now:</p>
            <ContactButton contact={res.crisis[0]} />
          </div>
        )}
      </main>
    </div>
  );
}

function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col">
      <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink">{title}</h1>
      {subtitle && <p className="mt-2 text-lg text-ink-soft">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function BigButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-3xl bg-accent px-5 py-5 text-xl font-bold text-accent-ink transition active:scale-[0.98]"
    >
      {children}
    </button>
  );
}

function GhostButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="w-full rounded-3xl border border-line px-5 py-4 text-lg font-medium text-ink-soft">
      {children}
    </button>
  );
}

function OptionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-line bg-card px-5 py-5 text-left text-xl font-semibold text-ink transition active:scale-[0.99]"
    >
      {children}
    </button>
  );
}

function Footer() {
  return (
    <footer className="text-center text-xs leading-relaxed text-ink-faint">
      FreezeFix isn&apos;t therapy, medical advice or an emergency service. 18+ only.
    </footer>
  );
}
