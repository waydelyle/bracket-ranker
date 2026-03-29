"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Users } from "lucide-react";

const BRACKET_SIZES = [8, 16, 32, 64] as const;

interface BracketSizeSelectorProps {
  itemCount: number;
  onSelect: (size: number) => void;
  defaultSize: number;
  categoryColor: string;
}

export function BracketSizeSelector({
  itemCount,
  onSelect,
  defaultSize,
  categoryColor,
}: BracketSizeSelectorProps) {
  const [selected, setSelected] = useState<number>(defaultSize);

  const handleSelect = (size: number) => {
    setSelected(size);
    onSelect(size);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="size-4" />
        <span>{itemCount} items available</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {BRACKET_SIZES.map((size) => {
          const available = itemCount >= size;
          const isSelected = selected === size;

          return (
            <button
              key={size}
              type="button"
              onClick={() => available && handleSelect(size)}
              disabled={!available}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "bg-card",
                available &&
                  !isSelected &&
                  "border-border hover:shadow-md cursor-pointer",
                isSelected && "shadow-md cursor-pointer",
                !available &&
                  "cursor-not-allowed border-border/50 opacity-50",
              )}
              style={
                isSelected
                  ? {
                      borderColor: categoryColor,
                      backgroundColor: `${categoryColor}18`,
                      boxShadow: `0 0 16px 2px ${categoryColor}30`,
                    }
                  : available
                    ? {
                        borderColor: undefined,
                      }
                    : undefined
              }
              onMouseEnter={(e) => {
                if (available && !isSelected) {
                  e.currentTarget.style.borderColor = `${categoryColor}66`;
                }
              }}
              onMouseLeave={(e) => {
                if (available && !isSelected) {
                  e.currentTarget.style.borderColor = "";
                }
              }}
            >
              <Trophy
                className="size-5"
                style={{
                  color: isSelected ? categoryColor : undefined,
                }}
              />
              <span
                className="text-lg font-bold"
                style={{
                  color: isSelected ? categoryColor : undefined,
                }}
              >
                {size}
              </span>
              <span className="text-xs text-muted-foreground">
                {available ? `${size} of ${itemCount}` : `Need ${size}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
