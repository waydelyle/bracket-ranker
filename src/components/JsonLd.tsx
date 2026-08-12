import { buildSiteJsonLd } from "@/lib/seo";
import { StructuredData } from "@/components/seo/StructuredData";

export function JsonLd() {
  const schema = buildSiteJsonLd();

  return <StructuredData data={schema} />;
}
