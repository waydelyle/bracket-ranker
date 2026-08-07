import { ImageResponse } from "next/og";
import { TrophyMark } from "@/components/seo/TrophyMark";
import { categories, getCategoryBySlug } from "@/data/categories";
import { getBracketsByCategory } from "@/data/registry";
import { getCategorySeo } from "@/lib/seo";

export const alt = "BracketRanker category";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

/**
 * Category hub social card.
 *
 * Without one, posting a hub to Discord, Reddit or X unfurls as a bare link —
 * the root card does not cascade into nested segments.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategoryBySlug(category);
  const list = getBracketsByCategory(category);
  const color = cat?.color ?? "#f59e0b";
  const seo = cat ? getCategorySeo(cat, list.length) : null;
  const title = seo?.title ?? "BracketRanker";
  const chips = list.slice(0, 8).map((bracket) => bracket.name);

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
            <span>{list.length} brackets</span>
          </div>

          <p
            style={{
              fontSize: title.length > 30 ? "62px" : "74px",
              fontWeight: 800,
              lineHeight: 1.08,
              margin: "22px 0 0 0",
              maxWidth: "1040px",
            }}
          >
            {title}
          </p>

          <p style={{ fontSize: "28px", color: "#a1a1aa", marginTop: "18px" }}>
            Pick a winner in every matchup. Crown a champion.
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
          <TrophyMark size={30} color="#fbbf24" />
          <span>BracketRanker</span>
        </div>
      </div>
    ),
    size,
  );
}
