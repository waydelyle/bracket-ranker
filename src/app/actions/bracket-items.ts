"use server";

import { getBracketMeta } from "@/data/registry";
import { loadBracketItems } from "@/data/items";
import type { BracketItem } from "@/data/types";

/**
 * Returns the entrants for a built-in bracket.
 *
 * Used by the tier list maker so the client only downloads the one dataset the
 * user picked rather than all 110 up front.
 */
export async function getBracketItemsAction(
  category: string,
  slug: string,
): Promise<BracketItem[] | null> {
  // Only serve slugs that exist in the registry.
  if (!getBracketMeta(category, slug)) return null;
  return loadBracketItems(category, slug);
}
