// Website footer wording from the Legal Pack (tab 4, sections 5 and 6).
// The one line that is NOT legal wording is the "Help now" link, added so crisis help
// is reachable from every page without passing the 18+ gate, sign-up or payment.
export default function SiteFooter() {
  return (
    <footer className="flex flex-col gap-3 border-t border-line pt-8 text-sm text-ink-faint">
      <p className="text-base text-ink-soft">
        GetFreezeFix.com is supportive software for adults 18+. It is not therapy, medical advice or an emergency
        service.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <a href="/help" className="text-ink-soft underline underline-offset-2 hover:text-ink">
          Help
        </a>
        <a href="/privacy" className="text-ink-soft underline underline-offset-2 hover:text-ink">
          Privacy
        </a>
        <a href="/terms" className="text-ink-soft underline underline-offset-2 hover:text-ink">
          Terms
        </a>
        <a href="/refunds" className="text-ink-soft underline underline-offset-2 hover:text-ink">
          Refunds
        </a>
        <a href="mailto:hello@getfreezefix.com" className="text-ink-soft underline underline-offset-2 hover:text-ink">
          hello@getfreezefix.com
        </a>
      </div>
    </footer>
  );
}
