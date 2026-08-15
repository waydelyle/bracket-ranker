"use client";

import { History, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SavedRunSummary } from "@/hooks/useBracket";

interface ResumeCardProps {
  run: SavedRunSummary;
  categoryColor: string;
  onResume: () => void;
  onDiscard: () => void;
}

/** Coarse "2 hours ago" label — coarse enough not to need a live timer. */
function formatSavedAt(savedAt: number): string {
  const minutes = Math.floor((Date.now() - savedAt) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? "" : "s"} ago`;
}

export function ResumeCard({
  run,
  categoryColor,
  onResume,
  onDiscard,
}: ResumeCardProps) {
  return (
    <section
      aria-labelledby="resume-heading"
      className="w-full rounded-xl border border-border bg-secondary/50 p-4 text-left"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full"
          style={{ backgroundColor: `${categoryColor}26`, color: categoryColor }}
        >
          <History className="size-4" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 id="resume-heading" className="text-sm font-bold text-white">
            Pick up where you left off
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {run.completed} of {run.total} matchups done &middot; {run.roundName}{" "}
            &middot; saved {formatSavedAt(run.savedAt)}
          </p>

          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-background"
            role="progressbar"
            aria-valuenow={run.percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Saved bracket progress"
          >
            <div
              className="h-full rounded-full"
              style={{
                width: `${run.percentage}%`,
                backgroundColor: categoryColor,
              }}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={onResume}
              size="sm"
              className="gap-1.5 font-bold text-white"
              style={{ backgroundColor: categoryColor }}
            >
              <Play className="size-3.5" />
              Resume
            </Button>
            <Button
              onClick={onDiscard}
              size="sm"
              variant="ghost"
              className="gap-1.5 text-muted-foreground"
            >
              <Trash2 className="size-3.5" />
              Start over
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
