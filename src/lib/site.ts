export const SITE_NAME = "BracketRanker";
export const SITE_URL = "https://www.bracketranker.com";

export function absoluteUrl(path = "/") {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath === "/" ? "" : cleanPath}`;
}
