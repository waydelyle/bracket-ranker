import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ListChecks, PlusCircle, Trophy } from "lucide-react";
import { StructuredData } from "@/components/seo/StructuredData";
import { absoluteUrl } from "@/lib/site";
import { buildBreadcrumbJsonLd, buildFaqJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Tier List Maker - Bracket-Style Ranking Tool",
  description:
    "Use a bracket-style tier list maker to rank favorites through head-to-head matchups, create custom ranking brackets, and share the final list.",
  alternates: {
    canonical: "/tier-list-maker",
  },
  openGraph: {
    title: "Tier List Maker - Bracket-Style Ranking Tool",
    description:
      "Rank favorites through head-to-head matchups, create custom ranking brackets, and share the final list.",
    url: "/tier-list-maker",
  },
};

const templates = [
  {
    href: "/food/fast-food",
    title: "Fast food tier list",
    detail: "Rank burger, chicken, taco, sandwich, and drive-thru chains.",
  },
  {
    href: "/food/pizza-toppings",
    title: "Pizza toppings tier list",
    detail: "A quick food bracket for classic and controversial toppings.",
  },
  {
    href: "/tv/sitcoms",
    title: "Sitcom tier list",
    detail: "Compare comfort shows, workplace comedies, and modern favorites.",
  },
  {
    href: "/movies/pixar",
    title: "Pixar movie ranking",
    detail: "Rank Toy Story, WALL-E, Finding Nemo, Inside Out, and more.",
  },
  {
    href: "/music/taylor-swift",
    title: "Taylor Swift song ranking",
    detail: "A 64-song bracket across albums and eras.",
  },
  {
    href: "/random/video-games",
    title: "Video game ranking",
    detail: "Build a final list from classic and modern games.",
  },
];

const faqs = [
  {
    question: "Is this a traditional drag-and-drop tier list maker?",
    answer:
      "BracketRanker uses a bracket-style workflow instead of dragging items into S, A, B, and C rows. It is better when you want the final order to come from direct choices.",
  },
  {
    question: "Can I create a custom tier list alternative?",
    answer:
      "Yes. Open the bracket maker, add your own items, and share the finished ranking bracket with friends.",
  },
  {
    question: "What topics work best?",
    answer:
      "The format works well for songs, movies, fast food, teams, players, TV shows, video games, party debates, and any top 10 list where matchups are easier than manual sorting.",
  },
];

export default function TierListMakerPage() {
  const breadcrumbSchema = buildBreadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: "Tier List Maker", path: "/tier-list-maker" },
  ]);
  const faqSchema = buildFaqJsonLd(faqs);
  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "BracketRanker Tier List Maker",
    applicationCategory: "EntertainmentApplication",
    operatingSystem: "Web",
    url: absoluteUrl("/tier-list-maker"),
    description:
      "A bracket-style tier list maker and ranking generator for custom top lists.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <>
      <StructuredData data={[breadcrumbSchema, faqSchema, softwareSchema]} />
      <section className="border-b border-border/50 px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300">
              <ListChecks className="size-4" />
              Bracket-style tier lists
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                Tier List Maker for Head-to-Head Rankings
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Make a cleaner tier list alternative by turning every decision
                into a matchup. Pick winners, let the bracket narrow the field,
                and share the final ranked list.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="glow-gold inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-semibold uppercase tracking-wider text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90"
              >
                <PlusCircle className="size-4" />
                Create Custom Bracket
              </Link>
              <Link
                href="#templates"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-7 text-sm font-semibold uppercase tracking-wider text-foreground transition-all hover:scale-105 hover:bg-secondary"
              >
                Browse Templates
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/20">
                <Trophy className="size-6 text-amber-300" />
              </div>
              <div>
                <h2 className="font-bold text-white">Why brackets work</h2>
                <p className="text-sm text-muted-foreground">
                  Less dragging, more decisive ranking.
                </p>
              </div>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-muted-foreground">
              <li>Compare two options at a time instead of sorting a full list.</li>
              <li>Replay with different bracket sizes for quick or deep rankings.</li>
              <li>Share a final result page that friends can compare against.</li>
              <li>Use ready-made brackets or create a custom ranking generator.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="templates" className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Start with a ranking template
          </h2>
          <p className="mt-2 text-muted-foreground">
            These pages match real search demand and already include playable
            brackets.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Link
              key={template.href}
              href={template.href}
              className="group rounded-xl border border-border/50 bg-card p-5 transition-all hover:-translate-y-1 hover:bg-secondary/50"
            >
              <h3 className="font-bold text-white">{template.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {template.detail}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-amber-300">
                Open bracket
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-border/50 px-4 py-14">
        <div className="mx-auto max-w-4xl space-y-4">
          <h2 className="text-2xl font-bold tracking-tight text-white">
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
      </section>
    </>
  );
}
