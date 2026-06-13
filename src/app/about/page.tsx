import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";

export const metadata: Metadata = {
  title: "About BracketRanker",
  description:
    "BracketRanker is a free bracket maker and ranking generator for movies, music, food, sports, TV, games, and custom lists.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/20">
            <Trophy className="size-7 text-amber-300" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            About BracketRanker
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            BracketRanker turns ranking debates into quick head-to-head choices.
            Pick a ready-made bracket or create a custom one, then share the
            final result with friends.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="font-bold text-white">Choose</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Start with movies, music, food, sports, TV, games, or random
              ranking ideas.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="font-bold text-white">Rank</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Make focused choices until the bracket produces a winner and a
              final ordered list.
            </p>
          </div>
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h2 className="font-bold text-white">Share</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Send the result page to friends and compare how their rankings
              differ.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Link
            href="/create"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Create a bracket
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
