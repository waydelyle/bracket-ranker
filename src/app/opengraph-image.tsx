import { ImageResponse } from "next/og";
import { TrophyMark } from "@/components/seo/TrophyMark";

export const alt =
  "BracketRanker - rank anything head-to-head with tier list brackets";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Site-wide social card.
 *
 * Every route without its own `opengraph-image` inherits this, which matters
 * because the layout advertises `twitter:card=summary_large_image` — without an
 * image every share rendered as a bare text link.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0b14",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(239,68,68,0.22), transparent 45%), radial-gradient(circle at 80% 25%, rgba(139,92,246,0.22), transparent 45%), radial-gradient(circle at 50% 90%, rgba(245,158,11,0.20), transparent 50%)",
          color: "white",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              backgroundColor: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrophyMark size={40} color="#0b0b14" />
          </div>
          <span style={{ fontSize: "52px", fontWeight: 800 }}>
            BracketRanker
          </span>
        </div>

        <p
          style={{
            fontSize: "60px",
            fontWeight: 800,
            textAlign: "center",
            lineHeight: 1.15,
            margin: 0,
            maxWidth: "960px",
          }}
        >
          Rank anything, one matchup at a time
        </p>

        <p
          style={{
            fontSize: "30px",
            color: "#a1a1aa",
            textAlign: "center",
            marginTop: "28px",
            maxWidth: "860px",
          }}
        >
          110 tier lists and song sorters for movies, music, TV, food, sports
          and games
        </p>
      </div>
    ),
    size,
  );
}
