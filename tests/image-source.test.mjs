import assert from "node:assert/strict";
import test from "node:test";

import {
  canOptimizeImage,
  directImageLoader,
} from "../src/lib/image-source.ts";

test("dedicated image CDNs keep using the Next image optimizer", () => {
  assert.equal(canOptimizeImage("https://image.tmdb.org/t/p/w500/poster.jpg"), true);
  assert.equal(canOptimizeImage("https://i.scdn.co/image/album"), true);
});

test("Wikimedia and custom HTTPS hosts bypass the optimizer", () => {
  assert.equal(canOptimizeImage("https://upload.wikimedia.org/example.jpg"), false);
  assert.equal(canOptimizeImage("https://en.wikipedia.org/example.jpg"), false);
  const src = "https://images.example.com/my-bracket/item.jpg";
  assert.equal(canOptimizeImage(src), false);
  assert.equal(directImageLoader({ src }), src);
});

test("invalid and insecure image sources are never optimizer candidates", () => {
  assert.equal(canOptimizeImage("not a URL"), false);
  assert.equal(canOptimizeImage("http://upload.wikimedia.org/example.jpg"), false);
});
