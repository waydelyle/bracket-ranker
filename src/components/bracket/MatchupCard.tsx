"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { BracketItem } from "@/data/types";
import { ItemCard } from "./ItemCard";

interface MatchupCardProps {
  itemA: BracketItem;
  itemB: BracketItem;
  onPick: (winnerId: string) => void;
  roundName: string;
  categoryColor: string;
}

/**
 * How long the winner stays highlighted before the next pair loads.
 *
 * This is paid once per pick, so it dominates how long a bracket takes: a
 * 64-entrant sorter is 63 picks, and every extra 100ms here adds six seconds
 * of pure waiting to the run.
 */
const PICK_SETTLE_MS = 260;

export function MatchupCard({
  itemA,
  itemB,
  onPick,
  roundName,
  categoryColor,
}: MatchupCardProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const matchupKey = `${itemA.id}-${itemB.id}`;

  const handlePick = useCallback(
    (winnerId: string) => {
      if (picked) return;
      setPicked(winnerId);

      setTimeout(
        () => {
          onPick(winnerId);
          setPicked(null);
        },
        reduceMotion ? 0 : PICK_SETTLE_MS,
      );
    },
    [picked, onPick, reduceMotion],
  );

  // Arrow keys pick the left or right entrant. A 63-pick sorter is far quicker
  // on a keyboard than it is by mouse, and this is also the only way to play
  // without a pointer.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === "ArrowLeft" || event.key === "1") {
        event.preventDefault();
        handlePick(itemA.id);
      } else if (event.key === "ArrowRight" || event.key === "2") {
        event.preventDefault();
        handlePick(itemB.id);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handlePick, itemA.id, itemB.id]);

  const duration = reduceMotion ? 0 : 0.28;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={matchupKey}
        initial={reduceMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduceMotion ? undefined : { opacity: 0, y: -20, scale: 0.97 }}
        transition={{ duration, ease: "easeOut" }}
        className="w-full"
      >
        {/* Round label */}
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground md:hidden">
          {roundName}
        </p>

        <div
          className="rounded-2xl bg-card p-4 md:p-6"
          style={{ border: `1px solid ${categoryColor}33` }}
        >
          {/* Both entrants stay side by side at every width. Stacking them put
              the second option below the fold on a phone, which forced a scroll
              before every single pick. */}
          <div className="relative grid grid-cols-2 items-stretch gap-3 md:gap-6">
            {/* Item A */}
            <motion.div
              animate={
                picked === null
                  ? { x: 0, opacity: 1, scale: 1 }
                  : picked === itemA.id
                    ? { scale: 1.04, opacity: 1, x: 0 }
                    : { opacity: 0, scale: 0.85, x: reduceMotion ? 0 : -30 }
              }
              transition={{ duration, ease: "easeOut" }}
            >
              <ItemCard
                item={itemA}
                onClick={() => handlePick(itemA.id)}
                selected={picked === itemA.id}
                disabled={picked !== null}
                categoryColor={categoryColor}
              />
            </motion.div>

            {/* Item B */}
            <motion.div
              animate={
                picked === null
                  ? { x: 0, opacity: 1, scale: 1 }
                  : picked === itemB.id
                    ? { scale: 1.04, opacity: 1, x: 0 }
                    : { opacity: 0, scale: 0.85, x: reduceMotion ? 0 : 30 }
              }
              transition={{ duration, ease: "easeOut" }}
            >
              <ItemCard
                item={itemB}
                onClick={() => handlePick(itemB.id)}
                selected={picked === itemB.id}
                disabled={picked !== null}
                categoryColor={categoryColor}
              />
            </motion.div>

            {/* VS badge, centred over the gap so it costs no vertical space */}
            <div
              aria-hidden
              className={cn(
                "pointer-events-none absolute left-1/2 top-1/2 z-20",
                "-translate-x-1/2 -translate-y-1/2",
                "flex size-11 items-center justify-center rounded-full",
                "bg-gradient-to-br from-amber-500 to-orange-600",
                "ring-4 ring-card",
                "text-sm font-black text-white",
                "md:size-14 md:text-xl",
              )}
            >
              VS
            </div>
          </div>
        </div>

        <p className="mt-3 hidden text-center text-xs text-muted-foreground md:block">
          Tip: use{" "}
          <kbd className="rounded border border-border px-1 font-mono">←</kbd>{" "}
          and{" "}
          <kbd className="rounded border border-border px-1 font-mono">→</kbd>{" "}
          to pick
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
