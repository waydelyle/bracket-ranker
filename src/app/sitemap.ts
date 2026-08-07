import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { brackets } from "@/data/registry";
import { getCachedPlayCounts } from "@/lib/community";
import { absoluteUrl } from "@/lib/site";

// Community results pages appear here only once they have data, so refresh the
// sitemap daily rather than freezing it at build time.
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // `lastmod` is only set on the pages that genuinely change on their own —
  // the community results, which move as brackets are played. Stamping today's
  // date on all 226 URLs every day told crawlers the whole site had changed
  // daily, which is both untrue and a reason to stop trusting the signal.
  const lastModified = new Date();

  const homepage: MetadataRoute.Sitemap[number] = {
    url: absoluteUrl("/"),
    changeFrequency: "weekly",
    priority: 1.0,
  };

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: absoluteUrl(`/${cat.slug}`),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const bracketPages: MetadataRoute.Sitemap = brackets.map((b) => ({
    url: absoluteUrl(`/${b.category}/${b.slug}`),
    changeFrequency: "weekly",
    priority: b.featured ? 0.8 : 0.7,
  }));

  // Only list a community results page once it has real aggregated data — an
  // empty one has nothing unique to say and is noindexed anyway.
  const playCounts = await getCachedPlayCounts(
    brackets.map((b) => ({ category: b.category, slug: b.slug })),
  );
  const resultsPages: MetadataRoute.Sitemap = brackets
    .filter((b) => (playCounts[`${b.category}/${b.slug}`] ?? 0) > 0)
    .map((b) => ({
      url: absoluteUrl(`/${b.category}/${b.slug}/results`),
      lastModified,
      changeFrequency: "daily" as const,
      priority: 0.6,
    }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/tier-list-maker"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: absoluteUrl("/create"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      // Aggregated from votes, so this one really does move daily.
      url: absoluteUrl("/leaderboard"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/about"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/privacy"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/contact"),
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  return [
    homepage,
    ...staticPages,
    ...categoryPages,
    ...bracketPages,
    ...resultsPages,
  ];
}
