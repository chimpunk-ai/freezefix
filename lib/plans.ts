// Pricing. One price, one trial, one page.
//
// Every number a visitor sees is set here so changing a price is one edit.
// These strings are DISPLAY ONLY: the amount charged comes from the price in
// the payment provider's dashboard, which also applies local currency and VAT.
// If the two disagree, the provider is right and this file is wrong.

export const TRIAL_DAYS = Number(process.env.TRIAL_DAYS) || 7;

type Prices = { currency: string; yearly: string; monthly: string; yearlyPerMonth: string };

// Keyed by the region the browser reports. The euro is the launch currency in
// Italy and Spain; the provider still charges in the visitor's own currency.
// Updated 19 Nov 2026: $61/yr, $17/mo (was $39.99/$9.99), per the founder's
// own pricing call. Display only, per the note above — the provider's
// dashboard prices are the ones actually charged and must be updated to
// match before payments go live.
const PRICES: Record<string, Prices> = {
  US: { currency: "USD", yearly: "$61", monthly: "$17", yearlyPerMonth: "$5.08" },
  GB: { currency: "GBP", yearly: "£61", monthly: "£17", yearlyPerMonth: "£5.08" },
  IT: { currency: "EUR", yearly: "€61", monthly: "€17", yearlyPerMonth: "€5.08" },
  ES: { currency: "EUR", yearly: "€61", monthly: "€17", yearlyPerMonth: "€5.08" },
  FR: { currency: "EUR", yearly: "€61", monthly: "€17", yearlyPerMonth: "€5.08" },
  DE: { currency: "EUR", yearly: "€61", monthly: "€17", yearlyPerMonth: "€5.08" },
  NL: { currency: "EUR", yearly: "€61", monthly: "€17", yearlyPerMonth: "€5.08" },
  PT: { currency: "EUR", yearly: "€61", monthly: "€17", yearlyPerMonth: "€5.08" },
};
const FALLBACK: Prices = PRICES.US;

export function pricesFor(region?: string): Prices {
  return PRICES[(region || "").toUpperCase()] ?? FALLBACK;
}

export function plansFor(region?: string) {
  const p = pricesFor(region);
  return {
    yearly: {
      id: "yearly" as const,
      label: "A year",
      price: p.yearly,
      per: "year",
      perMonth: p.yearlyPerMonth,
      note: `${p.yearlyPerMonth} a month, billed yearly`,
      recommended: true,
    },
    monthly: {
      id: "monthly" as const,
      label: "A month",
      price: p.monthly,
      per: "month",
      perMonth: p.monthly,
      note: "cancel whenever",
      recommended: false,
    },
  };
}

export type PlanId = "yearly" | "monthly";

/** Kept so older screens carry on working; new code should call plansFor(region). */
export const PLANS = plansFor("US");

export function trialDates(from = new Date(), days = TRIAL_DAYS) {
  const ends = new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: "numeric", month: "long" });
  // The day before the first charge, never earlier than the day the trial
  // started: a one-day trial is reminded the same day, not in the past.
  const reminder = new Date(ends.getTime() - 24 * 60 * 60 * 1000);
  return {
    days,
    startsLabel: "Today",
    chargeLabel: fmt(ends),
    reminderLabel: fmt(reminder < from ? from : reminder),
    endsAt: ends,
  };
}

export function checkoutConfig() {
  return {
    provider: "paddle" as const,
    environment: process.env.PADDLE_ENV === "production" ? "production" : "sandbox",
    clientToken: process.env.PADDLE_CLIENT_TOKEN || "",
    prices: {
      yearly: process.env.PADDLE_PRICE_YEARLY || "",
      monthly: process.env.PADDLE_PRICE_MONTHLY || "",
    },
  };
}

export function paymentsOn(): boolean {
  const c = checkoutConfig();
  return Boolean(c.clientToken && c.prices.yearly && c.prices.monthly);
}
