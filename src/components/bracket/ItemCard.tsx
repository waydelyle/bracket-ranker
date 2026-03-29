"use client";

import { useState } from "react";
import Image from "next/image";
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
  const [imgError, setImgError] = useState(false);
  const hasImage = item.image && !imgError;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex w-full flex-col items-center justify-end overflow-hidden rounded-2xl shadow-md transition-all duration-200 aspect-[3/4]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        !disabled && "cursor-pointer hover:scale-[1.03]",
        disabled && "cursor-default opacity-50",
        selected && "ring-2 ring-white scale-[1.03]",
      )}
      style={{
        background: hasImage ? "#000" : `linear-gradient(135deg, ${categoryColor}dd, ${categoryColor}55)`,
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
      {/* Image */}
      {hasImage && (
        <Image
          src={item.image!}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 45vw, 300px"
          onError={() => setImgError(true)}
        />
      )}

      {/* Gradient overlay for text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: hasImage
            ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 40%, transparent 70%)"
            : "none",
        }}
      />

      {/* Text content */}
      <div className="relative z-10 flex w-full flex-col items-center gap-1 px-4 pb-4 text-center">
        <h3
          className={cn(
            "font-bold leading-tight text-white",
            hasImage ? "text-lg md:text-xl" : "text-xl md:text-2xl",
          )}
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
        >
          {item.name}
        </h3>
        {item.subtitle && (
          <p className="text-sm text-white/70 line-clamp-1">
            {item.subtitle}
          </p>
        )}
      </div>
    </button>
  );
}
