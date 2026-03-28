import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedBrackets } from "@/components/home/FeaturedBrackets";

function HowItWorks() {
  const steps = [
    {
      icon: "\uD83C\uDFAF",
      title: "Pick a bracket",
      description: "Choose from movies, music, food, sports, and more",
    },
    {
      icon: "\u2694\uFE0F",
      title: "Choose your favorites",
      description:
        "Vote head-to-head in elimination-style matchups until a champion emerges",
    },
    {
      icon: "\uD83C\uDFC6",
      title: "Share your ranking",
      description: "See your final ranking and share the results with friends",
    },
  ];

  return (
    <section className="border-t bg-muted/40 px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            How It Works
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3 text-center">
              <span className="text-4xl">{step.icon}</span>
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="max-w-xs text-sm text-muted-foreground">
                {step.description}
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
      <Hero />
      <CategoryGrid />
      <FeaturedBrackets />
      <HowItWorks />
    </>
  );
}
