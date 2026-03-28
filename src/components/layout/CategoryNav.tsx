import Link from "next/link";
import { cn } from "@/lib/utils";
import { categories } from "@/data/categories";

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
              "hover:bg-muted",
              isActive && "text-white shadow-sm",
              !isActive && "text-muted-foreground hover:text-foreground",
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
