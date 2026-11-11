"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Container, Main, SiteHeader } from "@/components/Shell";
import SiteFooter from "@/components/SiteFooter";
import { TrustBadge } from "@/components/TrustBadge";
import { useRegion } from "@/components/useRegion";
import { plansFor, TRIAL_DAYS, trialDates, type PlanId } from "@/lib/plans";

// One price, one trial, one page. Yearly is the default and the honest one.
// When Paddle isn't configured the button becomes a launch list instead of a
// fake checkout — the price shown is always the real price.

type Checkout = {
  environment: "sandbox" | "production";
  clientToken: string;
  prices: Record<PlanId, string>;
};

type PaddleGlobal = {
  Environment: { set: (env: string) => void };
  Initialize: (opts: { token: string; eventCallback?: (e: { name?: string }) => void }) => void;
  Checkout: {
    open: (opts: {
      items: { priceId: string; quantity: number }[];
      customData?: Record<string, string>;
      settings?: Record<string, unknown>;
    }) => void;
  };
};

declare global {
  interface Window {
    Paddle?: PaddleGlobal;
  }
}

function loadPaddle(): Promise<PaddleGlobal> {
  return new Promise((resolve, reject) => {
    if (window.Paddle) return resolve(window.Paddle);
    const s = document.createElement("script");
    s.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    s.async = true;
    s.onload = () => (window.Paddle ? resolve(window.Paddle) : reject(new Error("no paddle")));
    s.onerror = () => reject(new Error("load failed"));
    document.head.appendChild(s);
  });
}

