const MAX_CUSTOM_ENTRIES = 24;
const MAX_CUSTOM_NAME_LENGTH = 60;

/** Character a tier list uses for an entrant nobody has placed yet. */
export const UNPLACED = ".";

/** A high or low surrogate with nothing on the other side of it. */
const LONE_SURROGATE =
  /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

/**
 * Trims `value` to at most `maxLength` UTF-16 units without leaving half a
 * character behind.
 *
 * `slice` counts UTF-16 units, so cutting a name at a fixed length lands inside
 * an emoji whenever an odd number of units precede it — an 80-character title
 * ending in 🎉 clips to 79 characters plus a stray high surrogate. That half
 * renders as a replacement character, and, worse, `encodeURIComponent` throws
 * `URIError: URI malformed` on it: a share button built from such a name takes
 * the whole page down with it, so the shared result cannot be opened at all.
 *
 * Anything that is not a string clamps to "", which is what every caller wants
 * from a missing or hostile field.
 */
export function clampText(value, maxLength) {
  if (typeof value !== "string") return "";
  if (!Number.isInteger(maxLength) || maxLength <= 0) return "";

  // Surrogates left unpaired by an earlier clip cannot be repaired, only
  // dropped — and they must be, or they travel straight back into a URL.
  const trimmed = value.trim().replace(LONE_SURROGATE, "");
  if (trimmed.length <= maxLength) return trimmed;

  // Back off one unit when the cut would fall between a surrogate pair.
  const code = trimmed.charCodeAt(maxLength - 1);
  const end = code >= 0xd800 && code <= 0xdbff ? maxLength - 1 : maxLength;

  return trimmed.slice(0, end);
}

export function serializeStructuredDataEntries(data) {
  const entries = Array.isArray(data) ? data : [data];

  return entries.map((entry) =>
    JSON.stringify(entry).replace(/</g, "\\u003c"),
  );
}

export function encodeCustomEntries(entries) {
  return `json:${JSON.stringify(entries)}`;
}

export function decodeCustomEntries(encoded) {
  // A share parameter is whatever the address bar says, so it is not even
  // guaranteed to be a string.
  if (typeof encoded !== "string" || encoded.length === 0) return undefined;

  let entries;
  if (encoded.startsWith("json:")) {
    try {
      entries = JSON.parse(encoded.slice(5));
    } catch {
      return undefined;
    }
  } else {
    // Preserve compatibility with links shared before the JSON encoding was
    // introduced. Those links used `~` as an irreversible delimiter.
    entries = encoded.split("~");
  }

  if (!Array.isArray(entries)) return undefined;

  const normalized = entries
    .filter((entry) => typeof entry === "string")
    // Bounded before the per-entry work, so a payload declaring a quarter of a
    // million entries costs the same as one declaring twenty-four.
    .slice(0, MAX_CUSTOM_ENTRIES * 2)
    .map((entry) => clampText(entry, MAX_CUSTOM_NAME_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_CUSTOM_ENTRIES);

  return normalized.length > 0 ? normalized : undefined;
}

// ---------------------------------------------------------------------------
// Tier-list placements
//
// A placement string is positional: one character per entrant, in the
// dataset's own order. That makes it short enough to paste into a chat window,
// and it means the string only says anything at all against the exact entrant
// list it was made from.
//
// Entrant lists do change — this repo has already shipped a commit removing a
// duplicate entrant from one of them. Decoded positionally against a changed
// list, every entrant after the change takes its neighbour's tier: the board
// that renders is not the one that was shared, and nothing on screen says so.
//
// So the encoding carries a fingerprint of the list it was made from, and a
// link that does not match is refused rather than half-applied. Links shared
// before the fingerprint existed have no marker to check, so they are held to
// the one thing that can be checked — that they are the right length.
//
// Kept here rather than in the tier list component so `node --test` can attack
// the decoder the same way a shared link can.
// ---------------------------------------------------------------------------

/** Marks a placement string that carries a fingerprint. Not a tier character. */
const PLACEMENT_VERSION = "1";

/** Width of the base-36 fingerprint; 36^7 covers the full 32-bit range. */
const FINGERPRINT_LENGTH = 7;

/**
 * FNV-1a over the entrant ids.
 *
 * Not a security boundary — a tier list is not worth forging — just enough to
 * notice that the list has been added to, cut down, reordered or renamed.
 */
export function placementFingerprint(ids) {
  let hash = 0x811c9dc5;
  const joined = ids.join("\u0000");

  for (let index = 0; index < joined.length; index++) {
    hash ^= joined.charCodeAt(index);
    // hash *= 16777619, in 32-bit pieces so it stays exact.
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36).padStart(FINGERPRINT_LENGTH, "0");
}

export function encodePlacement(ids, placement) {
  const body = ids.map((id) => placement[id] ?? UNPLACED).join("");
  return `${PLACEMENT_VERSION}${placementFingerprint(ids)}${body}`;
}

/**
 * Placements for `ids`, or null when the link was not made from this list.
 *
 * Null is the caller's cue to keep the entrants and drop the tiers, with a
 * message — a half-applied board looks like a real one.
 */
export function decodePlacement(ids, encoded, tierIds) {
  if (!Array.isArray(ids) || !Array.isArray(tierIds)) return null;
  if (typeof encoded !== "string" || encoded.length === 0) return null;

  let body;
  if (encoded.startsWith(PLACEMENT_VERSION)) {
    if (encoded.length < 1 + FINGERPRINT_LENGTH) return null;
    if (encoded.slice(1, 1 + FINGERPRINT_LENGTH) !== placementFingerprint(ids)) {
      return null;
    }
    body = encoded.slice(1 + FINGERPRINT_LENGTH);
  } else {
    // Shared before the fingerprint existed. Tier characters only, so it can
    // never be mistaken for the versioned form.
    body = encoded;
  }

  if (body.length !== ids.length) return null;

  const next = {};
  for (let index = 0; index < ids.length; index++) {
    const char = body[index];
    if (tierIds.includes(char)) next[ids[index]] = char;
  }

  return next;
}
