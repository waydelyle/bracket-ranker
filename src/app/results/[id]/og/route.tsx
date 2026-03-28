import { ImageResponse } from "@vercel/og";
import { getResult } from "@/app/actions/results";
import { getBracketMeta } from "@/data/registry";
import { getCategoryBySlug } from "@/data/categories";
import type { BracketItem, BracketResult } from "@/data/types";

export const runtime = "edge";

async function loadBracketItems(
  category: string,
  slug: string
): Promise<BracketItem[] | null> {
  try {
    const data = await import(`@/data/brackets/${category}/${slug}.json`);
    return data.default.items;
  } catch {
    return null;
  }
}

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
              fontSize: "28px",
            }}
          >
            🏆
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

  const meta = getBracketMeta(result.categorySlug, result.bracketSlug);
  const category = getCategoryBySlug(result.categorySlug);
  const items = await loadBracketItems(
    result.categorySlug,
    result.bracketSlug
  );

  const categoryColor = category?.color ?? "#6366f1";
  const bracketName = meta?.name ?? "Bracket";
  const categoryName = category?.name ?? "";
  const itemMap = new Map(items?.map((i) => [i.id, i]) ?? []);

  // Top 5 ranking
  const top5 = result.ranking.slice(0, 5).map((itemId, idx) => {
    const item = itemMap.get(itemId);
    return { rank: idx + 1, name: item?.name ?? itemId };
  });

  const championName = top5[0]?.name ?? "Champion";

  // Check Vercel Blob for cached image — skip if env vars are not set
  const blobAvailable =
    !!process.env.BLOB_READ_WRITE_TOKEN;
  const cacheKey = `og-result-${id}`;

  if (blobAvailable) {
    try {
      const { list } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: cacheKey, limit: 1 });
      if (blobs.length > 0 && blobs[0].url) {
        return Response.redirect(blobs[0].url, 302);
      }
    } catch {
      // Blob unavailable — generate on the fly
    }
  }

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
                fontSize: "20px",
              }}
            >
              🏆
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
          <span style={{ fontSize: "32px" }}>🏆</span>
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
              key={item.rank}
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

  // Cache to Blob in background if available
  if (blobAvailable) {
    try {
      const { put } = await import("@vercel/blob");
      const buffer = await response.clone().arrayBuffer();
      await put(cacheKey, buffer, {
        access: "public",
        contentType: "image/png",
      });
    } catch {
      // Caching failed — that's fine, we still return the response
    }
  }

  return response;
}
