export interface BracketCategory {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface BracketMeta {
  slug: string;
  category: string;
  name: string;
  description: string;
  itemCount: number;
  /**
   * Field the bracket opens on: the whole pool, capped at 64. It is no longer
   * restricted to a power of two — a field that does not fill the tree gives
   * out first-round byes instead of dropping entrants from the draw.
   */
  defaultSize: number;
  featured: boolean;
  keywords: string[];
}

export interface BracketItem {
  id: string;
  name: string;
  image?: string;
  subtitle?: string;
  metadata?: Record<string, string>;
}

export interface BracketResult {
  id: string;
  categorySlug: string;
  bracketSlug: string;
  ranking: string[];
  champion: string;
  matchups: Matchup[];
  createdAt: number;
}

export interface Matchup {
  round: number;
  itemA: string;
  itemB: string;
  winner: string;
}

/**
 * Where one entrant finished, as `src/lib/standings.mjs` works it out.
 *
 * Declared here because that module is plain ESM — kept that way so
 * `node --test` can exercise it — and so carries no types of its own.
 */
export interface Standing {
  id: string;
  /** Shared 1-based position. Equal for entrants the bracket never separated. */
  position: number;
  /** How many entrants hold that position. */
  count: number;
  tied: boolean;
  /** Matchups this entrant won — the only thing a knockout really measures. */
  wins: number;
  /** Round it went out in, or null for the champion. */
  eliminatedInRound: number | null;
}

export interface GlobalStats {
  categoryId: string;
  itemId: string;
  wins: number;
  losses: number;
  eloRating: number;
  championCount: number;
}
