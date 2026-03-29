import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-br from-background via-background to-muted">
      {/* Decorative background pattern */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 size-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 py-20 text-center sm:py-28">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Rank Your Favorites
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Pick a category, battle through head-to-head matchups, and share
            your final ranking with friends
          </p>
        </div>

        <Link
          href="#categories"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-primary-foreground shadow-xs hover:bg-primary/90"
        >
          Browse Categories
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
