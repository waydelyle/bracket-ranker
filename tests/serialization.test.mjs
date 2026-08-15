import assert from "node:assert/strict";
import test from "node:test";

import {
  clampText,
  decodeCustomEntries,
  decodePlacement,
  encodeCustomEntries,
  encodePlacement,
  serializeStructuredDataEntries,
} from "../src/lib/serialization.mjs";

const TIER_IDS = ["S", "A", "B", "C", "D", "F"];

/** A high or low surrogate with nothing on the other side of it. */
const LONE_SURROGATE =
  /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/;

test("structured-data arrays become independently valid JSON-LD scripts", () => {
  const scripts = serializeStructuredDataEntries([
    { "@context": "https://schema.org", "@type": "WebSite" },
    { "@context": "https://schema.org", "@type": "FAQPage" },
  ]);

  assert.equal(scripts.length, 2);
  for (const script of scripts) {
    const data = JSON.parse(script);
    assert.equal(Array.isArray(data), false);
    assert.equal(data["@context"].toLowerCase(), "https://schema.org");
  }
});

test("structured data escapes HTML-opening characters", () => {
  const [script] = serializeStructuredDataEntries({ name: "<script>alert(1)</script>" });

  assert.equal(script.includes("<"), false);
  assert.equal(JSON.parse(script).name, "<script>alert(1)</script>");
});

test("custom-entry share encoding round-trips delimiters and Unicode", () => {
  const entries = ["A~B", "مرحبا", "שלום", "<img src=x>", "comma, quote \""];

  assert.deepEqual(decodeCustomEntries(encodeCustomEntries(entries)), entries);
});

test("legacy custom-entry links remain readable", () => {
  assert.deepEqual(decodeCustomEntries("A~B"), ["A", "B"]);
});

test("shared custom entries respect the UI limits", () => {
  const entries = Array.from({ length: 30 }, (_, index) =>
    `${index}-${"x".repeat(80)}`,
  );
  const decoded = decodeCustomEntries(encodeCustomEntries(entries));

  assert.equal(decoded.length, 24);
  assert.equal(decoded.every((entry) => entry.length <= 60), true);
});

test("malformed versioned custom-entry data is ignored", () => {
  assert.equal(decodeCustomEntries("json:not-json"), undefined);
});

// ---------------------------------------------------------------------------
// Hostile and truncated share payloads
//
// The `c` parameter is whatever the address bar says, so every one of these is
// something a link can actually carry.
// ---------------------------------------------------------------------------

test("a hostile share payload cannot throw or hang the decoder", () => {
  const payloads = [
    ["truncated mid-array", 'json:["a","b'],
    ["truncated mid-string", 'json:["abc'],
    ["truncated prefix only", "json:"],
    ["object rather than array", 'json:{"a":1}'],
    ["null", "json:null"],
    ["number", "json:5"],
    ["nested to 2000 deep", "json:" + "[".repeat(2000) + "]".repeat(2000)],
    ["prototype pollution", 'json:{"__proto__":{"polluted":true}}'],
    ["prototype pollution in an array", 'json:[{"__proto__":{"polluted":true}}]'],
    ["nothing but delimiters", "~".repeat(50_000)],
    ["one enormous entry", "x".repeat(500_000)],
    ["a script tag", "<script>alert(1)</script>"],
    ["a lone surrogate", 'json:["\ud83d"]'],
    ["not a string at all", 12345],
  ];

  for (const [name, payload] of payloads) {
    const decoded = decodeCustomEntries(payload);
    assert.ok(
      decoded === undefined || Array.isArray(decoded),
      `${name} produced ${typeof decoded}`,
    );
    if (Array.isArray(decoded)) {
      assert.ok(decoded.length <= 24, `${name} returned ${decoded.length} entries`);
      for (const entry of decoded) {
        assert.equal(typeof entry, "string", name);
        assert.ok(entry.length <= 60, `${name} kept a ${entry.length}-char entry`);
      }
    }
  }

  assert.equal({}.polluted, undefined);
});

test("a share payload cannot grow memory beyond the entry limits", () => {
  // A quarter of a million declared entries is far past any URL a browser will
  // carry; what matters is that the decoder's output is bounded by the limits
  // rather than by what the payload claims.
  const payload = "json:" + JSON.stringify(Array.from({ length: 250_000 }, () => "abcdefgh"));
  const decoded = decodeCustomEntries(payload);

  assert.equal(decoded.length, 24);
});

// ---------------------------------------------------------------------------
// Entrant text
// ---------------------------------------------------------------------------

test("entrant names survive Unicode, emoji, quotes and angle brackets intact", () => {
  const entries = [
    "Café ☕",
    "🏆 the 🐐",
    "👨‍👩‍👧‍👦 family",
    "مرحبا",
    "שלום",
    "日本語のなまえ",
    '<img src=x onerror="alert(1)">',
    `it's a "quote" & an <angle>`,
    "A~B~C",
    "emoji at the end 🎉",
  ];

  assert.deepEqual(decodeCustomEntries(encodeCustomEntries(entries)), entries);
});

test("a name clipped at the length limit never splits a character in half", () => {
  // `slice` counts UTF-16 units, so cutting at 60 lands inside an emoji
  // whenever an odd number of units precede it. The half left behind renders
  // as a replacement character, and `encodeURIComponent` throws on it — which
  // is enough to take down any share button built from the name.
  const straddling = ["a" + "🏆".repeat(40), "x".repeat(59) + "🎉", "ab👨‍👩‍👧‍👦".repeat(9)];

  for (const value of straddling) {
    const [decoded] = decodeCustomEntries(encodeCustomEntries([value]));

    assert.ok(decoded.length <= 60, `kept ${decoded.length} units`);
    assert.equal(
      LONE_SURROGATE.test(decoded),
      false,
      `"${value.slice(0, 8)}…" was clipped through a surrogate pair`,
    );
    assert.doesNotThrow(() => encodeURIComponent(decoded));
  }
});

