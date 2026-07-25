import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brackets, getBracketMeta } from "@/data/registry";
import { getCategoryBySlug } from "@/data/categories";
import { loadBracketItems } from "@/data/items";
import { BracketGame } from "@/components/bracket/BracketGame";
import { BracketSeoContent } from "@/components/bracket/BracketSeoContent";
import { StructuredData } from "@/components/seo/StructuredData";
import { getCachedCommunityStandings } from "@/lib/community";
import {
  buildBracketSoftwareJsonLd,
  buildBreadcrumbJsonLd,
  buildEntrantListJsonLd,
  buildFaqJsonLd,
  getBracketDescription,
  getBracketSeo,
  getBracketTitle,
  getRelatedBrackets,
} from "@/lib/seo";

// Community results are folded into the page, so refresh it hourly rather than
// pinning the HTML to build time.
export const revalidate = 3600;

interface BracketPageProps {
  params: Promise<{ category: string; bracket: string }>;
}

export function generateStaticParams() {
  return brackets.map((b) => ({
    category: b.category,
    bracket: b.slug,
  }));
}

export async function generateMetadata({
  params,
}: BracketPageProps): Promise<Metadata> {
  const { category, bracket } = await params;
  const meta = getBracketMeta(category, bracket);
  if (!meta) return {};
  const cat = getCategoryBySlug(category);
  const title = getBracketTitle(meta, cat);
  const description = getBracketDescription(meta, cat);
  return {
    title,
    description,
    alternates: {
      canonical: `/${category}/${bracket}`,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/${category}/${bracket}`,
    },
  };
}

export default async function BracketPage({ params }: BracketPageProps) {
  const { category, bracket } = await params;
  const meta = getBracketMeta(category, bracket);

  if (!meta) {
    notFound();
  }

  const cat = getCategoryBySlug(category);
  const items = await loadBracketItems(category, bracket);

  if (!items) {
    notFound();
  }

  const seo = getBracketSeo(meta, cat, items);
  const related = getRelatedBrackets(meta);
  const standings = await getCachedCommunityStandings(category, bracket, items);
  const path = `/${category}/${bracket}`;

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: cat?.name ?? category, path: `/${category}` },
    { name: meta.name, path },
  ]);
  const faqSchema = buildFaqJsonLd(seo.faqs);
  const softwareSchema = buildBracketSoftwareJsonLd(
    meta,
    seo,
    path,
    standings?.totalPlays,
  );
  const entrantSchema = buildEntrantListJsonLd(
    `${meta.name} bracket entrants`,
    path,
    items,
  );

  return (
    <>
      <StructuredData
        data={[breadcrumbSchema, faqSchema, softwareSchema, entrantSchema]}
      />
      <div className="flex flex-1 flex-col">
        <BracketGame
          bracketName={meta.name}
          bracketDescription={seo.description}
          headline={seo.heading}
          tagline={seo.subheading}
          items={items}
          defaultSize={meta.defaultSize}
          categoryColor={cat?.color ?? "#6366f1"}
          categorySlug={category}
          bracketSlug={bracket}
        />
      </div>
      <BracketSeoContent
        meta={meta}
        category={cat}
        items={items}
        seo={seo}
        related={related}
        standings={standings}
      />
    </>
  );
}
