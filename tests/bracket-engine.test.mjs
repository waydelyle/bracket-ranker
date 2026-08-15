import assert from "node:assert/strict";
import test from "node:test";

// Loaded through Node's type stripping; the engine has no runtime imports.
import {
  bracketReducer,
  createInitialState,
  getProgress,
  getRoundName,
  maxBracketSize,
  rankingStages,
} from "../src/lib/bracket-engine.ts";

function makeItems(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    name: `Item ${index}`,
  }));
}

function seed(items, size, shuffleItems) {
  return bracketReducer(createInitialState(), {
    type: "SEED",
    items,
    size,
    ...(shuffleItems === undefined ? {} : { shuffleItems }),
  });
}

/** Plays to the end, always taking itemA. Fails loudly if the bracket stalls. */
function playAll(start) {
  let state = start;
  for (let i = 0; i < 200 && state.phase === "playing"; i++) {
    const matchup = state.rounds[state.currentRound]?.matchups[state.currentMatchup];
    assert.ok(
      matchup?.itemA && matchup?.itemB,
      `stalled at round ${state.currentRound} matchup ${state.currentMatchup} after ${state.completedMatchups} picks`,
    );
    state = bracketReducer(state, {
      type: "PICK_WINNER",
      winnerId: matchup.itemA.id,
    });
  }
  return state;
}

test("a bracket is never seeded larger than the entrants can fill", () => {
  assert.equal(maxBracketSize(12), 8);
  assert.equal(maxBracketSize(24), 16);
  assert.equal(maxBracketSize(64), 64);
  assert.equal(maxBracketSize(7), 0);

  const state = seed(makeItems(12), 16);
  assert.equal(state.bracketSize, 8);
  assert.deepEqual(
    state.rounds.map((round) => round.matchups.length),
    [4, 2, 1],
  );
  assert.equal(playAll(state).phase, "complete");
});

test("too few entrants leaves the bracket unstarted", () => {
  const state = seed(makeItems(5), 8);
  assert.equal(state.phase, "intro");
  assert.equal(state.rounds.length, 0);
});

for (const size of [8, 16, 32, 64]) {
  test(`a ${size}-entrant bracket plays through to one champion`, () => {
    const finished = playAll(seed(makeItems(size), size, false));

    assert.equal(finished.phase, "complete");
    assert.equal(finished.champion, "item-0");
    assert.equal(finished.completedMatchups, size - 1);
    assert.equal(finished.ranking.length, size);
    assert.equal(new Set(finished.ranking).size, size);
    assert.equal(finished.ranking[0], finished.champion);
  });
}

test("seeding shuffles by default and only skips it when asked", () => {
  const items = makeItems(64);
  const inOrder = items.map((item) => item.id);

  // `shuffleItems: false` is the replay path and must preserve the draw.
  assert.deepEqual(
    seed(items, 64, false).items.map((item) => item.id),
    inOrder,
  );

  // The default must still shuffle. One draw could coincidentally match, so
  // this only fails if every one of several draws comes back in input order.
  const draws = Array.from({ length: 8 }, () =>
    seed(items, 64).items.map((item) => item.id),
  );
  assert.ok(
    draws.some((draw) => JSON.stringify(draw) !== JSON.stringify(inOrder)),
    "SEED must shuffle unless shuffleItems is false",
  );
  // Whatever the order, a draw is always the full entrant set.
  for (const draw of draws) {
    assert.deepEqual([...draw].sort(), [...inOrder].sort());
  }
});

test("RESTORE only accepts an in-progress bracket", () => {
  const intro = createInitialState();
  const finished = playAll(seed(makeItems(8), 8, false));

  // Restoring a finished run would re-fire the save effect and duplicate the
  // stored result and its votes.
  assert.equal(bracketReducer(intro, { type: "RESTORE", state: finished }), intro);
  assert.equal(bracketReducer(intro, { type: "RESTORE", state: intro }), intro);

  const midRun = seed(makeItems(8), 8, false);
  const playing = bracketReducer(midRun, {
    type: "PICK_WINNER",
    winnerId: "item-0",
  });
  assert.equal(bracketReducer(intro, { type: "RESTORE", state: playing }), playing);
});

test("undo steps back across a round boundary and stays playable", () => {
  let state = seed(makeItems(8), 8, false);
  for (let i = 0; i < 4; i++) {
    state = bracketReducer(state, {
      type: "PICK_WINNER",
      winnerId: `item-${i * 2}`,
    });
  }
  assert.equal(state.currentRound, 1);

  const undone = bracketReducer(state, { type: "UNDO" });
  assert.equal(undone.currentRound, 0);
  assert.equal(undone.currentMatchup, 3);
  assert.equal(undone.completedMatchups, 3);

  const redone = bracketReducer(undone, {
    type: "PICK_WINNER",
    winnerId: "item-6",
  });
  assert.equal(playAll(redone).phase, "complete");
});

test("results are grouped by how far each entrant got, not ranked 1-to-N", () => {
  const stages = rankingStages(8);

  assert.deepEqual(
    stages.map((stage) => [stage.label, stage.start, stage.count]),
    [
      ["Champion", 0, 1],
      ["Runner-up", 1, 1],
      ["Eliminated in the Semifinals", 2, 2],
      ["Eliminated in the Quarterfinals", 4, 4],
    ],
  );

  // Every position in the final ranking belongs to exactly one stage.
  for (const size of [8, 16, 32, 64]) {
    const covered = rankingStages(size).reduce(
      (total, stage) => total + stage.count,
      0,
    );
    assert.equal(covered, size, `stages must cover all ${size} entrants`);
  }
});

test("round names and progress track the bracket size", () => {
  assert.equal(getRoundName(8, 0), "Quarterfinals");
  assert.equal(getRoundName(64, 5), "Championship");
  assert.equal(getRoundName(16, 9), "Round 10");

  const state = seed(makeItems(16), 16, false);
  assert.deepEqual(getProgress(state), { current: 0, total: 15, percentage: 0 });

  const afterOne = bracketReducer(state, {
    type: "PICK_WINNER",
    winnerId: "item-0",
  });
  assert.equal(getProgress(afterOne).current, 1);
  assert.equal(getProgress(createInitialState()).percentage, 0);
});
