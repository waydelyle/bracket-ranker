import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import { categories } from "@/data/categories";
import { getBracketsByCategory } from "@/data/registry";
import { getVoteStats } from "@/app/actions/votes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PowerRankings,
  type LeaderboardItem,
} from "@/components/leaderboard/PowerRankings";

export const revalidate = 300; // ISR: revalidate every 5 minutes

export const metadata: Metadata = {
  title: "Community Rankings - Global Leaderboard",
  description:
    "See how the community ranks items across all bracket categories. Updated live from player votes.",
};

async function getCategoryLeaderboard(
  categorySlug: string
): Promise<LeaderboardItem[]> {
  const bracketMetas = getBracketsByCategory(categorySlug);
  const itemMap = new Map<
    string,
    { name: string; wins: number; losses: number; championCount: number }
  >();

  // For each bracket in this category, load items and fetch vote stats
  for (const meta of bracketMetas) {
    // Load the item names from the JSON data
    let bracketItems: { id: string; name: string }[] = [];
    try {
      const data = await import(
        `@/data/brackets/${categorySlug}/${meta.slug}.json`
      );
      bracketItems = data.default.items;
    } catch {
      continue;
    }

    // Create a lookup from id to name
    const nameMap = new Map<string, string>();
    for (const item of bracketItems) {
      nameMap.set(item.id, item.name);
    }

    // Fetch vote stats from Redis
    const stats = await getVoteStats(categorySlug, meta.slug);
    if (!stats) continue;

    // Parse the flat hash into per-item stats
    const record = stats as Record<string, unknown>;
    for (const [key, value] of Object.entries(record)) {
      if (key === "totalPlays") continue;

      const parts = key.split(":");
      if (parts.length !== 2) continue;

      const itemId = parts[0];
      const stat = parts[1]; // "wins", "losses", or "champion"
      const count = typeof value === "number" ? value : Number(value) || 0;

      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, {
          name: nameMap.get(itemId) ?? itemId,
          wins: 0,
          losses: 0,
          championCount: 0,
        });
      }

      const entry = itemMap.get(itemId)!;
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

  // Sort: win rate descending, then champion count descending as tiebreaker
  items.sort((a, b) => {
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    if (b.championCount !== a.championCount)
      return b.championCount - a.championCount;
    return b.totalMatchups - a.totalMatchups;
  });

  return items;
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
              <TabsContent key={category.slug} value={category.slug}>
                <PowerRankings
                  items={items}
                  categoryColor={category.color}
                />
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
