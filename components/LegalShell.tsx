import Markdown, { headingsOf } from "@/components/Markdown";
import SectionIndex from "@/components/SectionIndex";
import { Container, Main, SiteHeader } from "@/components/Shell";
import SiteFooter from "@/components/SiteFooter";
import type { ReactNode } from "react";

// Shell for the long-form legal pages (privacy, terms, refunds).
//
// Reading measure is 680px (~70ch). On a laptop the section index sits in a
// sticky column to the left of the text; on a phone it is a compact list
// under the title that the reader can jump from. The `aboveContent` slot lets
// /privacy prepend its at-a-glance card without duplicating the shell.
export default function LegalShell({
  source,
  aboveContent,
}: {
  source: string;
  aboveContent?: ReactNode;
}) {
  const headings = headingsOf(source);
  return (
    <>
      <SiteHeader />
      <Main>
        <Container className="pb-10 lg:grid lg:grid-cols-[220px_minmax(0,680px)] lg:justify-center lg:gap-16 lg:pt-4">
          <div className="lg:order-2">
            {aboveContent}
            <div className="lg:hidden">
              <SectionIndex headings={headings} compact />
            </div>
            <Markdown source={source} />
          </div>
          <div className="hidden lg:order-1 lg:block">
            <SectionIndex headings={headings} />
          </div>
        </Container>
        <Container className="pb-14">
          <SiteFooter />
        </Container>
      </Main>
    </>
  );
}
