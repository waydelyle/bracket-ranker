import { getBracketMeta } from "@/data/registry";
import { loadBracketItems } from "@/data/items";
import { getCustomBracket } from "@/app/actions/custom-brackets";
import type { BracketItem } from "@/data/types";
import { MAX_BRACKET_SIZE } from "@/lib/tournament-validation";

export {
  MAX_BRACKET_SIZE,
  MAX_MATCHUPS,
  areMatchupsValid,
  isRankingValid,
} from "@/lib/tournament-validation";

/** Ceilings for user-named custom brackets. */
export const MAX_CUSTOM_TITLE_LENGTH = 80;
export const MAX_CUSTOM_ITEMS = MAX_BRACKET_SIZE;
export const MAX_CUSTOM_ITEM_NAME_LENGTH = 60;

/** Registry slugs are ours, so anything outside this shape is not a real bracket. */
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

/**
 * Ids minted by nanoid, which uses a mixed-case URL-safe alphabet — so a
 * custom bracket's id is not a slug and must not be checked against SLUG.
 */
const GENERATED_ID = /^[A-Za-z0-9_-]{10}$/;

export function isSlug(value: unknown): value is string {
  return typeof value === "string" && SLUG.test(value);
}

export function isGeneratedId(value: unknown): value is string {
  return typeof value === "string" && GENERATED_ID.test(value);
}

/**
 * The entrant ids a bracket legitimately contains, or null if no such bracket
 * exists.
 *
 * Server actions are public HTTP endpoints: anything that reaches Redis has to
 * be checked against the real bracket first, or a caller can invent categories,
 * slugs and entrant ids at will and write unbounded keys.
 */
export async function bracketEntrantIds(
  categorySlug: unknown,
  bracketSlug: unknown,
): Promise<Set<string> | null> {
  if (!isSlug(categorySlug)) return null;

  // User-built brackets live in Redis rather than the registry, and their
  // identifier is a nanoid — not a slug.
  if (categorySlug === "custom") {
    if (!isGeneratedId(bracketSlug)) return null;
    const bracket = await getCustomBracket(bracketSlug);
    const items = bracket?.items as BracketItem[] | undefined;
    if (!Array.isArray(items) || items.length === 0) return null;
    return new Set(items.map((item) => item.id));
  }

  if (!isSlug(bracketSlug)) return null;
  if (!getBracketMeta(categorySlug, bracketSlug)) return null;
  const items = await loadBracketItems(categorySlug, bracketSlug);
  if (!items || items.length === 0) return null;
  return new Set(items.map((item) => item.id));
}
