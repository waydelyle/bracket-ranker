"use client";

import { Trophy } from "lucide-react";
import type { BracketItem } from "@/data/types";

interface ShareCardProps {
  ranking: string[];
  items: BracketItem[];
  bracketName: string;
  categoryName: string;
  categoryColor: string;
}

export function ShareCard({
  ranking,
  items,
  bracketName,
  categoryName,
  categoryColor,
}: ShareCardProps) {
  const itemMap = new Map(items.map((item) => [item.id, item]));
  const displayRanking = ranking.slice(0, 10);

  return (
    <div className="overflow-hidden rounded-2xl bg-card shadow-xl">
      {/* Header bar */}
      <div
        className="px-6 py-4"
        style={{ backgroundColor: categoryColor }}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-white/80">
          {categoryName}
        </p>
        <h3 className="text-lg font-bold text-white">{bracketName}</h3>
      </div>

      {/* Dark ranking list */}
      <div className="bg-card px-6 py-4">
        <div className="space-y-2.5">
          {displayRanking.map((itemId, idx) => {
            const item = itemMap.get(itemId);
            if (!item) return null;

            const isChampion = idx === 0;

            return (
              <div key={itemId} className="flex items-center gap-3">
                {isChampion ? (
                  <Trophy
                    className="size-4 shrink-0"
                    style={{ color: categoryColor }}
                  />
                ) : (
                  <div
                    className="flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={
                      idx === 1
                        ? {
                            background:
                              "linear-gradient(to bottom right, #fbbf24, #d97706)",
                            color: "white",
                          }
                        : idx === 2
                          ? {
                              background:
                                "linear-gradient(to bottom right, #9ca3af, #6b7280)",
                              color: "white",
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
                <span
                  className={
                    isChampion
                      ? "text-sm font-bold"
                      : "text-sm text-muted-foreground"
                  }
                  style={isChampion ? { color: categoryColor } : undefined}
                >
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>

        {ranking.length > 10 && (
          <p className="mt-3 text-xs text-muted-foreground">
            +{ranking.length - 10} more
          </p>
        )}
      </div>

      {/* Footer watermark */}
      <div className="border-t border-border/50 bg-secondary/50 px-6 py-2.5">
        <p className="text-xs font-medium text-muted-foreground">
          BracketRanker.com
        </p>
      </div>
    </div>
  );
}
