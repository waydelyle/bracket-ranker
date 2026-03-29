import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

const glowClassMap: Record<string, string> = {
  "#ef4444": "group-hover:glow-red",
  "#8b5cf6": "group-hover:glow-violet",
  "#6366f1": "group-hover:glow-indigo",
  "#22c55e": "group-hover:glow-green",
  "#3b82f6": "group-hover:glow-blue",
  "#ec4899": "group-hover:glow-pink",
};

export function CategoryGrid() {
  return (
    <section id="categories" className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Browse by Category
        </h2>
        <p className="mt-2 text-muted-foreground">
          Pick a topic and start ranking
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className={cn(
              "group relative flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:-translate-y-1",
              glowClassMap[cat.color],
            )}
            style={{
              borderLeftWidth: "4px",
              borderLeftColor: cat.color,
            }}
          >
            {/* Emoji glow backdrop */}
            <div className="relative shrink-0">
              <div
                className="absolute inset-0 scale-150 rounded-full blur-xl"
                style={{ backgroundColor: cat.color, opacity: 0.2 }}
              />
              <span className="relative text-5xl">{cat.icon}</span>
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-foreground">{cat.name}</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {cat.description}
              </p>
            </div>

            <ChevronRight className="size-5 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}
