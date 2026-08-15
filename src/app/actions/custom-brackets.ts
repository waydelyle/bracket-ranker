"use server";

import { nanoid } from "nanoid";
import { getRedis } from "@/lib/kv";
import { clampText } from "@/lib/serialization.mjs";
import {
  MAX_CUSTOM_ITEMS,
  MAX_CUSTOM_ITEM_NAME_LENGTH,
  MAX_CUSTOM_TITLE_LENGTH,
} from "@/lib/validate";

interface CustomBracketInput {
  title: string;
  items: { name: string; image?: string }[];
}

/** Custom bracket ids are ours: 10 chars from nanoid's URL-safe alphabet. */
const CUSTOM_ID = /^[A-Za-z0-9_-]{10}$/;

/** Only real image URLs are worth storing, and only over http(s). */
function safeImageUrl(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0 || value.length > 500) {
    return undefined;
  }
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}

export async function saveCustomBracket(
  input: CustomBracketInput
): Promise<string> {
  // This is a public endpoint writing 90-day Redis keys, so the payload needs a
  // ceiling before it is stored. Clipped with `clampText` rather than `slice`:
  // cutting at a fixed number of UTF-16 units lands inside an emoji whenever an
  // odd number of units precede it, and the half left behind is stored, served
  // back, and then thrown at `encodeURIComponent` by the share buttons — which
  // raises `URIError` and stops the shared result page from opening at all.
  const title = clampText(input?.title, MAX_CUSTOM_TITLE_LENGTH);
  if (!title) throw new Error("A bracket needs a title");

  if (!Array.isArray(input.items)) throw new Error("Invalid items");

  const kept = input.items.slice(0, MAX_CUSTOM_ITEMS);

  // Ids have to be unique: the game identifies entrants by id, so two entrants
  // sharing one ("Pizza" and "pizza" both slugify to "pizza") makes matchups
  // ambiguous and the final ranking unusable.
  const used = new Set<string>();
  const bracketItems = kept
    .map((item, index) => {
      const name = clampText(item?.name, MAX_CUSTOM_ITEM_NAME_LENGTH);
      if (!name) return null;

      const base =
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || `item-${index}`;

      let id = base;
      let suffix = 2;
      while (used.has(id)) id = `${base}-${suffix++}`;
      used.add(id);

      return { id, name, image: safeImageUrl(item.image) };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (bracketItems.length < 8) {
    throw new Error("A bracket needs at least 8 entrants");
  }

  const id = nanoid(10);
  const redis = getRedis();

  const bracket = {
    id,
    title,
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
  if (typeof id !== "string" || !CUSTOM_ID.test(id)) return null;

  const data = await redis.get<string>(`custom:${id}`);
  if (!data) return null;

  return typeof data === "string" ? JSON.parse(data) : data;
}
