import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategoryBySlug } from "@/data/categories";
import { getBracketsByCategory } from "@/data/registry";
import { CategoryHeader } from "@/components/category/CategoryHeader";
import { BracketCard } from "@/components/category/BracketCard";
import { CategorySeoContent } from "@/components/category/CategorySeoContent";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  buildBreadcrumbJsonLd,
  buildItemListJsonLd,
  getCategorySeo,
} from "@/lib/seo";

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
      <CategoryHeader category={cat} />

      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <h2 className="mb-6 text-lg font-semibold text-white">
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
      <CategorySeoContent
        category={cat}
        brackets={categoryBrackets}
        heading={seo.heading}
        intro={seo.intro}
      />
    </>
  );
}
