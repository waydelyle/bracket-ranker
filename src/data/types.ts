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
  defaultSize: 8 | 16 | 32 | 64;
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
