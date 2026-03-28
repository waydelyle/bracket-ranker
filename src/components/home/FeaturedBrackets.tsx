import Link from "next/link";
import { Play } from "lucide-react";
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
                "group flex flex-col justify-between gap-4 rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {cat && (
                    <Badge
                      variant="secondary"
                      className="text-xs"
                      style={{
                        backgroundColor: `${cat.color}15`,
                        color: cat.color,
                      }}
                    >
                      {cat.icon} {cat.name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs">
                    {bracket.itemCount} items
                  </Badge>
                </div>
                <h3 className="font-semibold leading-snug">{bracket.name}</h3>
              </div>

              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                <Play className="size-3.5" />
                Play
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
