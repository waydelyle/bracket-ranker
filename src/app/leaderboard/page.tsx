import type { Metadata } from "next";
import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { categories } from "@/data/categories";
import { getBracketsByCategory } from "@/data/registry";
import { loadBracketItems } from "@/data/items";
import { getCachedVoteHash } from "@/lib/community";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PowerRankings,
  type LeaderboardItem,
} from "@/components/leaderboard/PowerRankings";
import { OG_DEFAULTS } from "@/lib/site";

// Rendered as ISR rather than per-request. This page used to be served with
// `no-store` on every hit, which made it the slowest and heaviest route on the
// site while also being listed in the sitemap.
export const revalidate = 600;

// Rows shown per category. The full aggregate for a category can run to
// hundreds of entrants, which previously pushed the HTML past 1 MB.
const ROWS_PER_CATEGORY = 25;

// Strength of the 50% prior used when ordering the table. Effectively "an
// entrant has to win about this many matchups before its record is taken at
// face value".
const PRIOR_MATCHUPS = 20;

export const metadata: Metadata = {
  title: "Community Rankings - Global Leaderboard",
  description:
    "See how the community ranks items across all bracket categories. Updated live from player votes.",
  alternates: {
    canonical: "/leaderboard",
  },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Community Rankings - Global Leaderboard",
    description:
      "See how the community ranks items across all bracket categories. Updated live from player votes.",
    url: "/leaderboard",
    images: ["/opengraph-image"],
  },
};

async function getCategoryLeaderboard(
  categorySlug: string
): Promise<LeaderboardItem[]> {
  const bracketMetas = getBracketsByCategory(categorySlug);
  const itemMap = new Map<
    string,
    { name: string; wins: number; losses: number; championCount: number }
  >();

  // Fetch every bracket in the category at once. Doing this serially meant one
  // Redis round trip per bracket, which pushed the page past the 60s static
  // generation budget. Each read goes through the data cache so this page stays
  // prerendered rather than being rebuilt on every request.
  const perBracket = await Promise.all(
    bracketMetas.map(async (meta) => {
      const [bracketItems, stats] = await Promise.all([
        loadBracketItems(categorySlug, meta.slug),
        getCachedVoteHash(categorySlug, meta.slug),
      ]);
      if (!bracketItems || !stats) return null;
      return { bracketItems, stats };
    }),
  );

  for (const bucket of perBracket) {
    if (!bucket) continue;

    // Create a lookup from id to name
    const nameMap = new Map<string, string>();
    for (const item of bucket.bracketItems) {
      nameMap.set(item.id, item.name);
    }

    // Parse the flat hash into per-item stats
    for (const [key, value] of Object.entries(bucket.stats)) {
      if (key === "totalPlays") continue;

      // Item ids can contain colons, so split from the right.
      const separator = key.lastIndexOf(":");
      if (separator <= 0) continue;

      const itemId = key.slice(0, separator);
      const stat = key.slice(separator + 1); // "wins", "losses", or "champion"
      const count = typeof value === "number" ? value : Number(value) || 0;

      const name = nameMap.get(itemId);
      if (!name) continue;

      // Aggregate by name, not by id. Ids are scoped to a bracket, so the same
      // entity carries different ones across brackets in a category — Toy Story
      // is "toy-story", "toy-story-anim" and "toy-story-franchise" — and keying
      // on the id listed it three times with its record split between the rows.
      const groupKey = name.trim().toLowerCase();

      if (!itemMap.has(groupKey)) {
        itemMap.set(groupKey, {
          name: name.trim(),
          wins: 0,
          losses: 0,
          championCount: 0,
        });
      }

      const entry = itemMap.get(groupKey)!;
      if (stat === "wins") entry.wins += count;
      else if (stat === "losses") entry.losses += count;
      else if (stat === "champion") entry.championCount += count;
    }
  }

  // Convert to LeaderboardItem array and compute derived stats
  const items: LeaderboardItem[] = Array.from(itemMap.entries()).map(
    ([id, data]) => {
      const totalMatchups = data.wins + data.losses;
      const winRate = totalMatchups > 0 ? (data.wins / totalMatchups) * 100 : 0;
      return {
        id,
        name: data.name,
        wins: data.wins,
        losses: data.losses,
        winRate,
        championCount: data.championCount,
        totalMatchups,
      };
    }
  );

  // Sort on a win rate shrunk toward 50%, so a 4-for-4 entrant no longer
  // outranks one that is 247-for-316. The rate shown to the reader is still the
  // real one; only the ordering is smoothed.
  const rank = (item: LeaderboardItem) =>
    (item.wins + PRIOR_MATCHUPS / 2) / (item.totalMatchups + PRIOR_MATCHUPS);

  items.sort((a, b) => {
    const diff = rank(b) - rank(a);
    if (diff !== 0) return diff;
    if (b.championCount !== a.championCount)
      return b.championCount - a.championCount;
    return b.totalMatchups - a.totalMatchups;
  });

  return items.slice(0, ROWS_PER_CATEGORY);
}

