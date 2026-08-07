import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import type { BracketMeta } from "@/data/types";
import { Badge } from "@/components/ui/badge";

interface BracketCardProps {
  bracket: BracketMeta;
  categoryColor: string;
  categorySlug: string;
  /** A few entrant images, shown as a preview strip. */
  previews?: { name: string; image: string }[];
}

export function BracketCard({
  bracket,
  categoryColor,
  categorySlug,
  previews = [],
}: BracketCardProps) {
  return (
    <Link
      href={`/${categorySlug}/${bracket.slug}`}
      className="group flex flex-col justify-between gap-4 rounded-xl bg-card p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      style={{ borderLeft: `3px solid ${categoryColor}` }}
    >
      <div className="space-y-3">
        {/* Browse surfaces used to be pure text while every bracket already had
            real artwork, which made the whole catalogue look empty next to a
            visual competitor. */}
        {previews.length > 0 && (
          <div className="flex -space-x-3">
            {previews.map((preview) => (
              <Image
                key={preview.image}
                src={preview.image}
                alt=""
                width={40}
                height={53}
                sizes="40px"
                className="h-[53px] w-10 rounded-md border-2 border-card object-cover"
              />
            ))}
          </div>
        )}

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
      </div>

      <div
        className="flex items-center gap-1.5 text-sm font-medium"
        style={{ color: categoryColor }}
      >
        <Play className="size-3.5" />
        <span>Play</span>
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}
