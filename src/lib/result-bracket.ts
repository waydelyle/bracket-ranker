import { getBracketMeta } from "@/data/registry";
import { getCategoryBySlug } from "@/data/categories";
import { loadBracketItems } from "@/data/items";
import { getCustomBracket } from "@/app/actions/custom-brackets";
import type { BracketItem } from "@/data/types";

export interface ResolvedBracket {
  /** Display name for the bracket a result came from. */
  name: string;
  categoryName: string;
  categoryColor: string;
  items: BracketItem[] | null;
  /** Where to send someone who wants to play it. */
  playPath: string;
  isCustom: boolean;
}

const CUSTOM_COLOR = "#8b5cf6";

/**
 * Resolves the bracket behind a saved result.
 *
 * User-built brackets are played at `/create/[id]` and stored in Redis rather
 * than the registry, so looking them up the same way as a built-in bracket
 * yields no name, no entrants — leaving the results page showing raw ids — and
 * a "play it" link to a URL that does not exist.
 */
export async function resolveResultBracket(
  categorySlug: string,
  bracketSlug: string,
): Promise<ResolvedBracket> {
  if (categorySlug === "custom") {
    const bracket = await getCustomBracket(bracketSlug);
    const items = (bracket?.items as BracketItem[] | undefined) ?? null;
    return {
      name: (bracket?.title as string | undefined) ?? "Custom Bracket",
      categoryName: "Custom",
      categoryColor: CUSTOM_COLOR,
      items,
      playPath: `/create/${bracketSlug}`,
      isCustom: true,
    };
  }

  const meta = getBracketMeta(categorySlug, bracketSlug);
  const category = getCategoryBySlug(categorySlug);
  const items = await loadBracketItems(categorySlug, bracketSlug);

  return {
    name: meta?.name ?? "Bracket",
    categoryName: category?.name ?? "Category",
    categoryColor: category?.color ?? "#6366f1",
    items,
    playPath: `/${categorySlug}/${bracketSlug}`,
    isCustom: false,
  };
}
