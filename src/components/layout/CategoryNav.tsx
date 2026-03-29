import Link from "next/link";
import { cn } from "@/lib/utils";
import { categories } from "@/data/categories";

const glowClassMap: Record<string, string> = {
  "#ef4444": "glow-red",
  "#8b5cf6": "glow-violet",
  "#6366f1": "glow-indigo",
  "#22c55e": "glow-green",
  "#3b82f6": "glow-blue",
  "#ec4899": "glow-pink",
};

interface CategoryNavProps {
  activeCategory?: string;
}

export function CategoryNav({ activeCategory }: CategoryNavProps) {
  return (
    <nav className="flex gap-1.5 overflow-x-auto scrollbar-none py-1">
      {categories.map((cat) => {
        const isActive = activeCategory === cat.slug;

        return (
          <Link
            key={cat.slug}
            href={`/${cat.slug}`}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              isActive && cn("text-white", glowClassMap[cat.color]),
              !isActive &&
                "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
            style={isActive ? { backgroundColor: cat.color } : undefined}
          >
            <span className="text-base leading-none">{cat.icon}</span>
            <span>{cat.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
