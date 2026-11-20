import type { Metadata } from "next";
import Faq, { faqItems } from "@/components/Faq";
import { Container, Main, SiteHeader } from "@/components/Shell";
import SiteFooter from "@/components/SiteFooter";
import { paymentsOn } from "@/lib/plans";

// Nov 2026: the FAQ used to live inline on the landing page. The landing
// page was rewritten to be understood in under a minute, which meant moving
// everything that explains rather than shows off of it — this page is where
// that content landed, not where it was cut. Same component, same FAQPage
// structured data, same content; just its own address now.

export const metadata: Metadata = {
  title: "Questions, answered",
  description: "The questions people ask before they try Fix — privacy, cost, what Fix is and isn't.",
  alternates: { canonical: "https://getfreezefix.com/faq" },
};

export default function Page() {
  const on = paymentsOn();
  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems(on).map((it) => ({
              "@type": "Question",
              name: it.q,
              acceptedAnswer: { "@type": "Answer", text: it.a },
            })),
          }),
        }}
      />
      <Main>
        <Faq paymentsOn={on} />
        <Container className="mt-16 pb-14 lg:mt-24">
          <SiteFooter />
        </Container>
      </Main>
    </>
  );
}
