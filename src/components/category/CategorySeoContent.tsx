import Link from "next/link";
import { ArrowRight, Trophy } from "lucide-react";
import type { BracketCategory, BracketMeta } from "@/data/types";

interface CategorySeoContentProps {
  category: BracketCategory;
  brackets: BracketMeta[];
  heading: string;
  intro: string;
}

export function CategorySeoContent({
  category,
  brackets,
  heading,
  intro,
}: CategorySeoContentProps) {
  const featured = brackets.filter((bracket) => bracket.featured).slice(0, 6);
  const examples = featured.length > 0 ? featured : brackets.slice(0, 6);

  return (
    <section className="border-t border-border/50 px-4 py-14">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="space-y-4">
          <p
            className="text-sm font-semibold uppercase tracking-wider"
            style={{ color: category.color }}
          >
            {category.name} rankings
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            {heading}
          </h2>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            {intro}
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-2xl font-extrabold text-white">
                {brackets.length}
              </p>
              <p className="text-sm text-muted-foreground">ready brackets</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-2xl font-extrabold text-white">
                {brackets.reduce((sum, bracket) => sum + bracket.itemCount, 0)}
              </p>
              <p className="text-sm text-muted-foreground">items to rank</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-4">
              <p className="text-2xl font-extrabold text-white">Free</p>
              <p className="text-sm text-muted-foreground">no account needed</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="size-5" style={{ color: category.color }} />
            <h3 className="font-bold text-white">Popular starting points</h3>
          </div>
          <div className="space-y-2">
            {examples.map((bracket) => (
              <Link
                key={bracket.slug}
                href={`/${category.slug}/${bracket.slug}`}
                className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium text-white">
                    {bracket.name}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {bracket.itemCount} items
                  </span>
                </span>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
