import assert from "node:assert/strict";
import test from "node:test";
import { bracketReducer, createInitialState } from "../src/lib/bracket-engine.ts";
import {
  areMatchupsValid,
  isRankingValid,
} from "../src/lib/tournament-validation.ts";

function finish(fieldSize, poolSize = fieldSize) {
  const items = Array.from({ length: poolSize }, (_, index) => ({
    id: `item-${index}`,
    name: `Item ${index}`,
  }));
  let state = bracketReducer(createInitialState(), {
    type: "SEED",
    items,
    size: fieldSize,
    shuffleItems: false,
  });
  while (state.phase === "playing") {
    const matchup = state.rounds[state.currentRound].matchups[state.currentMatchup];
    state = bracketReducer(state, {
      type: "PICK_WINNER",
      winnerId: (state.completedMatchups % 2 ? matchup.itemB : matchup.itemA).id,
    });
  }
  return { state, entrants: new Set(items.map((item) => item.id)) };
}

test("all full fields, including byes, validate with the game's actual picks", () => {
  for (let size = 8; size <= 64; size++) {
    const { state, entrants } = finish(size);
    assert.equal(state.phase, "complete");
    assert.equal(areMatchupsValid(state.matchupHistory, entrants, state.champion), true, `field ${size}`);
    assert.equal(isRankingValid(state.ranking, state.champion, entrants, state.matchupHistory), true, `ranking ${size}`);
  }
});

test("smaller playable fields validate against a larger entrant pool", () => {
  for (const [size, poolSize] of [[8, 32], [16, 24], [32, 64], [64, 70]]) {
    const { state, entrants } = finish(size, poolSize);
    assert.equal(areMatchupsValid(state.matchupHistory, entrants, state.champion), true);
    assert.equal(isRankingValid(state.ranking, state.champion, entrants, state.matchupHistory), true);
  }
});

test("repeated picks and entrants returning after elimination are rejected", () => {
  const { state, entrants } = finish(16);
  const repeated = Array.from({ length: 63 }, () => ({
    round: 99,
    itemA: "item-0",
    itemB: "item-1",
    winner: "item-0",
  }));
  assert.equal(areMatchupsValid(repeated, entrants, "item-0"), false);
  assert.equal(areMatchupsValid(Array(15).fill(state.matchupHistory[0]), entrants, state.champion), false);

  const resurrected = structuredClone(state.matchupHistory);
  const opening = resurrected[0];
  const loser = opening.winner === opening.itemA ? opening.itemB : opening.itemA;
  const later = resurrected.find((matchup) => matchup.round === 1);
  later.itemA = loser;
  later.winner = loser;
  assert.equal(areMatchupsValid(resurrected, entrants, loser), false);
});

test("a partial run or a malformed round cannot be submitted as complete", () => {
  const { state, entrants } = finish(8);
  assert.equal(areMatchupsValid(state.matchupHistory.slice(0, -1), entrants, state.champion), false);
  for (const round of [-1, 99, "0", null]) {
    const changed = structuredClone(state.matchupHistory);
    changed[0].round = round;
    assert.equal(areMatchupsValid(changed, entrants, state.champion), false);
  }
  const outOfOrder = structuredClone(state.matchupHistory);
  [outOfOrder[0], outOfOrder[4]] = [outOfOrder[4], outOfOrder[0]];
  assert.equal(areMatchupsValid(outOfOrder, entrants, state.champion), false);
});

test("the champion and full ranking must agree with the recorded matchups", () => {
  const { state, entrants } = finish(8);
  const runnerUp = state.ranking[1];
  assert.equal(areMatchupsValid(state.matchupHistory, entrants, runnerUp), false);
  assert.equal(isRankingValid([runnerUp, state.champion], runnerUp, entrants, state.matchupHistory), false);
  assert.equal(isRankingValid(state.ranking.slice(0, -1), state.champion, entrants, state.matchupHistory), false);
  const reordered = [...state.ranking];
  [reordered[2], reordered[3]] = [reordered[3], reordered[2]];
  assert.equal(isRankingValid(reordered, state.champion, entrants, state.matchupHistory), false);
  const sparse = [...state.ranking];
  delete sparse[3];
  assert.equal(isRankingValid(sparse, state.champion, entrants, state.matchupHistory), false);
});

test("unknown entrants and invalid winners are rejected", () => {
  const { state, entrants } = finish(8);
  for (const change of [
    { itemA: "invented" },
    { itemB: state.matchupHistory[0].itemA },
    { winner: "invented" },
  ]) {
    const changed = structuredClone(state.matchupHistory);
    Object.assign(changed[0], change);
    assert.equal(areMatchupsValid(changed, entrants, state.champion), false);
  }
  for (const invalid of [undefined, null, {}, [], [null]]) {
    assert.equal(areMatchupsValid(invalid, entrants, state.champion), false);
  }
});
