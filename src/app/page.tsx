import { Trophy, Swords, Share2 } from "lucide-react";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedBrackets } from "@/components/home/FeaturedBrackets";

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
            How It Works
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
      <HowItWorks />
    </>
  );
}
