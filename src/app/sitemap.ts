import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { brackets } from "@/data/registry";
import { SITE_UPDATED_AT, absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(SITE_UPDATED_AT);

  // Homepage
  const homepage: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl("/"),
    lastModified,
    changeFrequency: "daily",
    priority: 1.0,
  };

  // Category hub pages
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: absoluteUrl(`/${cat.slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  // Individual bracket pages
  const bracketPages: MetadataRoute.Sitemap = brackets.map((b) => ({
    url: absoluteUrl(`/${b.category}/${b.slug}`),
    lastModified,
    changeFrequency: "monthly",
    priority: b.featured ? 0.8 : 0.7,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/tier-list-maker"),
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/about"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  // Leaderboard
  const leaderboard: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl("/leaderboard"),
    lastModified,
    changeFrequency: "daily",
    priority: 0.7,
  };

  // Create page
  const create: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl("/create"),
    lastModified,
    changeFrequency: "monthly",
    priority: 0.9,
  };

  return [
    homepage,
    ...staticPages,
    ...categoryPages,
    ...bracketPages,
    leaderboard,
    create,
  ];
}
