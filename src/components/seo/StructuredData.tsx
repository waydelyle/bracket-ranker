import { serializeStructuredDataEntries } from "@/lib/serialization.mjs";

interface StructuredDataProps {
  data: unknown;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <>
      {serializeStructuredDataEntries(data).map((serialized, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serialized }}
        />
      ))}
    </>
  );
}
