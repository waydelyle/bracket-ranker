"use client";

import { cn } from "@/lib/utils";
import type { BracketItem } from "@/data/types";

interface ItemCardProps {
  item: BracketItem;
  onClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  categoryColor: string;
}

export function ItemCard({
  item,
  onClick,
  selected,
  disabled,
  categoryColor,
}: ItemCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-2xl shadow-md transition-all duration-200 aspect-[3/4]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        !disabled && "cursor-pointer hover:scale-[1.03]",
        disabled && "cursor-default opacity-50",
        selected && "ring-2 ring-white scale-[1.03]",
      )}
      style={{
        background: `linear-gradient(to bottom, ${categoryColor}cc, ${categoryColor}55)`,
        boxShadow: selected
          ? `0 0 24px 4px ${categoryColor}60`
          : undefined,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !selected) {
          e.currentTarget.style.boxShadow = `0 0 20px 2px ${categoryColor}40`;
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          e.currentTarget.style.boxShadow = "";
        }
      }}
    >
      {/* Item name - the hero element */}
      <div className="flex flex-col items-center gap-2 px-4 text-center">
        <h3
          className="text-xl font-bold leading-tight text-white md:text-2xl"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
        >
          {item.name}
        </h3>
        {item.subtitle && (
          <p className="text-sm text-white/80 line-clamp-2">
            {item.subtitle}
          </p>
        )}
      </div>
    </button>
  );
}
