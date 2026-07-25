import type { BracketItem } from "./types";

/**
 * Loads the entrant list for a bracket.
 *
 * The dynamic import is resolved at build time from the co-located JSON files,
 * so this stays static-generation friendly. Returns null for unknown brackets.
 */
export async function loadBracketItems(
  category: string,
  slug: string,
): Promise<BracketItem[] | null> {
  try {
    const data = await import(`@/data/brackets/${category}/${slug}.json`);
    return data.default.items as BracketItem[];
  } catch {
    return null;
  }
}
