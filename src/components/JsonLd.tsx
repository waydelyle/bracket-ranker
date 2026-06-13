import { buildSiteJsonLd } from "@/lib/seo";

export function JsonLd() {
  const schema = buildSiteJsonLd();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
