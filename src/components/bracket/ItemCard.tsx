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
}

export function ItemCard({ item, onClick, selected, disabled }: ItemCardProps) {
  const [imgError, setImgError] = useState(false);

  const showImage = item.image && !imgError;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-xl shadow-md transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        !disabled && "cursor-pointer hover:scale-[1.02] hover:shadow-lg",
        disabled && "cursor-default opacity-60",
        selected &&
          "ring-2 ring-primary ring-offset-2 shadow-lg scale-[1.02]",
      )}
    >
      {/* Image or Placeholder */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {showImage ? (
          <Image
            src={item.image!}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 80vw, 300px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/40">
            <span className="text-4xl font-bold text-primary/70">
              {item.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Gradient overlay for text */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Text overlay */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <h3 className="text-sm font-bold text-white leading-tight md:text-base">
            {item.name}
          </h3>
          {item.subtitle && (
            <p className="mt-0.5 text-xs text-white/80 line-clamp-1">
              {item.subtitle}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}
