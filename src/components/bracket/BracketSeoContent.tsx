import Link from "next/link";
import { ArrowRight, ListChecks, PlusCircle } from "lucide-react";
import type { BracketCategory, BracketItem, BracketMeta } from "@/data/types";
import type { BracketSeo } from "@/lib/seo";
import { getCategoryBySlug } from "@/data/categories";

interface BracketSeoContentProps {
  meta: BracketMeta;
  category?: BracketCategory;
  items: BracketItem[];
  seo: BracketSeo;
  related: BracketMeta[];
}

export function BracketSeoContent({
  meta,
  category,
  items,
  seo,
  related,
}: BracketSeoContentProps) {
  const sampleItems = items.slice(0, 10);

  return (
    <section className="border-t border-border/50 bg-background px-4 py-14">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)]">
        <article className="space-y-8">
          <div className="space-y-3">
            <p
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: category?.color ?? "#f59e0b" }}
            >
              {seo.primaryKeyword}
            </p>
            <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              {seo.heading}
            </h2>
            <p className="max-w-3xl text-base leading-7 text-muted-foreground">
              {seo.intro}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <ListChecks
                  className="size-5"
                  style={{ color: category?.color ?? "#f59e0b" }}
                />
                <h3 className="font-bold text-white">What you will rank</h3>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {seo.itemSummary}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {sampleItems.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full border border-border/50 bg-secondary px-3 py-1 text-xs text-muted-foreground"
                  >
                    {item.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card p-5">
              <h3 className="mb-3 font-bold text-white">
                How to get a better ranking
              </h3>
              <ol className="space-y-3 text-sm leading-6 text-muted-foreground">
                {seo.tips.map((tip, index) => (
                  <li key={tip} className="flex gap-3">
                    <span
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{ backgroundColor: category?.color ?? "#f59e0b" }}
                    >
                      {index + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ol>
            </div>
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
            href="/create"
            className="group block rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 transition-colors hover:bg-amber-500/15"
          >
            <div className="mb-3 flex items-center gap-2 text-amber-300">
              <PlusCircle className="size-5" />
              <h3 className="font-bold">Create your own bracket</h3>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Add your own items, share the link, and use BracketRanker as a
              free ranking generator for any topic.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
              Open bracket maker
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <div className="rounded-xl border border-border/50 bg-card p-5">
            <h3 className="font-bold text-white">Related brackets</h3>
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
                        {relatedCategory?.name ?? "Bracket"}
                      </span>
                    </span>
                    <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
