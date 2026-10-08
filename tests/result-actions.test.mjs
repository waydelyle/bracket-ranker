import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";
import { bracketReducer, createInitialState } from "../src/lib/bracket-engine.ts";

const fixture = { redis: null, entrants: null };
globalThis.__resultActionTestFixture = fixture;

// Exercise the actual public action with a clock-controlled Redis substitute.
const validationUrl = new URL("../src/lib/tournament-validation.ts", import.meta.url).href;
const substitutes = {
  "@/lib/kv": "export function getRedis() { return globalThis.__resultActionTestFixture.redis; }",
  "@/lib/validate": `export * from ${JSON.stringify(validationUrl)}; export async function bracketEntrantIds() { return globalThis.__resultActionTestFixture.entrants; }`,
  nanoid: "export function nanoid() { return 'abcdefghij'; }",
};
const hooks = registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier in substitutes) {
      return {
        url: `data:text/javascript,${encodeURIComponent(substitutes[specifier])}`,
        shortCircuit: true,
      };
    }
    return nextResolve(specifier, context);
  },
});
const { getResult, saveResult } = await import("../src/app/actions/results.ts");
hooks.deregister();

function completedInput(categorySlug = "food", bracketSlug = "fast-food") {
  const items = Array.from({ length: 8 }, (_, index) => ({
    id: `item-${index}`,
    name: `Item ${index}`,
  }));
  fixture.entrants = new Set(items.map((item) => item.id));
  let state = bracketReducer(createInitialState(), {
    type: "SEED", items, size: 8, shuffleItems: false,
  });
  while (state.phase === "playing") {
    state = bracketReducer(state, {
      type: "PICK_WINNER",
      winnerId: state.rounds[state.currentRound].matchups[state.currentMatchup].itemA.id,
    });
  }
  return { categorySlug, bracketSlug, ranking: state.ranking, champion: state.champion, matchups: state.matchupHistory };
}

function memoryRedis() {
  const records = new Map();
  let now = 0;
  let transactions = 0;
  function set(key, value, { ex }) {
    records.set(key, { value, expires: now + ex });
    return "OK";
  }
  function expire(key, ttl) {
    const record = records.get(key);
    if (!record || record.expires <= now) return 0;
    record.expires = now + ttl;
    return 1;
  }
  return {
    set,
    get(key) {
      const record = records.get(key);
      return record && record.expires > now ? record.value : null;
    },
    multi() {
      const commands = [];
      return {
        set(...args) { commands.push(() => set(...args)); return this; },
        expire(...args) { commands.push(() => expire(...args)); return this; },
        exec() { transactions++; return commands.map((command) => command()); },
      };
    },
    advance(seconds) { now += seconds; },
    get transactions() { return transactions; },
    get size() { return records.size; },
  };
}

test("a late custom result keeps its names available for its full 90 days", async () => {
  const redis = memoryRedis();
  fixture.redis = redis;
  const day = 86400;
  const input = completedInput("custom", "Custom1234");
  const metadata = JSON.stringify({ title: "My bracket", items: [...fixture.entrants].map((id) => ({ id, name: id })) });
  await redis.set("custom:Custom1234", metadata, { ex: 90 * day });
  redis.advance(89 * day);
  const id = await saveResult(input);
  assert.equal(redis.transactions, 1, "the result and renewed metadata are written together");
  redis.advance(2 * day);
  assert.equal((await getResult(id)).champion, input.champion);
  assert.equal(redis.get("custom:Custom1234"), metadata, "metadata outlives the original expiry");
  redis.advance(88 * day);
  assert.equal(await getResult(id), null);
  assert.equal(redis.get("custom:Custom1234"), null);
});

test("invalid picks and rankings reach neither result storage nor metadata expiry", async () => {
  const redis = memoryRedis();
  fixture.redis = redis;
  const input = completedInput("custom", "Custom1234");
  await assert.rejects(saveResult({ ...input, matchups: Array(7).fill(input.matchups[0]) }), /Invalid matchups/);
  await assert.rejects(saveResult({ ...input, champion: input.ranking[1] }), /Invalid matchups/);
  await assert.rejects(saveResult({ ...input, ranking: input.ranking.slice(0, 2) }), /Invalid ranking/);
  assert.equal(redis.size, 0);
  assert.equal(redis.transactions, 0);
});

test("saved matchups retain only the game fields", async () => {
  const redis = memoryRedis();
  fixture.redis = redis;
  const input = completedInput();
  input.matchups[0].extra = "unrelated caller payload";
  const id = await saveResult(input);
  const result = await getResult(id);
  assert.deepEqual(Object.keys(result.matchups[0]).sort(), ["itemA", "itemB", "round", "winner"]);
  assert.equal(result.ranking.length, 8);
});

test("no share id is returned without result storage", async () => {
  fixture.redis = null;
  assert.equal(await saveResult(completedInput()), null);
});
