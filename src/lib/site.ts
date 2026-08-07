export const SITE_NAME = "BracketRanker";
export const SITE_URL = "https://www.bracketranker.com";

/**
 * Open Graph fields every page needs to restate.
 *
 * Next merges metadata shallowly, so a page that declares its own `openGraph`
 * replaces the root one outright and silently loses `siteName` and `type`.
 * Spread this into every page-level `openGraph` block.
 */
export const OG_DEFAULTS = {
  type: "website",
  siteName: SITE_NAME,
} as const;

export function absoluteUrl(path = "/") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
}
