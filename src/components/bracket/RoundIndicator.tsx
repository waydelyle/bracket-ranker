"use client";

import { motion } from "framer-motion";

interface RoundIndicatorProps {
  name: string;
  matchupNumber: number;
  totalInRound: number;
}

export function RoundIndicator({
  name,
  matchupNumber,
  totalInRound,
}: RoundIndicatorProps) {
  return (
    <motion.div
      key={name}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="text-center"
    >
      <h2 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">
        {name}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Matchup {matchupNumber} of {totalInRound}
      </p>
    </motion.div>
  );
}
