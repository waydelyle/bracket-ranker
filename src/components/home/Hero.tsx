import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-background">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -right-32 size-[500px] rounded-full bg-[#ef4444]/15 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 size-[500px] rounded-full bg-[#8b5cf6]/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 size-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      {/* Dot grid pattern overlay */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Floating category emoji badges */}
      <div className="absolute inset-0 -z-10 hidden md:block" aria-hidden>
        <span className="absolute top-16 left-[12%] text-3xl opacity-40 animate-bounce [animation-duration:3s]">
          🎬
        </span>
        <span className="absolute top-24 right-[14%] text-3xl opacity-40 animate-bounce [animation-duration:3.5s] [animation-delay:0.5s]">
          🎵
        </span>
        <span className="absolute bottom-20 left-[18%] text-3xl opacity-40 animate-bounce [animation-duration:4s] [animation-delay:1s]">
          🍔
        </span>
        <span className="absolute bottom-16 right-[10%] text-3xl opacity-40 animate-bounce [animation-duration:3.2s] [animation-delay:0.3s]">
          🏆
        </span>
        <span className="absolute top-1/2 left-[6%] text-2xl opacity-30 animate-bounce [animation-duration:3.8s] [animation-delay:0.7s]">
          📺
        </span>
        <span className="absolute top-1/3 right-[6%] text-2xl opacity-30 animate-bounce [animation-duration:4.2s] [animation-delay:1.2s]">
          🎲
        </span>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-24 text-center sm:py-32">
        <div className="space-y-6">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
              Rank Your Favorites
            </span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Pick a category, battle through head-to-head matchups, and share
            your final ranking with friends
          </p>
        </div>

        <Link
          href="#categories"
          className="glow-gold inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-base font-semibold uppercase tracking-wider text-primary-foreground shadow-lg transition-all hover:scale-105 hover:bg-primary/90"
        >
          Browse Categories
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
