import { MoodFace } from "@/components/MoodFace";
import { MOOD_LABEL, dayFromISO, prettyDay, type Mood } from "@/lib/entry";
import { goalSentence, type WeekStats } from "@/lib/pattern";

// The weekly mirror card. The one thing everything else in the app exists to
// produce. No grade, no trophy, no congratulations: a shape, said plainly.

function range(start: string, end: string): string {
  const fmt = (d: string) =>
    dayFromISO(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toLowerCase();
  return `${fmt(start)} – ${fmt(end)}`;
}

function Leaf() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M20 4c-8 0-14 3.6-14 10a6 6 0 0 0 6 6c6.4 0 8-6 8-16Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6 20c2-5 5-8 10-10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function Sun() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function WeekGrid({ stats }: { stats: WeekStats }) {
  return (
    <div className="ff-draw grid grid-cols-7 gap-1.5" role="list" aria-label="the last seven nights">
      {stats.cells.map((c) => {
        const mood = c.mood as Mood | null;
        const tough = mood !== null && mood <= 2;
        const good = mood !== null && mood >= 4;
        return (
          <div
            key={c.day}
            role="listitem"
            className={[
              "flex flex-col items-center gap-1.5 rounded-card border px-1 py-2",
              c.smoked === null
                ? "border-line/60 bg-chip/30 text-ink-faint"
                : tough
                  ? "border-frost/30 bg-frost/10 text-frost"
                  : good
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-line bg-card text-ink-soft",
            ].join(" ")}
            title={`${prettyDay(c.day)}: ${c.smoked === null ? "no entry" : c.smoked ? "smoked" : "didn't smoke"}${mood ? `, ${MOOD_LABEL[mood]}` : ""}`}
          >
            <span className="text-12 leading-none opacity-70">{c.initial}</span>
            <span className="flex h-3 items-center justify-center">
              {c.smoked === null ? <span className="text-12 leading-none">·</span> : c.smoked ? <Leaf /> : <Sun />}
            </span>
            <span className="flex h-5 items-center justify-center">
              {mood ? <MoodFace mood={mood} size={18} /> : <span className="text-12 leading-none opacity-40">–</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function PatternCard({
  name,
  stats,
  onAsk,
  onClose,
  dimmed = false,
}: {
  name: string;
  stats: WeekStats;
  onAsk?: () => void;
  onClose?: () => void;
  dimmed?: boolean;
}) {
  const who = name.trim() || "you";
  const line = stats.goalLine;
  return (
    <article
      className={[
        "rounded-sheet border border-line bg-card p-6",
        dimmed ? "opacity-70" : "",
      ].join(" ")}
    >
      <p className="text-12 uppercase tracking-[0.14em] text-ink-faint">{range(stats.start, stats.end)}</p>
      <h2 className="mt-2 font-display text-28 text-ink">{who}, here&rsquo;s your week</h2>

      <div className="mt-4 space-y-2">
        {stats.sentences.map((s, i) => (
          <p key={i} className="text-16 text-ink-soft">
            {s}
          </p>
        ))}
      </div>

      <div className="mt-5">
        <WeekGrid stats={stats} />
      </div>

      {line ? (
        <p className="mt-5 rounded-card border border-accent/25 bg-accent/[0.07] px-4 py-3 text-14 text-ink">
          {goalSentence(line)}
        </p>
      ) : null}

      {stats.observation ? <p className="mt-3 text-14 text-ink-faint">{stats.observation}</p> : null}

      <p className="mt-5 text-12 text-ink-faint">only you know what it means.</p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {onAsk ? (
          <button
            type="button"
            onClick={onAsk}
            className="ff-chip rounded-pill border border-accent/40 bg-accent/10 px-4 py-2 text-14 font-medium text-accent hover:bg-accent/15"
          >
            ask Fix about this week
          </button>
        ) : null}
        {onClose ? (
          <button type="button" onClick={onClose} className="ff-chip rounded-pill px-3 py-2 text-14 text-ink-faint hover:text-ink-soft">
            close
          </button>
        ) : null}
      </div>
    </article>
  );
}
