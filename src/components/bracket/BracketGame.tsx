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
import { MatchupPreloader } from "./MatchupPreloader";
import { ProgressBar } from "./ProgressBar";
import { RoundIndicator } from "./RoundIndicator";
import { UndoButton } from "./UndoButton";

/** Minimum time the champion reveal stays on screen before navigating. */
const CELEBRATION_MS = 1400;

interface BracketGameProps {
  bracketName: string;
  bracketDescription: string;
  /** Keyword-bearing H1. Falls back to the bracket name. */
  headline?: string;
  /** Supporting line under the H1. Falls back to the description. */
  tagline?: string;
  items: BracketItem[];
  defaultSize: number;
  categoryColor: string;
  categorySlug: string;
  bracketSlug: string;
}

export function BracketGame({
  bracketName,
  bracketDescription,
  headline,
  tagline,
  items,
  defaultSize,
  categoryColor,
  categorySlug,
  bracketSlug,
}: BracketGameProps) {
  const router = useRouter();
  const {
    state,
    startBracket,
    pickWinner,
    undo,
    reset,
    progress,
    currentMatchup,
    nextMatchup,
    canUndo,
    savedRun,
    resumeSavedRun,
    discardSavedRun,
  } = useBracket(`${categorySlug}/${bracketSlug}`, items);

  const [isSaving, setIsSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
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

  const handleReset = useCallback(() => {
    hasSavedRef.current = false;
    setIsSaving(false);
    setSaveFailed(false);
    reset();
  }, [reset]);

  // Save results and navigate when bracket completes
  useEffect(() => {
    if (state.phase !== "complete" || hasSavedRef.current || !state.champion) {
      return;
    }

    hasSavedRef.current = true;

    async function save() {
      setIsSaving(true);

      // Community stats are best-effort and separate from the player's own
      // result. Awaiting them together meant a failed vote write rejected the
      // pair and threw away a share link that had already been created.
      void submitVotes(
        categorySlug,
        bracketSlug,
        state.matchupHistory,
        state.champion!,
      ).catch(() => {});

      try {
        const [resultId] = await Promise.all([
          saveResult({
            categorySlug,
            bracketSlug,
            ranking: state.ranking,
            champion: state.champion!,
            matchups: state.matchupHistory,
          }),
          // The champion reveal is the payoff for 30-odd picks and the moment
          // someone decides whether to share. Saving usually resolves in a few
          // hundred milliseconds, which made it flash past before it registered.
          new Promise((resolve) => setTimeout(resolve, CELEBRATION_MS)),
        ]);

        // No id means there was nowhere to store the result; navigating would
        // land on a 404, so keep the ranking on screen instead.
        if (!resultId) {
          setIsSaving(false);
          setSaveFailed(true);
          return;
        }

        router.push(`/results/${resultId}`);
      } catch {
        // If saving fails, stay on the page and show the results inline
        setIsSaving(false);
        setSaveFailed(true);
      }
    }

    save();
  }, [state.phase, state.champion, state.ranking, state.matchupHistory, categorySlug, bracketSlug, router]);

  // ----- Intro phase -----
  if (state.phase === "intro") {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <BracketIntro
          name={headline ?? bracketName}
          label={headline ? bracketName : undefined}
          description={tagline ?? bracketDescription}
          itemCount={items.length}
          defaultSize={defaultSize}
          categoryColor={categoryColor}
          onStart={handleStart}
          savedRun={savedRun}
          onResume={resumeSavedRun}
          onDiscardSavedRun={discardSavedRun}
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
            <div className="flex items-center gap-2 rounded-lg bg-secondary px-4 py-2">
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Saving your results...
              </span>
            </div>
          )}

          {/* Without this the failure path offered nothing but "Play Again" —
              the full ranking below is still valid and worth keeping. */}
          {saveFailed && (
            <div
              role="status"
              className="rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-muted-foreground"
            >
              We could not save a share link, but your ranking is below.
            </div>
          )}

          {/* Trophy with glow */}
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full"
            style={{
              backgroundColor: categoryColor,
              boxShadow: `0 0 30px 8px ${categoryColor}50`,
            }}
          >
            <Trophy className="size-12 text-white" />
          </div>

          <div className="space-y-2">
            <h2 className="text-4xl font-extrabold tracking-tight text-white">
              Champion
            </h2>
            {champion && (
              <p
                className="text-2xl font-bold"
                style={{ color: categoryColor }}
              >
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
          <div className="w-full rounded-2xl bg-card p-4 text-left">
            {/* The whole ranking and the whole history go in, so the eight
                rows on screen still report the positions the full field
                settled rather than their own row numbers. */}
            <ResultsDisplay
              ranking={state.ranking}
              items={state.items}
              categoryColor={categoryColor}
              matchups={state.matchupHistory}
              limit={8}
            />
          </div>

          <Button
            onClick={handleReset}
            className="mt-4 gap-2 rounded-xl px-6 font-bold text-white"
            style={{
              backgroundColor: categoryColor,
              boxShadow: `0 0 16px 2px ${categoryColor}30`,
            }}
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

      {/* Announces each new pair. Without it a screen reader hears nothing
          after a pick and has to hunt for what changed. */}
      <p aria-live="polite" className="sr-only">
        {currentMatchup
          ? `${roundName}, matchup ${state.currentMatchup + 1} of ${totalInRound}: ${currentMatchup.itemA.name} or ${currentMatchup.itemB.name}?`
          : ""}
      </p>

      {/* Matchup */}
      <div className="relative flex w-full max-w-2xl flex-1 items-center justify-center">
        <AnimatePresence mode="wait">
          {currentMatchup && (
            <MatchupCard
              key={`${currentMatchup.itemA.id}-${currentMatchup.itemB.id}`}
              itemA={currentMatchup.itemA}
              itemB={currentMatchup.itemB}
              onPick={handlePick}
              roundName={roundName}
              categoryColor={categoryColor}
            />
          )}
        </AnimatePresence>
        <MatchupPreloader
          items={[nextMatchup?.itemA, nextMatchup?.itemB]}
        />
      </div>
    </div>
  );
}
