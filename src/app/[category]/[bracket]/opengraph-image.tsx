import { ImageResponse } from "next/og";
import { brackets, getBracketMeta } from "@/data/registry";
import { getCategoryBySlug } from "@/data/categories";
import { loadBracketItems } from "@/data/items";
import { getBracketTitle } from "@/lib/seo";

export const alt = "BracketRanker tier list";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return brackets.map((b) => ({ category: b.category, bracket: b.slug }));
}

/**
 * Per-bracket social card.
 *
 * Entrant names are rendered as chips rather than embedding the remote poster
 * images: a good share of the Wikipedia/TMDB URLs in the datasets are SVG-
 * derived or served with content types Satori cannot decode, which made image
 * generation both slow and inconsistent at build time.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ category: string; bracket: string }>;
}) {
  const { category, bracket } = await params;
  const meta = getBracketMeta(category, bracket);
  const cat = getCategoryBySlug(category);
  const items = (await loadBracketItems(category, bracket)) ?? [];
  const color = cat?.color ?? "#f59e0b";
  const title = meta ? getBracketTitle(meta, cat) : "BracketRanker";
  const chips = items.slice(0, 9).map((item) => item.name);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0b0b14",
          backgroundImage: `radial-gradient(circle at 12% 10%, ${color}33, transparent 55%)`,
          color: "white",
          padding: "60px",
          borderTop: `18px solid ${color}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              fontSize: "26px",
              color: "#a1a1aa",
            }}
          >
            <span style={{ fontWeight: 700, color }}>
              {cat?.name ?? "BracketRanker"}
            </span>
            <span>·</span>
            <span>{items.length} entrants</span>
          </div>

          <p
            style={{
              fontSize: title.length > 28 ? "64px" : "76px",
              fontWeight: 800,
              lineHeight: 1.08,
              margin: "22px 0 0 0",
              maxWidth: "1040px",
            }}
          >
            {title}
          </p>

          <p style={{ fontSize: "28px", color: "#a1a1aa", marginTop: "18px" }}>
            Pick a winner in every matchup. Get a full ranking.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            maxHeight: "180px",
            overflow: "hidden",
          }}
        >
          {chips.map((name) => (
            <div
              key={name}
              style={{
                display: "flex",
                fontSize: "24px",
                color: "#d4d4d8",
                border: `1px solid ${color}66`,
                borderRadius: "999px",
                padding: "10px 22px",
              }}
            >
              {name}
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "30px",
            fontWeight: 800,
          }}
        >
          <span>🏆</span>
          <span>BracketRanker</span>
        </div>
      </div>
    ),
    size,
  );
}
