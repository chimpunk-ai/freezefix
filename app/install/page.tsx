import type { Metadata } from "next";
import Link from "next/link";
import HeaderInstallButton from "@/components/HeaderInstallButton";
import { Container, Kicker, Main, SiteHeader } from "@/components/Shell";
import SiteFooter from "@/components/SiteFooter";

// Install guide. Two paths, step by step.
//
// Why a page, not a modal: people bookmark it, send it to themselves, read it
// on a laptop while installing on a phone. A separate URL survives all three.
// InstallPrompt on /plans still catches the native Chrome prompt where it
// fires; this page is for the people who need to read before they tap.

export const metadata: Metadata = {
  title: "Install fix on your phone",
  description:
    "How to install getfreezefix.com on iPhone (Safari) and Android (Chrome). No app store, no account, no download.",
  alternates: { canonical: "/install" },
};

export default function InstallPage() {
  return (
    <>
      <SiteHeader cta={{ href: "/app", label: "open the app" }} />
      <Main className="min-h-dvh">
        <Container className="pb-16">
          <section aria-labelledby="install-h" className="pt-6 lg:pt-10">
            <Kicker>install</Kicker>
            <h1 id="install-h" className="mt-2 font-display text-40 leading-tight text-ink lg:text-56">
              a phone shortcut, not an app.
            </h1>
            <p className="mt-4 max-w-[58ch] text-16 text-ink-soft lg:text-20 lg:leading-[1.4]">
              fix doesn&rsquo;t live in the app store. you open it in your browser once, add it to your
              home screen, and after that it opens the way a native app would &mdash; its own icon, full
              screen, no browser bar. nothing to download, no account to make.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <HeaderInstallButton />
              <span className="text-13 text-ink-faint">
                on this device, if your browser supports it.
              </span>
            </div>
          </section>

          <section
            aria-labelledby="iphone-h"
            className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16"
          >
            <div>
              <Kicker tone="faint">iPhone &amp; iPad</Kicker>
              <h2 id="iphone-h" className="mt-2 font-display text-28 leading-tight text-ink lg:text-36">
                safari, add to home screen.
              </h2>
              <p className="mt-3 max-w-[40ch] text-14 text-ink-soft lg:text-16">
                this is the only route that works on iOS. the chrome app on iPhone still uses safari
                underneath, and third-party browsers can&rsquo;t add to the home screen.
              </p>
            </div>
            <ol className="space-y-6 text-14 text-ink lg:text-16">
              {IPHONE_STEPS.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line font-display text-14 text-ink-soft"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{s.title}</p>
                    <p className="mt-1 text-ink-soft">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            aria-labelledby="android-h"
            className="mt-14 grid gap-10 border-t border-line pt-14 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16 lg:pt-20"
          >
            <div>
              <Kicker tone="faint">Android</Kicker>
              <h2 id="android-h" className="mt-2 font-display text-28 leading-tight text-ink lg:text-36">
                chrome &rarr; install app.
              </h2>
              <p className="mt-3 max-w-[40ch] text-14 text-ink-soft lg:text-16">
                chrome usually offers to install fix on its own after a visit or two. if you&rsquo;d
                rather not wait, the menu has the same option.
              </p>
            </div>
            <ol className="space-y-6 text-14 text-ink lg:text-16">
              {ANDROID_STEPS.map((s, i) => (
                <li key={i} className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-[2px] flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line font-display text-14 text-ink-soft"
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{s.title}</p>
                    <p className="mt-1 text-ink-soft">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section
            aria-labelledby="after-h"
            className="mt-14 grid gap-10 border-t border-line pt-14 lg:mt-20 lg:grid-cols-2 lg:gap-16 lg:pt-20"
          >
            <div>
              <Kicker tone="faint">after it&rsquo;s installed</Kicker>
              <h2 id="after-h" className="mt-2 font-display text-28 leading-tight text-ink lg:text-36">
                what changes.
              </h2>
            </div>
            <div className="space-y-5 text-14 text-ink-soft lg:text-16">
              <p>
                <span className="text-ink">one tap in, no browser bar.</span> fix opens full-screen
                with its own icon on the home screen. the log is where the browser was.
              </p>
              <p>
                <span className="text-ink">nightly reminders become possible.</span> android can send
                them from the browser too. iOS requires fix to be on the home screen first &mdash; this
                is apple&rsquo;s rule, not ours. both are off by default; turn them on in{" "}
                <Link href="/app/settings" className="underline decoration-line underline-offset-4 hover:text-ink">
                  settings
                </Link>.
              </p>
              <p>
                <span className="text-ink">your log still lives on your device.</span> no account is
                created, no email is asked for. uninstalling the shortcut doesn&rsquo;t send anything to
                us. the one exception is Fix &mdash; when you press send, that message and the week it
                refers to travels to our ai provider to write the reply; the{" "}
                <Link href="/privacy" className="underline decoration-line underline-offset-4 hover:text-ink">
                  privacy page
                </Link>{" "}
                says exactly what goes and how long it&rsquo;s kept.
              </p>
              <p>
                <span className="text-ink">updates arrive on their own.</span> when fix changes, the
                next open pulls the new version. nothing to download, nothing to approve.
              </p>
            </div>
          </section>

          <section
            aria-labelledby="hitch-h"
            className="mt-14 grid gap-10 border-t border-line pt-14 lg:mt-20 lg:grid-cols-2 lg:gap-16 lg:pt-20"
          >
            <div>
              <Kicker tone="faint">if a step is missing</Kicker>
              <h2 id="hitch-h" className="mt-2 font-display text-28 leading-tight text-ink lg:text-36">
                the usual hitches.
              </h2>
            </div>
            <dl className="space-y-5 text-14 text-ink-soft lg:text-16">
              <div>
                <dt className="text-ink">no &ldquo;add to home screen&rdquo; in safari.</dt>
                <dd className="mt-1">
                  make sure the page is open as a tab, not in reader mode. private browsing hides the
                  option on some iOS versions &mdash; open an ordinary tab and try again.
                </dd>
              </div>
              <div>
                <dt className="text-ink">chrome doesn&rsquo;t offer to install.</dt>
                <dd className="mt-1">
                  open the three-dot menu and look for &ldquo;install app&rdquo; or &ldquo;add to home
                  screen&rdquo;. one of them is there.
                </dd>
              </div>
              <div>
                <dt className="text-ink">a different browser.</dt>
                <dd className="mt-1">
                  firefox for android works. firefox focus, duckduckgo and others usually don&rsquo;t
                  install pwas. on iPhone, only safari can add to the home screen.
                </dd>
              </div>
              <div>
                <dt className="text-ink">a phone bought in a work scheme.</dt>
                <dd className="mt-1">
                  some managed devices block home-screen shortcuts. if the options above are greyed
                  out, ask whoever manages the phone, or use fix in the browser.
                </dd>
              </div>
            </dl>
          </section>
        </Container>

        <Container className="pb-14">
          <SiteFooter />
        </Container>
      </Main>
    </>
  );
}

type Step = { title: string; detail: string };

const IPHONE_STEPS: Step[] = [
  {
    title: "Open getfreezefix.com in Safari.",
    detail: "The address bar is at the bottom on newer iOS versions.",
  },
  {
    title: "Tap the share button.",
    detail: "The square with an arrow pointing up, in the middle of the toolbar.",
  },
  {
    title: "Scroll and tap “Add to Home Screen”.",
    detail:
      "Near the bottom of the share menu, below the row of share targets. The icon is a small square with a plus.",
  },
  {
    title: "Keep the name as “Fix” and tap Add.",
    detail:
      "You can shorten it if you like; the lock screen never shows weed-related words whatever the name is.",
  },
  {
    title: "Open fix from the home screen.",
    detail: "Full-screen, its own icon, no Safari chrome. The log is the first thing you see.",
  },
];

const ANDROID_STEPS: Step[] = [
  {
    title: "Open getfreezefix.com in Chrome.",
    detail:
      "A banner may appear a few seconds in that offers to install. Tap “Install” and you’re done.",
  },
  {
    title: "If no banner: tap the three dots at the top right.",
    detail: "The main Chrome menu opens.",
  },
  {
    title: "Tap “Install app” or “Add to Home screen”.",
    detail: "Chrome worded it differently across versions; one of the two is there.",
  },
  {
    title: "Confirm the name and tap Install.",
    detail: "The icon lands on your home screen and in your app drawer.",
  },
  {
    title: "Open fix from the home screen.",
    detail:
      "Full-screen, its own icon, no browser bar. Nightly reminders can be turned on in settings when you’re ready.",
  },
];
