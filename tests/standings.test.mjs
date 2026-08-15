import assert from "node:assert/strict";
import test from "node:test";

import {
  bracketStandings,
  formatPosition,
  groupStandings,
  ordinal,
  sharedExitRound,
} from "../src/lib/standings.mjs";

// Loaded through Node's type stripping; the engine has no runtime imports.
import {
  bracketReducer,
  createInitialState,
  getRoundName,
} from "../src/lib/bracket-engine.ts";

function makeItems(count) {
  return Array.from({ length: count }, (_, index) => ({
    id: `i${index}`,
    name: `Item ${index}`,
  }));
}

/**
 * Plays a whole bracket without shuffling the draw, taking whichever side
 * `choose` returns. Both the ranking and the matchups come back, because the
 * matchups are what the standings are actually derived from.
 */
function play(fieldSize, choose = (matchup) => matchup.itemA) {
  let state = bracketReducer(createInitialState(), {
    type: "SEED",
    items: makeItems(fieldSize),
    size: fieldSize,
    shuffleItems: false,
  });

  for (let guard = 0; guard < 200 && state.phase === "playing"; guard++) {
    const matchup =
      state.rounds[state.currentRound].matchups[state.currentMatchup];
    state = bracketReducer(state, {
      type: "PICK_WINNER",
      winnerId: choose(matchup).id,
    });
  }

  assert.equal(state.phase, "complete", `a ${fieldSize} field did not finish`);
  return state;
}

test("ordinals read the way people write them", () => {
  assert.equal(ordinal(1), "1st");
  assert.equal(ordinal(2), "2nd");
  assert.equal(ordinal(3), "3rd");
  assert.equal(ordinal(4), "4th");
  assert.equal(ordinal(11), "11th");
  assert.equal(ordinal(12), "12th");
  assert.equal(ordinal(13), "13th");
  assert.equal(ordinal(21), "21st");
  assert.equal(ordinal(22), "22nd");
  assert.equal(ordinal(23), "23rd");
  assert.equal(ordinal(64), "64th");
});

test("a shared position reads as a range", () => {
  assert.equal(formatPosition(1, 1), "1st");
  assert.equal(formatPosition(3, 2), "3rd–4th");
  assert.equal(formatPosition(5, 4), "5th–8th");
  assert.equal(formatPosition(9, 8), "9th–16th");
  assert.equal(formatPosition(3, 2, "-"), "3rd-4th");
});

