import type { Metadata } from "next";
import { CreatePageClient } from "@/components/create/CreatePageClient";

export const metadata: Metadata = {
  title: "Free Bracket Maker - Create a Custom Ranking Bracket",
  description:
    "Use BracketRanker as a free bracket maker and ranking generator. Add custom items, create a shareable bracket, and rank anything head-to-head.",
  alternates: {
    canonical: "/create",
  },
  openGraph: {
    title: "Free Bracket Maker - Create a Custom Ranking Bracket",
    description:
      "Add custom items, create a shareable bracket, and rank anything head-to-head with BracketRanker.",
    url: "/create",
  },
};

export default function CreatePage() {
  return <CreatePageClient />;
}
