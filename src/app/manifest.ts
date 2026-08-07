import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/lib/site";

/**
 * Web app manifest.
 *
 * Most traffic here is mobile, and without a manifest an "Add to Home Screen"
 * install gets the page title and a screenshot instead of a name and an icon.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Tier Lists & Ranking Brackets`,
    short_name: SITE_NAME,
    description:
      "Rank anything head-to-head. Pick a winner in every matchup, crown a champion, and share how everything placed.",
    start_url: "/",
    display: "standalone",
    background_color: "#0b0b14",
    theme_color: "#0b0b14",
    categories: ["entertainment", "games"],
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        src: "/apple-icon",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  };
}
