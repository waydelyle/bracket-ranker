import type { Matchup } from "@/data/types";

export const MAX_BRACKET_SIZE = 64;
export const MAX_MATCHUPS = MAX_BRACKET_SIZE - 1;

/** Reconstructs a completed knockout, rejecting picks the game cannot make. */
function completedRanking(
  matchups: unknown,
  entrants: Set<string>,
): string[] | null {
  if (!Array.isArray(matchups)) return null;
  if (matchups.length < 7 || matchups.length > MAX_MATCHUPS) return null;

  // A completed knockout eliminates everyone but its champion. The UI offers
  // powers of two and the full pool (with byes), rather than arbitrary subsets.
  const fieldSize = matchups.length + 1;
  const fullSize = Math.min(entrants.size, MAX_BRACKET_SIZE);
  if (fieldSize > fullSize) return null;
  if (![8, 16, 32, 64, fullSize].includes(fieldSize)) return null;

  let slots = 8;
  while (slots < fieldSize) slots *= 2;
  const roundCounts = [fieldSize - slots / 2];
  for (let count = slots / 4; count >= 1; count /= 2) {
    roundCounts.push(count);
  }

  const participants = new Set<string>();
  const eliminated = new Set<string>();
  const losses: string[] = [];
  let index = 0;
  let champion: string | null = null;

  for (let round = 0; round < roundCounts.length; round++) {
    const played = new Set<string>();
    for (let pick = 0; pick < roundCounts[round]; pick++) {
      const matchup = matchups[index++];
      if (!matchup || typeof matchup !== "object") return null;
      const { itemA, itemB, winner } = matchup as Matchup;
      if (matchup.round !== round) return null;
      if (!entrants.has(itemA) || !entrants.has(itemB) || itemA === itemB) {
        return null;
      }
      if (winner !== itemA && winner !== itemB) return null;
      // An entrant plays once per round and never returns after losing.
      if (played.has(itemA) || played.has(itemB)) return null;
      if (eliminated.has(itemA) || eliminated.has(itemB)) return null;
      played.add(itemA);
      played.add(itemB);
      participants.add(itemA);
      participants.add(itemB);

      const loser = winner === itemA ? itemB : itemA;
      eliminated.add(loser);
      losses.push(loser);
      champion = winner;
    }
  }

  if (!champion || participants.size !== fieldSize) return null;
  return [champion, ...losses.reverse()];
}

/** True only for a completed, consistent tournament with the stated champion. */
export function areMatchupsValid(
  matchups: unknown,
  entrants: Set<string>,
  champion: unknown,
): matchups is Matchup[] {
  const ranking = completedRanking(matchups, entrants);
  return ranking !== null && ranking[0] === champion;
}

/** The game's final order must agree with its picks, including every entrant. */
export function isRankingValid(
  ranking: unknown,
  champion: unknown,
  entrants: Set<string>,
  matchups: unknown,
): ranking is string[] {
  if (!Array.isArray(ranking)) return false;
  const expected = completedRanking(matchups, entrants);
  return (
    expected !== null &&
    expected[0] === champion &&
    ranking.length === expected.length &&
    expected.every((id, index) => ranking[index] === id)
  );
}
