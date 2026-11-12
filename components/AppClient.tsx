"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HelpChip, Wordmark } from "@/components/Brand";
import FixSheet from "@/components/FixSheet";
import LogScreen from "@/components/LogScreen";
import Onboarding from "@/components/Onboarding";
import { PatternCard, WeekGrid } from "@/components/PatternCard";
import { Container, Main } from "@/components/Shell";
import { useRegion } from "@/components/useRegion";
import { clearEntries, readEntries, todayISO, type Entries } from "@/lib/entry";
import { clearSeen, dueMirror, latestMirror, markSeen } from "@/lib/mirror";
import { recentWeeks, weekStats, type WeekStats } from "@/lib/pattern";
import { BEDTIMES, GOAL_EXAMPLES, bedtimeLabel, clearProfile, patchProfile, readProfile, type Profile } from "@/lib/profile";
import { clearChimePref, readChimePref, writeChimePref, type ChimePref } from "@/lib/chime-pref";
import { trialState } from "@/lib/trial";

// The app shell. No navigation tree, no home screen, no feed: the log is the
// home, the mirror slides up when it's Sunday, and Fix sits behind one button.
//
// Everything the user writes stays on this device. The only server calls are the
// voice transcript, Fix, and the trial/payment record.

export type View = "log" | "weeks" | "settings";

/**
 * What the server says about money, as far as this device is concerned.
 *
 * - paymentsOn: a checkout exists. While false, nothing can be charged and
 *   nothing locks — the free week is simply free. The server is the only
 *   source of truth for this (lib/plans.ts paymentsOn()).
 * - paid: an active plan or trial on this device, per the server. Only
 *   meaningful when paymentsOn is true; /api/paywall reports active=true for
 *   everyone while payments are off, which must not read as "subscribed".
 *
 * Unknown (fetch failed, offline) is treated as payments off: a person's own
 * local log is never locked because our server couldn't be reached. The
 * server enforces the Fix paywall on its own side regardless.
 */
export type Billing = { paymentsOn: boolean; paid: boolean };

