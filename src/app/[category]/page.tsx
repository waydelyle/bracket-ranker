import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategoryBySlug } from "@/data/categories";
import { getBracketsByCategory } from "@/data/registry";
import { CategoryHeader } from "@/components/category/CategoryHeader";
import { BracketCard } from "@/components/category/BracketCard";

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export function generateStaticParams() {
  return categories.map((cat) => ({ category: cat.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  if (!cat) return {};
  return {
    title: `Rank ${cat.name} - Interactive Bracket Rankings`,
    description: `Rank the best ${cat.name.toLowerCase()} using our bracket system. Pick your favorites head-to-head, get your top 10, and see how you compare.`,
    openGraph: {
      title: `Rank ${cat.name} - Interactive Bracket Rankings | BracketRanker`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);

  if (!cat) {
    notFound();
  }

  const categoryBrackets = getBracketsByCategory(category);

  return (
    <>
      <CategoryHeader category={cat} />

      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h2 className="mb-6 text-lg font-semibold">
          {categoryBrackets.length} Brackets
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryBrackets.map((bracket) => (
            <BracketCard
              key={bracket.slug}
              bracket={bracket}
              categoryColor={cat.color}
              categorySlug={cat.slug}
            />
          ))}
        </div>
      </div>
    </>
  );
}
