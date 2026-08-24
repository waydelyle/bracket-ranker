/**
 * Category colours are brand accents, not automatically accessible text or
 * button colours. These paired palettes preserve the hue while meeting WCAG
 * AA against the site's dark surfaces (text) and against white (surfaces).
 */
const TEXT_COLORS: Record<string, string> = {
  "#ef4444": "#f87171",
  "#8b5cf6": "#c4b5fd",
  "#6366f1": "#a5b4fc",
  "#22c55e": "#4ade80",
  "#3b82f6": "#60a5fa",
  "#ec4899": "#f472b6",
};

const SURFACE_COLORS: Record<string, string> = {
  "#ef4444": "#b91c1c",
  "#8b5cf6": "#6d28d9",
  "#6366f1": "#4338ca",
  "#22c55e": "#15803d",
  "#3b82f6": "#1d4ed8",
  "#ec4899": "#be185d",
};

export function categoryTextColor(color: string): string {
  return TEXT_COLORS[color.toLowerCase()] ?? color;
}

export function categorySurfaceColor(color: string): string {
  return SURFACE_COLORS[color.toLowerCase()] ?? color;
}
