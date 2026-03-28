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
    <div className="overflow-hidden rounded-2xl border bg-card shadow-lg">
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{ backgroundColor: categoryColor }}
      >
        <p className="text-xs font-medium uppercase tracking-wider text-white/80">
          {categoryName}
        </p>
        <h3 className="text-lg font-bold text-white">{bracketName}</h3>
      </div>

      {/* Ranking list */}
      <div className="px-6 py-4">
        <div className="space-y-2">
          {displayRanking.map((itemId, idx) => {
            const item = itemMap.get(itemId);
            if (!item) return null;

            const isChampion = idx === 0;

            return (
              <div key={itemId} className="flex items-center gap-2">
                {isChampion ? (
                  <Trophy
                    className="size-4 shrink-0"
                    style={{ color: categoryColor }}
                  />
                ) : (
                  <span className="w-4 shrink-0 text-center text-xs font-bold text-muted-foreground">
                    {idx + 1}
                  </span>
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
          <p className="mt-2 text-xs text-muted-foreground">
            +{ranking.length - 10} more
          </p>
        )}
      </div>

      {/* Footer watermark */}
      <div className="border-t bg-muted/50 px-6 py-2">
        <p className="text-xs font-medium text-muted-foreground">
          BracketRanker.com
        </p>
      </div>
    </div>
  );
}
