export function JsonLd() {
  // Static structured data - no user input, safe for inline script
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Bracket Ranker",
    applicationCategory: "Entertainment",
    description:
      "Interactive bracket-style ranking tool for movies, music, food, sports and more",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: "https://bracketranker.com",
  };

  return (
    <script
      type="application/ld+json"
      // Safe: schema is a hardcoded constant with no user input
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
