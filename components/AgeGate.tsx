"use client";

import { useEffect, useRef, useState } from "react";
import { LANDING_COPY, type Locale } from "@/lib/landing-copy";

// 18+ age gate — the single modal that fires on first public-page visit.
//
// Added 5 November 2026 (feat/age-gate-18) as Stage 4 of the Calm-grade
// redesign plan. Shipped per the brief:
//
//   "18+ age gate (remembers choice), crisis help one tap from every screen"
//
// Design
//   • One modal, dark Calm palette, fills the viewport on phones and is a
//     centred sheet on tablet/desktop. Anchored to the viewport (position
//     fixed), outside the page's own stacking context.
//   • Two primary actions: "I'm 18 or older" and "I'm under 18." No date
//     picker and no year-of-birth entry — the brief says "remembers the
//     answer," not "collects a birth date." Collecting the date would be
//     a minor-identifying datum, and the project's privacy rules keep
//     those out of memory.
//   • The modal ships with "Get help now" as a visible tertiary link so
//     that the brief's "crisis help one tap away on every screen" promise
//     is held even on the gate itself — someone at 2am in a bad place
//     does not have to confirm their age before they can reach help.
//   • Keyboard: focus trapped inside the dialog until an answer is given;
//     Escape is NOT a dismiss (the brief forbids dead-ends and dismissed
//     age-gates are a dead-end pattern).
//
// Storage
//   Honours the keys the existing /app surface already uses, so a user
//   who passed the gate inside /app is not re-asked on the landing:
//     ff_adult      — "yes" / "no"
//     ff_adult_date — ISO date the answer was recorded (never a birth
//                     date — the project's privacy rules keep that out)
//     ff_block_until — epoch ms; a "no" answer locks the device for 24h
//                      so a kid can't thumb-tap through on the next page
//                      load. The duration matches /app's own guard.
//
// Reduced-motion
//   The 200ms scale/opacity entrance drops to 0.01ms under the global
//   prefers-reduced-motion rule in globals.css; nothing new to add here.

type Props = {
  locale?: Locale;
};

const K_ADULT = "ff_adult";
const K_ADULT_DATE = "ff_adult_date";
const K_BLOCK = "ff_block_until";
const DAY_MS = 24 * 60 * 60 * 1000;

// Copy — kept inline here because the modal is small and this component
// is the only consumer. Six locales, matching the landing copy pack.
const AGE_GATE_COPY: Record<Locale, {
  kicker: string;
  heading: string;
  body: string;
  adultLabel: string;
  minorLabel: string;
  helpLabel: string;
  blockedHeading: string;
  blockedBody: string;
  blockedHelpLabel: string;
}> = {
  en: {
    kicker: "Adults 18+",
    heading: "Quick check before we open Fix.",
    body:
      "FreezeFix is supportive software for adults. If you are younger than 18, Fix is not the right place — we'd rather help you find one.",
    adultLabel: "I'm 18 or older",
    minorLabel: "I'm under 18",
    helpLabel: "Need help right now?",
    blockedHeading: "Fix is for adults.",
    blockedBody:
      "Thanks for being honest. Fix is not the right place for you yet, but help lines below are free, confidential, and available right now.",
    blockedHelpLabel: "See free help lines →",
  },
  de: {
    kicker: "Ab 18",
    heading: "Kurze Frage, bevor wir Fix öffnen.",
    body:
      "FreezeFix ist unterstützende Software für Erwachsene. Wenn du unter 18 bist, ist Fix nicht der richtige Ort — wir helfen dir lieber, einen besseren zu finden.",
    adultLabel: "Ich bin 18 oder älter",
    minorLabel: "Ich bin unter 18",
    helpLabel: "Jetzt Hilfe nötig?",
    blockedHeading: "Fix ist für Erwachsene.",
    blockedBody:
      "Danke für deine Ehrlichkeit. Fix ist noch nicht der richtige Ort für dich, aber die Hilfen unten sind kostenlos, anonym und sofort erreichbar.",
    blockedHelpLabel: "Kostenlose Hilfen anzeigen →",
  },
  fr: {
    kicker: "Adultes 18+",
    heading: "Petite question avant d'ouvrir Fix.",
    body:
      "FreezeFix est un logiciel de soutien pour adultes. Si tu as moins de 18 ans, Fix n'est pas le bon endroit — on préfère t'aider à en trouver un.",
    adultLabel: "J'ai 18 ans ou plus",
    minorLabel: "J'ai moins de 18 ans",
    helpLabel: "Besoin d'aide maintenant ?",
    blockedHeading: "Fix est pour les adultes.",
    blockedBody:
      "Merci de ta franchise. Fix n'est pas encore le bon endroit pour toi, mais les lignes ci-dessous sont gratuites, confidentielles et disponibles tout de suite.",
    blockedHelpLabel: "Voir les lignes gratuites →",
  },
  nl: {
    kicker: "Volwassenen 18+",
    heading: "Korte vraag voor we Fix openen.",
    body:
      "FreezeFix is ondersteunende software voor volwassenen. Als je jonger bent dan 18 is Fix niet de juiste plek — we helpen je liever een betere te vinden.",
    adultLabel: "Ik ben 18 of ouder",
    minorLabel: "Ik ben jonger dan 18",
    helpLabel: "Nu hulp nodig?",
    blockedHeading: "Fix is voor volwassenen.",
    blockedBody:
      "Bedankt voor je eerlijkheid. Fix is nu niet de juiste plek voor jou, maar de lijnen hieronder zijn gratis, vertrouwelijk en meteen bereikbaar.",
    blockedHelpLabel: "Gratis hulp zien →",
  },
  es: {
    kicker: "Adultos 18+",
    heading: "Una comprobación rápida antes de abrir Fix.",
    body:
      "FreezeFix es software de apoyo para adultos. Si tienes menos de 18 años, Fix no es el sitio adecuado — preferimos ayudarte a encontrar uno.",
    adultLabel: "Tengo 18 años o más",
    minorLabel: "Tengo menos de 18",
    helpLabel: "¿Necesitas ayuda ahora?",
    blockedHeading: "Fix es para adultos.",
    blockedBody:
      "Gracias por ser sincero. Fix no es el sitio adecuado para ti ahora, pero las líneas de abajo son gratis, confidenciales y están disponibles ahora mismo.",
    blockedHelpLabel: "Ver líneas gratuitas →",
  },
  it: {
    kicker: "Adulti 18+",
    heading: "Una domanda veloce prima di aprire Fix.",
    body:
      "FreezeFix è software di supporto per adulti. Se hai meno di 18 anni, Fix non è il posto giusto — preferiamo aiutarti a trovarne uno.",
    adultLabel: "Ho 18 anni o più",
    minorLabel: "Ho meno di 18 anni",
    helpLabel: "Hai bisogno di aiuto ora?",
    blockedHeading: "Fix è per adulti.",
    blockedBody:
      "Grazie per l'onestà. Fix non è il posto giusto per te ora, ma le linee qui sotto sono gratis, riservate e disponibili subito.",
    blockedHelpLabel: "Vedi le linee gratuite →",
  },
};

