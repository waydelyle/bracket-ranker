import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ListChecks, PlusCircle, Swords } from "lucide-react";
import { StructuredData } from "@/components/seo/StructuredData";
import {
  TierListMaker,
  type TierListDataset,
} from "@/components/tierlist/TierListMaker";
import { brackets, getBracketMeta } from "@/data/registry";
import { categories, getCategoryBySlug } from "@/data/categories";
import { loadBracketItems } from "@/data/items";
import { absoluteUrl, OG_DEFAULTS } from "@/lib/site";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/seo";

/** The list the tool opens with. Highest-volume template on the site. */
const DEFAULT_CATEGORY = "food";
const DEFAULT_SLUG = "fast-food";

export const metadata: Metadata = {
  title: "Tier List Maker",
  description:
    "Free tier list maker with 110 ready-made templates. Drag or tap entries into S, A, B, C, D and F tiers, add your own, then share a link that reopens the list.",
  alternates: {
    canonical: "/tier-list-maker",
  },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Tier List Maker - 110 Templates, No Sign-Up",
    description:
      "Drag or tap entries into S through F tiers, add your own, and share a link that reopens the exact list. 110 templates across movies, music, TV, food, sports and games.",
    url: "/tier-list-maker",
    images: ["/opengraph-image"],
  },
};

const faqs = [
  {
    question: "How do I make a tier list?",
    answer:
      "Pick a template from the dropdown above — fast food, anime, Marvel movies, Taylor Swift songs and 106 others. Then move each entry into a tier: on a phone, tap the entry and tap the tier row you want it in; with a mouse you can drag it instead. Tap an entry that is already in a tier to send it back to the unranked pool. Nothing is locked in, so you can rearrange until it looks right.",
  },
  {
    question: "What do the S, A, B, C, D and F tiers mean?",
    answer:
      "S is the top tier — better than an A, which is the joke the format started with. From there A is great, B is good, C is fine, D is weak and F is the one you would not defend. The labels are only conventions: you can leave tiers empty, put everything in two rows, or use S and F as a like/dislike split.",
  },
  {
    question: "Can I add my own items to a tier list?",
    answer:
      "Yes. The \"Add your own\" box under the unranked pool lets you add up to 24 entries of your own on top of a template, which covers the usual case of a list that is missing one favourite. Your additions are saved with the rest of the list and travel in the share link.",
  },
  {
    question: "Can I make my own tier list from scratch?",
    answer:
      "Almost — start from the template closest to your topic, hit Reset, and add your own entries; you are then working from an empty grid with only the names you typed. If you want a set that is entirely your own with nothing borrowed, the bracket maker builds one from a blank list and gives you a shareable page for it.",
  },
  {
    question: "Will my tier list still be here if I close the tab?",
    answer:
      "Yes. The list is saved in your browser as you go, per template, so refreshing or coming back tomorrow reopens it exactly where you left it. Nothing is uploaded and there is no account — clearing your browser storage is the only thing that erases it.",
  },
  {
    question: "How do I share a tier list?",
    answer:
      "\"Share link\" copies a URL that contains the whole list, so whoever opens it sees your exact tiers and can rearrange their own copy from there. \"Copy\" instead puts a plain-text version on your clipboard (S: ..., A: ..., B: ...) which is what you want for a Discord message, a Reddit comment or a group chat.",
  },
  {
    question: "Is a tier list better than a ranking bracket?",
    answer:
      "They answer different questions. A tier list is fast and forgiving — good when you mostly want to group things and do not care whether the third-best and fourth-best are in the right order. A bracket forces a winner in every pair, which is what you want when the top of the list is genuinely contested. Every template here exists in both forms, so you can build the tier list and then play the same set as a bracket to check whether your S tier survives.",
  },
  {
    question: "Does it work on a phone?",
    answer:
      "Yes, and it does not rely on dragging. Browser drag-and-drop is unreliable on touchscreens, which is why every action here also works as tap-the-entry then tap-the-tier. The tier rows stay readable at phone width and the tool does not need an app.",
  },
];

