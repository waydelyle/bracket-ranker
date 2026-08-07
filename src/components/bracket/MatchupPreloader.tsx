"use client";

import Image from "next/image";
import type { BracketItem } from "@/data/types";

/**
 * Warms the browser cache with the next matchup's artwork.
 *
 * Matchup images are large and only mount when their pair becomes current, so
 * without this every pick is followed by a visible pop-in. The images are
 * requested at the same `sizes` the real cards use, so the candidate the
 * browser picks here is the one it reuses a moment later.
 */
export function MatchupPreloader({
  items,
}: {
  items: (BracketItem | undefined)[];
}) {
  const sources = items
    .map((item) => item?.image)
    .filter((src): src is string => Boolean(src));

  if (sources.length === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute size-px overflow-hidden opacity-0"
    >
      {sources.map((src) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="(max-width: 768px) 45vw, 300px"
          priority
        />
      ))}
    </div>
  );
}
