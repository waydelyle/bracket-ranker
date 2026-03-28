"use client";

import type React from "react";
import { Trophy } from "lucide-react";
import type { BracketItem } from "@/data/types";
import { cn } from "@/lib/utils";

interface ResultsDisplayProps {
  ranking: string[];
  items: BracketItem[];
  champion: string;
  categoryColor: string;
}

const MEDAL_COLORS: Record<number, string> = {
  0: "#FFD700", // gold
  1: "#C0C0C0", // silver
  2: "#CD7F32", // bronze
};

export function ResultsDisplay({
  ranking,
  items,
  champion,
  categoryColor,
}: ResultsDisplayProps) {
  const itemMap = new Map(items.map((item) => [item.id, item]));

  return (
    <div className="w-full space-y-3">
      {ranking.map((itemId, idx) => {
        const item = itemMap.get(itemId);
        if (!item) return null;

        const isChampion = idx === 0;
        const isTopThree = idx < 3;
        const medalColor = MEDAL_COLORS[idx];

        return (
          <div
            key={itemId}
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
              isChampion
                ? "ring-2 shadow-sm"
                : isTopThree
                  ? "bg-muted/50"
                  : "hover:bg-muted/30"
            )}
            style={
              isChampion
                ? ({
                    backgroundColor: `${categoryColor}10`,
                    borderColor: categoryColor,
                    "--tw-ring-color": categoryColor,
                  } as React.CSSProperties)
                : undefined
            }
          >
            {/* Rank number or trophy */}
            <div className="flex w-8 shrink-0 items-center justify-center">
              {isChampion ? (
                <Trophy
                  className="size-5"
                  style={{ color: categoryColor }}
                />
              ) : (
                <span
                  className={cn(
                    "text-sm font-bold",
                    isTopThree
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                  style={medalColor ? { color: medalColor } : undefined}
                >
                  {idx + 1}
                </span>
              )}
            </div>

            {/* Item info */}
            <div className="min-w-0 flex-1">
              <p
                className={cn(
                  "truncate text-sm",
                  isChampion
                    ? "font-bold"
                    : isTopThree
                      ? "font-semibold"
                      : "font-medium text-muted-foreground"
                )}
                style={isChampion ? { color: categoryColor } : undefined}
              >
                {item.name}
              </p>
              {item.subtitle && (
                <p className="truncate text-xs text-muted-foreground">
                  {item.subtitle}
                </p>
              )}
            </div>

            {/* Medal indicator for top 3 */}
            {isTopThree && (
              <div
                className="flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: medalColor }}
              >
                {idx + 1}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
