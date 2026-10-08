import test from "node:test";
import assert from "node:assert/strict";
import { getChampionLeaders } from "../src/lib/community-champions.mjs";

test("title leaders are chosen by champion count rather than win-rate order", () => {
  const entries = [
    { id: "win-rate-leader", winRate: 90, championCount: 1 },
    { id: "title-leader", winRate: 70, championCount: 8 },
    { id: "third", winRate: 60, championCount: 2 },
  ];

  assert.deepEqual(getChampionLeaders(entries), [entries[1]]);
  assert.deepEqual(entries.map((entry) => entry.id), [
    "win-rate-leader",
    "title-leader",
    "third",
  ]);
});

test("every entrant tied for the most titles is returned", () => {
  const entries = [
    { id: "first", championCount: 2 },
    { id: "joint-a", championCount: 5 },
    { id: "joint-b", championCount: 5 },
  ];

  assert.deepEqual(getChampionLeaders(entries), entries.slice(1));
});

test("no titles produces no title leader", () => {
  assert.deepEqual(getChampionLeaders([]), []);
  assert.deepEqual(getChampionLeaders([{ id: "unplayed", championCount: 0 }]), []);
});
