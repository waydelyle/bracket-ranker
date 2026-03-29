import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { brackets } from "@/data/registry";

const BASE_URL = "https://bracketranker.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Homepage
  const homepage: MetadataRoute.Sitemap[number] = {
    url: BASE_URL,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1.0,
  };

  // Category hub pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/${cat.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Individual bracket pages
  const bracketPages: MetadataRoute.Sitemap = brackets.map((b) => ({
    url: `${BASE_URL}/${b.category}/${b.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: b.featured ? 0.8 : 0.7,
  }));

  // Leaderboard
  const leaderboard: MetadataRoute.Sitemap[number] = {
    url: `${BASE_URL}/leaderboard`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.7,
  };

  // Create page
  const create: MetadataRoute.Sitemap[number] = {
    url: `${BASE_URL}/create`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  };

  return [homepage, ...categoryPages, ...bracketPages, leaderboard, create];
}
