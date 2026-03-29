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
  const fillColor = color || "hsl(var(--primary))";

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-white">{roundName}</span>
        <span className="tabular-nums text-muted-foreground">
          {current} / {total} matchups
        </span>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            backgroundColor: fillColor,
            boxShadow: `0 0 12px 2px ${fillColor}50`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <p className="text-center text-xs font-medium text-white">
        {percentage}% complete
      </p>
    </div>
  );
}
