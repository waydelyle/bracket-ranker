"use server";

import { nanoid } from "nanoid";
import { getRedis } from "@/lib/kv";

interface CustomBracketInput {
  title: string;
  items: { name: string; image?: string }[];
}

export async function saveCustomBracket(
  input: CustomBracketInput
): Promise<string> {
  const id = nanoid(10);
  const redis = getRedis();

  // Generate proper BracketItem format with IDs
  const bracketItems = input.items.map((item, index) => ({
    id:
      item.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || `item-${index}`,
    name: item.name,
    image: item.image || undefined,
  }));

  const bracket = {
    id,
    title: input.title,
    items: bracketItems,
    createdAt: Date.now(),
  };

  if (redis) {
    await redis.set(`custom:${id}`, JSON.stringify(bracket), {
      ex: 60 * 60 * 24 * 90,
    });
  }

  return id;
}

export async function getCustomBracket(id: string) {
  const redis = getRedis();
  if (!redis) return null;

  const data = await redis.get<string>(`custom:${id}`);
  if (!data) return null;

  return typeof data === "string" ? JSON.parse(data) : data;
}
