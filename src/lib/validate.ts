import { getBracketMeta } from "@/data/registry";
import { loadBracketItems } from "@/data/items";
import { getCustomBracket } from "@/app/actions/custom-brackets";
import type { BracketItem, Matchup } from "@/data/types";

/** Largest bracket the game offers, so the most picks a real run can produce. */
export const MAX_BRACKET_SIZE = 64;
export const MAX_MATCHUPS = MAX_BRACKET_SIZE - 1;

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

/** True when `matchups` could have come from a real run of this bracket. */
export function areMatchupsValid(
  matchups: unknown,
  entrants: Set<string>,
): matchups is Matchup[] {
  if (!Array.isArray(matchups)) return false;
  if (matchups.length === 0 || matchups.length > MAX_MATCHUPS) return false;

  return matchups.every((matchup) => {
    if (!matchup || typeof matchup !== "object") return false;
    const { itemA, itemB, winner } = matchup as Matchup;
    if (!entrants.has(itemA) || !entrants.has(itemB)) return false;
    if (itemA === itemB) return false;
    return winner === itemA || winner === itemB;
  });
}

/** True when `ranking` is a plausible final order for this bracket. */
export function isRankingValid(
  ranking: unknown,
  champion: unknown,
  entrants: Set<string>,
): ranking is string[] {
  if (!Array.isArray(ranking)) return false;
  if (ranking.length < 2 || ranking.length > MAX_BRACKET_SIZE) return false;
  if (typeof champion !== "string" || ranking[0] !== champion) return false;
  if (!ranking.every((id) => typeof id === "string" && entrants.has(id))) {
    return false;
  }
  // A ranking lists each entrant once.
  return new Set(ranking).size === ranking.length;
}
