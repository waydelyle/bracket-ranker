import Link from "next/link";
import { categories } from "@/data/categories";
import { cn } from "@/lib/utils";

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

      <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className={cn(
              "group relative flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center transition-all hover:-translate-y-0.5 hover:shadow-md"
            )}
            style={{
              borderColor: `${cat.color}30`,
            }}
          >
            <span className="text-4xl sm:text-5xl">{cat.icon}</span>
            <div>
              <h3 className="font-semibold">{cat.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {cat.description}
              </p>
            </div>
            {/* Accent gradient on hover */}
            <div
              className="absolute inset-x-0 bottom-0 h-1 rounded-b-xl opacity-0 transition-opacity group-hover:opacity-100"
              style={{ backgroundColor: cat.color }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
