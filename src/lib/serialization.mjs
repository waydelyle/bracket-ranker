const MAX_CUSTOM_ENTRIES = 24;
const MAX_CUSTOM_NAME_LENGTH = 60;

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
  if (!encoded) return undefined;

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
    .map((entry) => entry.trim().slice(0, MAX_CUSTOM_NAME_LENGTH))
    .filter(Boolean)
    .slice(0, MAX_CUSTOM_ENTRIES);

  return normalized.length > 0 ? normalized : undefined;
}
