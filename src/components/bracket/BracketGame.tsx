"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, RotateCcw, Trophy } from "lucide-react";
import type { BracketItem } from "@/data/types";
import { getRoundName } from "@/lib/bracket-engine";
import { useBracket } from "@/hooks/useBracket";
import { saveResult } from "@/app/actions/results";
import { submitVotes } from "@/app/actions/votes";
import { Button } from "@/components/ui/button";
import { ResultsDisplay } from "@/components/results/ResultsDisplay";
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
  const router = useRouter();
  const { state, startBracket, pickWinner, undo, reset, progress, currentMatchup, canUndo } =
    useBracket();

  const [isSaving, setIsSaving] = useState(false);
  const hasSavedRef = useRef(false);

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

  // Save results and navigate when bracket completes
  useEffect(() => {
    if (state.phase !== "complete" || hasSavedRef.current || !state.champion) {
      return;
    }

    hasSavedRef.current = true;
    setIsSaving(true);

    async function save() {
      try {
        const [resultId] = await Promise.all([
          saveResult({
            categorySlug,
            bracketSlug,
            ranking: state.ranking,
            champion: state.champion!,
            matchups: state.matchupHistory,
          }),
          submitVotes(
            categorySlug,
            bracketSlug,
            state.matchupHistory,
            state.champion!
          ),
        ]);

        router.push(`/results/${resultId}`);
      } catch {
        // If saving fails, stay on the page and show the results inline
        setIsSaving(false);
      }
    }

    save();
  }, [state.phase, state.champion, state.ranking, state.matchupHistory, categorySlug, bracketSlug, router]);

  // Reset the save guard when bracket is reset
  useEffect(() => {
    if (state.phase === "intro") {
      hasSavedRef.current = false;
      setIsSaving(false);
    }
  }, [state.phase]);

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
          className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center"
        >
          {/* Saving indicator */}
          {isSaving && (
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2">
              <Loader2 className="size-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                Saving your results...
              </span>
            </div>
          )}

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

          {/* Inline results preview */}
          <div className="w-full text-left">
            <ResultsDisplay
              ranking={state.ranking.slice(0, 8)}
              items={state.items}
              champion={state.champion ?? ""}
              categoryColor={categoryColor}
            />
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
