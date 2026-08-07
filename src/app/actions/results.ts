"use server";

import { nanoid } from "nanoid";
import { getRedis } from "@/lib/kv";
import {
  areMatchupsValid,
  bracketEntrantIds,
  isRankingValid,
} from "@/lib/validate";
import type { Matchup } from "@/data/types";

interface SaveResultInput {
  categorySlug: string;
  bracketSlug: string;
  ranking: string[];
  champion: string;
  matchups: Matchup[];
}

/** Result ids are ours: 10 chars from nanoid's URL-safe alphabet. */
const RESULT_ID = /^[A-Za-z0-9_-]{10}$/;

export async function saveResult(
  input: SaveResultInput,
): Promise<string | null> {
  // Reject anything that could not have come from a real run before it reaches
  // Redis — every stored result is a 90-day key.
  const entrants = await bracketEntrantIds(
    input?.categorySlug,
    input?.bracketSlug,
  );
  if (!entrants) throw new Error("Unknown bracket");
  if (!isRankingValid(input.ranking, input.champion, entrants)) {
    throw new Error("Invalid ranking");
  }
  if (!areMatchupsValid(input.matchups, entrants)) {
    throw new Error("Invalid matchups");
  }

  const redis = getRedis();
  // Nothing to store into. Returning an id anyway sent the player straight to
  // /results/<id>, which 404s because the record was never written — so the id
  // is only minted once there is somewhere to put it.
  if (!redis) return null;

  const id = nanoid(10);

  const result = {
    categorySlug: input.categorySlug,
    bracketSlug: input.bracketSlug,
    ranking: input.ranking,
    champion: input.champion,
    matchups: input.matchups,
    id,
    createdAt: Date.now(),
  };

  // Save with 90-day TTL
  await redis.set(`result:${id}`, JSON.stringify(result), {
    ex: 60 * 60 * 24 * 90,
  });

  return id;
}

export async function getResult(id: string) {
  const redis = getRedis();
  if (!redis) return null;
  if (typeof id !== "string" || !RESULT_ID.test(id)) return null;

  const data = await redis.get<string>(`result:${id}`);
  if (!data) return null;

  return typeof data === "string" ? JSON.parse(data) : data;
}
