import type { ReactNode } from "react";

// A phone, drawn in CSS. No device images, no brand. Used on the landing to
// show the real app components at a real phone size (390×844 logical px),
// scaled down to fit a column. The screen is inert by default so the real
// LogScreen / PatternCard / WeeksView inside can't be operated or write to
// storage — they are a picture of the app, and are labelled as one.

const SCREEN_W = 390;
const SCREEN_H = 844;

export default function PhoneFrame({
  label,
  children,
  className = "",
  width = 300,
  interactive = false,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  width?: number;
  interactive?: boolean;
}) {
  const scale = width / SCREEN_W;
  const outerW = width;
  const outerH = Math.round(SCREEN_H * scale);
  // Bezel and radius scale with the phone so a 260px phone and a 300px phone
  // look like the same device at different distances.
  const bezel = Math.round(10 * scale);
  const radius = Math.round(44 * scale);
  const islandW = Math.round(96 * scale);
  const islandH = Math.round(28 * scale);

  const a11y = interactive
    ? { role: "group" as const, "aria-label": label }
    : { role: "img" as const, "aria-label": label };

  return (
    <div
      {...a11y}
      className={`relative shrink-0 ${className}`.trim()}
      style={{
        width: outerW + bezel * 2,
        height: outerH + bezel * 2,
        padding: bezel,
        borderRadius: radius + bezel,
        background: "linear-gradient(180deg, #221d18 0%, #16130f 100%)",
        boxShadow:
          "0 0 0 1px rgba(51, 44, 37, 0.9), inset 0 0 0 1px rgba(242, 237, 230, 0.04), 0 40px 80px -40px rgba(0, 0, 0, 0.7), 0 24px 60px -36px rgba(156, 175, 136, 0.25)",
      }}
    >
      {/* The screen: scaled viewport of the real app. */}
      <div
        className="relative overflow-hidden bg-bg"
        style={{
          width: outerW,
          height: outerH,
          borderRadius: radius,
          backgroundImage:
            "radial-gradient(52% 34% at 18% 6%, rgba(156, 175, 136, 0.07), transparent 70%), radial-gradient(46% 32% at 92% 22%, rgba(216, 146, 122, 0.04), transparent 72%), radial-gradient(70% 40% at 50% 104%, rgba(156, 175, 136, 0.05), transparent 72%)",
        }}
      >
        <div
          className="absolute left-0 top-0 overflow-hidden"
          style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${scale})`, transformOrigin: "top left" }}
          {...(interactive ? {} : { inert: true, "aria-hidden": true })}
        >
          {/* Status strip. Just a time; nothing else a phone would show. */}
          <div className="flex h-11 items-center px-6 pt-1 text-12 text-ink-faint" aria-hidden>
            21:14
          </div>
          {children}
        </div>
        {/* The island, over the status strip. */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 rounded-pill"
          style={{ top: Math.round(12 * scale), width: islandW, height: islandH, background: "#0d0b09" }}
        />
      </div>
    </div>
  );
}
