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

export function ResultsDisplay({
  ranking,
  items,
  champion,
  categoryColor,
}: ResultsDisplayProps) {
  const itemMap = new Map(items.map((item) => [item.id, item]));

  return (
    <div className="w-full space-y-2">
      {ranking.map((itemId, idx) => {
        const item = itemMap.get(itemId);
        if (!item) return null;

        const isChampion = idx === 0;
        const isTopThree = idx < 3;

        return (
          <div
            key={itemId}
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
                              background: "hsl(var(--secondary))",
                              color: "hsl(var(--muted-foreground))",
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
        );
      })}
    </div>
  );
}
