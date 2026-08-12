import assert from "node:assert/strict";
import test from "node:test";

import {
  decodeCustomEntries,
  encodeCustomEntries,
  serializeStructuredDataEntries,
} from "../src/lib/serialization.mjs";

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
