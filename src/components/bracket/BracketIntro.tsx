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
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
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
        />
      </div>

      {/* Start button */}
      <Button
        onClick={() => onStart(selectedSize)}
        className="h-12 gap-2 rounded-xl px-8 text-base font-bold shadow-lg transition-transform hover:scale-[1.03]"
        style={{ backgroundColor: categoryColor }}
      >
        <Play className="size-5" />
        Start Bracket
      </Button>
    </motion.div>
  );
}
