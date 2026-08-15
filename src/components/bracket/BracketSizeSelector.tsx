"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Trophy, Users } from "lucide-react";
import { byeCount, fieldSizeOptions } from "@/lib/bracket-engine";

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

  // Only fields this pool can actually play are offered. The pool's own size is
  // one of them even when it is not a power of two — that run gives out
  // first-round byes rather than leaving entrants out of the draw.
  const sizes = fieldSizeOptions(itemCount);

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
        {sizes.map((size) => {
          const isSelected = selected === size;
          const byes = byeCount(size);
          const isFullField = size >= itemCount;

          return (
            <button
              key={size}
              type="button"
              onClick={() => handleSelect(size)}
              // Icon-and-number tiles say nothing about their state to a
              // screen reader; without this the chosen field is invisible.
              aria-pressed={isSelected}
              className={cn(
                "relative flex flex-col items-center gap-1 rounded-xl border-2 p-4 transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "cursor-pointer bg-card",
                !isSelected && "border-border hover:shadow-md",
                isSelected && "shadow-md",
              )}
              style={
                isSelected
                  ? {
                      borderColor: categoryColor,
                      backgroundColor: `${categoryColor}18`,
                      boxShadow: `0 0 16px 2px ${categoryColor}30`,
                    }
                  : undefined
              }
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = `${categoryColor}66`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
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
                {/* The bye count is the one thing about a full field that is
                    not obvious, and it changes how the first round feels. */}
                {isFullField
                  ? byes > 0
                    ? `all — ${byes} on a bye`
                    : "every entrant"
                  : `${size} of ${itemCount}`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
