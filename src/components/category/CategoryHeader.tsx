import type { BracketCategory } from "@/data/types";

interface CategoryHeaderProps {
  category: BracketCategory;
}

export function CategoryHeader({ category }: CategoryHeaderProps) {
  return (
    <section
      className="border-b"
      style={{
        background: `linear-gradient(135deg, ${category.color}08 0%, ${category.color}15 100%)`,
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-12 text-center sm:py-16">
        <span className="text-5xl sm:text-6xl">{category.icon}</span>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          {category.name}
        </h1>
        <p className="max-w-lg text-muted-foreground">{category.description}</p>
      </div>
    </section>
  );
}