export default async function LeaderboardPage() {
  // Fetch leaderboard data for all categories in parallel
  const categoryData = await Promise.all(
    categories.map(async (cat) => ({
      category: cat,
      items: await getCategoryLeaderboard(cat.slug),
    }))
  );

  const hasAnyData = categoryData.some((d) => d.items.length > 0);

  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20">
            <BarChart3 className="size-7 text-amber-500" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Community Rankings
          </h1>
          <p className="mt-2 text-muted-foreground">
            See how the community ranks items across every bracket, aggregated
            from all player votes.
          </p>
        </div>

        {/* Content */}
        {!hasAnyData ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border/50 bg-card px-6 py-16 text-center">
            <BarChart3 className="size-10 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              Leaderboard data will appear once voting begins
            </p>
          </div>
        ) : (
          <Tabs defaultValue={categories[0].slug} className="w-full">
            <TabsList className="mb-6 flex h-auto w-full flex-wrap gap-1 bg-secondary">
              {categories.map((cat) => {
                const data = categoryData.find(
                  (d) => d.category.slug === cat.slug
                );
                const count = data?.items.length ?? 0;
                return (
                  <TabsTrigger
                    key={cat.slug}
                    value={cat.slug}
                    className="gap-1.5 px-3 py-2 text-sm data-[state=active]:bg-card data-[state=active]:text-white"
                    style={
                      {
                        "--tab-active-border": cat.color,
                      } as React.CSSProperties
                    }
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                    {count > 0 && (
                      <span className="ml-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-medium leading-none text-muted-foreground">
                        {count}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {categoryData.map(({ category, items }) => (
              // keepMounted: without it Base UI renders only the active panel,
              // so five of the six category leaderboards never appeared in the
              // served HTML at all — invisible to crawlers and to anyone
              // reading the page with JavaScript disabled.
              <TabsContent
                key={category.slug}
                value={category.slug}
                keepMounted
              >
                <h2 className="sr-only">
                  {category.name} community rankings
                </h2>
                <PowerRankings
                  items={items}
                  categoryColor={category.color}
                />

                {/* Per-bracket community pages were reachable from a single link
                    each and from nothing on this page, which left 110 of them
                    effectively orphaned. */}
                <div className="mt-8">
                  <h3 className="mb-3 text-sm font-semibold text-muted-foreground">
                    Community rankings by bracket
                  </h3>
                  <ul className="flex flex-wrap gap-2">
                    {getBracketsByCategory(category.slug).map((bracket) => (
                      <li key={bracket.slug}>
                        <Link
                          href={`/${category.slug}/${bracket.slug}/results`}
                          className="inline-flex rounded-full border border-border/60 bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                        >
                          {bracket.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
