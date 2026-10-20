"use client";

import { resourcesFor, TRUSTED_MESSAGE, VERIFIED_COUNTRIES, RESOURCES, DOCTOR_LINES, type Contact } from "@/lib/resources";
import type { HelpScreen as HelpScreenId } from "@/lib/risk";

// Help screens. Wording is copied exactly from Safety Pack v1.0 sections 2 and 6.
// Tone: a wingman, not an alarm. No sirens, no "WARNING". The call button is the biggest thing.
// These screens never touch the paywall, trial count or session limits.

type Props = {
  screen: HelpScreenId;
  region: string;
  onRegionChange: (r: string) => void;
  onBack?: () => void; // undefined = no way back (under-18 stop)
};

export default function HelpScreen({ screen, region, onRegionChange, onBack }: Props) {
  const r = resourcesFor(region);
  const em = r.emergency;
  const emNumber = em.tel ? em.display : "your local emergency number";

  let lines: string[] = [];
  let primary: Contact | undefined;
  let extra: Contact[] = [];
  let showTrusted = true;
  let worried = false;

  switch (screen) {
    case "emergency":
      lines = [
        "Okay. Let's get you a real person, right now.",
        `Call ${emNumber}, or ask someone near you to call.`,
        "FreezeFix doesn't know who you are and doesn't share anything.",
      ];
      primary = em;
      break;
    case "crisis": {
      const line = r.crisis[0];
      lines = [
        "Thanks for telling me. You don't have to carry this alone.",
        `Talk to someone now, free: ${name(line, "a crisis line")}. Or message someone who's got your back.`,
        `If you might act on this soon, call ${emNumber}.`,
      ];
      primary = line;
      extra = [...r.crisis.slice(1), em];
      break;
    }
    case "psychosis": {
      const line = r.urgentMentalHealth[0];
      lines = [
        "Okay. Let's get someone on your side today.",
        `A mental health line can help you work out what's going on: ${name(line, "a mental health line")}. Stay with someone you trust if you can.`,
        `If you feel unsafe, call ${emNumber}.`,
      ];
      primary = line;
      extra = [...r.urgentMentalHealth.slice(1), em];
      break;
    }
    case "mixed": {
      const line = r.substances[0];
      lines = [
        "Mixing changes things, so this needs real help. FreezeFix is only built for weed, and we can't tell what a mix is doing to your body.",
        `If you feel very unwell, can't breathe, have chest pain or someone won't wake up: call ${emNumber}.`,
        `For advice right now: ${name(line, "a helpline")}. Stay with someone. Don't take anything else tonight.`,
      ];
      primary = em;
      extra = r.substances;
      showTrusted = false;
      break;
    }
    case "doctor": {
      // R9 repeated vomiting. Wording approved by Safety & Trust on 16 Oct (Safety Pack section 2).
      // Urgent line: 111 in the UK, 116117 in Germany. Elsewhere, only the emergency button.
      const urgent = DOCTOR_LINES[r.code];
      lines = [
        "Being sick for hours needs a doctor to check you today.",
        "Sip water slowly and stay with someone if you can.",
        `If you can't keep water down, feel faint or very unwell, call ${emNumber}.`,
      ];
      primary = urgent ?? em;
      extra = urgent ? [em] : [];
      break;
    }
    case "worried": {
      // Someone else in a screenshot is in crisis (Safety Pack section 9).
      // Emergency number first; the country crisis line also helps people worried about someone.
      lines = [
        "You did the right thing showing this.",
        "Message them now: \u201cI'm here. Can I call you?\u201d",
        `If they might be in danger right now, call ${emNumber}.`,
      ];
      primary = em;
      extra = r.crisis.slice(0, 2);
      showTrusted = false;
      worried = true;
      break;
    }
    case "under18": {
      const youth = r.youth;
      lines = [
        "FreezeFix is for adults, so we can't help here.",
        `If you're having a hard time, these people talk to under-18s every day, free and confidential: ${name(youth[0], "a youth line")}.`,
        `If you're in danger, call ${emNumber}.`,
      ];
      primary = youth[0];
      extra = [...youth.slice(1), ...(r.youthNightBackup ? [{ ...r.youthNightBackup, label: `${r.youthNightBackup.label} (at night)` }] : []), em];
      showTrusted = false;
      break;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {lines.map((l, i) => (
          <p key={i} className={i === 0 ? "text-2xl font-semibold leading-snug text-ink" : "text-lg leading-relaxed text-ink-soft"}>
            {l}
          </p>
        ))}
      </div>

      {primary && <ContactButton contact={primary} big />}

      {extra.length > 0 && (
        <div className="flex flex-col gap-2">
          {extra.map((c, i) => (
            <ContactButton key={i} contact={c} />
          ))}
        </div>
      )}

      {worried && (
        <a
          href={smsHref(undefined, "I'm here. Can I call you?")}
          className="rounded-2xl border border-line bg-card px-5 py-4 text-center text-lg font-medium text-ink"
        >
          Message them now
        </a>
      )}

      {showTrusted && (
        <a
          href={smsHref(undefined, TRUSTED_MESSAGE)}
          className="rounded-2xl border border-line bg-card px-5 py-4 text-center text-lg font-medium text-ink"
        >
          Message someone I trust
        </a>
      )}

      <CountrySwitcher region={region} onChange={onRegionChange} />

      {onBack && (
        <button onClick={onBack} className="self-center py-2 text-sm text-ink-faint underline underline-offset-4">
          Back to FreezeFix
        </button>
      )}
    </div>
  );
}

export function ContactButton({ contact, big = false }: { contact: Contact; big?: boolean }) {
  const href = contact.tel
    ? `tel:${contact.tel}`
    : contact.sms
    ? smsHref(contact.sms.to, contact.sms.body)
    : contact.url;
  const verb = contact.tel ? "Call" : contact.sms ? "Text" : "Open";

  if (!href) {
    return (
      <div className="rounded-2xl border border-line bg-card px-5 py-4 text-ink">
        <div className="text-lg font-semibold">{contact.display}</div>
        <div className="text-sm text-ink-faint">{contact.label}</div>
      </div>
    );
  }

  return (
    <a
      href={href}
      target={contact.url ? "_blank" : undefined}
      rel={contact.url ? "noopener noreferrer" : undefined}
      className={
        big
          ? "flex flex-col items-center gap-1 rounded-3xl bg-accent px-5 py-6 text-center text-accent-ink shadow-lg"
          : "flex items-center justify-between gap-3 rounded-2xl border border-line bg-card px-5 py-3 text-ink"
      }
    >
      {big ? (
        <>
          <span className="text-2xl font-bold">
            {verb} {contact.display.replace(/^(Call or text|Text|Call) /, "")}
          </span>
          <span className="text-sm opacity-80">
            {contact.label}
            {contact.note ? ` · ${contact.note}` : ""}
          </span>
          {contact.blurb && (
            <span className="mt-1 max-w-[28ch] text-xs leading-snug opacity-70">
              {contact.blurb}
            </span>
          )}
        </>
      ) : (
        <>
          <span className="flex min-w-0 flex-col">
            <span className="font-medium">{contact.label}</span>
            {contact.note && <span className="text-xs text-ink-faint">{contact.note}</span>}
            {contact.blurb && (
              <span className="mt-0.5 text-xs leading-snug text-ink-faint">
                {contact.blurb}
              </span>
            )}
          </span>
          <span className="shrink-0 rounded-full bg-chip px-3 py-1 text-sm font-semibold">
            {verb} {contact.display.replace(/^(Call or text|Text|Call) /, "")}
          </span>
        </>
      )}
    </a>
  );
}

export function CountrySwitcher({ region, onChange }: { region: string; onChange: (r: string) => void }) {
  const current = (VERIFIED_COUNTRIES as string[]).includes(region) ? region : "OTHER";
  return (
    <label className="flex items-center justify-center gap-2 text-sm text-ink-faint">
      Showing help for
      <select
        value={current}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-line bg-card px-2 py-1 text-ink"
      >
        {VERIFIED_COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {RESOURCES[c].name}
          </option>
        ))}
        <option value="OTHER">Somewhere else</option>
      </select>
    </label>
  );
}

function name(c: Contact | undefined, fallback: string) {
  if (!c) return fallback;
  return c.tel || c.sms ? `${c.label}, ${c.display}` : `${c.label} (${c.display})`;
}

// Opens the phone's own messages app. FreezeFix never reads contacts and never sends anything itself.
export function smsHref(to: string | undefined, body?: string) {
  const b = body ? `body=${encodeURIComponent(body)}` : "";
  return `sms:${to ?? ""}${b ? `?&${b}` : ""}`;
}