export default function AppClient({ view = "log" }: { view?: View }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<Entries>({});
  const [billing, setBilling] = useState<Billing>({ paymentsOn: false, paid: false });
  const [fixOpen, setFixOpen] = useState(false);
  const [manualSheet, setManualSheet] = useState<WeekStats | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const region = useRegion();

  useEffect(() => {
    // One-time read of this device's own storage. The server cannot know what is
    // on the phone, so this is the hydration-safe bootstrap rather than a
    // render-driven sync — the compiler's setState-in-effect heuristic does not
    // apply to a mount-only read.
    /* eslint-disable react-hooks/set-state-in-effect */
    setProfile(readProfile());
    setEntries(readEntries());
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    fetch("/api/paywall", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { active?: boolean; paymentsOn?: boolean }) =>
        setBilling({ paymentsOn: Boolean(d.paymentsOn), paid: Boolean(d.paymentsOn) && Boolean(d.active) })
      )
      .catch(() => setBilling({ paymentsOn: false, paid: false }));
  }, []);

  // The Sunday card arrives on its own, once. It is derived from the log instead
  // of being pushed into state by an effect: dueMirror is pure and cheap, and the
  // only thing worth remembering is which week the user already closed.
  const due = ready && profile?.onboarded && view === "log" ? dueMirror(entries, profile.goal) : null;
  const sheet = manualSheet ?? (due && due.end !== dismissed ? due : null);

  const closeSheet = useCallback(() => {
    if (sheet) {
      markSeen(sheet.end);
      setDismissed(sheet.end);
    }
    setManualSheet(null);
  }, [sheet]);

  const openFix = useCallback(() => setFixOpen(true), []);

  if (!ready || !profile) {
    return (
      <Main className="flex min-h-dvh items-center justify-center px-5">
        <span className="breathe h-3 w-3 rounded-full bg-accent/50" role="status" aria-label="loading" />
      </Main>
    );
  }

  const trial = trialState(profile);
  // The free week only ends when there is something to buy at the end of it.
  const locked = Boolean(profile.onboarded && trial.ended && billing.paymentsOn && !billing.paid);
  const stats = latestMirror(entries, profile.goal);
  const planLabel = billing.paid
    ? "subscribed"
    : !billing.paymentsOn
      ? "free, for now"
      : trial.daysLeft
        ? `${trial.daysLeft} free ${trial.daysLeft === 1 ? "day" : "days"} left`
        : "free week";
  const thisWeek = weekStats(entries, profile.goal);

  return (
    <Main className="min-h-dvh">
      <header>
        {/* Always the site measure, so the wordmark stays where it was on the
            landing page when someone taps "start" — on a laptop the set-up
            header otherwise floats in a 560px column in the middle of the
            window. The set-up and the locked screen below still use the
            560px app measure for their own content. */}
        <Container measure="site" className="flex items-center justify-between py-5">
          <Wordmark href={profile?.onboarded ? "/app" : "/"} />
          <nav aria-label="app" className="flex items-center gap-2 sm:gap-4">
            {profile?.onboarded ? (
              <>
                <Link href="/app/weeks" className={navLink(view === "weeks")}>
                  the shelf
                </Link>
                <Link href="/app/settings" className={navLink(view === "settings")}>
                  you
                </Link>
              </>
            ) : null}
            <HelpChip compact />
          </nav>
        </Container>
      </header>

      {!profile?.onboarded ? (
        <Onboarding
          onDone={(p) => {
            setProfile(p);
            setEntries(readEntries());
          }}
        />
      ) : locked ? (
        <section className="mx-auto w-full max-w-[560px] px-5 py-10">
          <h1 className="font-display text-28 text-ink">the free week is done.</h1>
          <p className="mt-3 text-16 text-ink-soft">
            your log is still here, on this phone, and it isn&rsquo;t going anywhere. the mirror opens
            again when you&rsquo;re ready to keep going.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/plans" className="rounded-pill bg-accent px-5 py-3 text-16 font-medium text-bg no-underline">
              see what it costs
            </Link>
            <Link
              href="/app/settings"
              className="rounded-pill border border-line px-5 py-3 text-16 text-ink-soft no-underline"
            >
              your data
            </Link>
          </div>
          <p className="mt-6 text-12 text-ink-faint">
            the help page stays free, always. no account, no payment, no gate.
          </p>
        </section>
      ) : view === "weeks" ? (
        <WeeksView
          weeks={recentWeeks(entries, profile.goal, 12)}
          name={profile.name}
          onAsk={openFix}
        />
      ) : view === "settings" ? (
        <SettingsView
          profile={profile}
          entries={entries}
          planLabel={planLabel}
          paymentsOn={billing.paymentsOn}
          onChange={(p) => setProfile(p)}
        />
      ) : (
        <Container className="grid items-start gap-10 lg:grid-cols-[minmax(0,560px)_minmax(280px,400px)] lg:justify-center lg:gap-16">
          <div className="min-w-0">
            <LogScreen
              profile={profile}
              entries={entries}
              onSaved={(next) => setEntries(next)}
              onOpenFix={openFix}
              onOpenMirror={() => {
                setManualSheet(dueMirror(entries, profile.goal) ?? stats);
              }}
              mirrorReady={Boolean(dueMirror(entries, profile.goal))}
            />
            <p className="px-5 pb-10 text-center text-12 text-ink-faint lg:hidden">
              <Link href="/plans" className="underline decoration-line underline-offset-4 hover:text-ink-soft">
                {planLabel}
              </Link>
            </p>
          </div>
          <WeekRail
            name={profile.name}
            thisWeek={thisWeek}
            latest={stats}
            mirrorReady={Boolean(dueMirror(entries, profile.goal))}
            planLabel={planLabel}
            onOpenMirror={() => setManualSheet(dueMirror(entries, profile.goal) ?? stats)}
            onAsk={openFix}
          />
        </Container>
      )}

      {sheet ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 md:items-center md:p-6" role="dialog" aria-modal="true" aria-label="your week">
          <button type="button" aria-label="close" onClick={closeSheet} className="absolute inset-0 cursor-default" />
          <div className="ff-sheet relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-t-sheet border border-line bg-bg p-3 md:rounded-sheet">
            <PatternCard name={profile.name} stats={sheet} onAsk={() => { closeSheet(); openFix(); }} onClose={closeSheet} />
          </div>
        </div>
      ) : null}

      {stats ? (
        <FixSheet
          open={fixOpen}
          onClose={() => setFixOpen(false)}
          name={profile.name}
          stats={stats}
          entries={entries}
          goal={profile.goal}
          region={region}
          onPaywall={() => setFixOpen(false)}
        />
      ) : null}
    </Main>
  );
}

function navLink(current: boolean): string {
  return [
    "inline-flex min-h-11 items-center px-1 text-14 no-underline",
    current ? "text-ink" : "text-ink-faint hover:text-ink",
  ].join(" ");
}

/**
 * The quiet second column on a laptop. On a phone it sits under the log.
 * Nothing here is a feed: this week so far (the same grid the Sunday card
 * will draw), the last card if there is one, and the plan line.
 */
