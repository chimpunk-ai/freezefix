// Website footer wording from the Legal Pack (tab 4, sections 5 and 6).
// The one line that is NOT legal wording is the "Help now" link, added so crisis help
// is reachable from every page without passing the 18+ gate, sign-up or payment.
export default function SiteFooter() {
  return (
    <footer className="flex flex-col gap-2 text-center text-xs leading-relaxed text-ink-faint">
      <p>
        <a href="/help" className="text-ink-soft underline underline-offset-2 hover:text-ink">
          Help now
        </a>{" "}
        · free, no sign-up
      </p>
      <p>FreezeFix is not therapy, medical advice or an emergency service. 18+ only.</p>
      <p>
        © 2026 FreezeFix · <a href="/privacy" className="underline underline-offset-2">Privacy</a> ·{" "}
        <a href="/terms" className="underline underline-offset-2">Terms</a> ·{" "}
        <a href="/refunds" className="underline underline-offset-2">Refunds</a> ·{" "}
        <a href="mailto:hello@getfreezefix.com" className="underline underline-offset-2">hello@getfreezefix.com</a>
      </p>
      <p>We only use cookies needed to run FreezeFix.</p>
    </footer>
  );
}
