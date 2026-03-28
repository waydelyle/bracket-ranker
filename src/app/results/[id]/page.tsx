import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";
import { getResult } from "@/app/actions/results";
import { getVoteStats } from "@/app/actions/votes";
import { getBracketMeta } from "@/data/registry";
import { getCategoryBySlug } from "@/data/categories";
import type { BracketItem, BracketResult } from "@/data/types";
import { Button } from "@/components/ui/button";
import { ResultsDisplay } from "@/components/results/ResultsDisplay";
import { ShareCard } from "@/components/results/ShareCard";
import { ShareButtons } from "@/components/results/ShareButtons";
import { CommunityStats } from "@/components/results/CommunityStats";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
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

export async function generateMetadata({
  params,
}: ResultsPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = (await getResult(id)) as BracketResult | null;

  if (!result) {
    return {
      title: "Result Not Found",
    };
  }

  const meta = getBracketMeta(result.categorySlug, result.bracketSlug);
  const bracketName = meta?.name ?? "Bracket";

  return {
    title: `My ${bracketName} Ranking`,
    openGraph: {
      title: `My ${bracketName} Ranking | BracketRanker`,
      images: [`/results/${id}/og`],
    },
    twitter: {
      card: "summary_large_image",
      title: `My ${bracketName} Ranking | BracketRanker`,
      images: [`/results/${id}/og`],
    },
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  const result = (await getResult(id)) as BracketResult | null;

  if (!result) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-muted">
            <Trophy className="size-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Result Not Found</h1>
          <p className="text-muted-foreground">
            This result may have expired or doesn&apos;t exist. Results are kept
            for 90 days.
          </p>
          <Button render={<Link href="/" />}>Browse Brackets</Button>
        </div>
      </div>
    );
  }

  const meta = getBracketMeta(result.categorySlug, result.bracketSlug);
  const category = getCategoryBySlug(result.categorySlug);
  const items = await loadBracketItems(
    result.categorySlug,
    result.bracketSlug
  );
  const categoryColor = category?.color ?? "#6366f1";
  const bracketName = meta?.name ?? "Bracket";
  const categoryName = category?.name ?? "Category";

  // Get community stats
  const voteData = await getVoteStats(
    result.categorySlug,
    result.bracketSlug
  );
  const totalPlays = voteData
    ? Number(voteData["totalPlays"] ?? 0)
    : 0;
  const championCount = voteData
    ? Number(voteData[`${result.champion}:champion`] ?? 0)
    : 0;

  // Find champion item name
  const championItem = items?.find((i) => i.id === result.champion);
  const championName = championItem?.name ?? result.champion;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main content */}
        <div className="space-y-8">
          {/* Champion header */}
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div
              className="flex size-16 shrink-0 items-center justify-center rounded-full shadow-lg"
              style={{ backgroundColor: categoryColor }}
            >
              <Trophy className="size-8 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {categoryName} &middot; {bracketName}
              </p>
              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Champion:{" "}
                <span style={{ color: categoryColor }}>{championName}</span>
              </h1>
            </div>
          </div>

          {/* Community stats */}
          <CommunityStats
            championId={result.champion}
            totalPlays={totalPlays}
            championCount={championCount}
          />

          {/* Share buttons */}
          <ShareButtons
            resultId={id}
            bracketName={bracketName}
            champion={championName}
          />

          {/* Full ranking */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Full Ranking</h2>
            {items ? (
              <ResultsDisplay
                ranking={result.ranking}
                items={items}
                champion={result.champion}
                categoryColor={categoryColor}
              />
            ) : (
              <ol className="space-y-1 text-sm">
                {result.ranking.map((itemId: string, idx: number) => (
                  <li key={itemId} className="flex items-center gap-2 px-3 py-1">
                    <span className="w-6 text-right font-bold text-muted-foreground">
                      {idx + 1}.
                    </span>
                    <span>{itemId}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Try this bracket CTA */}
          <div className="rounded-xl border bg-muted/30 p-6 text-center">
            <h3 className="text-lg font-bold">Think you can do better?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Try this bracket yourself and see how your ranking compares.
            </p>
            <Button
              className="mt-4 gap-2"
              render={
                <Link href={`/${result.categorySlug}/${result.bracketSlug}`} />
              }
            >
              Try This Bracket
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Sidebar — share card */}
        <div className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Preview
            </h3>
            {items ? (
              <ShareCard
                ranking={result.ranking}
                items={items}
                bracketName={bracketName}
                categoryName={categoryName}
                categoryColor={categoryColor}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
