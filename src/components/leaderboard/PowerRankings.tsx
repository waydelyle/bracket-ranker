"use client";

import { Trophy, Medal, Award } from "lucide-react";
import { WinRateBar } from "./WinRateBar";

export interface LeaderboardItem {
  id: string;
  name: string;
  wins: number;
  losses: number;
  winRate: number;
  championCount: number;
  totalMatchups: number;
}

interface PowerRankingsProps {
  items: LeaderboardItem[];
  categoryColor: string;
}

function RankBadge({ rank, color }: { rank: number; color: string }) {
  if (rank === 1) {
    return (
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: color }}
      >
        <Trophy className="size-4 text-white" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted-foreground/20">
        <Medal className="size-4 text-muted-foreground" />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted-foreground/10">
        <Award className="size-4 text-muted-foreground" />
      </div>
    );
  }
  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <span className="text-sm font-medium text-muted-foreground">{rank}</span>
    </div>
  );
}

export function PowerRankings({ items, categoryColor }: PowerRankingsProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Trophy className="size-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          No ranking data yet. Play some brackets to see items appear here!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Table header */}
      <div className="mb-1 grid grid-cols-[3rem_1fr_12rem_5rem_5rem] items-center gap-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground max-sm:hidden">
        <span>Rank</span>
        <span>Item</span>
        <span>Win Rate</span>
        <span className="text-right">Matchups</span>
        <span className="text-right">Champ</span>
      </div>

      {/* Rows */}
      <div className="flex flex-col gap-1">
        {items.map((item, index) => {
          const rank = index + 1;
          const isTop3 = rank <= 3;

          return (
            <div
              key={item.id}
              className={`grid grid-cols-[3rem_1fr_auto] items-center gap-2 rounded-lg px-3 py-2.5 transition-colors sm:grid-cols-[3rem_1fr_12rem_5rem_5rem] ${
                isTop3
                  ? "bg-muted/60 ring-1 ring-foreground/5"
                  : "hover:bg-muted/40"
              }`}
            >
              {/* Rank */}
              <div className="flex items-center justify-center">
                <RankBadge rank={rank} color={categoryColor} />
              </div>

              {/* Name */}
              <div className="min-w-0">
                <p
                  className={`truncate font-medium ${
                    isTop3 ? "text-base" : "text-sm"
                  }`}
                >
                  {item.name}
                </p>
                {/* Mobile-only stats */}
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground sm:hidden">
                  <span>
                    {item.totalMatchups} matchup
                    {item.totalMatchups !== 1 ? "s" : ""}
                  </span>
                  {item.championCount > 0 && (
                    <span className="flex items-center gap-0.5">
                      <Trophy className="size-3" />
                      {item.championCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Win Rate - on mobile, this is in the 3rd column */}
              <div className="flex justify-end sm:justify-start">
                <WinRateBar
                  percentage={item.winRate}
                  color={categoryColor}
                />
              </div>

              {/* Matchups (hidden on mobile) */}
              <span className="hidden text-right text-sm tabular-nums text-muted-foreground sm:block">
                {item.totalMatchups}
              </span>

              {/* Champion count (hidden on mobile) */}
              <span className="hidden text-right text-sm tabular-nums text-muted-foreground sm:block">
                {item.championCount > 0 ? (
                  <span className="inline-flex items-center gap-1">
                    <Trophy className="size-3" style={{ color: categoryColor }} />
                    {item.championCount}
                  </span>
                ) : (
                  <span className="text-muted-foreground/50">--</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
