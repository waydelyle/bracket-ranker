import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BarChart3, Play, Trophy } from "lucide-react";
import { brackets, getBracketMeta } from "@/data/registry";
import { getCategoryBySlug } from "@/data/categories";
import { loadBracketItems } from "@/data/items";
import { StructuredData } from "@/components/seo/StructuredData";
import { CommunityBoard } from "@/components/bracket/CommunityBoard";
import { EntrantGrid } from "@/components/bracket/EntrantGrid";
import { formatPlays, getCachedCommunityStandings } from "@/lib/community";
import {
  buildBreadcrumbJsonLd,
  buildFaqJsonLd,
  getBracketKeyword,
  getRelatedBrackets,
} from "@/lib/seo";
import { absoluteUrl, OG_DEFAULTS } from "@/lib/site";

// Community data changes as people play, so refresh more aggressively than the
// bracket page itself.
export const revalidate = 600;

interface ResultsPageProps {
  params: Promise<{ category: string; bracket: string }>;
}

// `revalidate` alone does not make a dynamic segment cacheable: without
// `generateStaticParams` these 110 pages were served with
// `cache-control: private, no-cache, no-store`, so every visit and every crawl
// re-rendered them and hit Redis live. Prerendering them costs one cached Redis
// read per bracket at build time — the same reads the bracket pages already do.
export function generateStaticParams() {
  return brackets.map((b) => ({ category: b.category, bracket: b.slug }));
}

function formatUpdated(date: Date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

export async function generateMetadata({
  params,
}: ResultsPageProps): Promise<Metadata> {
  const { category, bracket } = await params;
  const meta = getBracketMeta(category, bracket);
  if (!meta) return {};
  const cat = getCategoryBySlug(category);
  const items = await loadBracketItems(category, bracket);
  const standings = items
    ? await getCachedCommunityStandings(category, bracket, items, 600)
    : null;

  const title = `${meta.name} Community Rankings`;
  const description = standings
    ? `How ${formatPlays(standings.totalPlays)} people ranked ${meta.name.toLowerCase()}. Win rates, champion counts and the full community order, updated as brackets are played.`
    : `The community ranking for ${meta.name.toLowerCase()}, aggregated from every completed bracket. Play the ${getBracketKeyword(meta, cat)} to add your picks.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${category}/${bracket}/results`,
    },
    // A results page with no votes yet has nothing unique to say, so keep it
    // out of the index until real data exists.
    robots: standings ? undefined : { index: false, follow: true },
    openGraph: {
      ...OG_DEFAULTS,
      title,
      description,
      url: `/${category}/${bracket}/results`,
    },
  };
}

