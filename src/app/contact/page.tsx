import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact BracketRanker",
  description:
    "Contact BracketRanker about bracket ideas, feedback, privacy questions, or issues with a ranking page.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-2xl space-y-8 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/20">
          <Mail className="size-7 text-amber-300" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            Contact BracketRanker
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            Send feedback, report an issue, or suggest a bracket topic that
            should be added next.
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6 text-left">
          <h2 className="font-bold text-white">What to include</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
            <li>The page URL if something looks wrong.</li>
            <li>The bracket topic or item list you want added.</li>
            <li>Any browser or device details for layout or playback issues.</li>
          </ul>
        </div>

        <Link
          href="mailto:hello@bracketranker.com"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Mail className="size-4" />
          hello@bracketranker.com
        </Link>
      </div>
    </section>
  );
}
