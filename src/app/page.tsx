import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Swords, Share2 } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedBrackets } from "@/components/home/FeaturedBrackets";
import { StructuredData } from "@/components/seo/StructuredData";
import { buildFaqJsonLd } from "@/lib/seo";
import { OG_DEFAULTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tier Lists & Song Sorters | BracketRanker",
  description:
    "Rank anything head-to-head. 110 tier lists and song sorters for movies, music, TV, food, sports and games - pick a winner in each matchup, crown a champion, and see how everything else placed.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Tier Lists & Song Sorters | BracketRanker",
    description:
      "Rank anything head-to-head. 110 tier lists and song sorters - pick a winner in each matchup and see how everything placed.",
    url: "/",
  },
};

const popularIdeas = [
  {
    href: "/food/fast-food",
    label: "Fast food tier list",
    detail: "Rank chains like McDonald's, Chick-fil-A, In-N-Out, and Taco Bell.",
  },
  {
    href: "/music/taylor-swift",
    label: "Taylor Swift song sorter",
    detail: "Sort 64 tracks across every era into one ranked list.",
  },
  {
    href: "/tv/anime",
    label: "Anime tier list",
    detail: "Attack on Titan, Fullmetal Alchemist, Death Note and 29 more.",
  },
  {
    href: "/movies/marvel",
    label: "Rank Marvel movies",
    detail: "Compare MCU films through a 32-movie bracket.",
  },
  {
    href: "/food/pizza-toppings",
    label: "Pizza toppings tier list",
    detail: "Choose between pepperoni, mushrooms, pineapple, and more.",
  },
  {
    href: "/random/video-games",
    label: "Video game tier list",
    detail: "Build a replayable ranking for classic and modern games.",
  },
];

function PopularRankingIdeas() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-16">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Popular Ranking Ideas
        </h2>
        <p className="mt-2 text-muted-foreground">
          Start with a ready-made bracket or create your own from scratch
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {popularIdeas.map((idea) => (
          <Link
            key={idea.href}
            href={idea.href}
            className="group rounded-xl border border-border/50 bg-card p-5 transition-all hover:-translate-y-1 hover:bg-secondary/50"
          >
            <h3 className="font-bold text-white">{idea.label}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {idea.detail}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Trophy,
      title: "Pick a Bracket",
      description:
        "Choose from 110+ brackets across movies, music, food & more",
    },
    {
      icon: Swords,
      title: "Battle Head-to-Head",
      description:
        "Pick your favorite in each matchup until a champion emerges",
    },
    {
      icon: Share2,
      title: "Share Your Ranking",
      description: "Get your final ranking and share with friends to compare",
    },
  ];

  return (
    <section className="border-t border-border px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            How Bracket Ranking Works
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 text-center"
              >
                <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {idx + 1}
                </div>
                <Icon className="size-8 text-muted-foreground" />
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="max-w-xs text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const homeFaqs = [
  {
    question: "How is this different from a drag-and-drop tier list maker?",
    answer:
      "A drag-and-drop tier list asks you to place everything at once, which means the first layout you sketch usually becomes the final answer. BracketRanker asks one question at a time - this or that - and builds the order out of your answers. For a 32-entrant list that is 31 quick comparisons instead of one hard sorting problem, and the result tends to survive a second look.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. Nothing is saved until you finish a bracket, and even then you just get a shareable result link. There is no sign-up, no email, and no limit on how many times you can play.",
  },
  {
    question: "Can I rank something that is not listed?",
    answer:
      "Yes. The bracket maker lets you add your own entrants, name the bracket and share a link so friends can play the same one. It works for anything from a friend group's favourite restaurants to a full discography.",
  },
  {
    question: "How long does a bracket take?",
    answer:
      "An 8-entrant bracket is 7 picks and takes under a minute. A 32-entrant bracket is 31 picks, around 3 to 5 minutes. The 64-entrant song sorters are 63 picks and take closer to 8 minutes.",
  },
  {
    question: "What happens to my picks?",
    answer:
      "Every matchup feeds the community ranking for that bracket, which is why each bracket has a results page showing win rates and champion counts across all plays. Your individual result page is yours to share; nothing personal is collected.",
  },
];

function HomeFaq() {
  return (
    <section className="border-t border-border px-4 py-16">
      <div className="mx-auto max-w-4xl">
        <h2 className="mb-8 text-center text-2xl font-bold tracking-tight sm:text-3xl">
          Questions about ranking brackets
        </h2>
        <div className="grid gap-3">
          {homeFaqs.map((faq) => (
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
  );
}

export default function HomePage() {
  return (
    <>
      <StructuredData data={buildFaqJsonLd(homeFaqs)} />
      <Hero />
      <CategoryGrid />
      <FeaturedBrackets />
      <PopularRankingIdeas />
      <HowItWorks />
      <HomeFaq />
    </>
  );
}
