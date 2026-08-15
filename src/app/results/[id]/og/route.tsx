import { ImageResponse } from "@vercel/og";
import { TrophyMark } from "@/components/seo/TrophyMark";
import { getResult } from "@/app/actions/results";
import { resolveResultBracket } from "@/lib/result-bracket";
import { bracketStandings } from "@/lib/standings.mjs";
import type { BracketResult, Standing } from "@/data/types";

export const runtime = "edge";

function GenericOGImage() {
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
          backgroundColor: "#09090b",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              backgroundColor: "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrophyMark size={30} color="white" />
          </div>
          <span style={{ fontSize: "48px", fontWeight: 800 }}>
            BracketRanker
          </span>
        </div>
        <p
          style={{
            fontSize: "24px",
            color: "#a1a1aa",
            textAlign: "center",
            maxWidth: "600px",
          }}
        >
          Rank anything with interactive brackets. Share your results!
        </p>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Try to fetch result
  let result: BracketResult | null = null;
  try {
    result = (await getResult(id)) as BracketResult | null;
  } catch {
    // Redis unavailable — fall back to generic image
  }

  if (!result) {
    return GenericOGImage();
  }

  const {
    name: bracketName,
    categoryName,
    categoryColor,
    items,
  } = await resolveResultBracket(result.categorySlug, result.bracketSlug);

  const itemMap = new Map(items?.map((i) => [i.id, i]) ?? []);

  // Top 5, by shared position rather than by row number: a knockout settles
  // the champion and the runner-up, and past that the entrants that got
  // equally far are tied, so two of them can both be third.
  const standings = bracketStandings(
    result.ranking,
    result.matchups,
  ) as Standing[];
  const top5 = standings.slice(0, 5).map((entry) => ({
    key: entry.id,
    rank: entry.position,
    name: itemMap.get(entry.id)?.name ?? entry.id,
  }));

  const championName = top5[0]?.name ?? "Champion";

  const response = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#09090b",
          color: "white",
          padding: "48px 56px",
        }}
      >
        {/* Top bar: branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                backgroundColor: categoryColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrophyMark size={22} color="white" />
            </div>
            <span style={{ fontSize: "24px", fontWeight: 700 }}>
              BracketRanker
            </span>
          </div>
          <span style={{ fontSize: "18px", color: "#a1a1aa" }}>
            {categoryName}
          </span>
        </div>

        {/* Bracket name */}
        <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: "18px", color: "#a1a1aa", marginBottom: "4px" }}>
            My Ranking
          </span>
          <span style={{ fontSize: "36px", fontWeight: 800 }}>
            {bracketName}
          </span>
        </div>

        {/* Champion highlight */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            padding: "20px 24px",
            borderRadius: "16px",
            backgroundColor: `${categoryColor}22`,
            border: `2px solid ${categoryColor}`,
            marginBottom: "24px",
          }}
        >
          <TrophyMark size={34} color={categoryColor} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: "12px",
                color: "#a1a1aa",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Champion
            </span>
            <span
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: categoryColor,
              }}
            >
              {championName}
            </span>
          </div>
        </div>

        {/* Rest of top 5 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: 1,
          }}
        >
          {top5.slice(1).map((item) => (
            <div
              key={item.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 12px",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#71717a",
                  width: "28px",
                  textAlign: "right",
                }}
              >
                {item.rank}
              </span>
              <span style={{ fontSize: "20px", fontWeight: 600, color: "#d4d4d8" }}>
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );

  // Buffer the image and serve the bytes, rather than returning the streamed
  // ImageResponse. Previously this route cloned the response to stash a copy in
  // Vercel Blob; draining the clone left the returned stream empty, so the very
  // first scrape of every share card — the one a crawler makes when the link is
  // pasted — received a 0-byte PNG and rendered no preview at all.
  //
  // A result is immutable once saved, so an immutable cache header lets the CDN
  // hold the image indefinitely. That replaces what the Blob copy was for,
  // without the `list()` round trip that cost every cold request ~0.9s.
  const png = await response.arrayBuffer();

  return new Response(png, {
    headers: {
      "content-type": "image/png",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
