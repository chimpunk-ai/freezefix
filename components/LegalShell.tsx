import Markdown from "@/components/Markdown";
import SiteFooter from "@/components/SiteFooter";

export default function LegalShell({ source }: { source: string }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 pb-10 pt-4">
      <header className="mb-8 flex items-center justify-between">
        <a href="/" className="text-lg font-bold tracking-tight text-ink">
          Freeze<span className="text-accent">Fix</span>
        </a>
        <a href="/" className="text-sm text-ink-soft underline underline-offset-4">
          Back to the app
        </a>
      </header>
      <main className="flex-1">
        <Markdown source={source} />
      </main>
      <div className="mt-12">
        <SiteFooter />
      </div>
    </div>
  );
}
