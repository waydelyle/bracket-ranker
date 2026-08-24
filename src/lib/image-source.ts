/**
 * Hosts that are safe to send through the Next image optimizer.
 *
 * Wikimedia deliberately rate-limits bursts from a single origin. A category
 * page can request dozens of entrant thumbnails at once, so proxying those
 * through one Next server intermittently produced 429s and broken artwork.
 * Wikimedia files are already capped at 500px in the datasets; serve them
 * directly and keep optimization for providers built for image delivery.
 */
const OPTIMIZED_HOSTS = new Set(["image.tmdb.org", "i.scdn.co"]);

export function canOptimizeImage(src: string): boolean {
  try {
    const url = new URL(src);
    return url.protocol === "https:" && OPTIMIZED_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

/** A custom Next Image loader that leaves a user-supplied HTTPS URL alone. */
export function directImageLoader({ src }: { src: string }): string {
  return src;
}
