"use server";

import { getRedis } from "@/lib/kv";
import type { Matchup } from "@/data/types";

export async function submitVotes(
  categorySlug: string,
  bracketSlug: string,
  matchups: Matchup[],
  championId: string
) {
  const redis = getRedis();
  if (!redis) return;

  const key = `votes:${categorySlug}/${bracketSlug}`;
  const pipe = redis.pipeline();

  for (const m of matchups) {
    pipe.hincrby(key, `${m.winner}:wins`, 1);
    const loser = m.winner === m.itemA ? m.itemB : m.itemA;
    pipe.hincrby(key, `${loser}:losses`, 1);
  }
  pipe.hincrby(key, `${championId}:champion`, 1);
  pipe.hincrby(key, "totalPlays", 1);

  await pipe.exec();
}

export async function getVoteStats(
  categorySlug: string,
  bracketSlug: string
) {
  const redis = getRedis();
  if (!redis) return null;

  const key = `votes:${categorySlug}/${bracketSlug}`;
  const data = await redis.hgetall(key);
  return data;
}
