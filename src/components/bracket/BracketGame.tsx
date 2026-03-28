"use client";

import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw, Trophy } from "lucide-react";
import type { BracketItem } from "@/data/types";
import { getRoundName } from "@/lib/bracket-engine";
import { useBracket } from "@/hooks/useBracket";
import { Button } from "@/components/ui/button";
import { BracketIntro } from "./BracketIntro";
import { MatchupCard } from "./MatchupCard";
import { ProgressBar } from "./ProgressBar";
import { RoundIndicator } from "./RoundIndicator";
import { UndoButton } from "./UndoButton";

interface BracketGameProps {
  bracketName: string;
  bracketDescription: string;
  items: BracketItem[];
  defaultSize: number;
  categoryColor: string;
  categorySlug: string;
  bracketSlug: string;
}

export function BracketGame({
  bracketName,
  bracketDescription,
  items,
  defaultSize,
  categoryColor,
  categorySlug,
  bracketSlug,
}: BracketGameProps) {
  const { state, startBracket, pickWinner, undo, reset, progress, currentMatchup, canUndo } =
    useBracket();

  const handleStart = useCallback(
    (size: number) => {
      startBracket(items, size);
    },
    [items, startBracket],
  );

  const handlePick = useCallback(
    (winnerId: string) => {
      pickWinner(winnerId);
    },
    [pickWinner],
  );

  // ----- Intro phase -----
  if (state.phase === "intro") {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <BracketIntro
          name={bracketName}
          description={bracketDescription}
          itemCount={items.length}
          defaultSize={defaultSize}
          categoryColor={categoryColor}
          onStart={handleStart}
        />
      </div>
    );
  }

  // ----- Complete phase -----
  if (state.phase === "complete") {
    const champion = state.items.find((i) => i.id === state.champion);

    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto flex max-w-md flex-col items-center gap-6 text-center"
        >
          <div
            className="flex h-20 w-20 items-center justify-center rounded-full shadow-lg"
            style={{ backgroundColor: categoryColor }}
          >
            <Trophy className="size-10 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Champion
            </h2>
            {champion && (
              <p className="text-xl font-bold" style={{ color: categoryColor }}>
                {champion.name}
              </p>
            )}
            {champion?.subtitle && (
              <p className="text-sm text-muted-foreground">
                {champion.subtitle}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Final Ranking
            </h3>
            <ol className="space-y-1 text-sm">
              {state.ranking.slice(0, 8).map((itemId, idx) => {
                const item = state.items.find((i) => i.id === itemId);
                if (!item) return null;
                return (
                  <li
                    key={itemId}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5"
                  >
                    <span className="w-6 text-right font-bold text-muted-foreground">
                      {idx + 1}.
                    </span>
                    <span
                      className={
                        idx === 0 ? "font-bold" : "text-muted-foreground"
                      }
                    >
                      {item.name}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <Button
            variant="outline"
            onClick={reset}
            className="mt-4 gap-2"
          >
            <RotateCcw className="size-4" />
            Play Again
          </Button>
        </motion.div>
      </div>
    );
  }

  // ----- Playing phase -----
  const round = state.rounds[state.currentRound];
  const roundName = round
    ? round.name
    : getRoundName(state.bracketSize, state.currentRound);
  const totalInRound = round ? round.matchups.length : 0;

  return (
    <div className="flex flex-1 flex-col items-center gap-8 px-4 py-8">
      {/* Toolbar */}
      <div className="flex w-full max-w-2xl items-center justify-between">
        <RoundIndicator
          name={roundName}
          matchupNumber={state.currentMatchup + 1}
          totalInRound={totalInRound}
        />
        <UndoButton onClick={undo} disabled={!canUndo} />
      </div>

      {/* Progress */}
      <div className="w-full max-w-2xl">
        <ProgressBar
          current={progress.current}
          total={progress.total}
          percentage={progress.percentage}
          roundName={roundName}
          color={categoryColor}
        />
      </div>

      {/* Matchup */}
      <div className="flex w-full max-w-2xl flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {currentMatchup && (
            <MatchupCard
              key={`${currentMatchup.itemA.id}-${currentMatchup.itemB.id}`}
              itemA={currentMatchup.itemA}
              itemB={currentMatchup.itemB}
              onPick={handlePick}
              roundName={roundName}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
