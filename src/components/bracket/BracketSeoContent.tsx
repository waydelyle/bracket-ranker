import Link from "next/link";
import { ArrowRight, BarChart3, ListChecks, PlusCircle } from "lucide-react";
import type { BracketCategory, BracketItem, BracketMeta } from "@/data/types";
import type { BracketSeo } from "@/lib/seo";
import type { CommunityStandings } from "@/lib/community";
import { formatPlays } from "@/lib/community";
import { getCategoryBySlug } from "@/data/categories";
import { EntrantGrid } from "./EntrantGrid";
import { CommunityBoard } from "./CommunityBoard";

interface BracketSeoContentProps {
  meta: BracketMeta;
  category?: BracketCategory;
  items: BracketItem[];
  seo: BracketSeo;
  related: BracketMeta[];
  standings: CommunityStandings | null;
}

export function BracketSeoContent({
  meta,
  category,
  items,
  seo,
  related,
  standings,
}: BracketSeoContentProps) {
  const color = category?.color ?? "#f59e0b";
  const resultsHref = `/${meta.category}/${meta.slug}/results`;
  const tierListHref = `/tier-list-maker#d=${meta.category}/${meta.slug}`;

  return (
    <section className="border-t border-border/50 bg-background px-4 py-14">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <article className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              How the {meta.name} bracket works
            </h2>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              {seo.intro}
            </p>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              {seo.method}
            </p>
          </div>

          {/* Round-by-round breakdown — differs with each bracket's size. */}
          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="mb-4 font-bold text-white">
              {seo.picks} picks, {seo.rounds.length} rounds
            </h3>
            <ol className="grid gap-2 sm:grid-cols-2">
              {seo.rounds.map((round, index) => {
                const matchups = Math.pow(2, seo.rounds.length - index - 1);
                return (
                  <li
                    key={round}
                    className="flex items-center justify-between gap-3 rounded-lg bg-secondary/50 px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-white">{round}</span>
                    <span className="text-xs text-muted-foreground">
                      {matchups} {matchups === 1 ? "matchup" : "matchups"}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Roughly {seo.minutes} start to finish.
            </p>
          </div>

          {/* Full roster — the page's main unique content. */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ListChecks className="size-5" style={{ color }} />
              <h3 className="text-xl font-bold text-white">
                All {items.length} entrants
              </h3>
            </div>
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {seo.itemSummary}
            </p>
            <EntrantGrid items={items} categoryColor={color} />
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              Would rather group them than rank them?{" "}
              <Link
                href={tierListHref}
                className="font-semibold underline underline-offset-2"
                style={{ color }}
              >
                Open all {items.length} in the tier list maker
              </Link>{" "}
              and sort them into S, A, B, C, D and F tiers instead — same
              entrants, no matchups.
            </p>
          </div>

          {/* Community aggregate — fresh, unique, and impossible to copy. */}
          {standings && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-5" style={{ color }} />
                <h3 className="text-xl font-bold text-white">
                  How everyone else ranked them
                </h3>
              </div>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Aggregated from {formatPlays(standings.totalPlays)} completed{" "}
                {meta.name} brackets. Win rate is the share of head-to-head
                matchups each entrant has won across every play.
              </p>
              <CommunityBoard standings={standings} categoryColor={color} />
              <Link
                href={resultsHref}
                className="inline-flex items-center gap-1 text-sm font-semibold"
                style={{ color }}
              >
                See the full {meta.name} community ranking
                <ArrowRight className="size-4" />
              </Link>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">
              Getting a ranking you actually agree with
            </h3>
            <ol className="space-y-3 text-sm leading-6 text-muted-foreground">
              {seo.tips.map((tip, index) => (
                <li key={tip} className="flex gap-3">
                  <span
                    className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {index + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">
              {meta.name} bracket FAQ
            </h3>
            <div className="grid gap-3">
              {seo.faqs.map((faq) => (
                <div
                  key={faq.question}
                  className="rounded-xl border border-border/50 bg-card p-5"
                >
                  <h4 className="font-semibold text-white">{faq.question}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <Link
            href={tierListHref}
            className="group block rounded-xl border border-border/50 bg-card p-5 transition-colors hover:bg-secondary/50"
          >
            <div className="mb-3 flex items-center gap-2" style={{ color }}>
              <ListChecks className="size-5" />
              <h3 className="font-bold">Tier list instead?</h3>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              These {items.length} entrants, loaded into the tier list maker.
              Tap or drag them into S through F, add your own, and share a link
              to the finished list.
            </p>
            <span
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color }}
            >
              Open the tier list maker
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            href={resultsHref}
            className="group block rounded-xl border border-border/50 bg-card p-5 transition-colors hover:bg-secondary/50"
          >
            <div className="mb-3 flex items-center gap-2" style={{ color }}>
              <BarChart3 className="size-5" />
              <h3 className="font-bold">Community results</h3>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              {standings
                ? `The full ${meta.name} ranking from ${formatPlays(
                    standings.totalPlays,
                  )} completed brackets, updated as people play.`
                : `See how everyone else ranks these ${items.length} entrants once the votes come in.`}
            </p>
            <span
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color }}
            >
              View community ranking
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            href="/create"
            className="group block rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 transition-colors hover:bg-amber-500/15"
          >
            <div className="mb-3 flex items-center gap-2 text-amber-300">
              <PlusCircle className="size-5" />
              <h3 className="font-bold">Missing something?</h3>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Build your own {meta.name.toLowerCase()} bracket with exactly the
              entrants you want, then share the link.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
              Open the bracket maker
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="font-bold text-white">Related tier lists</h3>
            <div className="mt-4 space-y-2">
              {related.map((bracket) => {
                const relatedCategory = getCategoryBySlug(bracket.category);
                return (
                  <Link
                    key={`${bracket.category}/${bracket.slug}`}
                    href={`/${bracket.category}/${bracket.slug}`}
                    className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium text-white">
                        {bracket.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {relatedCategory?.name ?? "Bracket"} ·{" "}
                        {bracket.itemCount} entrants
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
            <Link
              href={`/${meta.category}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold"
              style={{ color }}
            >
              All {category?.name ?? "category"} tier lists
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