function WeekRail({
  name,
  thisWeek,
  latest,
  mirrorReady,
  planLabel,
  onOpenMirror,
  onAsk,
}: {
  name: string;
  thisWeek: WeekStats;
  latest: WeekStats;
  mirrorReady: boolean;
  planLabel: string;
  onOpenMirror: () => void;
  onAsk: () => void;
}) {
  const who = name.trim() || "you";
  return (
    <aside aria-label="this week" className="hidden lg:block lg:sticky lg:top-8">
      <div className="rounded-sheet border border-line bg-card/70 p-5">
        <p className="text-14 text-ink-faint">this week so far</p>
        <p className="mt-1 font-display text-20 text-ink">
          {thisWeek.logged === 0 ? `nothing yet, ${who}.` : thisWeek.sentences[0]}
        </p>
        <div className="mt-4">
          <WeekGrid stats={thisWeek} />
        </div>
        <p className="mt-3 text-12 text-ink-faint">a dot is a night with no entry. it isn&rsquo;t a no.</p>
        {mirrorReady ? (
          <button
            type="button"
            onClick={onOpenMirror}
            className="ff-chip mt-4 inline-flex min-h-11 items-center rounded-pill bg-signpost px-4 text-14 font-medium text-signpost-ink"
          >
            your week is ready
          </button>
        ) : null}
      </div>

      {latest.logged > 0 && latest.end !== thisWeek.end ? (
        <div className="mt-5">
          <p className="mb-2 text-14 text-ink-faint">last card</p>
          <PatternCard name={name} stats={latest} onAsk={onAsk} dimmed />
        </div>
      ) : null}

      <p className="mt-5 text-12 text-ink-faint">
        <Link href="/plans" className="underline decoration-line underline-offset-4 hover:text-ink-soft">
          {planLabel}
        </Link>
      </p>
    </aside>
  );
}

/** The shelf. Exported so the landing can show the real one inside a phone frame. */
export function WeeksView({ weeks, name, onAsk }: { weeks: WeekStats[]; name: string; onAsk: () => void }) {
  return (
    <Container className="pb-16">
      <section className="lg:max-w-[720px]">
      <p className="text-12 uppercase tracking-[0.14em] text-ink-faint">the shelf</p>
      <h1 className="mt-2 font-display text-28 text-ink">your weeks</h1>
      <p className="mt-2 text-14 text-ink-faint">newest first. quiet, not a feed.</p>

      {weeks.length === 0 ? (
        <p className="mt-8 rounded-card border border-line bg-card px-4 py-5 text-14 text-ink-soft">
          nothing here yet. log a few nights and the first week will land on sunday.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          {weeks.map((w) => (
            <PatternCard key={w.end} name={name} stats={w} onAsk={onAsk} dimmed />
          ))}
        </div>
      )}

      <Link href="/app" className="mt-8 inline-flex min-h-11 items-center text-14 text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft">
        back to tonight
      </Link>
      </section>
    </Container>
  );
}