export default function PlansPage() {
  const region = useRegion();
  const [plan, setPlan] = useState<PlanId>("yearly");
  const [state, setState] = useState<"loading" | "ready" | "off" | "opening" | "confirming" | "active" | "error">(
    "loading"
  );
  const cfg = useRef<{ ref: string; checkout: Checkout } | null>(null);
  const initialised = useRef(false);

  useEffect(() => {
    fetch("/api/paywall", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.active) {
          setState("active");
          return;
        }
        cfg.current = { ref: d.ref, checkout: d.checkout };
        setState(d.paymentsOn ? "ready" : "off");
      })
      .catch(() => setState("error"));
  }, []);

  const plans = plansFor(region);
  const dates = trialDates();

  async function confirm() {
    setState("confirming");
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      try {
        const d = await (await fetch("/api/paywall", { cache: "no-store" })).json();
        if (d.active) {
          setState("active");
          return;
        }
      } catch {
        /* keep trying */
      }
    }
    setState("error");
  }

  async function start() {
    const c = cfg.current;
    if (!c) return;
    setState("opening");
    try {
      const paddle = await loadPaddle();
      if (!initialised.current) {
        if (c.checkout.environment === "sandbox") paddle.Environment.set("sandbox");
        paddle.Initialize({
          token: c.checkout.clientToken,
          eventCallback: (e) => {
            if (e.name === "checkout.completed") confirm();
            if (e.name === "checkout.closed") setState((s) => (s === "confirming" ? s : "ready"));
          },
        });
        initialised.current = true;
      }
      paddle.Checkout.open({
        items: [{ priceId: c.checkout.prices[plan], quantity: 1 }],
        customData: { ref: c.ref },
        settings: { displayMode: "overlay", theme: "dark", locale: "en", allowLogout: false },
      });
      setState("ready");
    } catch {
      setState("error");
    }
  }

  return (
    <>
      <SiteHeader cta={{ href: "/app", label: "open the app" }} />
      <Main className="min-h-dvh">
        <Container className="pb-16 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:gap-16 lg:pt-6">
          <section aria-labelledby="plans-heading">
            {state === "off" ? (
              <>
                <h1 id="plans-heading" className="font-display text-40 leading-tight text-ink lg:text-56">
                  free, for now.
                </h1>
                <p className="mt-3 max-w-[52ch] text-16 text-ink-soft lg:text-20 lg:leading-[1.4]">
                  everything is open: the log, the Sunday card, the shelf, Fix. no card, no email. the
                  price below is the price it will be once payments are switched on — you&rsquo;ll see
                  it here first, and nothing can be charged until then.
                </p>
              </>
            ) : (
              <>
                <h1 id="plans-heading" className="font-display text-40 leading-tight text-ink lg:text-56">
                  one price. one week free.
                </h1>
                <p className="mt-3 max-w-[52ch] text-16 text-ink-soft lg:text-20 lg:leading-[1.4]">
                  everything is in the free week: the log, the Sunday card, the shelf, Fix. no card to
                  start. no trial that quietly turns into a charge.
                </p>
              </>
            )}

            <div className="mt-8 grid gap-3 md:grid-cols-2" role="radiogroup" aria-label="billing">
              {(["yearly", "monthly"] as PlanId[]).map((id) => {
                const p = plans[id];
                const selected = plan === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setPlan(id)}
                    className={[
                      "ff-chip flex min-h-11 w-full flex-col rounded-sheet border p-5 text-left",
                      selected ? "border-accent/60 bg-accent/[0.07]" : "border-line bg-card hover:border-ink-faint",
                    ].join(" ")}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-16 text-ink">{p.label}</span>
                      <span
                        aria-hidden
                        className={[
                          "h-4 w-4 rounded-full border",
                          selected ? "border-accent bg-accent" : "border-ink-faint",
                        ].join(" ")}
                      />
                    </span>
                    <span className="mt-4 block font-display text-40 leading-none text-ink">{p.price}</span>
                    <span className="mt-1 block text-14 text-ink-soft">billed once a {p.per}</span>
                    <span className="mt-3 block text-12 text-ink-faint">{p.note}</span>
                  </button>
                );
              })}
            </div>

            <p className="mt-4 text-12 text-ink-faint" aria-live="polite">
              {state === "off"
                ? `when payments switch on: ${TRIAL_DAYS} days free first, then the price above.`
                : `${TRIAL_DAYS} days free, from ${dates.startsLabel.toLowerCase()} to ${dates.chargeLabel}.`}
            </p>

            {state === "active" ? (
              <div className="mt-6 rounded-card border border-accent/30 bg-accent/[0.07] px-4 py-4">
                <p className="text-14 text-ink">this device already has it.</p>
                <Link href="/app" className="mt-2 inline-flex min-h-11 items-center text-14 text-accent underline decoration-accent/40 underline-offset-4">
                  back to tonight
                </Link>
              </div>
            ) : state === "off" ? (
              <div className="mt-6">
                <Link
                  href="/app"
                  className="ff-chip inline-flex min-h-12 w-full items-center justify-center rounded-pill bg-signpost px-6 text-16 font-medium text-signpost-ink no-underline shadow-[0_8px_24px_-12px_rgba(240,168,104,0.6)] transition-transform hover:-translate-y-[1px] md:w-auto"
                >
                  open the app, free
                </Link>
                <p className="mt-3 text-12 text-ink-faint">
                  payments aren&rsquo;t switched on yet, so nothing can be charged and nothing runs out.
                  the price above is the price it will be.
                </p>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={start}
                  disabled={state === "loading" || state === "opening" || state === "confirming"}
                  className="ff-chip inline-flex min-h-12 w-full items-center justify-center rounded-pill bg-signpost px-6 text-16 font-medium text-signpost-ink shadow-[0_8px_24px_-12px_rgba(240,168,104,0.6)] transition-transform hover:-translate-y-[1px] disabled:opacity-60 disabled:hover:translate-y-0 md:w-auto"
                >
                  {state === "confirming"
                    ? "waiting for the receipt…"
                    : state === "opening"
                      ? "opening checkout…"
                      : `start ${TRIAL_DAYS} days free`}
                </button>
                {state === "error" ? (
                  <p className="mt-3 text-12 text-frost" role="alert">
                    the checkout didn&rsquo;t open. nothing was charged. try again, or write to us and we&rsquo;ll
                    sort it out.
                  </p>
                ) : null}
              </div>
            )}

            <p className="mt-8 text-12 text-ink-faint">
              prices shown in your local currency where we know it; the payment provider applies VAT and the
              exact amount at checkout.{" "}
              <Link href="/refunds" className="underline decoration-line underline-offset-4">
                refunds
              </Link>{" "}
              ·{" "}
              <Link href="/terms" className="underline decoration-line underline-offset-4">
                terms
              </Link>
            </p>
          </section>

          <aside aria-label="what's included" className="mt-10 lg:mt-2">
            <TrustBadge />
            <div className="mt-6 space-y-4 text-14 text-ink-soft">
              <p>
                <span className="text-ink">what you get:</span> the nightly log, the Sunday mirror, the shelf
                of past weeks, and Fix — five questions a day on the free week, twenty a day on the paid
                plan. it&rsquo;s capped on purpose; a chart with manners shouldn&rsquo;t be a chat habit.
              </p>
              <p>
                <span className="text-ink">what you don&rsquo;t get:</span> a streak, a leaderboard, a
                community feed, a coach, or an email asking why you left. we don&rsquo;t have your email.
              </p>
              <p>
                the help page is free forever, with or without a plan.{" "}
                <Link href="/help" className="text-frost underline decoration-frost/40 underline-offset-4">
                  get help now
                </Link>
              </p>
            </div>
          </aside>
        </Container>

        <Container className="pb-14">
          <SiteFooter />
        </Container>
      </Main>
    </>
  );
}