test("entrants the bracket never separated hold the same position", () => {
  const { ranking, matchupHistory } = play(16);
  const standings = bracketStandings(ranking, matchupHistory);

  assert.equal(standings.length, 16);
  assert.deepEqual(
    standings.map((entry) => entry.position),
    [1, 2, 3, 3, 5, 5, 5, 5, 9, 9, 9, 9, 9, 9, 9, 9],
  );
  assert.deepEqual(
    standings.map((entry) => entry.wins),
    [4, 3, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
  );

  // Champion and runner-up are the two the bracket really did establish.
  assert.equal(standings[0].tied, false);
  assert.equal(standings[1].tied, false);
  assert.equal(standings[2].tied, true);
});

test("a position is no longer decided by where the draw put an entrant", () => {
  const { ranking, matchupHistory } = play(16);

  // Every entrant knocked out in the opening round has the same record: no
  // wins, and no matchup against any of the others. The stored ranking still
  // has to list them in some order, and that order is their draw slots in
  // reverse — the loser of the last matchup played sits eight places above the
  // loser of the first.
  const firstOut = ranking.slice(8);
  assert.deepEqual(firstOut, [
    "i15", "i13", "i11", "i9", "i7", "i5", "i3", "i1",
  ]);

  // Read as positions, that is a fabricated 9th through 16th. The standings
  // give all eight the same position instead.
  const standings = bracketStandings(ranking, matchupHistory);
  const positions = new Set(
    standings.filter((entry) => entry.wins === 0).map((entry) => entry.position),
  );
  assert.deepEqual([...positions], [9]);
});

test("the same result produces the same standings every time it is opened", () => {
  const { ranking, matchupHistory } = play(32);

  assert.deepEqual(
    bracketStandings(ranking, matchupHistory),
    bracketStandings(ranking, matchupHistory),
  );
  // Order inside a shared position follows the stored ranking, so a result
  // does not shuffle itself between page loads.
  assert.deepEqual(
    bracketStandings(ranking, matchupHistory).map((entry) => entry.id),
    bracketStandings([...ranking], [...matchupHistory]).map((entry) => entry.id),
  );
});

test("a bye does not buy a better position than an entrant that played", () => {
  // 24 entrants draw into a 32-slot tree, so eight of them start in the second
  // round without playing. Grouping by the round an entrant went out in ranks
  // one of those — which has won nothing — above an entrant that played its
  // opening matchup and lost, also having won nothing.
  const { ranking, matchupHistory } = play(24, (matchup) => matchup.itemB);
  const standings = bracketStandings(ranking, matchupHistory);

  assert.equal(standings.length, 24);

  const winless = standings.filter((entry) => entry.wins === 0);
  assert.ok(winless.length > 8, `only ${winless.length} winless entrants`);

  // Every one of them shares a single position, whether it played and lost or
  // stood in the second round and lost.
  assert.deepEqual([...new Set(winless.map((entry) => entry.position))], [
    standings.length - winless.length + 1,
  ]);

  // And some of them really did go out in different rounds, which is exactly
  // the case a round-based grouping gets wrong.
  const exits = new Set(winless.map((entry) => entry.eliminatedInRound));
  assert.ok(exits.size > 1, `all winless entrants left in round ${[...exits]}`);
});

test("positions run 1..fieldSize with no gaps and no invented places", () => {
  for (const size of [8, 12, 16, 24, 32, 64]) {
    const { ranking, matchupHistory } = play(size);
    const standings = bracketStandings(ranking, matchupHistory);

    assert.equal(standings.length, size, `size ${size}`);
    assert.equal(
      new Set(standings.map((entry) => entry.id)).size,
      size,
      `size ${size} lost or duplicated an entrant`,
    );

    // A shared position starts where the entrants above it end: position N is
    // held by exactly `count` entrants, and the next group starts at N + count.
    let expected = 1;
    for (const group of groupStandings(standings)) {
      assert.equal(group[0].position, expected, `size ${size}`);
      assert.equal(group.length, group[0].count, `size ${size}`);
      expected += group.length;
    }
    assert.equal(expected - 1, size, `size ${size}`);

    // The champion is alone at the top and is the entrant that won the most.
    assert.equal(standings[0].position, 1);
    assert.equal(standings[0].count, 1);
    assert.equal(standings[0].id, ranking[0]);
  }
});

test("a group that left in one round can be named after it", () => {
  const { ranking, matchupHistory } = play(16);
  const groups = groupStandings(bracketStandings(ranking, matchupHistory));

  // A power-of-two field has no byes, so every shared position is also a round.
  const named = groups.map((group) => {
    const round = sharedExitRound(group);
    return round === null ? null : getRoundName(16, round);
  });

  assert.deepEqual(named, [null, "Championship", "Final Four", "Elite 8", "Round of 16"]);
});

test("a group whose members left in different rounds is not named after one", () => {
  const { ranking, matchupHistory } = play(24, (matchup) => matchup.itemB);
  const groups = groupStandings(bracketStandings(ranking, matchupHistory));

  const winless = groups[groups.length - 1];
  assert.ok(winless.every((entry) => entry.wins === 0));
  assert.equal(sharedExitRound(winless), null);
});

test("a result saved without its matchups claims nothing it cannot show", () => {
  const standings = bracketStandings(["a", "b", "c"], undefined);

  assert.deepEqual(
    standings.map((entry) => [entry.position, entry.tied]),
    [
      [1, false],
      [2, false],
      [3, false],
    ],
  );
});

test("standings survive a ranking or history that is not what it should be", () => {
  assert.deepEqual(bracketStandings(null, []), []);
  assert.deepEqual(bracketStandings([], []), []);
  assert.deepEqual(bracketStandings(["a"], "nonsense"), [
    { id: "a", position: 1, count: 1, tied: false, wins: 0, eliminatedInRound: null },
  ]);
  assert.deepEqual(
    bracketStandings(["a", 7, null, "b"], [{ itemA: "a", itemB: "b", winner: "a", round: 0 }]).map(
      (entry) => entry.id,
    ),
    ["a", "b"],
  );
  assert.doesNotThrow(() =>
    bracketStandings(["a", "b"], [null, 5, {}, { winner: 42 }, { winner: "a" }]),
  );
  assert.deepEqual(groupStandings([]), []);
  assert.equal(sharedExitRound([]), null);
  assert.equal(sharedExitRound(null), null);
});
