"use client";

import type React from "react";
import { Trophy } from "lucide-react";
import type { BracketItem } from "@/data/types";
import { rankingStages } from "@/lib/bracket-engine";
import { cn } from "@/lib/utils";

interface ResultsDisplayProps {
  ranking: string[];
  items: BracketItem[];
  categoryColor: string;
  /**
   * Bracket size. When given, the list is broken up by how far each entrant
   * got, which is the only ordering a knockout actually establishes.
   */
  bracketSize?: number;
}

// The champion is always `ranking[0]`, so it is derived rather than passed.
export function ResultsDisplay({
  ranking,
  items,
  categoryColor,
  bracketSize,
}: ResultsDisplayProps) {
  const itemMap = new Map(items.map((item) => [item.id, item]));

  // Index -> stage heading to print immediately above that row.
  const headings = new Map<number, string>();
  if (bracketSize && ranking.length === bracketSize) {
    for (const stage of rankingStages(bracketSize)) {
      // The top two speak for themselves; grouping starts where the ordering
      // stops being a real comparison.
      if (stage.count > 1) headings.set(stage.start, stage.label);
    }
  }

  return (
    <div className="w-full space-y-2">
      {ranking.map((itemId, idx) => {
        const item = itemMap.get(itemId);
        if (!item) return null;

        const isChampion = idx === 0;
        const isTopThree = idx < 3;

        const heading = headings.get(idx);

        return (
          <div key={itemId}>
            {heading && (
              <p className="px-1 pb-1.5 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {heading}
              </p>
            )}
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
              isChampion
                ? "ring-2"
                : isTopThree
                  ? "bg-secondary/50"
                  : "hover:bg-secondary/30"
            )}
            style={
              isChampion
                ? ({
                    backgroundColor: `${categoryColor}15`,
                    "--tw-ring-color": categoryColor,
                    boxShadow: `0 0 16px 2px ${categoryColor}25`,
                  } as React.CSSProperties)
                : undefined
            }
          >
            {/* Rank circle or trophy */}
            <div className="flex w-8 shrink-0 items-center justify-center">
              {isChampion ? (
                <Trophy
                  className="size-5"
                  style={{ color: categoryColor }}
                />
              ) : (
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-bold text-white",
                  )}
                  style={
                    idx === 1
                      ? {
                          background:
                            "linear-gradient(to bottom right, #fbbf24, #d97706)",
                        }
                      : idx === 2
                        ? {
                            background:
                              "linear-gradient(to bottom right, #9ca3af, #6b7280)",
                          }
                        : idx === 3
                          ? {
                              background:
                                "linear-gradient(to bottom right, #d97706, #92400e)",
                            }
                          : {
                              background: "var(--secondary)",
                              color: "var(--muted-foreground)",
                            }
                  }
                >
                  {idx + 1}
                </div>
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
                      ? "font-semibold text-white"
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
          </div>
          </div>
        );
      })}
    </div>
  );
}
