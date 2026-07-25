import Image from "next/image";
import type { BracketItem } from "@/data/types";

interface EntrantGridProps {
  items: BracketItem[];
  categoryColor: string;
}

/**
 * Server-rendered grid of every entrant in a bracket.
 *
 * This is the page's main unique content: the full roster with artwork, rather
 * than a handful of names in a sentence. It also means the entrants are in the
 * HTML for crawlers, which was not the case when they only appeared inside the
 * client-side matchup view.
 */
export function EntrantGrid({ items, categoryColor }: EntrantGridProps) {
  return (
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-2.5"
        >
          <div
            className="relative size-14 shrink-0 overflow-hidden rounded-lg"
            style={{
              background: item.image
                ? "#000"
                : `linear-gradient(135deg, ${categoryColor}dd, ${categoryColor}55)`,
            }}
          >
            {item.image && (
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="56px"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {item.name}
            </p>
            {item.subtitle && (
              <p className="truncate text-xs text-muted-foreground">
                {item.subtitle}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
