"use client";

import type React from "react";
import { Trophy } from "lucide-react";
import type { BracketItem, Matchup, Standing } from "@/data/types";
import { getRoundName } from "@/lib/bracket-engine";
import {
  bracketStandings,
  formatPosition,
  groupStandings,
  sharedExitRound,
} from "@/lib/standings.mjs";
import { cn } from "@/lib/utils";

interface ResultsDisplayProps {
  ranking: string[];
  items: BracketItem[];
  categoryColor: string;
  /**
   * The matchups that were played. Given them, positions are worked out from
   * what each entrant actually won rather than from where the draw put it.
   */
  matchups?: Matchup[];
  /** Show only this many entrants. Positions are still worked out from all. */
  limit?: number;
}

// The champion is always `ranking[0]`, so it is derived rather than passed.
export function ResultsDisplay({
  ranking,
  items,
  categoryColor,
  matchups,
  limit,
}: ResultsDisplayProps) {
  const itemMap = new Map(items.map((item) => [item.id, item]));

  // Worked out over the whole field, so a truncated list still reports the
  // right positions for the entrants it does show.
  const standings = bracketStandings(ranking, matchups) as Standing[];
  const groups = (groupStandings(standings) as Standing[][]).filter(
    (group) => group.length > 0,
  );
  const anyTied = groups.some((group) => group.length > 1);

  // Trim to `limit` up front rather than while rendering, so each group still
  // knows its real size and can report the position honestly.
  let room = limit ?? standings.length;
  const visibleGroups: { group: Standing[]; visible: Standing[] }[] = [];
  for (const group of groups) {
    if (room <= 0) break;
    // An entrant the pool no longer has renders nothing, so a group left with
    // no rows must not print its heading over the next group's entrants.
    const visible = group
      .slice(0, room)
      .filter((entry) => itemMap.has(entry.id));
    room -= Math.min(group.length, room);
    if (visible.length > 0) visibleGroups.push({ group, visible });
  }

  return (
    <div className="w-full space-y-2">
      {anyTied && (
        <p className="px-1 pb-1 text-xs text-muted-foreground">
          A knockout only compares entrants that met. Below the runner-up,
          everyone that got equally far shares a position.
        </p>
      )}

      {visibleGroups.map(({ group, visible }) => {
        const [first] = group;

        // Named after a round only when every entrant in the group really did
        // go out in it; byes make that untrue often enough to check.
        const exitRound = sharedExitRound(group) as number | null;
        const roundName =
          exitRound === null
            ? null
            : getRoundName(standings.length, exitRound);

        const heading =
          group.length > 1
            ? [
                formatPosition(first.position, first.count),
                roundName ? `out in the ${roundName}` : null,
                first.wins === 1 ? "1 win" : `${first.wins} wins`,
              ]
                .filter(Boolean)
                .join(" · ")
            : null;

        return (
          <div key={first.position} className="space-y-2">
            {heading && (
              <p className="px-1 pb-0.5 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {heading}
              </p>
            )}

            {visible.map((entry) => {
              const item = itemMap.get(entry.id);
              if (!item) return null;

              const isChampion = entry.position === 1;
              // Only a position the bracket actually settled gets a medal. In
              // a knockout that is the champion and the runner-up; third is a
              // coin toss between two entrants that never played each other.
              const medal =
                !entry.tied && entry.position <= 3 ? entry.position : 0;

              return (
                <div
                  key={entry.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 transition-colors",
                    isChampion
                      ? "ring-2"
                      : medal > 0
                        ? "bg-secondary/50"
                        : "hover:bg-secondary/30",
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
                  {/* Position, shared with everyone else on the same record */}
                  <div className="flex w-8 shrink-0 items-center justify-center">
                    {isChampion ? (
                      <Trophy
                        className="size-5"
                        style={{ color: categoryColor }}
                      />
                    ) : (
                      <div
                        className="flex size-7 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={
                          medal === 2
                            ? {
                                background:
                                  "linear-gradient(to bottom right, #fbbf24, #d97706)",
                              }
                            : medal === 3
                              ? {
                                  background:
                                    "linear-gradient(to bottom right, #9ca3af, #6b7280)",
                                }
                              : {
                                  background: "var(--secondary)",
                                  color: "var(--muted-foreground)",
                                }
                        }
                        title={
                          entry.tied
                            ? `Joint ${formatPosition(entry.position, entry.count)}`
                            : undefined
                        }
                      >
                        {entry.position}
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
                          : medal > 0
                            ? "font-semibold text-white"
                            : "font-medium text-muted-foreground",
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
      })}
    </div>
  );
}
