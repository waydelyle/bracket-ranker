import type { Metadata } from "next";
import Link from "next/link";
import { Trophy, Swords, Share2 } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedBrackets } from "@/components/home/FeaturedBrackets";

export const metadata: Metadata = {
  title: "Free Bracket Maker and Ranking Generator",
  description:
    "Create bracket-style rankings and tier list alternatives for movies, songs, food, sports, TV, games, and custom top 10 lists.",
  alternates: {
    canonical: "/",
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
    label: "Rank Taylor Swift songs",
    detail: "Build an Eras-spanning song ranking from 64 tracks.",
  },
  {
    href: "/movies/marvel",
    label: "Rank Marvel movies",
    detail: "Compare MCU films through a 32-movie bracket.",
  },
  {
    href: "/movies/pixar",
    label: "Rank Pixar movies",
    detail: "Settle the Toy Story, Nemo, WALL-E, and Inside Out debates.",
  },
  {
    href: "/food/pizza-toppings",
    label: "Pizza toppings tier list",
    detail: "Choose between pepperoni, mushrooms, pineapple, and more.",
  },
  {
    href: "/random/video-games",
    label: "Rank video games",
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

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedBrackets />
      <PopularRankingIdeas />
      <HowItWorks />
    </>
  );
}
