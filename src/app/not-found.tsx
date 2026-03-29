import Link from "next/link";
import { Home, ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFeaturedBrackets } from "@/data/registry";
import { getCategoryBySlug } from "@/data/categories";

export default function NotFound() {
  const featured = getFeaturedBrackets().slice(0, 6);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 text-center">
        {/* Big 404 with gold accent */}
        <div className="relative">
          <h1 className="text-gradient-gold text-8xl font-extrabold tracking-tighter">
            404
          </h1>
        </div>

        {/* Trophy icon */}
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/20">
          <Trophy className="size-8 text-amber-500" />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Bracket Not Found
        </h2>

        {/* Subtext */}
        <p className="text-muted-foreground">
          This matchup doesn&apos;t exist&hellip; yet! Maybe you should create it.
        </p>

        {/* Home link */}
        <Button render={<Link href="/" />} className="gap-2 bg-amber-500 text-white hover:bg-amber-600">
          <Home className="size-4" />
          Back to Home
        </Button>
      </div>

      {/* Suggested brackets */}
      <div className="mx-auto mt-16 w-full max-w-2xl">
        <h3 className="mb-4 text-center text-sm font-semibold text-muted-foreground">
          Try one of these instead
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {featured.map((bracket) => {
            const cat = getCategoryBySlug(bracket.category);
            return (
              <Link
                key={`${bracket.category}-${bracket.slug}`}
                href={`/${bracket.category}/${bracket.slug}`}
                className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card p-4 transition-all hover:bg-secondary/50"
                style={
                  cat
                    ? {
                        borderLeftWidth: "3px",
                        borderLeftColor: cat.color,
                      }
                    : undefined
                }
              >
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg text-lg text-white"
                  style={{ backgroundColor: cat?.color ?? "#6366f1" }}
                >
                  {cat?.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">
                    {bracket.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {bracket.description}
                  </p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
