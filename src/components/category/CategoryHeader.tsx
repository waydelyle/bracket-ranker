import type { BracketCategory } from "@/data/types";

interface CategoryHeaderProps {
  category: BracketCategory;
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
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
          {category.name}
        </h1>
        <p className="max-w-lg text-muted-foreground">{category.description}</p>
      </div>
    </section>
  );
}
