export const SITE_NAME = "BracketRanker";
export const SITE_URL = "https://www.bracketranker.com";
export const SITE_UPDATED_AT = "2026-06-13";

export function absoluteUrl(path = "/") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
}
