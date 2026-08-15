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

export interface GlobalStats {
  categoryId: string;
  itemId: string;
  wins: number;
  losses: number;
  eloRating: number;
  championCount: number;
}
