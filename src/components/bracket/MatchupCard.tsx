"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

export function MatchupCard({
  itemA,
  itemB,
  onPick,
  roundName,
  categoryColor,
}: MatchupCardProps) {
  const [picked, setPicked] = useState<string | null>(null);
  const matchupKey = `${itemA.id}-${itemB.id}`;

  const handlePick = useCallback(
    (winnerId: string) => {
      if (picked) return;
      setPicked(winnerId);

      setTimeout(() => {
        onPick(winnerId);
        setPicked(null);
      }, 600);
    },
    [picked, onPick],
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={matchupKey}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30, scale: 0.95 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full"
      >
        {/* Round label */}
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-muted-foreground md:hidden">
          {roundName}
        </p>

        <div
          className="rounded-2xl p-4 md:p-6"
          style={{
            backgroundColor: "hsl(var(--card))",
            border: `1px solid ${categoryColor}33`,
          }}
        >
          <div
            className={cn(
              "flex flex-col items-center gap-4",
              "md:flex-row md:items-stretch md:gap-6",
            )}
          >
            {/* Item A */}
            <motion.div
              initial={{ x: -80, opacity: 0 }}
              animate={
                picked === null
                  ? { x: 0, opacity: 1 }
                  : picked === itemA.id
                    ? { scale: 1.06, opacity: 1, x: 0 }
                    : { opacity: 0, scale: 0.85, x: -50 }
              }
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="w-full max-w-xs md:flex-1 md:max-w-none"
            >
              <ItemCard
                item={itemA}
                onClick={() => handlePick(itemA.id)}
                selected={picked === itemA.id}
                disabled={picked !== null}
                categoryColor={categoryColor}
              />
            </motion.div>

            {/* VS Badge */}
            <div className="relative flex shrink-0 items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  delay: 0.15,
                }}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-full",
                  "bg-gradient-to-br from-amber-500 to-orange-600",
                  "shadow-lg shadow-orange-500/40",
                  "text-xl font-black text-white",
                  "md:h-16 md:w-16 md:text-2xl",
                  "animate-pulse",
                )}
              >
                VS
              </motion.div>
            </div>

            {/* Item B */}
            <motion.div
              initial={{ x: 80, opacity: 0 }}
              animate={
                picked === null
                  ? { x: 0, opacity: 1 }
                  : picked === itemB.id
                    ? { scale: 1.06, opacity: 1, x: 0 }
                    : { opacity: 0, scale: 0.85, x: 50 }
              }
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="w-full max-w-xs md:flex-1 md:max-w-none"
            >
              <ItemCard
                item={itemB}
                onClick={() => handlePick(itemB.id)}
                selected={picked === itemB.id}
                disabled={picked !== null}
                categoryColor={categoryColor}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