export default async function TierListMakerPage() {
  const items = await loadBracketItems(DEFAULT_CATEGORY, DEFAULT_SLUG);
  const defaultMeta = getBracketMeta(DEFAULT_CATEGORY, DEFAULT_SLUG);
  if (!items || !defaultMeta) notFound();

  const datasets: TierListDataset[] = brackets.map((bracket) => ({
    category: bracket.category,
    categoryName: getCategoryBySlug(bracket.category)?.name ?? bracket.category,
    slug: bracket.slug,
    name: bracket.name,
    itemCount: bracket.itemCount,
  }));

  const initialDataset = datasets.find(
    (entry) =>
      entry.category === DEFAULT_CATEGORY && entry.slug === DEFAULT_SLUG,
  )!;

  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tier List Maker", path: "/tier-list-maker" },
  ]);
  const faqSchema = buildFaqJsonLd(faqs);
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "BracketRanker Tier List Maker",
    applicationCategory: "GameApplication",
    browserRequirements: "Requires JavaScript",
    operatingSystem: "Web",
    url: absoluteUrl("/tier-list-maker"),
    description:
      "Free tier list maker with 110 templates. Sort entries into S through F tiers by tapping or dragging, add your own, and share the finished list as a link.",
    isAccessibleForFree: true,
    featureList: [
      `${brackets.length} ready-made tier list templates`,
      "Six tiers (S, A, B, C, D, F)",
      "Tap-to-place, so it works on touchscreens",
      "Add your own entries",
      "Saved in the browser between visits",
      "Shareable link that reopens the exact list",
    ],
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <StructuredData data={[breadcrumbSchema, faqSchema, softwareSchema]} />

      <section className="border-b border-border/50 px-4 pb-6 pt-10 sm:pt-14">
        <div className="mx-auto max-w-6xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300">
            <ListChecks className="size-4" />
            {brackets.length} templates, no sign-up
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Tier List Maker
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            A free online tier list maker that sorts anything into S, A, B, C, D
            and F tiers. Start from one of {brackets.length} ready-made lists
            below, tap or drag each entry into a row, add anything that is
            missing, and copy a link that reopens your exact tier list. It saves
            as you go and works the same on a phone.
          </p>
        </div>
      </section>

      <section id="maker" className="px-4 py-8">
        <div className="mx-auto max-w-6xl">
          <TierListMaker
            datasets={datasets}
            initialDataset={initialDataset}
            initialItems={items}
          />
        </div>
      </section>

      <section className="border-t border-border/50 px-4 py-14">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <article className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                How this tier list maker works
              </h2>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                Six tiers, one pool of unranked entries, and no step that
                requires an account. Pick a template from the dropdown and the
                whole set drops into the unranked row. Move an entry by tapping
                it and then tapping a tier — the tier rows highlight while
                something is selected — or drag it if you are on a desktop.
                Tapping an entry that is already placed sends it back to the
                pool, so nothing is a one-way decision.
              </p>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                Two things make a finished list useful rather than disposable.
                It is stored in your browser per template, so you can leave a
                50-entry list half-done and come back to it. And the share
                button encodes the whole arrangement into the URL, which means
                the person you send it to opens your list rather than an empty
                grid — then rearranges their own copy to argue with you.
              </p>
              <p className="max-w-3xl text-base leading-7 text-muted-foreground">
                One thing this is not: a general-purpose tier maker where you
                upload your own images. Every template comes with the artwork
                already attached, which is the trade — you cannot bring a folder
                of screenshots, but you also do not have to, and there is
                nothing to set up before you start ranking.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                What the tiers usually mean
              </h2>
              <dl className="grid gap-2 sm:grid-cols-2">
                {[
                  ["S", "Best in class. Keep this tier small or it stops meaning anything."],
                  ["A", "Great. Would recommend without a caveat."],
                  ["B", "Good. Solid, just not a favourite."],
                  ["C", "Fine. Neither a recommendation nor a warning."],
                  ["D", "Weak. Would only pick it if the better options were gone."],
                  ["F", "No. The tier you have to justify."],
                ].map(([tier, meaning]) => (
                  <div
                    key={tier}
                    className="flex items-start gap-3 rounded-xl border border-border/50 bg-card p-4"
                  >
                    <dt className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-sm font-black text-white">
                      {tier}
                    </dt>
                    <dd className="text-sm leading-6 text-muted-foreground">
                      {meaning}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                None of this is enforced. A tier list with three empty rows is
                still a tier list, and plenty of the best ones only use S, B and
                F.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                Tips for a tier list you still agree with tomorrow
              </h2>
              <ol className="space-y-3 text-sm leading-6 text-muted-foreground">
                {[
                  "Fill S last. Most people put three things in S in the first ten seconds and then have nowhere to go when they hit something better.",
                  "Use Shuffle before you start. Working through a list in its original order anchors you to whatever happens to be first.",
                  "If two entries keep swapping rows, they belong in the same tier. That is what tiers are for, and it is the main advantage over a strict 1-to-30 ranking.",
                  "When the top of your list genuinely will not settle, play the same set as a bracket. Head-to-head picks break ties that tiers cannot.",
                ].map((tip, index) => (
                  <li key={tip} className="flex gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                      {index + 1}
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">
                Tier list maker FAQ
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
            </div>
          </article>

          <aside className="space-y-4">
            <Link
              href="/create"
              className="group block rounded-xl border border-amber-500/30 bg-amber-500/10 p-5 transition-colors hover:bg-amber-500/15"
            >
              <div className="mb-3 flex items-center gap-2 text-amber-300">
                <PlusCircle className="size-5" />
                <h3 className="font-bold">Start from nothing</h3>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Need a list that is entirely your own — a friend group, a
                league, a discography? Build the set from scratch and share it as
                a playable bracket.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
                Open the bracket maker
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>

            <Link
              href={`/${DEFAULT_CATEGORY}/${DEFAULT_SLUG}`}
              className="group block rounded-xl border border-border/50 bg-card p-5 transition-colors hover:bg-secondary/50"
            >
              <div className="mb-3 flex items-center gap-2 text-white">
                <Swords className="size-5" />
                <h3 className="font-bold">Or settle it head-to-head</h3>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Every template here is also a ranking bracket: two options at a
                time until one is left, plus a community results page showing
                how everyone else ranked the same set.
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-white">
                Play the {defaultMeta.name} bracket
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </aside>
        </div>
      </section>

      <section
        id="templates"
        className="border-t border-border/50 px-4 py-14"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              All {brackets.length} tier list templates
            </h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">
              Every template can be sorted into tiers above or played as a
              head-to-head bracket on its own page, where you also get the
              community ranking for the same set.
            </p>
          </div>

          <div className="space-y-10">
            {categories.map((category) => {
              const inCategory = brackets.filter(
                (bracket) => bracket.category === category.slug,
              );
              return (
                <div key={category.slug} className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <h3 className="text-lg font-bold text-white">
                      <Link
                        href={`/${category.slug}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {category.name} tier lists
                      </Link>
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {inCategory.length} templates
                    </span>
                  </div>
                  <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {inCategory.map((bracket) => (
                      <li key={bracket.slug}>
                        <Link
                          href={`/${bracket.category}/${bracket.slug}`}
                          className="group flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-card px-4 py-3 text-sm transition-colors hover:bg-secondary/60"
                        >
                          <span className="min-w-0">
                            <span className="block truncate font-medium text-white">
                              {bracket.name}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">
                              {bracket.itemCount} entries
                            </span>
                          </span>
                          <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
