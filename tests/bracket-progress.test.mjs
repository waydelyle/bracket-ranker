import assert from "node:assert/strict";
import test from "node:test";

import {
  PROGRESS_TTL_MS,
  PROGRESS_VERSION,
  classifySavedRun,
  entrantsStillExist,
  hasResumableRun,
  isValidProgress,
  parseProgress,
  progressStorageKey,
  restoreProgress,
  saveActionFor,
  serializeProgress,
  stateBelongsTo,
  summarizeProgress,
} from "../src/lib/bracket-progress.mjs";
// Loaded through Node's type stripping, so the saved-run format is exercised
// against the real reducer rather than a stand-in. Needs Node >= 22.18 (or
// >= 23.6), where stripping TypeScript types is on by default.
import {
  bracketReducer,
  createInitialState,
  getRoundName,
  roundIndexForPick,
} from "../src/lib/bracket-engine.ts";

const ENGINE = { bracketReducer, createInitialState };
const ID = "movies/marvel";

function makeItems(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `item-${index}`,
    name: `Item ${index}`,
  }));
}

/** Seeds in a fixed order and plays `picks` matchups, always taking itemA. */
function playedState(items, size, picks) {
  let state = bracketReducer(createInitialState(), {
    type: "SEED",
    items,
    size,
    shuffleItems: false,
  });

  for (let i = 0; i < picks; i++) {
    const matchup = state.rounds[state.currentRound].matchups[state.currentMatchup];
    state = bracketReducer(state, {
      type: "PICK_WINNER",
      winnerId: matchup.itemA.id,
    });
  }

  return state;
}

/** The parts of a state a resumed run has to reproduce exactly. */
function playableShape(state) {
  return {
    phase: state.phase,
    bracketSize: state.bracketSize,
    items: state.items.map((item) => item.id),
    currentRound: state.currentRound,
    currentMatchup: state.currentMatchup,
    completedMatchups: state.completedMatchups,
    ranking: state.ranking,
    matchupHistory: state.matchupHistory,
    rounds: state.rounds.map((round) =>
      round.matchups.map((matchup) => [
        matchup.itemA?.id ?? null,
        matchup.itemB?.id ?? null,
        matchup.winner?.id ?? null,
      ]),
    ),
  };
}

// ---------------------------------------------------------------------------
// Snapshot format
// ---------------------------------------------------------------------------

test("a saved run records the draw order and every pick", () => {
  const items = makeItems(32);
  const progress = serializeProgress(playedState(items, 16, 3), ID, 1000);

  assert.deepEqual(progress, {
    v: PROGRESS_VERSION,
    id: ID,
    size: 16,
    itemIds: items.slice(0, 16).map((item) => item.id),
    picks: ["item-0", "item-2", "item-4"],
    savedAt: 1000,
  });
});

test("a saved run stays far smaller than the state it replays", () => {
  const items = makeItems(64);
  const state = playedState(items, 64, 32);
  const snapshot = JSON.stringify(serializeProgress(state, ID));

  // The pre-existing format stored the whole state, which nests every entrant
  // once per round and is rewritten on every pick.
  const wholeState = JSON.stringify({ version: 1, savedAt: 0, state });

  assert.ok(
    snapshot.length * 10 < wholeState.length,
    `expected an order-of-magnitude saving, got ${wholeState.length} vs ${snapshot.length}`,
  );
});

test("nothing is saved before the first pick, or once the run is over", () => {
  const items = makeItems(8);

  assert.equal(serializeProgress(playedState(items, 8, 0), ID), null);
  assert.equal(serializeProgress(createInitialState(), ID), null);
  // A finished bracket belongs on its results page, not in a resume prompt.
  assert.equal(serializeProgress(playedState(items, 8, 7), ID), null);
  // No id means persistence is switched off.
  assert.equal(serializeProgress(playedState(items, 8, 2), undefined), null);
});

