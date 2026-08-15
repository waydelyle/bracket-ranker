"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { maxBracketSize } from "@/lib/bracket-engine";
import type { SavedRunSummary } from "@/hooks/useBracket";
import { BracketSizeSelector } from "./BracketSizeSelector";
import { ResumeCard } from "./ResumeCard";

interface BracketIntroProps {
  name: string;
  /** Optional eyebrow showing the underlying bracket name. */
  label?: string;
  description: string;
  itemCount: number;
  defaultSize: number;
  categoryColor: string;
  onStart: (size: number) => void;
  /** An unfinished run on this bracket, offered before a fresh one. */
  savedRun?: SavedRunSummary | null;
  onResume?: () => void;
  onDiscardSavedRun?: () => void;
}

export function BracketIntro({
  name,
  label,
  description,
  itemCount,
  defaultSize,
  categoryColor,
  onStart,
  savedRun,
  onResume,
  onDiscardSavedRun,
}: BracketIntroProps) {
  // A bracket larger than the item pool can never be completed, so the
  // preselected size is clamped to what these items can actually fill.
  const playableDefault = Math.min(defaultSize, maxBracketSize(itemCount));
  const [selectedSize, setSelectedSize] = useState<number>(playableDefault);

  return (
    // No entrance animation: this card is the first thing on a bracket page, so
    // fading it in from `opacity: 0` shipped an invisible LCP element in the
    // server HTML and pushed Largest Contentful Paint out by the full duration.
    <motion.div
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto flex max-w-lg flex-col items-center gap-8 text-center"
    >
      {/* Dark card container with category accent bar */}
      <div
        className="w-full overflow-hidden rounded-2xl bg-card shadow-lg"
        style={{
          borderTop: `4px solid ${categoryColor}`,
        }}
      >
        <div className="flex flex-col items-center gap-6 px-6 py-8">
          {/* Header */}
          <div className="space-y-3">
            {label && (
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: categoryColor }}
              >
                {label}
              </p>
            )}
            <h1
              className="text-3xl font-extrabold tracking-tight md:text-4xl"
              style={{ color: categoryColor }}
            >
              {name}
            </h1>
            <p className="text-base text-muted-foreground">{description}</p>
          </div>

          {/* An unfinished run on this bracket */}
          {savedRun && onResume && onDiscardSavedRun && (
            <ResumeCard
              run={savedRun}
              categoryColor={categoryColor}
              onResume={onResume}
              onDiscard={onDiscardSavedRun}
            />
          )}

          {/* Size selector */}
          <div className="w-full">
            <BracketSizeSelector
              itemCount={itemCount}
              onSelect={setSelectedSize}
              defaultSize={playableDefault}
              categoryColor={categoryColor}
            />
          </div>

          {/* Start button */}
          <Button
            onClick={() => onStart(selectedSize)}
            className="h-12 gap-2 rounded-xl px-8 text-base font-bold text-white shadow-lg transition-transform hover:scale-[1.03]"
            style={{
              backgroundColor: categoryColor,
              boxShadow: `0 0 20px 2px ${categoryColor}40`,
            }}
          >
            <Play className="size-5" />
            {savedRun ? "Start a new bracket" : "Start Bracket"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
