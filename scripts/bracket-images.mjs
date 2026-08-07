#!/usr/bin/env node
/**
 * Audit and resolve entrant artwork for the bracket datasets.
 *
 * The datasets were originally built by keyword-searching Wikipedia, which
 * matches homonyms confidently and wrongly — the candy Starburst was
 * illustrated with a starburst galaxy, and the Asian cuisine bracket with war
 * and air-disaster photos. Both commands here exist to catch that class of
 * error and to fix it without reintroducing it.
 *
 *   node scripts/bracket-images.mjs audit
 *     Checks every image URL is reachable and really an image, and flags any
 *     whose filename shares no word with the entrant it depicts. Read-only.
 *
 *   node scripts/bracket-images.mjs resolve jobs.json [--write]
 *     Resolves images from *explicit* Wikipedia article titles, never from a
 *     name search. Verifies each candidate before accepting it. Prints a plan;
 *     only writes with --write.
 *
 *     jobs.json: [{ "file", "id", "titles": ["Korean cuisine", "Commons:..."] }]
 *     A "Commons:" prefix searches Wikimedia Commons instead of fetching an
 *     article. Titles are tried in order; the first that verifies wins.
 *
 * Wikimedia rate-limits aggressively and returns 429 to unthrottled bursts, so
 * requests are serialised with a delay. A full audit takes a few minutes.
 */

import { readFile, writeFile } from "node:fs/promises";
import { glob } from "node:fs/promises";

const UA = "BracketRankerImageTool/1.0 (https://www.bracketranker.com)";
const REST = "https://en.wikipedia.org/api/rest_v1/page/summary/";
const COMMONS = "https://commons.wikimedia.org/w/api.php";
const PAUSE_MS = 1200;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function datasetFiles() {
  const out = [];
  for await (const f of glob("src/data/brackets/*/*.json")) out.push(f);
  return out.sort();
}

async function loadAll() {
  const files = await datasetFiles();
  return Promise.all(
    files.map(async (file) => ({
      file,
      data: JSON.parse(await readFile(file, "utf8")),
    })),
  );
}

/** True when the bytes look like a real bitmap, not an HTML error page. */
function looksLikeImage(bytes, contentType) {
  if (!contentType.startsWith("image/")) return false;
  const b = bytes;
  return (
    (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) || // jpeg
    (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) || // png
    (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46) || // gif
    (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46) // webp
  );
}

async function verify(url, { retries = 3 } = {}) {
  for (let attempt = 0; ; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Range: "bytes=0-2047" },
      });
      if (res.status === 429 && attempt < retries) {
        await sleep(20_000 * (attempt + 1));
        continue;
      }
      if (!res.ok && res.status !== 206) return { ok: false, why: `HTTP ${res.status}` };
      const bytes = new Uint8Array(await res.arrayBuffer());
      const ctype = res.headers.get("content-type") ?? "";
      return looksLikeImage(bytes, ctype)
        ? { ok: true }
        : { ok: false, why: `not an image (${ctype})` };
    } catch (err) {
      if (attempt >= retries) return { ok: false, why: err.message };
      await sleep(5000);
    }
  }
}

const STOP = new Set(
  ("the a an of and or in on at to for with logo brand official svg png jpg jpeg " +
    "file thumb commons wikipedia en px new original classic bar s").split(" "),
);

