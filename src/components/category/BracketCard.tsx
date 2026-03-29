"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import type { BracketMeta } from "@/data/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BracketCardProps {
  bracket: BracketMeta;
  categoryColor: string;
  categorySlug: string;
}

export function BracketCard({
  bracket,
  categoryColor,
  categorySlug,
}: BracketCardProps) {
  return (
    <Link
      href={`/${categorySlug}/${bracket.slug}`}
      className={cn(
        "group flex flex-col justify-between gap-4 rounded-xl bg-card p-5 transition-all duration-200 hover:-translate-y-1",
      )}
      style={{
        borderLeft: `3px solid ${categoryColor}`,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px -4px ${categoryColor}30`;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "";
      }}
    >
      <div className="space-y-2">
        <h3 className="font-bold leading-snug text-white">{bracket.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {bracket.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-border/50 bg-secondary text-xs"
          >
            {bracket.itemCount} items
          </Badge>
          <Badge
            className="text-xs"
            style={{
              backgroundColor: `${categoryColor}20`,
              color: categoryColor,
            }}
          >
            {bracket.defaultSize}-item bracket
          </Badge>
        </div>
      </div>

      <div
        className="flex items-center gap-1.5 text-sm font-medium transition-colors"
        style={{ color: categoryColor }}
      >
        <Play className="size-3.5" />
        <span>Play</span>
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
