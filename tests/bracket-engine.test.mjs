import assert from "node:assert/strict";
import test from "node:test";

// Loaded through Node's type stripping; the engine has no runtime imports.
import {
  bracketReducer,
  bracketSlots,
  byeCount,
  createInitialState,
  fieldSizeOptions,
  getProgress,
  getRoundName,
  matchupsPerRound,
  rankingStages,
  resolveFieldSize,
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

test("a pool is offered its own size, not just the power of two below it", () => {
  // The whole pool used to be unplayable unless it happened to be a power of
  // two: a 24-entrant bracket capped at 16 and dropped eight entrants from the
  // draw at random, and they never appeared in the ranking at all.
  assert.deepEqual(fieldSizeOptions(24), [8, 16, 24]);
  assert.deepEqual(fieldSizeOptions(12), [8, 12]);
  assert.deepEqual(fieldSizeOptions(32), [8, 16, 32]);
  assert.deepEqual(fieldSizeOptions(64), [8, 16, 32, 64]);
  // Nobody finishes more than 64, and under 8 there is no bracket to play.
  assert.deepEqual(fieldSizeOptions(70), [8, 16, 32, 64]);
  assert.deepEqual(fieldSizeOptions(7), []);

  // Asking for more than the pool holds plays the pool, rather than falling
  // back to half of it.
  assert.equal(resolveFieldSize(64, 24), 24);
  assert.equal(resolveFieldSize(16, 24), 16);
  assert.equal(resolveFieldSize(20, 24), 16);
  assert.equal(resolveFieldSize(4, 24), 8);
  assert.equal(resolveFieldSize(16, 7), 0);
});

test("a bracket is never seeded larger than the entrants can fill", () => {
  const state = seed(makeItems(12), 16);

  // Every entrant is in the draw: four opening matchups plus four byes make up
  // the eight quarter-finalists.
  assert.equal(state.bracketSize, 12);
  assert.equal(state.items.length, 12);
  assert.deepEqual(
    state.rounds.map((round) => round.matchups.length),
    [4, 4, 2, 1],
  );
  assert.equal(state.totalMatchups, 11);
  assert.equal(playAll(state).phase, "complete");
});

test("too few entrants leaves the bracket unstarted", () => {
  const state = seed(makeItems(5), 8);
  assert.equal(state.phase, "intro");
  assert.equal(state.rounds.length, 0);
});

test("every field from 8 to 64 plays to a champion and ranks all of them", () => {
  for (let fieldSize = 8; fieldSize <= 64; fieldSize++) {
    const start = seed(makeItems(fieldSize), fieldSize, false);
    assert.equal(start.bracketSize, fieldSize, `field ${fieldSize} seats all`);
    assert.equal(start.totalMatchups, fieldSize - 1);
    assert.deepEqual(
      start.rounds.map((round) => round.matchups.length),
      matchupsPerRound(fieldSize),
      `field ${fieldSize} round shape`,
    );

    const finished = playAll(start);
    assert.equal(finished.phase, "complete", `field ${fieldSize} completes`);
    assert.equal(finished.completedMatchups, fieldSize - 1);
    assert.equal(finished.ranking.length, fieldSize);
    assert.equal(new Set(finished.ranking).size, fieldSize);
    assert.equal(finished.ranking[0], finished.champion);

    // Everyone seeded is placed, and nobody else appears.
    assert.deepEqual(
      [...finished.ranking].sort(),
      start.items.map((item) => item.id).sort(),
    );
  }
});

test("byes are spread across the draw rather than clustered in one corner", () => {
  for (let fieldSize = 9; fieldSize <= 64; fieldSize++) {
    const byes = byeCount(fieldSize);
    if (byes === 0) continue;

    const state = seed(makeItems(fieldSize), fieldSize, false);
    const slots = bracketSlots(fieldSize) / 2;
    const opening = state.rounds[0];

    assert.equal(opening.matchups.length, slots - byes);
    assert.equal(opening.advancesTo.length, opening.matchups.length);

    // Whichever slots the play-in winners take, the rest are byes.
    const byeSlots = new Set(
      Array.from({ length: slots }, (_, slot) => slot).filter(
        (slot) => !opening.advancesTo.includes(slot),
      ),
    );
    assert.equal(byeSlots.size, byes);

    // No half, quarter or eighth of the draw may carry more than one bye more
    // than any other. Handing byes out in slot order fails this immediately:
    // with 24 entrants all eight would sit in the same half.
    for (let blocks = 2; blocks <= slots / 2; blocks *= 2) {
      const perBlock = Array.from({ length: blocks }, (_, block) =>
        [...byeSlots].filter(
          (slot) => Math.floor(slot / (slots / blocks)) === block,
        ).length,
      );
      assert.ok(
        Math.max(...perBlock) - Math.min(...perBlock) <= 1,
        `field ${fieldSize}: byes ${perBlock.join("/")} across ${blocks} blocks`,
      );
    }
  }
});

test("a bye carries its entrant into the second round without a matchup", () => {
  // 24 entrants: eight opening matchups, eight byes, and a Round of 16.
  const state = seed(makeItems(24), 24, false);

  assert.deepEqual(
    state.rounds.map((round) => round.name),
    ["Round of 24", "Round of 16", "Elite 8", "Final Four", "Championship"],
  );

  const second = state.rounds[1];
  const standing = second.matchups.flatMap((matchup) =>
    [matchup.itemA, matchup.itemB].filter(Boolean).map((item) => item.id),
  );
  assert.equal(standing.length, 8, "byes are already placed");

  // Nobody is in two places at once: the opening round and the byes partition
  // the field.
  const playingIn = state.rounds[0].matchups.flatMap((matchup) => [
    matchup.itemA.id,
    matchup.itemB.id,
  ]);
  assert.equal(playingIn.length, 16);
  assert.deepEqual(
    [...playingIn, ...standing].sort(),
    state.items.map((item) => item.id).sort(),
  );
});

test("undoing back into the opening round leaves the byes standing", () => {
  let state = seed(makeItems(24), 24, false);
  const byesBefore = state.rounds[1].matchups.map((matchup) => [
    matchup.itemA?.id ?? null,
    matchup.itemB?.id ?? null,
  ]);

  // Play the whole opening round, which advances eight winners into the 16.
  for (let i = 0; i < 8; i++) {
    const matchup = state.rounds[0].matchups[state.currentMatchup];
    state = bracketReducer(state, {
      type: "PICK_WINNER",
      winnerId: matchup.itemA.id,
    });
  }
  assert.equal(state.currentRound, 1);
  assert.equal(
    state.rounds[1].matchups.every((m) => m.itemA && m.itemB),
    true,
  );

  const undone = bracketReducer(state, { type: "UNDO" });
  assert.equal(undone.currentRound, 0);
  assert.equal(undone.currentMatchup, 7);
  assert.deepEqual(
    undone.rounds[1].matchups.map((matchup) => [
      matchup.itemA?.id ?? null,
      matchup.itemB?.id ?? null,
    ]),
    byesBefore,
    "an entrant on a bye never played for its place and must keep it",
  );

  // And the bracket still finishes from there.
  const redone = bracketReducer(undone, {
    type: "PICK_WINNER",
    winnerId: undone.rounds[0].matchups[7].itemB.id,
  });
  const finished = playAll(redone);
  assert.equal(finished.phase, "complete");
  assert.equal(new Set(finished.ranking).size, 24);
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

  // A field with byes has a smaller opening round, so its last group is
  // smaller than the one above it — 8 of the 24 go out in the opening round,
  // not 12.
  assert.deepEqual(
    rankingStages(24).map((stage) => [stage.label, stage.start, stage.count]),
    [
      ["Champion", 0, 1],
      ["Runner-up", 1, 1],
      ["Eliminated in the Final Four", 2, 2],
      ["Eliminated in the Elite 8", 4, 4],
      ["Eliminated in the Round of 16", 8, 8],
      ["Eliminated in the Round of 24", 16, 8],
    ],
  );

  // Every position in the final ranking belongs to exactly one stage, whatever
  // the field size — the results page groups a ranking by these.
  for (let size = 8; size <= 64; size++) {
    const stages = rankingStages(size);
    const covered = stages.reduce((total, stage) => total + stage.count, 0);
    assert.equal(covered, size, `stages must cover all ${size} entrants`);
    assert.ok(
      stages.every(
        (stage) =>
          Number.isInteger(stage.start) && Number.isInteger(stage.count),
      ),
      `stage boundaries for ${size} must be whole positions`,
    );
    // Stages run back to back with no gap and no overlap.
    stages.reduce((next, stage) => {
      assert.equal(stage.start, next, `stage ${stage.label} starts at ${next}`);
      return next + stage.count;
    }, 0);
  }
});

test("the ranking groups every entrant by the round it went out in", () => {
  const finished = playAll(seed(makeItems(24), 24, false));
  const eliminated = new Map();
  for (const matchup of finished.matchupHistory) {
    const loser =
      matchup.winner === matchup.itemA ? matchup.itemB : matchup.itemA;
    eliminated.set(loser, matchup.round);
  }

  for (const stage of rankingStages(24)) {
    const ids = finished.ranking.slice(stage.start, stage.start + stage.count);
    if (stage.label === "Champion") {
      assert.deepEqual(ids, [finished.champion]);
      continue;
    }
    // Everyone in a group really did go out in the same round.
    const rounds = new Set(ids.map((id) => eliminated.get(id)));
    assert.equal(rounds.size, 1, `${stage.label} mixes elimination rounds`);
  }
});

test("round names and progress track the bracket size", () => {
  assert.equal(getRoundName(8, 0), "Quarterfinals");
  assert.equal(getRoundName(64, 5), "Championship");
  assert.equal(getRoundName(16, 9), "Round 10");

  // A field with byes opens with a partial round, and is an ordinary bracket
  // of half the tree from there.
  assert.equal(getRoundName(24, 0), "Round of 24");
  assert.equal(getRoundName(24, 1), "Round of 16");
  assert.equal(getRoundName(24, 4), "Championship");
  assert.equal(getRoundName(12, 0), "Round of 12");
  assert.equal(getRoundName(12, 1), "Quarterfinals");
  assert.equal(getRoundName(24, 9), "Round 10");

  const state = seed(makeItems(16), 16, false);
  assert.deepEqual(getProgress(state), { current: 0, total: 15, percentage: 0 });

  const afterOne = bracketReducer(state, {
    type: "PICK_WINNER",
    winnerId: "item-0",
  });
  assert.equal(getProgress(afterOne).current, 1);
  assert.equal(getProgress(createInitialState()).percentage, 0);
});

// ---------------------------------------------------------------------------
// Reproducibility
//
// The draw is shuffled, which is the one place unseeded randomness enters the
// engine. Everything downstream of it has to be a pure function of the draw
// order and the picks, or a saved run would not replay into the bracket it was
// playing and a result could not be trusted to mean the same thing twice.
// ---------------------------------------------------------------------------

test("the same entrant order and the same picks give the same bracket twice", () => {
  const items = makeItems(32);

  // Each run takes whichever side the previous pick did not, so the two runs
  // exercise the whole tree rather than one corner of it.
  const run = () => {
    let state = seed(items, 32, false);
    let flip = false;
    while (state.phase === "playing") {
      const matchup =
        state.rounds[state.currentRound].matchups[state.currentMatchup];
      flip = !flip;
      state = bracketReducer(state, {
        type: "PICK_WINNER",
        winnerId: (flip ? matchup.itemA : matchup.itemB).id,
      });
    }
    return state;
  };

  const first = run();
  const second = run();

  assert.equal(first.phase, "complete");
  assert.deepEqual(first.ranking, second.ranking);
  assert.deepEqual(first.matchupHistory, second.matchupHistory);
  assert.equal(first.champion, second.champion);
  // Nothing anywhere in the state differs, not just the parts read back out.
  assert.equal(JSON.stringify(first), JSON.stringify(second));
});

test("the draw is the only thing chance decides, and it is shuffled", () => {
  const items = makeItems(32);

  // Seeding without a shuffle is exactly the order it was handed.
  assert.deepEqual(
    seed(items, 32, false).items.map((item) => item.id),
    items.map((item) => item.id),
  );

  // Seeding with one is not — which is the behaviour a replayed saved run
  // switches off, and why the run stores the draw rather than re-rolling it.
  const draws = new Set(
    Array.from({ length: 20 }, () =>
      seed(items, 32).items.map((item) => item.id).join(","),
    ),
  );
  assert.ok(draws.size > 1, "the draw never changed across 20 seeds");

  // However the draw falls, it is always the whole pool, each entrant once.
  for (const draw of draws) {
    const ids = draw.split(",");
    assert.equal(ids.length, 32);
    assert.equal(new Set(ids).size, 32);
  }
});

test("byes fall on the same slots for the same field size every time", () => {
  // Bye placement is derived from the tree, not drawn, so two seeds of the
  // same field give byes to the same *slots* — the entrants standing in them
  // differ only because the draw does.
  for (const size of [12, 24, 40, 63]) {
    const shape = (state) =>
      state.rounds.map((round) => round.matchups.length).join(",");

    const first = seed(makeItems(size), size, false);
    const second = seed(makeItems(size), size, false);

    assert.equal(shape(first), shape(second), `size ${size}`);
    assert.deepEqual(first.rounds[0].advancesTo, second.rounds[0].advancesTo);
    assert.equal(byeCount(size), bracketSlots(size) - size, `size ${size}`);
  }
});

// ---------------------------------------------------------------------------
// Scale
// ---------------------------------------------------------------------------

test("the largest field the UI offers plays through without blowing up", () => {
  // 64 is MAX_FIELD_SIZE, and the largest built-in bracket is exactly that.
  assert.equal(fieldSizeOptions(200).at(-1), 64);
  assert.deepEqual(matchupsPerRound(64), [32, 16, 8, 4, 2, 1]);

  const state = playAll(seed(makeItems(64), 64, false));

  assert.equal(state.phase, "complete");
  assert.equal(state.completedMatchups, 63);
  assert.equal(state.ranking.length, 64);
  assert.equal(new Set(state.ranking).size, 64);
  assert.equal(state.matchupHistory.length, 63);
  assert.equal(state.rounds.length, 6);

  // A saved run is the ids and the picks, so what has to cross localStorage
  // and a page reload stays small even at the largest size.
  const snapshot = JSON.stringify({
    itemIds: state.items.map((item) => item.id),
    picks: state.matchupHistory.map((matchup) => matchup.winner),
  });
  assert.ok(snapshot.length < 4096, `${snapshot.length} bytes`);
});

test("work per pick does not grow quadratically with the field", () => {
  // Every pick copies the round structure, so the cost of a whole run rises
  // with the field. What must not happen is the *per-pick* cost rising with
  // it too, which is what would make 64 entrants unplayable on a phone.
  const cost = (size) => {
    const started = process.hrtime.bigint();
    for (let repeat = 0; repeat < 40; repeat++) {
      playAll(seed(makeItems(size), size, false));
    }
    return Number(process.hrtime.bigint() - started) / 40 / (size - 1);
  };

  cost(16); // warm up, so the first measured size is not paying for the JIT
  const small = cost(16);
  const large = cost(64);

  // Four times the field, and a pick may cost more — the tree it copies is
  // bigger — but nothing like the sixteen times a quadratic per-pick cost
  // would bring. Loose enough not to flake on a busy machine.
  assert.ok(
    large < small * 8,
    `a pick costs ${(large / small).toFixed(1)}x more at 64 than at 16`,
  );
});
