import type { Metadata } from "next";
import { CreatePageClient } from "@/components/create/CreatePageClient";
import { OG_DEFAULTS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Free Bracket Maker - Create a Custom Ranking Bracket",
  description:
    "Use BracketRanker as a free bracket maker and ranking generator. Add custom items, create a shareable bracket, and rank anything head-to-head.",
  alternates: {
    canonical: "/create",
  },
  openGraph: {
    ...OG_DEFAULTS,
    title: "Free Bracket Maker - Create a Custom Ranking Bracket",
    description:
      "Add custom items, create a shareable bracket, and rank anything head-to-head with BracketRanker.",
    url: "/create",
    images: ["/opengraph-image"],
  },
};

export default function CreatePage() {
  return <CreatePageClient />;
}
