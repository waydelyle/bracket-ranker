"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  percentage: number;
  roundName: string;
  color?: string;
}

export function ProgressBar({
  current,
  total,
  percentage,
  roundName,
  color,
}: ProgressBarProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-foreground">{roundName}</span>
        <span className="tabular-nums text-muted-foreground">
          {current} / {total} matchups
        </span>
      </div>

      <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color || "hsl(var(--primary))" }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {percentage}% complete
      </p>
    </div>
  );
}
