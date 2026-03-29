import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getFeaturedBrackets } from "@/data/registry";
import { getCategoryBySlug } from "@/data/categories";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function FeaturedBrackets() {
  const featured = getFeaturedBrackets();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Featured Brackets
        </h2>
        <p className="mt-2 text-muted-foreground">
          Jump right in with our most popular brackets
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((bracket) => {
          const cat = getCategoryBySlug(bracket.category);
          return (
            <Link
              key={`${bracket.category}/${bracket.slug}`}
              href={`/${bracket.category}/${bracket.slug}`}
              className={cn(
                "group flex flex-col justify-between gap-4 overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:-translate-y-1",
              )}
              style={
                cat
                  ? {
                      boxShadow: undefined,
                    }
                  : undefined
              }
              onMouseEnter={undefined}
            >
              {/* Top gradient bar */}
              {cat && (
                <div
                  className="h-1 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${cat.color}, ${cat.color}80)`,
                  }}
                />
              )}

              <div className="flex flex-1 flex-col justify-between gap-4 p-5 pt-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {cat && (
                      <Badge
                        className="text-xs text-white"
                        style={{
                          backgroundColor: cat.color,
                        }}
                      >
                        {cat.icon} {cat.name}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {bracket.itemCount} items
                    </Badge>
                  </div>
                  <h3 className="font-bold leading-snug text-foreground">
                    {bracket.name}
                  </h3>
                  {bracket.description && (
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {bracket.description}
                    </p>
                  )}
                </div>

                <div
                  className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                  style={{ color: cat?.color }}
                >
                  Play
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
