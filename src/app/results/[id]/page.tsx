import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Trophy, ArrowRight } from "lucide-react";
import { getResult } from "@/app/actions/results";
import { getVoteStats } from "@/app/actions/votes";
import { getBracketMeta } from "@/data/registry";
import type { BracketResult, Standing } from "@/data/types";
import { getRelatedBrackets } from "@/lib/seo";
import { resolveResultBracket } from "@/lib/result-bracket";
import { bracketStandings } from "@/lib/standings.mjs";
import { OG_DEFAULTS } from "@/lib/site";
import { Button } from "@/components/ui/button";
import { ResultsDisplay } from "@/components/results/ResultsDisplay";
import { ShareCard } from "@/components/results/ShareCard";
import { ShareButtons } from "@/components/results/ShareButtons";
import { CommunityStats } from "@/components/results/CommunityStats";

interface ResultsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * One Redis read per request, shared by `generateMetadata` and the page.
 */
const loadResult = cache(
  async (id: string) => (await getResult(id)) as BracketResult | null,
);

export async function generateMetadata({
  params,
}: ResultsPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await loadResult(id);

  // The 404 has to be raised here rather than in the component below. This
  // route has a `loading.tsx`, so rendering it streams: by the time the
  // component runs, a 200 has already been flushed and `notFound()` can only
  // swap the body, producing a soft 404. Metadata resolves before the shell is
  // sent, so throwing here yields a real 404 status.
  if (!result) {
    notFound();
  }

  const { name: bracketName, items } = await resolveResultBracket(
    result.categorySlug,
    result.bracketSlug,
  );

  // Name the actual podium. Every shared link used to carry the site-wide
  // blurb, so a card that should read "Wendy's beat Chick-fil-A" instead
  // described the whole website and gave nobody a reason to click.
  const nameFor = (itemId: string) =>
    items?.find((item) => item.id === itemId)?.name ?? itemId;
  // From the standings, so the card names the same three the page and the
  // share image do — the raw ranking can order a tied pair the other way.
  const podium = (
    bracketStandings(result.ranking, result.matchups) as Standing[]
  )
    .slice(0, 3)
    .map((entry) => nameFor(entry.id));
  const description =
    podium.length > 1
      ? `${podium[0]} is my #1 in the ${bracketName} bracket, ahead of ${podium.slice(1).join(" and ")}. See the full ranking and build your own.`
      : `My ${bracketName} ranking, decided head-to-head. See the full order and build your own.`;

  const title = `My ${bracketName} Ranking`;

  return {
    title,
    description,
    robots: {
      index: false,
      follow: true,
    },
    openGraph: {
      ...OG_DEFAULTS,
      title: `${title} | BracketRanker`,
      url: `/results/${id}`,
      images: [
        {
          url: `/results/${id}/og`,
          width: 1200,
          height: 630,
          alt: `${bracketName} ranking with ${podium[0]} at number one`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | BracketRanker`,
      images: [`/results/${id}/og`],
    },
  };
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { id } = await params;
  // Already 404'd in generateMetadata for missing ids; this narrows the type.
  const result = await loadResult(id);
  if (!result) {
    notFound();
  }

  const meta = getBracketMeta(result.categorySlug, result.bracketSlug);
  const {
    name: bracketName,
    categoryName,
    categoryColor,
    items,
    playPath,
    isCustom,
  } = await resolveResultBracket(result.categorySlug, result.bracketSlug);

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

  // Runners-up make the shared text worth reading — "X won" alone says little.
  // Labelled from the standings so a shared third place is marked "=3" rather
  // than being passed off as an outright one.
  const nameFor = (id: string) => items?.find((i) => i.id === id)?.name ?? id;
  const standings = bracketStandings(
    result.ranking,
    result.matchups,
  ) as Standing[];
  const podium = standings.slice(0, 3).map((entry) => ({
    name: nameFor(entry.id),
    label: entry.tied ? `=${entry.position}` : `${entry.position}`,
  }));

  // A finished bracket is the moment someone is most likely to play another
  // one, so the page needs somewhere to go that is not the bracket they just did.
  const related = meta ? getRelatedBrackets(meta, 6) : [];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
        {/* Champion, stats and sharing */}
        <div className="space-y-8 lg:col-start-1 lg:row-start-1">
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
            podium={podium}
            categoryColor={categoryColor}
          />
        </div>

        {/* Share card — under the share row on mobile, right rail on desktop */}
        <div className="lg:col-start-2 lg:row-start-1">
          <div className="lg:sticky lg:top-24">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              Your card
            </h2>
            {items ? (
              <ShareCard
                ranking={result.ranking}
                items={items}
                bracketName={bracketName}
                categoryName={categoryName}
                categoryColor={categoryColor}
                matchups={result.matchups}
              />
            ) : null}
          </div>
        </div>

        {/* Ranking and what to play next */}
        <div className="space-y-8 lg:col-start-1 lg:row-start-2">
          {/* Full ranking */}
          <div className="space-y-3">
            <h2 className="text-lg font-bold">Full Ranking</h2>
            {/* The draw is shuffled, and in a knockout the draw is part of the
                result: an entrant put opposite the eventual champion goes out
                earlier than the same entrant would have anywhere else. Worth
                saying, rather than letting the list read as a pure verdict. */}
            <p className="text-sm text-muted-foreground">
              Entrants are drawn at random, so who met whom is part of how this
              turned out.
            </p>
            {items ? (
              <ResultsDisplay
                ranking={result.ranking}
                items={items}
                categoryColor={categoryColor}
                matchups={result.matchups}
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
            <h2 className="text-lg font-bold">Think you can do better?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Replay it — the draw is reshuffled, so the matchups change.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button className="gap-2" render={<Link href={playPath} />}>
                Play it again
                <ArrowRight className="size-4" />
              </Button>
              {/* Custom brackets have no community page — they are private to
                  whoever holds the link. */}
              {!isCustom && (
                <Button
                  variant="outline"
                  render={<Link href={`${playPath}/results`} />}
                >
                  See how everyone ranked it
                </Button>
              )}
            </div>
          </div>

          {/* What to play next */}
          {related.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold">Play another bracket</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {related.map((item) => (
                  <Link
                    key={`${item.category}/${item.slug}`}
                    href={`/${item.category}/${item.slug}`}
                    className="group rounded-xl border border-border/50 bg-card p-4 transition-colors hover:bg-secondary/50"
                  >
                    <p className="font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.itemCount} entrants
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