function SettingsView({
  profile,
  entries,
  planLabel,
  paymentsOn,
  onChange,
}: {
  profile: Profile;
  entries: Entries;
  planLabel: string;
  paymentsOn: boolean;
  onChange: (p: Profile) => void;
}) {
  const [name, setName] = useState(profile.name);
  const [bedtime, setBedtime] = useState(profile.bedtime);
  const [goalText, setGoalText] = useState(profile.goal?.text ?? "");
  const [target, setTarget] = useState(profile.goal?.target ?? 2);
  const [saved, setSaved] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [chime, setChime] = useState<ChimePref>("unset");
  const router = useRouter();

  useEffect(() => {
    setChime(readChimePref());
  }, []);

  function setChimeAnd(answer: "yes" | "no") {
    writeChimePref(answer);
    setChime(answer);
  }

  const logged = Object.keys(entries).length;

  function save() {
    const p = patchProfile({
      name: name.trim().slice(0, 24),
      bedtime,
      goal: goalText.trim()
        ? { text: goalText.trim().slice(0, 80), target, madeAt: profile.goal?.madeAt ?? todayISO() }
        : null,
    });
    onChange(p);
    setSaved(true);
  }

  function forget() {
    // Every ff_* key the app writes, not just the two big ones. The privacy
    // policy (§9) promises this removes "the log, your name, your settings and
    // the help-page country choice"; scripts/test-legal.ts pins the list.
    clearEntries(); // ff_entries
    clearProfile(); // ff_profile
    clearSeen(); // ff_mirror_seen
    clearChimePref(); // ff_chime, ff_chime_asked
    try {
      window.localStorage.removeItem("ff_region"); // help-page country pick
    } catch {
      /* storage can be blocked */
    }
    router.replace("/");
  }

  return (
    <Container className="pb-16">
      <section className="lg:grid lg:grid-cols-[minmax(0,560px)_minmax(280px,400px)] lg:justify-center lg:gap-16">
      <div>
      <p className="text-14 text-ink-faint">you</p>
      <h1 className="mt-2 font-display text-28 text-ink">the small stuff</h1>

      <div className="mt-6 space-y-6">
        <label className="block">
          <span className="text-14 text-ink-soft">the name the mirror uses</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 24))}
            className="mt-2 w-full rounded-card border border-line bg-card px-4 py-3 font-display text-20 text-ink focus:border-accent/50 focus:outline-none"
          />
        </label>

        <div>
          <p className="text-14 text-ink-soft">the one ping</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {BEDTIMES.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setBedtime(h)}
                aria-pressed={bedtime === h}
                className={[
                  "ff-chip rounded-pill border px-3.5 py-2 text-14",
                  bedtime === h ? "border-accent/50 bg-accent/15 text-accent" : "border-line bg-card text-ink-soft",
                ].join(" ")}
              >
                {bedtimeLabel(h)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-14 text-ink-soft">your thing</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GOAL_EXAMPLES.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGoalText(g)}
                aria-pressed={goalText === g}
                className={[
                  "ff-chip rounded-pill border px-3 py-1.5 text-12",
                  goalText === g ? "border-accent/50 bg-accent/15 text-accent" : "border-line bg-card text-ink-soft",
                ].join(" ")}
              >
                {g}
              </button>
            ))}
          </div>
          <input
            value={goalText}
            onChange={(e) => setGoalText(e.target.value.slice(0, 80))}
            placeholder="in your words"
            className="mt-2 w-full rounded-card border border-line bg-card px-4 py-3 text-14 text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none"
          />
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setTarget(n)}
                aria-pressed={target === n}
                className={[
                  "ff-chip h-9 w-9 rounded-full border text-14",
                  target === n ? "border-accent/50 bg-accent/15 text-accent" : "border-line bg-card text-ink-soft",
                ].join(" ")}
              >
                {n}
              </button>
            ))}
            <span className="self-center text-12 text-ink-faint">times a week</span>
          </div>
        </div>

        <div>
          <p className="text-14 text-ink-soft">the sunday chime</p>
          <p className="mt-1 text-12 text-ink-faint">
            one soft tone when the weekly card finishes drawing. it never plays anywhere else, and it
            follows your device&rsquo;s reduced-motion setting.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setChimeAnd("yes")}
              aria-pressed={chime === "yes"}
              className={[
                "ff-chip rounded-pill border px-3.5 py-2 text-14",
                chime === "yes"
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-line bg-card text-ink-soft",
              ].join(" ")}
            >
              softly, yes
            </button>
            <button
              type="button"
              onClick={() => setChimeAnd("no")}
              aria-pressed={chime === "no"}
              className={[
                "ff-chip rounded-pill border px-3.5 py-2 text-14",
                chime === "no"
                  ? "border-accent/50 bg-accent/15 text-accent"
                  : "border-line bg-card text-ink-soft",
              ].join(" ")}
            >
              no, silence
            </button>
            {chime === "unset" ? (
              <span className="self-center text-12 text-ink-faint">pick one — default is silence.</span>
            ) : null}
          </div>
        </div>

        <button type="button" onClick={save} className="w-full rounded-pill bg-accent px-6 py-3 text-16 font-medium text-bg">
          save
        </button>
        {saved ? <p className="text-center text-12 text-ink-faint">saved.</p> : null}
      </div>

      </div>

      <div className="lg:pt-10">
      <div className="mt-10 rounded-card border border-line bg-card px-4 py-4 lg:mt-0">
        <p className="text-14 text-ink">
          {paymentsOn ? planLabel : "free, for now. payments aren't switched on, so nothing can be charged."}
        </p>
        <p className="mt-1 text-12 text-ink-faint">
          {logged} {logged === 1 ? "night" : "nights"} logged on this device. nothing here has an email
          attached, and there is nothing on our side to look up.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-12">
          <Link href="/plans" className="text-accent underline decoration-accent/40 underline-offset-4">
            what it costs
          </Link>
          <Link href="/privacy" className="text-ink-faint underline decoration-line underline-offset-4">
            privacy
          </Link>
          <Link href="/help" className="text-frost underline decoration-frost/40 underline-offset-4">
            get help now
          </Link>
        </div>
      </div>

      <div className="mt-8">
        {confirming ? (
          <div className="rounded-card border border-frost/30 bg-frost/[0.06] px-4 py-4">
            <p className="text-14 text-ink">forget everything on this device?</p>
            <p className="mt-1 text-12 text-ink-faint">
              every night, every note, your name, your thing, your chime and country choices. there is
              no copy anywhere else, so there is no undo.
            </p>
            <div className="mt-3 flex gap-3">
              <button type="button" onClick={forget} className="rounded-pill border border-frost/40 px-4 py-2 text-14 text-frost">
                forget it
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-pill border border-line px-4 py-2 text-14 text-ink-soft"
              >
                keep it
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-14 text-ink-faint underline decoration-line underline-offset-4 hover:text-ink-soft"
          >
            forget everything
          </button>
        )}
      </div>
      </div>
      </section>
    </Container>
  );
}