export default async function BracketResultsPage({
  params,
}: ResultsPageProps) {
  const { category, bracket } = await params;
  const meta = getBracketMeta(category, bracket);

  if (!meta) {
    notFound();
  }

  const cat = getCategoryBySlug(category);
  const items = await loadBracketItems(category, bracket);

  if (!items) {
    notFound();
  }

  const standings = await getCachedCommunityStandings(category, bracket, items, 600);
  const related = getRelatedBrackets(meta, 6);
  const color = cat?.color ?? "#6366f1";
  const playHref = `/${category}/${bracket}`;
  const path = `${playHref}/results`;
  const updated = new Date();
  const keyword = getBracketKeyword(meta, cat);

  const champion = standings?.entries.find((entry) => entry.championCount > 0);
  const topByWinRate = standings?.entries[0];

  const faqs = [
    {
      question: `How is the ${meta.name} community ranking calculated?`,
      answer: standings
        ? `Every completed ${meta.name} bracket adds one result to the pool. Each head-to-head pick is recorded as a win for one entrant and a loss for the other, and entrants are ordered by win rate across all ${formatPlays(
            standings.totalMatchups,
          )} matchups played so far. Champion counts are tracked separately so a lucky draw cannot pass as a favourite.`
        : `Each head-to-head pick in a completed bracket is recorded as a win for one entrant and a loss for the other. Entrants are then ordered by win rate. No results have been recorded for this bracket yet.`,
    },
    {
      question: `Why use win rate instead of how often something wins the bracket?`,
      answer: `Brackets are shuffled, so an entrant can reach the final without beating anything difficult. Win rate counts every matchup an entrant appeared in, which is a fairer read on how people actually feel about it. Champion counts are shown next to it for the entrants that keep taking the title.`,
    },
    {
      question: `How often does this ranking update?`,
      answer: `Continuously. The page rebuilds every few minutes, so a bracket you finish now shows up here shortly afterwards. Last refreshed ${formatUpdated(
        updated,
      )}.`,
    },
    {
      question: `Does my own ranking have to match this one?`,
      answer: `No — this is the aggregate, not a verdict. Play the ${keyword} yourself and you get a private result page with your own order, which you can share and compare against the community list here.`,
    },
  ];

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: cat?.name ?? category, path: `/${category}` },
    { name: meta.name, path: playHref },
    { name: "Community rankings", path },
  ]);
  const faqSchema = buildFaqJsonLd(faqs);
  const rankingSchema = standings
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: `${meta.name} community ranking`,
        url: absoluteUrl(path),
        numberOfItems: standings.entries.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement: standings.entries.map((entry, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: entry.name,
          ...(entry.image ? { image: entry.image } : {}),
        })),
      }
    : null;

  return (
    <>
      <StructuredData
        data={[breadcrumbSchema, faqSchema, ...(rankingSchema ? [rankingSchema] : [])]}
      />

      <section className="border-b border-border/50 px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl space-y-5">
          <Link
            href={playHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color }}
          >
            {meta.name}
            <ArrowRight className="size-3.5" />
          </Link>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {meta.name} Community Rankings
          </h1>

          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            {standings ? (
              <>
                The cumulative ranking of all {items.length} entrants, built
                from {formatPlays(standings.totalPlays)} completed{" "}
                {meta.name} brackets and{" "}
                {formatPlays(standings.totalMatchups)} head-to-head picks.
                {topByWinRate && (
                  <>
                    {" "}
                    <strong className="text-white">
                      {topByWinRate.name}
                    </strong>{" "}
                    currently leads on win rate
                    {champion && champion.id !== topByWinRate.id && (
                      <>
                        , while{" "}
                        <strong className="text-white">{champion.name}</strong>{" "}
                        has taken the title most often
                      </>
                    )}
                    .
                  </>
                )}
              </>
            ) : (
              <>
                No brackets have been completed for {meta.name} yet. Play it
                once and this page fills in with the aggregate ranking, win
                rates and champion counts.
              </>
            )}
          </p>

          <p className="text-sm text-muted-foreground">
            Last updated {formatUpdated(updated)}
          </p>

          <Link
            href={playHref}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: color }}
          >
            <Play className="size-4" />
            Play the {meta.name} bracket
          </Link>
        </div>
      </section>

      {standings ? (
        <section className="px-4 py-12">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <p className="text-2xl font-extrabold text-white">
                  {formatPlays(standings.totalPlays)}
                </p>
                <p className="text-sm text-muted-foreground">
                  brackets completed
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <p className="text-2xl font-extrabold text-white">
                  {formatPlays(standings.totalMatchups)}
                </p>
                <p className="text-sm text-muted-foreground">picks recorded</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-card p-4">
                <p className="text-2xl font-extrabold text-white">
                  {standings.entries.length}
                </p>
                <p className="text-sm text-muted-foreground">
                  entrants with results
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-5" style={{ color }} />
                <h2 className="text-xl font-bold text-white">
                  Full community ranking
                </h2>
              </div>
              <CommunityBoard
                standings={standings}
                categoryColor={color}
                limit={standings.entries.length}
              />
              {standings.unplayed > 0 && (
                <p className="text-sm text-muted-foreground">
                  {standings.unplayed} of the {items.length} entrants have not
                  appeared in a recorded matchup yet — the field is shuffled
                  each play, so smaller brackets leave some out.
                </p>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="px-4 py-12">
          <div className="mx-auto max-w-4xl space-y-4">
            <div className="flex items-center gap-2">
              <Trophy className="size-5" style={{ color }} />
              <h2 className="text-xl font-bold text-white">
                The {items.length} entrants waiting to be ranked
              </h2>
            </div>
            <EntrantGrid items={items} categoryColor={color} />
          </div>
        </section>
      )}

      <section className="border-t border-border/50 px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-4">
          <h2 className="text-xl font-bold text-white">
            How this ranking works
          </h2>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <div
                key={faq.question}
                className="rounded-xl border border-border/50 bg-card p-5"
              >
                <h3 className="font-semibold text-white">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              Other {cat?.name.toLowerCase() ?? ""} rankings
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {related.map((item) => (
                <Link
                  key={`${item.category}/${item.slug}`}
                  href={`/${item.category}/${item.slug}`}
                  className="group flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card px-4 py-3 text-sm transition-colors hover:bg-secondary"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-white">
                      {item.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.itemCount} entrants
                    </span>
                  </span>
                  <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