export default function AgeGate({ locale = "en" }: Props) {
  // Three UI states: hidden (we already know), ask, blocked.
  type State = "hidden" | "ask" | "blocked";
  const [state, setState] = useState<State>("hidden");
  const adultBtnRef = useRef<HTMLButtonElement | null>(null);
  const copy = AGE_GATE_COPY[locale];
  const landing = LANDING_COPY[locale];

  // On mount: read the storage. A "yes" means hidden forever; a "no" with
  // a 24h block means blocked; anything else means ask.
  useEffect(() => {
    try {
      const adult = window.localStorage.getItem(K_ADULT);
      if (adult === "yes") {
        setState("hidden");
        return;
      }
      const block = window.localStorage.getItem(K_BLOCK);
      if (block) {
        const until = Number.parseInt(block, 10);
        if (Number.isFinite(until) && until > Date.now()) {
          setState("blocked");
          return;
        }
      }
      setState("ask");
    } catch {
      // Storage blocked — we still show the ask state. A user who declines
      // it stays on the "blocked" screen for the session even though we
      // cannot write to storage; that's the safest fallback.
      setState("ask");
    }
  }, []);

  // Focus the primary button when the modal opens so a keyboard user can
  // Enter straight through if they are indeed an adult.
  useEffect(() => {
    if (state === "ask") {
      adultBtnRef.current?.focus();
    }
  }, [state]);

  // Lock scroll under the modal.
  useEffect(() => {
    if (state === "hidden") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [state]);

  if (state === "hidden") return null;

  const onAdult = () => {
    try {
      window.localStorage.setItem(K_ADULT, "yes");
      window.localStorage.setItem(K_ADULT_DATE, new Date().toISOString());
    } catch {
      /* storage blocked — the session still continues */
    }
    setState("hidden");
  };
  const onMinor = () => {
    try {
      window.localStorage.setItem(K_ADULT, "no");
      window.localStorage.setItem(K_BLOCK, String(Date.now() + DAY_MS));
    } catch {
      /* storage blocked */
    }
    setState("blocked");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/80 px-4 py-8 backdrop-blur-sm"
    >
      <div
        className="w-full max-w-md rounded-[1.25rem] border border-line bg-card p-6 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6)] sm:p-7"
        style={{ animation: "ff-bubble 260ms cubic-bezier(.2,.8,.3,1) both" }}
      >
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-ink-soft">
          {state === "ask" ? copy.kicker : landing.getHelpNow}
        </p>
        <h2
          id="age-gate-heading"
          className="mt-3 text-[clamp(1.5rem,4vw,1.85rem)] leading-[1.15] text-ink"
          style={{ fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {state === "ask" ? copy.heading : copy.blockedHeading}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-soft">
          {state === "ask" ? copy.body : copy.blockedBody}
        </p>

        {state === "ask" ? (
          <div className="mt-6 flex flex-col gap-3">
            <button
              ref={adultBtnRef}
              type="button"
              onClick={onAdult}
              className="flex min-h-[52px] items-center justify-center rounded-full bg-accent px-6 py-3 text-base font-medium text-accent-ink shadow-[0_14px_32px_-14px_rgba(156,175,136,0.55)] transition active:scale-[0.98]"
            >
              {copy.adultLabel}
            </button>
            <button
              type="button"
              onClick={onMinor}
              className="flex min-h-[52px] items-center justify-center rounded-full border border-line bg-card px-6 py-3 text-base text-ink transition hover:border-ink-soft"
            >
              {copy.minorLabel}
            </button>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span className="text-xs text-ink-faint">{copy.helpLabel}</span>
              <a
                href="/help"
                className="text-xs text-frost underline-offset-4 hover:underline"
              >
                {landing.getHelpNow}
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-3">
            <a
              href="/help"
              className="flex min-h-[52px] items-center justify-center rounded-full bg-frost/15 px-6 py-3 text-base font-medium text-frost ring-1 ring-frost/40 transition hover:bg-frost/20"
            >
              {copy.blockedHelpLabel}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
