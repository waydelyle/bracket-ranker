import Image from "next/image";
import type { CommunityStandings } from "@/lib/community";

interface CommunityBoardProps {
  standings: CommunityStandings;
  categoryColor: string;
  limit?: number;
  showChampionShare?: boolean;
}

/**
 * Aggregate community ranking for a bracket, rendered server-side.
 *
 * Win rate is the honest metric here: an entrant that is drawn into an easy
 * half of the bracket can pick up wins without ever being anyone's favourite,
 * so the champion share is shown alongside it rather than instead of it.
 */
export function CommunityBoard({
  standings,
  categoryColor,
  limit = 10,
  showChampionShare = true,
}: CommunityBoardProps) {
  const rows = standings.entries.slice(0, limit);

  return (
    <ol className="space-y-2">
      {rows.map((entry, index) => (
        <li
          key={entry.id}
          className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3"
        >
          <span
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{
              backgroundColor: index < 3 ? categoryColor : "transparent",
              border: index < 3 ? undefined : "1px solid currentColor",
              color: index < 3 ? "#fff" : undefined,
            }}
          >
            {index + 1}
          </span>

          {entry.image && (
            <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-black">
              <Image
                src={entry.image}
                alt={entry.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {entry.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {entry.wins}W - {entry.losses}L
              {showChampionShare && entry.championCount > 0 && (
                <>
                  {" · "}
                  won {entry.championCount}{" "}
                  {entry.championCount === 1 ? "bracket" : "brackets"}
                </>
              )}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <p
              className="text-sm font-bold tabular-nums"
              style={{ color: categoryColor }}
            >
              {entry.winRate.toFixed(0)}%
            </p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              win rate
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