/** decodeURIComponent throws on a bare "%", which real filenames contain. */
function safeDecode(text) {
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

function words(text) {
  return new Set(
    safeDecode(text)
      .replace(/\.(svg|png|jpe?g|gif|webp)$/i, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((w) => w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w)),
  );
}

async function audit() {
  const sets = await loadAll();
  const entries = [];
  for (const { file, data } of sets) {
    for (const item of data.items) {
      entries.push({ file, item });
    }
  }
  const withImage = entries.filter((e) => e.item.image);

  // Filename-vs-name check first: it is offline and instant.
  const suspect = [];
  for (const { file, item } of withImage) {
    // TMDB paths are opaque hashes, so there is no filename to compare.
    if (!item.image.includes("upload.wikimedia.org")) continue;
    const fname = item.image.split("/").pop().replace(/^\d+px-/, "");
    const nameWords = words(`${item.name} ${item.subtitle ?? ""}`);
    let related = [...words(fname)].some((w) => nameWords.has(w));
    if (!related) {
      // "FrenchToast.JPG" and "Plain-M&Ms-Pile.jpg" are correct but tokenise
      // apart from "French Toast" and "M&M's", so fall back to containment.
      const flat = safeDecode(fname).toLowerCase().replace(/[^a-z0-9]/g, "");
      related = [...nameWords].some((w) => w.length >= 4 && flat.includes(w));
    }
    if (!related) suspect.push({ file, item, fname: safeDecode(fname) });
  }

  console.log(`${entries.length} entrants, ${withImage.length} with artwork`);
  console.log(`${entries.length - withImage.length} with none`);
  // This is a heuristic, not a verdict: a correct image can be named for the
  // dish rather than the entrant ("Oseti.jpg" really is Japanese cuisine).
  // Read the list, do not bulk-replace it.
  console.log(`\n${suspect.length} unrelated-looking filenames — review, expect false positives:`);
  for (const s of suspect) {
    console.log(
      `  ${s.file.replace("src/data/brackets/", "").padEnd(30)} ${s.item.name.slice(0, 28).padEnd(28)} ${s.fname.slice(0, 56)}`,
    );
  }

  // Duplicates inside one bracket: two entrants showing the same picture makes
  // a matchup between them meaningless.
  console.log("\nre-used artwork inside a single bracket:");
  for (const { file, data } of sets) {
    const seen = new Map();
    for (const item of data.items) {
      if (item.image) seen.set(item.image, [...(seen.get(item.image) ?? []), item.name]);
    }
    for (const [url, names] of seen) {
      if (names.length > 1) {
        console.log(`  ${file.replace("src/data/brackets/", "")}: ${names.join(", ")} -> ${url.split("/").pop().slice(0, 44)}`);
      }
    }
  }

  console.log(`\nchecking ${withImage.length} URLs are reachable (slow, rate-limited)...`);
  const dead = [];
  for (const [i, { file, item }] of withImage.entries()) {
    const res = await verify(item.image);
    if (!res.ok) {
      dead.push({ file, item, why: res.why });
      console.log(`  DEAD ${item.name.slice(0, 30)} — ${res.why}`);
    }
    if ((i + 1) % 200 === 0) console.log(`    ${i + 1}/${withImage.length}`);
    await sleep(PAUSE_MS);
  }
  console.log(`\n${dead.length} unreachable or non-image URLs`);
}

/**
 * Pin oversized Wikimedia thumbnails to 500px.
 *
 * Matchup cards render at roughly 300px, so a 3840px source is wasted transfer
 * on every first view. Only `/thumb/` URLs can be resized this way.
 */
function normaliseWidth(url) {
  if (!url.includes("/thumb/")) return url;
  return url.replace(/\/(\d{3,4})px-/, (match, w) => (Number(w) > 800 ? "/500px-" : match));
}

async function summaryImage(title) {
  try {
    const res = await fetch(REST + encodeURIComponent(title.replace(/ /g, "_")), {
      headers: { "User-Agent": UA },
    });
    if (!res.ok) return null;
    const d = await res.json();
    if (d.type === "disambiguation") return null;
    const url = d.originalimage?.source ?? d.thumbnail?.source;
    // The REST API appends a tracking query that does not belong in the data.
    return url ? { url: normaliseWidth(url.split("?")[0]), via: d.title } : null;
  } catch {
    return null;
  }
}

async function commonsSearch(query) {
  const params = new URLSearchParams({
    action: "query", format: "json", list: "search",
    srsearch: `${query} filetype:bitmap`, srnamespace: "6", srlimit: "8",
  });
  try {
    const res = await fetch(`${COMMONS}?${params}`, { headers: { "User-Agent": UA } });
    const d = await res.json();
    const qwords = words(query);
    for (const hit of d.query?.search ?? []) {
      const fname = hit.title.replace(/^File:/, "");
      // Require a shared word, or Commons' relevance ranking will hand back
      // something only loosely related.
      if (![...words(fname)].some((w) => qwords.has(w))) continue;
      const info = new URLSearchParams({
        action: "query", format: "json", prop: "imageinfo",
        iiprop: "url", iiurlwidth: "500", titles: hit.title,
      });
      const r2 = await fetch(`${COMMONS}?${info}`, { headers: { "User-Agent": UA } });
      const j = await r2.json();
      for (const page of Object.values(j.query?.pages ?? {})) {
        const ii = page.imageinfo?.[0];
        const url = ii?.thumburl ?? ii?.url;
        if (url) return { url: normaliseWidth(url.split("?")[0]), via: hit.title };
      }
    }
  } catch {
    /* fall through */
  }
  return null;
}

async function resolve(jobsPath, write) {
  const jobs = JSON.parse(await readFile(jobsPath, "utf8"));
  const plan = [];

  for (const [n, job] of jobs.entries()) {
    let found = null;
    for (const title of job.titles) {
      const cand = title.startsWith("Commons:")
        ? await commonsSearch(title.slice("Commons:".length))
        : await summaryImage(title);
      await sleep(PAUSE_MS);
      if (!cand) continue;
      const check = await verify(cand.url);
      await sleep(400);
      if (check.ok) { found = cand; break; }
    }
    plan.push({ ...job, found });
    console.log(
      `${found ? "OK " : "-- "}${String(n + 1).padStart(3)}/${jobs.length} ${(job.id ?? "").slice(0, 28).padEnd(28)} ${found?.url ?? "nothing verified"}`,
    );
  }

  if (!write) {
    console.log(`\n${plan.filter((p) => p.found).length}/${plan.length} resolved. Re-run with --write to apply.`);
    return;
  }

  const byFile = new Map();
  for (const p of plan) {
    if (!p.found) continue;
    if (!byFile.has(p.file)) byFile.set(p.file, JSON.parse(await readFile(p.file, "utf8")));
    const data = byFile.get(p.file);
    const item = data.items.find((i) => i.id === p.id);
    if (!item) { console.log(`  !! no entrant ${p.id} in ${p.file}`); continue; }
    // Refuse to give two entrants in one bracket the same picture.
    if (data.items.some((i) => i.id !== p.id && i.image === p.found.url)) {
      console.log(`  skip ${p.id}: another entrant already uses that image`);
      continue;
    }
    item.image = p.found.url;
  }
  for (const [file, data] of byFile) {
    await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
  }
  console.log(`\nwrote ${byFile.size} files`);
}

const [command, ...rest] = process.argv.slice(2);
if (command === "audit") {
  await audit();
} else if (command === "resolve") {
  const jobs = rest.find((a) => !a.startsWith("--"));
  if (!jobs) {
    console.error("usage: bracket-images.mjs resolve <jobs.json> [--write]");
    process.exit(1);
  }
  await resolve(jobs, rest.includes("--write"));
} else {
  console.error("usage: bracket-images.mjs <audit|resolve>");
  process.exit(1);
}