test("clamping text is length-limited, trimmed and never leaves half a character", () => {
  assert.equal(clampText("  spaced  ", 20), "spaced");
  assert.equal(clampText("abcdef", 3), "abc");
  assert.equal(clampText("🏆🏆🏆", 5), "🏆🏆");
  assert.equal(clampText("a🏆", 2), "a");
  assert.equal(clampText(undefined, 10), "");
  assert.equal(clampText(42, 10), "");
  assert.equal(clampText("plain", 0), "");
  assert.doesNotThrow(() => encodeURIComponent(clampText("x".repeat(79) + "🎉", 80)));
});

// ---------------------------------------------------------------------------
// Tier-list placements
//
// The placement string is positional — one character per entrant, in the
// dataset's own order — so it only means anything against the exact list it
// was made from. Entrant lists do change; this repo has already shipped a
// commit removing a duplicate entrant from one of them.
// ---------------------------------------------------------------------------

test("placements round-trip against the list they were made from", () => {
  const ids = ["kobe", "lebron", "jordan", "curry", "duncan"];
  const placement = { kobe: "A", lebron: "S", jordan: "S", duncan: "C" };

  assert.deepEqual(
    decodePlacement(ids, encodePlacement(ids, placement), TIER_IDS),
    placement,
  );
});

test("a link made before the entrant list changed is refused, not mis-read", () => {
  const before = ["kobe", "lebron", "jordan-dup", "jordan", "curry", "duncan"];
  const shared = encodePlacement(before, {
    kobe: "A",
    lebron: "S",
    "jordan-dup": "F",
    jordan: "S",
    curry: "B",
    duncan: "C",
  });

  // The duplicate is gone. Decoded positionally, every entrant after it takes
  // the tier of its neighbour: Jordan drops from S to F and Curry rises from B
  // to S, with nothing on screen to say the list is wrong.
  const after = before.filter((id) => id !== "jordan-dup");

  assert.equal(decodePlacement(after, shared, TIER_IDS), null);
});

test("a link made against a renamed entrant is refused", () => {
  // Same length, so a count check alone would wave it through.
  const before = ["a", "b", "c", "d"];
  const after = ["a", "b", "c-renamed", "d"];
  const shared = encodePlacement(before, { a: "S", b: "A", c: "B", d: "F" });

  assert.equal(decodePlacement(after, shared, TIER_IDS), null);
});

test("adding a custom entrant to a shared link does not shift the rest", () => {
  const ids = ["a", "b", "custom-0"];
  const shared = encodePlacement(ids, { a: "S", b: "A", "custom-0": "F" });

  assert.deepEqual(decodePlacement(ids, shared, TIER_IDS), {
    a: "S",
    b: "A",
    "custom-0": "F",
  });
  // The same link opened without its custom entrant no longer describes the
  // board it was made from.
  assert.equal(decodePlacement(["a", "b"], shared, TIER_IDS), null);
});

test("placement links shared before the integrity marker still open", () => {
  const ids = ["a", "b", "c", "d"];

  // The old format: one tier character per entrant and nothing else.
  assert.deepEqual(decodePlacement(ids, "SA.F", TIER_IDS), {
    a: "S",
    b: "A",
    d: "F",
  });
  // Same format, wrong length — the list it was made from is not this one.
  assert.equal(decodePlacement(ids, "SA.", TIER_IDS), null);
  assert.equal(decodePlacement(ids, "SA.FB", TIER_IDS), null);
});

test("a hostile placement payload is refused rather than partly applied", () => {
  const ids = ["a", "b", "c"];
  const payloads = [
    "",
    "1",
    "1short",
    "1zzzzzzzSAB",
    "$$$",
    "S".repeat(100_000),
    "1" + "0".repeat(7) + "S".repeat(100_000),
  ];

  for (const payload of payloads) {
    const decoded = decodePlacement(ids, payload, TIER_IDS);
    assert.ok(
      decoded === null || typeof decoded === "object",
      `payload ${payload.slice(0, 10)} produced ${typeof decoded}`,
    );
    if (decoded) {
      for (const key of Object.keys(decoded)) {
        assert.ok(ids.includes(key), `invented entrant ${key}`);
        assert.ok(TIER_IDS.includes(decoded[key]), `invented tier ${decoded[key]}`);
      }
    }
  }

  assert.equal(decodePlacement(ids, undefined, TIER_IDS), null);
  assert.equal(decodePlacement(ids, 5, TIER_IDS), null);
});

test("placement encoding stays proportional to the entrant count", () => {
  const ids = Array.from({ length: 88 }, (_, index) => `entrant-${index}`);
  const placement = Object.fromEntries(ids.map((id, index) => [id, TIER_IDS[index % 6]]));

  const encoded = encodePlacement(ids, placement);

  // One character per entrant plus a fixed-width integrity marker: the whole
  // of the largest dataset plus every custom entrant still fits in a tweet.
  assert.ok(encoded.length <= ids.length + 8, `${encoded.length} chars`);
  assert.deepEqual(decodePlacement(ids, encoded, TIER_IDS), placement);
});
