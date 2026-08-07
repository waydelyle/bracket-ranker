"use server";

import { getRedis } from "@/lib/kv";
import {
  areMatchupsValid,
  bracketEntrantIds,
  isGeneratedId,
  isSlug,
} from "@/lib/validate";
import type { Matchup } from "@/data/types";

export async function submitVotes(
  categorySlug: string,
  bracketSlug: string,
  matchups: Matchup[],
  championId: string
) {
  const redis = getRedis();
  if (!redis) return;

  // This is a public endpoint. Without these checks a caller can create
  // arbitrary `votes:*` keys with arbitrary fields and skew every community
  // ranking on the site.
  const entrants = await bracketEntrantIds(categorySlug, bracketSlug);
  if (!entrants) return;
  if (!entrants.has(championId)) return;
  if (!areMatchupsValid(matchups, entrants)) return;

  const key = `votes:${categorySlug}/${bracketSlug}`;
  const pipe = redis.pipeline();

  for (const m of matchups) {
    pipe.hincrby(key, `${m.winner}:wins`, 1);
    const loser = m.winner === m.itemA ? m.itemB : m.itemA;
    pipe.hincrby(key, `${loser}:losses`, 1);
  }
  pipe.hincrby(key, `${championId}:champion`, 1);
  pipe.hincrby(key, "totalPlays", 1);

  // The `custom:*` bracket and every `result:*` referencing it expire after 90
  // days, so their vote hash has to as well or it is orphaned in Redis forever.
  // Set inside the pipeline (no extra round trip) and refreshed on each play, so
  // a bracket people keep playing keeps its history.
  if (categorySlug === "custom") {
    pipe.expire(key, 60 * 60 * 24 * 90);
  }

  await pipe.exec();
}

export async function getVoteStats(
  categorySlug: string,
  bracketSlug: string
) {
  const redis = getRedis();
  if (!redis) return null;
  // Custom brackets are keyed by nanoid rather than by slug.
  if (!isSlug(categorySlug)) return null;
  if (!isSlug(bracketSlug) && !isGeneratedId(bracketSlug)) return null;

  const key = `votes:${categorySlug}/${bracketSlug}`;
  const data = await redis.hgetall(key);
  return data;
}
