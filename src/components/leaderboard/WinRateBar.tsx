"use client";

interface WinRateBarProps {
  percentage: number;
  color: string;
}

export function WinRateBar({ percentage, color }: WinRateBarProps) {
  const clamped = Math.max(0, Math.min(100, percentage));

  return (
    <div className="flex items-center gap-2">
      <div className="relative h-2.5 w-24 overflow-hidden rounded-full bg-muted sm:w-32">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${clamped}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="min-w-[3.25rem] text-right text-sm font-medium tabular-nums text-muted-foreground">
        {clamped.toFixed(1)}%
      </span>
    </div>
  );
}
