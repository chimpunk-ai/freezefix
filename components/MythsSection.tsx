import { Container } from "@/components/Shell";
import { mythItems } from "@/lib/myth-items";

// Myths & reality as an in-page section on the landing page. Pairs with the
// FAQ above: the FAQ answers questions people ASK, this answers beliefs they
// HOLD that stop them looking. The /myths route still works for direct links
// and SEO, but visitors don't have to click away to see any of this.

export default function MythsSection() {
  const items = mythItems();
  return (
    <section aria-labelledby="myths-heading" id="myths" className="mt-16 scroll-mt-20 lg:mt-24">
      <Container className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-16">
        <div data-reveal>
          <p className="text-12 uppercase tracking-[0.14em] text-ink-faint">what people believe</p>
          <h2 id="myths-heading" className="mt-2 font-display text-28 text-ink lg:text-40">
            myths &amp; reality.
          </h2>
          <p className="mt-3 max-w-[40ch] text-14 text-ink-soft lg:text-16">
            the beliefs that stop people from looking at their own weeks. none of this is medical
            advice &mdash; it&rsquo;s about the looking, not the chemistry. the longer versions are on the{" "}
            <a href="/myths" className="underline decoration-line underline-offset-4 hover:text-ink">
              myths page
            </a>.
          </p>
        </div>
        <div data-reveal className="mt-8 divide-y divide-line border-y border-line lg:mt-0">
          {items.map((it) => (
            <details key={it.myth} className="group">
              <summary className="flex min-h-11 cursor-pointer list-none items-start justify-between gap-6 py-4 text-16 text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="font-display text-18 lg:text-20">&ldquo;{it.myth}&rdquo;</span>
                <span
                  aria-hidden
                  className="shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[62ch] pb-5 text-14 leading-relaxed text-ink-soft lg:text-16">
                <span className="text-ink">reality:</span> {it.reality}
              </p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