test("the storage key is scoped per bracket", () => {
  assert.equal(progressStorageKey(ID), "bracketranker:progress:movies/marvel");
  assert.notEqual(progressStorageKey(ID), progressStorageKey("movies/pixar"));
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

test("structurally sound saves are accepted", () => {
  const progress = serializeProgress(playedState(makeItems(8), 8, 2), ID);
  assert.equal(isValidProgress(progress), true);

  // A field that is not a power of two is an ordinary save now that byes let
  // one be played, and must not be thrown away as malformed.
  const withByes = serializeProgress(playedState(makeItems(24), 24, 5), ID);
  assert.equal(withByes.size, 24);
  assert.equal(isValidProgress(withByes), true);
});

test("malformed saves are rejected rather than restored", () => {
  const base = serializeProgress(playedState(makeItems(8), 8, 2), ID);
  const ids = (count) =>
    Array.from({ length: count }, (_, index) => `item-${index}`);

  const rejected = {
    "an older schema version": { ...base, v: 1 },
    "a field too small for a bracket": {
      ...base,
      size: 4,
      itemIds: ids(4),
    },
    "a field larger than the game offers": {
      ...base,
      size: 65,
      itemIds: ids(65),
    },
    "a fractional field": { ...base, size: 8.5 },
    "an entrant list that disagrees with the size": { ...base, itemIds: ["a"] },
    "duplicate entrants": {
      ...base,
      itemIds: [...base.itemIds.slice(0, 7), "item-0"],
    },
    "no picks yet": { ...base, picks: [] },
    "a completed run": { ...base, picks: Array(7).fill("item-0") },
    "non-string picks": { ...base, picks: [1] },
    "a missing id": { ...base, id: "" },
    "a non-numeric timestamp": { ...base, savedAt: "yesterday" },
    "a non-object": "nope",
    null: null,
  };

  for (const [label, value] of Object.entries(rejected)) {
    assert.equal(isValidProgress(value), false, `should reject ${label}`);
  }
});

test("parsing rejects junk, other brackets, and stale saves", () => {
  const progress = serializeProgress(playedState(makeItems(8), 8, 2), ID, 1000);
  const raw = JSON.stringify(progress);

  assert.deepEqual(parseProgress(raw, ID, 1000), progress);
  // Right at the limit is still resumable; a millisecond past is not.
  assert.deepEqual(parseProgress(raw, ID, 1000 + PROGRESS_TTL_MS), progress);
  assert.equal(parseProgress(raw, ID, 1000 + PROGRESS_TTL_MS + 1), null);

  assert.equal(parseProgress(raw, "movies/pixar", 1000), null);
  assert.equal(parseProgress("{not json", ID, 1000), null);
  assert.equal(parseProgress(null, ID, 1000), null);
  assert.equal(parseProgress("", ID, 1000), null);
});

test("saves in the pre-existing whole-state format are ignored", () => {
  // What the previous version wrote. It must not be misread as a new save.
  const legacy = JSON.stringify({
    version: 1,
    savedAt: Date.now(),
    state: playedState(makeItems(8), 8, 3),
  });

  assert.equal(parseProgress(legacy, ID), null);
});

// ---------------------------------------------------------------------------
// Entrant drift
// ---------------------------------------------------------------------------

test("a save is only usable while its entrants still exist", () => {
  const items = makeItems(16);
  const progress = serializeProgress(playedState(items, 8, 3), ID);

  assert.equal(entrantsStillExist(progress, items), true);

  // An entrant was renamed — the exact shape of "fill 26 gaps" style edits.
  const renamed = items.map((item, index) =>
    index === 2 ? { ...item, id: "renamed" } : item,
  );
  assert.equal(entrantsStillExist(progress, renamed), false);

  // Or dropped entirely.
  const dropped = items.filter((item) => item.id !== "item-5");
  assert.equal(entrantsStillExist(progress, dropped), false);

  assert.equal(entrantsStillExist(progress, []), false);
  assert.equal(entrantsStillExist(progress, undefined), false);
});

test("a live run is only written back while it matches the entrants on screen", () => {
  const items = makeItems(16);
  const state = playedState(items, 8, 3);

  assert.equal(stateBelongsTo(state, items), true);
  // Guards a component instance reused across a change of bracket: the
  // outgoing run must not be written under the incoming bracket's key.
  assert.equal(stateBelongsTo(state, makeItems(16).map((item) => ({
    ...item,
    id: `other-${item.id}`,
  }))), false);
});

// ---------------------------------------------------------------------------
// Replay
// ---------------------------------------------------------------------------

test("a save replays back into exactly the state it was taken from", () => {
  const items = makeItems(32);
  const original = playedState(items, 16, 9);
  const progress = serializeProgress(original, ID);

  const restored = restoreProgress(progress, ID, items, ENGINE);

  assert.notEqual(restored, null);
  assert.deepEqual(playableShape(restored), playableShape(original));
});

test("a save of a field with byes replays byes and all", () => {
  const items = makeItems(24);
  // Six picks: still inside the opening round, with the byes already standing
  // in the second round waiting for opponents.
  const original = playedState(items, 24, 6);
  const progress = serializeProgress(original, ID);

  assert.equal(progress.size, 24);
  assert.equal(progress.itemIds.length, 24);

  const restored = restoreProgress(progress, ID, items, ENGINE);
  assert.notEqual(restored, null);
  assert.deepEqual(playableShape(restored), playableShape(original));

  // Resuming after the opening round is the case byes can break: the second
  // round is part-filled before a single pick is made.
  const acrossBoundary = playedState(items, 24, 8);
  const resumed = restoreProgress(
    serializeProgress(acrossBoundary, ID),
    ID,
    items,
    ENGINE,
  );
  assert.deepEqual(playableShape(resumed), playableShape(acrossBoundary));
  assert.equal(resumed.currentRound, 1);
  assert.equal(resumed.currentMatchup, 0);

  // And it still finishes, ranking every one of the 24.
  let state = resumed;
  while (state.phase === "playing") {
    const matchup = state.rounds[state.currentRound].matchups[state.currentMatchup];
    assert.ok(matchup?.itemA && matchup?.itemB, "resumed bracket must not stall");
    state = bracketReducer(state, {
      type: "PICK_WINNER",
      winnerId: matchup.itemA.id,
    });
  }
  assert.equal(state.phase, "complete");
  assert.equal(new Set(state.ranking).size, 24);
});

test("saves written before byes existed still resume", () => {
  // Byte-for-byte what the previous release wrote: same version, a power-of-two
  // size, ids and picks. Rejecting these would drop every run in progress at
  // the moment the change ships.
  const items = makeItems(16);
  const legacy = {
    v: PROGRESS_VERSION,
    id: ID,
    size: 16,
    itemIds: items.map((item) => item.id),
    picks: ["item-0", "item-2", "item-4"],
    savedAt: 1000,
  };

  const parsed = parseProgress(JSON.stringify(legacy), ID, 2000);
  assert.deepEqual(parsed, legacy);

  const restored = restoreProgress(parsed, ID, items, ENGINE);
  assert.deepEqual(playableShape(restored), playableShape(playedState(items, 16, 3)));
});

test("a save taken across a round boundary resumes on the right matchup", () => {
  const items = makeItems(8);
  // Four picks completes round one, so the resume lands on the first semi.
  const original = playedState(items, 8, 4);
  const restored = restoreProgress(
    serializeProgress(original, ID),
    ID,
    items,
    ENGINE,
  );

  assert.equal(restored.currentRound, 1);
  assert.equal(restored.currentMatchup, 0);
  assert.equal(restored.rounds[1].matchups[0].itemA.id, "item-0");
  assert.equal(restored.rounds[1].matchups[0].itemB.id, "item-2");
});

test("a resumed run can still be played to a champion", () => {
  const items = makeItems(16);
  let state = restoreProgress(
    serializeProgress(playedState(items, 16, 11), ID),
    ID,
    items,
    ENGINE,
  );

  while (state.phase === "playing") {
    const matchup = state.rounds[state.currentRound].matchups[state.currentMatchup];
    assert.ok(matchup?.itemA && matchup?.itemB, "resumed bracket must not stall");
    state = bracketReducer(state, {
      type: "PICK_WINNER",
      winnerId: matchup.itemA.id,
    });
  }

  assert.equal(state.phase, "complete");
  assert.equal(state.ranking.length, 16);
  assert.equal(new Set(state.ranking).size, 16);
});

test("replay refuses a save that no longer describes a legal run", () => {
  const items = makeItems(8);
  const progress = serializeProgress(playedState(items, 8, 3), ID);

  // Belongs to another bracket.
  assert.equal(restoreProgress(progress, "movies/pixar", items, ENGINE), null);

  // References an entrant this bracket no longer has.
  const renamed = items.map((item, index) =>
    index === 3 ? { ...item, id: "renamed" } : item,
  );
  assert.equal(restoreProgress(progress, ID, renamed, ENGINE), null);

  // A pick that is not valid for the matchup it lands on.
  const tampered = { ...progress, picks: [...progress.picks.slice(0, 2), "item-7"] };
  assert.equal(restoreProgress(tampered, ID, items, ENGINE), null);

  assert.equal(restoreProgress(null, ID, items, ENGINE), null);
});

test("replay refuses a save the entrant pool can no longer fill", () => {
  const items = makeItems(16);
  const progress = serializeProgress(playedState(items, 16, 5), ID);

  // The bracket shrank below the saved size: seeding would clamp to 8 and the
  // saved run would no longer be the run that was being played.
  const shrunk = items.slice(0, 12);
  assert.equal(restoreProgress(progress, ID, shrunk, ENGINE), null);
});

// ---------------------------------------------------------------------------
// Starting fresh, and clearing what can never be resumed
// ---------------------------------------------------------------------------

test("a seeded run holds nothing to resume until the first pick", () => {
  const items = makeItems(8);

  assert.equal(hasResumableRun(playedState(items, 8, 0)), false);
  assert.equal(hasResumableRun(playedState(items, 8, 1)), true);
  assert.equal(hasResumableRun(createInitialState()), false);
  assert.equal(hasResumableRun(playedState(items, 8, 7)), false);
  assert.equal(hasResumableRun(null), false);
});

test("starting a fresh bracket clears the previous run rather than reviving it", () => {
  const items = makeItems(8);

  // The intro still has a save on offer, so it must survive.
  assert.equal(saveActionFor(createInitialState(), items), "keep");

  // The moment a new bracket is seeded the old run is abandoned. Nothing is
  // written back until the first pick, so without this the previous run would
  // still be sitting in storage to be offered again after a reload.
  assert.equal(saveActionFor(playedState(items, 8, 0), items), "clear");

  assert.equal(saveActionFor(playedState(items, 8, 3), items), "write");
  // Undoing back to no picks retires the save for the same reason.
  assert.equal(saveActionFor(playedState(items, 8, 0), items), "clear");
  // A finished run belongs to its results page.
  assert.equal(saveActionFor(playedState(items, 8, 7), items), "clear");
});

test("a run is never written under a bracket it does not belong to", () => {
  const state = playedState(makeItems(8), 8, 3);
  const otherBracket = makeItems(8).map((item) => ({
    ...item,
    id: `other-${item.id}`,
  }));

  assert.equal(saveActionFor(state, otherBracket), "keep");
  assert.equal(saveActionFor(state, undefined), "keep");
});

test("stored runs are classified so unusable ones can be cleaned up", () => {
  const items = makeItems(8);
  const progress = serializeProgress(playedState(items, 8, 3), ID, 1000);
  const raw = JSON.stringify(progress);

  // Nothing stored.
  assert.equal(classifySavedRun(null, ID, items, 1000).status, "none");
  assert.equal(classifySavedRun("", ID, items, 1000).status, "none");

  // A good save stays put, and carries its parsed form for the prompt.
  const usable = classifySavedRun(raw, ID, items, 1000);
  assert.equal(usable.status, "usable");
  assert.deepEqual(usable.progress, progress);

  const unusable = {
    malformed: ["{not json", ID, items, 1000],
    "the older whole-state format": [
      JSON.stringify({ version: 1, savedAt: 1000, state: playedState(items, 8, 3) }),
      ID,
      items,
      1000,
    ],
    expired: [raw, ID, items, 1000 + PROGRESS_TTL_MS + 1],
    "from another bracket": [raw, "movies/pixar", items, 1000],
    "referring to entrants that are gone": [
      raw,
      ID,
      items.map((item, index) => (index === 2 ? { ...item, id: "renamed" } : item)),
      1000,
    ],
  };

  for (const [label, args] of Object.entries(unusable)) {
    const result = classifySavedRun(...args);
    assert.equal(result.status, "unusable", `${label} should be unusable`);
    assert.equal(result.progress, null, `${label} should expose no progress`);
  }
});

test("classification without an entrant pool still catches unreadable saves", () => {
  const items = makeItems(8);
  const raw = JSON.stringify(serializeProgress(playedState(items, 8, 2), ID, 1000));

  // Structural problems do not need the pool to be spotted.
  assert.equal(classifySavedRun("{not json", ID, undefined, 1000).status, "unusable");
  // A structurally sound save is left alone when the pool is unknown, rather
  // than being thrown away on a check that cannot be made.
  assert.equal(classifySavedRun(raw, ID, undefined, 1000).status, "usable");
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

/** How the resume prompt turns a save into "you were in the Semifinals". */
function roundNameFor(progress) {
  const summary = summarizeProgress(progress);
  return getRoundName(
    progress.size,
    roundIndexForPick(progress.size, summary.completed),
  );
}

test("the resume prompt reports the round the next pick falls in", () => {
  const items = makeItems(8);
  const progressAfter = (picks) =>
    serializeProgress(playedState(items, 8, picks), ID);

  assert.deepEqual(
    { ...summarizeProgress(progressAfter(1)), savedAt: undefined },
    { completed: 1, total: 7, percentage: 14, savedAt: undefined },
  );
  assert.equal(roundNameFor(progressAfter(1)), "Quarterfinals");
  assert.equal(roundNameFor(progressAfter(4)), "Semifinals");
  assert.equal(roundNameFor(progressAfter(6)), "Championship");
  assert.equal(summarizeProgress(progressAfter(6)).percentage, 86);
});

test("the resume prompt reports rounds for a 64-entrant bracket", () => {
  const items = makeItems(64);
  const progress = serializeProgress(playedState(items, 64, 32), ID);
  const summary = summarizeProgress(progress);

  assert.equal(summary.completed, 32);
  assert.equal(summary.total, 63);
  assert.equal(roundNameFor(progress), "Round of 32");
});

test("the resume prompt reports rounds for a field with byes", () => {
  // 24 entrants: eight opening matchups, then an ordinary 16-slot bracket.
  const items = makeItems(24);
  const progressAfter = (picks) =>
    serializeProgress(playedState(items, 24, picks), ID);

  assert.equal(roundNameFor(progressAfter(1)), "Round of 24");
  assert.equal(roundNameFor(progressAfter(7)), "Round of 24");
  // The eighth pick finishes the opening round, so the next one is in the 16.
  assert.equal(roundNameFor(progressAfter(8)), "Round of 16");
  assert.equal(roundNameFor(progressAfter(16)), "Elite 8");
  assert.equal(roundNameFor(progressAfter(22)), "Championship");
  assert.equal(summarizeProgress(progressAfter(8)).total, 23);
});

test("the round walk agrees with the rounds the engine actually builds", () => {
  // Two independent descriptions of the same draw: the progress summary walks
  // matchup counts, the reducer builds real rounds. They must not drift.
  for (let fieldSize = 8; fieldSize <= 64; fieldSize++) {
    let state = bracketReducer(createInitialState(), {
      type: "SEED",
      items: makeItems(fieldSize),
      size: fieldSize,
      shuffleItems: false,
    });

    for (let pick = 0; pick < fieldSize - 1; pick++) {
      assert.equal(
        roundIndexForPick(fieldSize, pick),
        state.currentRound,
        `field ${fieldSize}: round for pick ${pick}`,
      );
      const matchup = state.rounds[state.currentRound].matchups[
        state.currentMatchup
      ];
      state = bracketReducer(state, {
        type: "PICK_WINNER",
        winnerId: matchup.itemA.id,
      });
    }
    assert.equal(state.phase, "complete");
  }
});
