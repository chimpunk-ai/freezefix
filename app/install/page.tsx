import type { Metadata } from "next";
import InstallGuide from "@/components/InstallGuide";

export const metadata: Metadata = {
  title: "Install Fix on your phone",
  description:
    "Add Fix to your Home Screen on iPhone or Android. Opens full screen from its own icon, works offline, no app store and no account.",
  alternates: { canonical: "/install" },
  openGraph: {
    title: "Install Fix on your phone",
    description: "Home Screen on iPhone, Install app on Android. No store, no account.",
    url: "/install",
  },
};

export default function Page() {
  return (
    <main className="mx-auto max-w-xl px-5 py-10">
      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-ink-soft">Get the app</p>
      <h1 className="mt-2 font-display text-[2.5rem] leading-[1.1] text-ink">
        Put Fix on your phone
      </h1>
      <p className="mt-3 text-base leading-relaxed text-ink-soft">
        Two taps, and it sits next to your other apps. No store, no download, no account. This is
        the same app you&apos;re using now, with its own icon and no browser bars.
      </p>

      <div className="mt-8">
        <InstallGuide />
      </div>
    </main>
  );
}
