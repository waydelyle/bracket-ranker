"use server";

import { nanoid } from "nanoid";
import { getRedis } from "@/lib/kv";
import type { Matchup } from "@/data/types";

interface SaveResultInput {
  categorySlug: string;
  bracketSlug: string;
  ranking: string[];
  champion: string;
  matchups: Matchup[];
}

export async function saveResult(input: SaveResultInput): Promise<string> {
  const id = nanoid(10);
  const redis = getRedis();

  const result = {
    ...input,
    id,
    createdAt: Date.now(),
  };

  if (redis) {
    // Save with 90-day TTL
    await redis.set(`result:${id}`, JSON.stringify(result), {
      ex: 60 * 60 * 24 * 90,
    });
  }

  return id;
}

export async function getResult(id: string) {
  const redis = getRedis();
  if (!redis) return null;

  const data = await redis.get<string>(`result:${id}`);
  if (!data) return null;

  return typeof data === "string" ? JSON.parse(data) : data;
}
