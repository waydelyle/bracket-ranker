import type { BracketCategory } from "./types";

export const categories: BracketCategory[] = [
  {
    id: "movies",
    slug: "movies",
    name: "Movies",
    icon: "\uD83C\uDFAC",
    color: "#ef4444",
    description: "Rank the best movies ever made",
  },
  {
    id: "music",
    slug: "music",
    name: "Music",
    icon: "\uD83C\uDFB5",
    color: "#8b5cf6",
    description: "Rank songs, albums & artists",
  },
  {
    id: "tv",
    slug: "tv",
    name: "TV",
    icon: "\uD83D\uDCFA",
    color: "#6366f1",
    description: "Rank the best TV shows",
  },
  {
    id: "food",
    slug: "food",
    name: "Food",
    icon: "\uD83C\uDF54",
    color: "#22c55e",
    description: "Rank food, drinks & restaurants",
  },
  {
    id: "sports",
    slug: "sports",
    name: "Sports",
    icon: "\uD83C\uDFC6",
    color: "#3b82f6",
    description: "Rank players, teams & athletes",
  },
  {
    id: "random",
    slug: "random",
    name: "Random",
    icon: "\uD83C\uDFB2",
    color: "#ec4899",
    description: "Rank anything & everything",
  },
];

export function getCategoryBySlug(slug: string): BracketCategory | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getAllCategories(): BracketCategory[] {
  return categories;
}
