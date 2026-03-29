"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BracketSizeSelector } from "./BracketSizeSelector";

interface BracketIntroProps {
  name: string;
  description: string;
  itemCount: number;
  defaultSize: number;
  categoryColor: string;
  onStart: (size: number) => void;
}

export function BracketIntro({
  name,
  description,
  itemCount,
  defaultSize,
  categoryColor,
  onStart,
}: BracketIntroProps) {
  const [selectedSize, setSelectedSize] = useState<number>(defaultSize);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
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
            <h1
              className="text-3xl font-extrabold tracking-tight md:text-4xl"
              style={{ color: categoryColor }}
            >
              {name}
            </h1>
            <p className="text-base text-muted-foreground">{description}</p>
          </div>

          {/* Size selector */}
          <div className="w-full">
            <BracketSizeSelector
              itemCount={itemCount}
              onSelect={setSelectedSize}
              defaultSize={defaultSize}
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
            Start Bracket
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
