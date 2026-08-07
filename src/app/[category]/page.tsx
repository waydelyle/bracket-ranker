import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategoryBySlug } from "@/data/categories";
import { getBracketsByCategory } from "@/data/registry";
import { loadBracketItems } from "@/data/items";
import { CategoryHeader } from "@/components/category/CategoryHeader";
import { BracketCard } from "@/components/category/BracketCard";
import { CategorySeoContent } from "@/components/category/CategorySeoContent";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  getCategorySeo,
} from "@/lib/seo";
import { OG_DEFAULTS } from "@/lib/site";

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
  const categoryBrackets = getBracketsByCategory(category);
  const seo = getCategorySeo(cat, categoryBrackets.length);
  return {
    title: seo.title,
    description: seo.description,
    alternates: {
      canonical: `/${cat.slug}`,
    },
    openGraph: {
      ...OG_DEFAULTS,
      title: seo.title,
      description: seo.description,
      url: `/${cat.slug}`,
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
  const seo = getCategorySeo(cat, categoryBrackets.length);

  // Entrant artwork for the preview strip on each card. The JSON is local and
  // these pages are prerendered, so this costs nothing at request time.
  const previewsBySlug = new Map(
    await Promise.all(
      categoryBrackets.map(async (bracket) => {
        const items = await loadBracketItems(category, bracket.slug);
        const previews = (items ?? [])
          .filter((item) => item.image)
          .slice(0, 4)
          .map((item) => ({ name: item.name, image: item.image! }));
        return [bracket.slug, previews] as const;
      }),
    ),
  );

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: cat.name, path: `/${cat.slug}` },
  ]);
  const itemListSchema = buildItemListJsonLd(
    `${cat.name} ranking brackets`,
    categoryBrackets.map((bracket) => ({
      name: bracket.name,
      url: `/${cat.slug}/${bracket.slug}`,
    })),
  );

  return (
    <>
      <StructuredData data={[breadcrumbSchema, itemListSchema]} />
      <CategoryHeader
        category={cat}
        heading={seo.title}
        tagline={`${categoryBrackets.length} head-to-head brackets. Pick a winner in every matchup, crown a champion, and compare it with everyone else's.`}
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h2 className="mb-6 text-lg font-semibold text-white">
          All {categoryBrackets.length} {cat.name.toLowerCase()} tier lists
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoryBrackets.map((bracket) => (
            <BracketCard
              key={bracket.slug}
              bracket={bracket}
              categoryColor={cat.color}
              categorySlug={cat.slug}
              previews={previewsBySlug.get(bracket.slug)}
            />
          ))}
        </div>
      </div>
      <CategorySeoContent
        category={cat}
        brackets={categoryBrackets}
        heading={seo.heading}
        intro={seo.intro}
      />
    </>
  );
}
