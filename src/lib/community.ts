import { unstable_cache } from "next/cache";
import { getRedis } from "@/lib/kv";
import type { BracketItem } from "@/data/types";

export interface CommunityEntry {
  id: string;
  name: string;
  image?: string;
  subtitle?: string;
  wins: number;
  losses: number;
  matchups: number;
  winRate: number;
  championCount: number;
  championRate: number;
}

export interface CommunityStandings {
  totalPlays: number;
  totalMatchups: number;
  entries: CommunityEntry[];
  /** Entrants that have not been picked in a matchup yet. */
  unplayed: number;
}

/**
 * Aggregate community results for one bracket.
 *
 * This reads the same `votes:{category}/{slug}` hash that `submitVotes` writes,
 * but lives outside `app/actions` so pages can call it during static generation
 * and revalidate on a schedule instead of rendering fully dynamically.
 *
 * Returns null when Redis is unavailable (local dev without credentials) so the
 * caller can fall back to the pre-play state.
 */
export async function getCommunityStandings(
  categorySlug: string,
  bracketSlug: string,
  items: BracketItem[],
): Promise<CommunityStandings | null> {
  const redis = getRedis();
  if (!redis) return null;

  let raw: Record<string, unknown> | null = null;
  try {
    raw = await redis.hgetall<Record<string, unknown>>(
      `votes:${categorySlug}/${bracketSlug}`,
    );
  } catch {
    return null;
  }
  if (!raw) return null;

  const stats = new Map<
    string,
    { wins: number; losses: number; championCount: number }
  >();
  let totalPlays = 0;

  for (const [key, value] of Object.entries(raw)) {
    const count = typeof value === "number" ? value : Number(value) || 0;

    if (key === "totalPlays") {
      totalPlays = count;
      continue;
    }

    // Keys look like "<itemId>:wins". Item ids can contain colons, so split
    // from the right rather than assuming exactly two segments.
    const separator = key.lastIndexOf(":");
    if (separator <= 0) continue;
    const itemId = key.slice(0, separator);
    const stat = key.slice(separator + 1);

    const entry = stats.get(itemId) ?? { wins: 0, losses: 0, championCount: 0 };
    if (stat === "wins") entry.wins += count;
    else if (stat === "losses") entry.losses += count;
    else if (stat === "champion") entry.championCount += count;
    else continue;
    stats.set(itemId, entry);
  }

  const entries: CommunityEntry[] = [];
  let totalMatchups = 0;

  for (const item of items) {
    const stat = stats.get(item.id);
    if (!stat) continue;
    const matchups = stat.wins + stat.losses;
    if (matchups === 0) continue;
    totalMatchups += stat.wins;
    entries.push({
      id: item.id,
      name: item.name,
      image: item.image,
      subtitle: item.subtitle,
      wins: stat.wins,
      losses: stat.losses,
      matchups,
      winRate: (stat.wins / matchups) * 100,
      championCount: stat.championCount,
      championRate: totalPlays > 0 ? (stat.championCount / totalPlays) * 100 : 0,
    });
  }

  if (entries.length === 0) return null;

  entries.sort((a, b) => {
    if (b.winRate !== a.winRate) return b.winRate - a.winRate;
    if (b.championCount !== a.championCount)
      return b.championCount - a.championCount;
    return b.matchups - a.matchups;
  });

  return {
    totalPlays,
    totalMatchups,
    entries,
    unplayed: Math.max(0, items.length - entries.length),
  };
}

/**
 * Cached wrapper around {@link getCommunityStandings}.
 *
 * The Upstash REST call is an uncached data source, which would otherwise opt
 * every bracket page out of static generation. Wrapping it keeps the 110
 * bracket pages prerendered while still refreshing the standings on a schedule.
 */
export function getCachedCommunityStandings(
  categorySlug: string,
  bracketSlug: string,
  items: BracketItem[],
  revalidate = 3600,
) {
  return unstable_cache(
    () => getCommunityStandings(categorySlug, bracketSlug, items),
    ["community-standings", categorySlug, bracketSlug, String(revalidate)],
    { revalidate, tags: ["community-standings"] },
  )();
}

/**
 * Play counts for many brackets in a single round trip.
 *
 * Used by the sitemap, which would otherwise make one Redis call per bracket
 * just to find out whether a results page has anything on it yet.
 */
export async function getPlayCounts(
  keys: { category: string; slug: string }[],
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  const redis = getRedis();
  if (!redis || keys.length === 0) return counts;

  try {
    const pipe = redis.pipeline();
    for (const key of keys) {
      pipe.hget(`votes:${key.category}/${key.slug}`, "totalPlays");
    }
    const results = (await pipe.exec()) as unknown[];
    keys.forEach((key, index) => {
      const value = results[index];
      const count = typeof value === "number" ? value : Number(value) || 0;
      if (count > 0) counts[`${key.category}/${key.slug}`] = count;
    });
  } catch {
    return counts;
  }

  return counts;
}

/**
 * Cached wrapper around {@link getPlayCounts}.
 *
 * Without this the sitemap route reads an uncached data source and Next serves
 * it dynamically on every crawl, which makes the declared `revalidate` on the
 * route meaningless.
 */
const cachedPlayCounts = unstable_cache(
  (keys: { category: string; slug: string }[]) => getPlayCounts(keys),
  ["play-counts"],
  { revalidate: 86400, tags: ["community-standings"] },
);

export function getCachedPlayCounts(
  keys: { category: string; slug: string }[],
) {
  // The keys are passed as an argument rather than baked into the key parts:
  // Next folds arguments into the cache key, whereas the previous key varied
  // only on `keys.length`, so any two different bracket lists of the same
  // length shared one cache entry.
  return cachedPlayCounts(keys);
}

/**
 * Raw vote hash for one bracket, cached.
 *
 * The leaderboard aggregates every bracket in a category; going through the
 * cache keeps that page prerendered instead of hitting Redis on each request.
 */
export function getCachedVoteHash(categorySlug: string, bracketSlug: string) {
  return unstable_cache(
    async (): Promise<Record<string, unknown> | null> => {
      const redis = getRedis();
      if (!redis) return null;
      try {
        return await redis.hgetall<Record<string, unknown>>(
          `votes:${categorySlug}/${bracketSlug}`,
        );
      } catch {
        return null;
      }
    },
    ["vote-hash", categorySlug, bracketSlug],
    { revalidate: 600, tags: ["community-standings"] },
  )();
}

/** Formats a play count for prose, e.g. "1,204 completed brackets". */
export function formatPlays(totalPlays: number) {
  return totalPlays.toLocaleString("en-US");
}
