"use client";

import { Users } from "lucide-react";

interface CommunityStatsProps {
  championId: string;
  totalPlays: number;
  championCount: number;
}

export function CommunityStats({
  totalPlays,
  championCount,
}: CommunityStatsProps) {
  if (totalPlays === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3">
        <Users className="size-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Be the first to share your ranking!
        </p>
      </div>
    );
  }

  const percentage = Math.round((championCount / totalPlays) * 100);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-3">
      <Users className="size-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{percentage}%</span> of
        people agree with your #1 pick
      </p>
    </div>
  );
}
