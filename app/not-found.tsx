import type { Metadata } from "next";
import Link from "next/link";
import { Container, Kicker, Main, SiteHeader } from "@/components/Shell";
import SiteFooter from "@/components/SiteFooter";

// Custom 404. A quiet page, not an alarm. The help chip is still reachable
// at the top for anyone who landed here because a bookmark broke and they
// are in distress; everyone else gets a short route back to the front door.

export const metadata: Metadata = {
  title: "Page not here",
  description: "That URL isn't a page on getfreezefix.com right now.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <Main className="min-h-dvh">
        <Container className="pb-16 pt-6 lg:pt-10">
          <Kicker tone="faint">404</Kicker>
          <h1 className="mt-2 font-display text-40 leading-tight text-ink lg:text-56">
            not here.
          </h1>
          <p className="mt-4 max-w-[52ch] text-16 text-ink-soft lg:text-20 lg:leading-[1.4]">
            that URL isn&rsquo;t a page on fix. probably a typo, or a link that moved. the front
            door has what&rsquo;s there, and the help page is free and always open.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="ff-chip inline-flex min-h-11 items-center rounded-pill bg-signpost px-5 text-14 font-medium text-signpost-ink no-underline ff-cta-shadow hover:-translate-y-[1px]"
            >
              back to fix
            </Link>
            <Link
              href="/help"
              className="ff-chip inline-flex min-h-11 items-center rounded-pill border border-line px-4 text-14 text-ink no-underline hover:border-ink-faint"
            >
              get help now
            </Link>
          </div>
        </Container>
        <Container className="pb-14">
          <SiteFooter />
        </Container>
      </Main>
    </>
  );
}
