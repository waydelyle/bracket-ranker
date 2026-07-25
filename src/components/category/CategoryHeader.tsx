import type { BracketCategory } from "@/data/types";

interface CategoryHeaderProps {
  category: BracketCategory;
  /** Keyword-bearing H1. Falls back to the category name. */
  heading?: string;
  /** Supporting line under the H1. Falls back to the category description. */
  tagline?: string;
}

export function CategoryHeader({
  category,
  heading,
  tagline,
}: CategoryHeaderProps) {
  return (
    <section
      className="relative overflow-hidden border-b border-border/50"
      style={{
        background: `linear-gradient(135deg, ${category.color}25 0%, transparent 70%)`,
      }}
    >
      {/* Noise texture overlay */}
      <div className="noise-bg absolute inset-0 opacity-30" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center sm:py-20">
        <span className="text-6xl sm:text-7xl">{category.icon}</span>
        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
          {heading ?? category.name}
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          {tagline ?? category.description}
        </p>
      </div>
    </section>
  );
}
