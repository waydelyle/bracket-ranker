import Link from "next/link";
import { Play } from "lucide-react";
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
        "group flex flex-col justify-between gap-4 rounded-xl border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
      )}
      style={{
        borderColor: `${categoryColor}20`,
      }}
    >
      <div className="space-y-2">
        <h3 className="font-semibold leading-snug">{bracket.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {bracket.description}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {bracket.itemCount} items
          </Badge>
          <Badge
            variant="secondary"
            className="text-xs"
            style={{
              backgroundColor: `${categoryColor}15`,
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
        Play
      </div>
    </Link>
  );
}
