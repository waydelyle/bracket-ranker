import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { brackets, getBracketMeta } from "@/data/registry";
import { getCategoryBySlug } from "@/data/categories";
import { BracketGame } from "@/components/bracket/BracketGame";
import type { BracketItem } from "@/data/types";

interface BracketPageProps {
  params: Promise<{ category: string; bracket: string }>;
}

async function loadBracketItems(
  category: string,
  slug: string
): Promise<BracketItem[] | null> {
  try {
    const data = await import(`@/data/brackets/${category}/${slug}.json`);
    return data.default.items;
  } catch {
    return null;
  }
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
  return {
    title: `Rank ${meta.name} - ${meta.defaultSize}-Item Bracket Challenge`,
    description: meta.description,
    openGraph: {
      title: `Rank ${meta.name} - ${meta.defaultSize}-Item Bracket Challenge | BracketRanker`,
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

  return (
    <div className="flex flex-1 flex-col">
      <BracketGame
        bracketName={meta.name}
        bracketDescription={meta.description}
        items={items}
        defaultSize={meta.defaultSize}
        categoryColor={cat?.color ?? "#6366f1"}
        categorySlug={category}
        bracketSlug={bracket}
      />
    </div>
  );
}
