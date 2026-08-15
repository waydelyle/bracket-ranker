/**
 * Final standings for a played bracket.
 *
 * A single-elimination bracket is a weak ranking instrument. It settles the
 * champion beyond doubt, and the runner-up nearly as well, and past that it
 * settles very little: the two semi-final losers never played each other, and
 * neither did the four before them. Printing 1, 2, 3, 4 … down the whole field
 * claims comparisons the bracket never made.
 *
 * Worse, the order those never-compared entrants came out in is not neutral.
 * The engine pushes each loser onto the front of `ranking` as it happens, so
 * within a round the loser of the *last* matchup finishes above the loser of
 * the first. In a 16-entrant field played by always taking the left-hand side,
 * the bottom eight land in the exact order i15, i13, i11, i9, i7, i5, i3, i1 —
 * their positions are their draw slots in reverse and nothing else. The draw is
 * shuffled, so that is a coin toss deciding who is "9th" and who is "16th".
 *
 * So positions here are shared rather than invented. Entrants are grouped by
 * the one thing the bracket really measured — how many matchups each of them
 * won — and everyone in a group holds the same position.
 *
 * Wins are used rather than the round an entrant went out in because byes make
 * those two disagree. In a 24-entrant field, eight entrants start in the second
 * round without playing; one of them that then loses has won nothing, yet it
 * went out a round later than an entrant that played its opening matchup and
 * lost. Grouping by round would rank the free pass above the entrant that
 * actually turned up. Grouping by wins puts them level, which is what their
 * records say.
 *
 * Plain ESM, like `serialization.mjs` and `bracket-progress.mjs`, so
 * `node --test` can exercise it without a TypeScript step. Round *names* are
 * deliberately not resolved here — that needs the engine's knowledge of how a
 * field divides into rounds, so the round index is handed back instead and the
 * caller names it.
 */

/**
 * @typedef {object} Standing
 * @property {string} id           Entrant id.
 * @property {number} position     Shared 1-based position; equal for tied entrants.
 * @property {number} count        How many entrants share that position.
 * @property {boolean} tied        `count > 1` — the bracket did not separate them.
 * @property {number} wins         Matchups this entrant won.
 * @property {number|null} eliminatedInRound
 *   Round index of the matchup it lost, or null for the champion (and for any
 *   entrant whose loss is missing from the history).
 */

/** Wins per entrant id, from the matchups actually played. */
function winsByEntrant(matchups) {
  const wins = new Map();
  if (!Array.isArray(matchups)) return wins;

  for (const matchup of matchups) {
    if (!matchup || typeof matchup !== "object") continue;
    const { winner } = matchup;
    if (typeof winner !== "string" || !winner) continue;
    wins.set(winner, (wins.get(winner) ?? 0) + 1);
  }
  return wins;
}

/** Round index each entrant was knocked out in, from the matchups played. */
function exitRoundByEntrant(matchups) {
  const exits = new Map();
  if (!Array.isArray(matchups)) return exits;

  for (const matchup of matchups) {
    if (!matchup || typeof matchup !== "object") continue;
    const { itemA, itemB, winner, round } = matchup;
    const loser = winner === itemA ? itemB : winner === itemB ? itemA : null;
    if (typeof loser !== "string" || !loser) continue;
    exits.set(loser, Number.isInteger(round) ? round : null);
  }
  return exits;
}

/**
 * Standings for `ranking`, in the order they should be shown.
 *
 * Entrants are reordered by wins, high to low, keeping the stored order inside
 * a group so a result renders the same way every time it is opened. The stored
 * `ranking` array is left alone: it is the saved format, it is validated
 * server-side, and it already holds every entrant exactly once.
 *
 * Without a usable matchup history nothing can be grouped, so every entrant is
 * returned at its own position — the same list the caller passed in, just
 * annotated. That path only runs for a result saved without its matchups.
 *
 * @param {string[]} ranking Entrant ids, champion first.
 * @param {Array<{round?: number, itemA?: string, itemB?: string, winner?: string}> | undefined} [matchups]
 * @returns {Standing[]}
 */
export function bracketStandings(ranking, matchups) {
  if (!Array.isArray(ranking) || ranking.length === 0) return [];

  const ids = ranking.filter((id) => typeof id === "string" && id);
  const wins = winsByEntrant(matchups);
  const exits = exitRoundByEntrant(matchups);

  // No history to group by — hand back the order as given, everyone alone.
  if (wins.size === 0) {
    return ids.map((id, index) => ({
      id,
      position: index + 1,
      count: 1,
      tied: false,
      wins: 0,
      eliminatedInRound: null,
    }));
  }

  // Stable: `sort` is stable in every engine this runs on, so entrants on the
  // same record keep the order the run recorded them in.
  const ordered = [...ids].sort(
    (a, b) => (wins.get(b) ?? 0) - (wins.get(a) ?? 0),
  );

  const standings = [];
  let index = 0;
  while (index < ordered.length) {
    const record = wins.get(ordered[index]) ?? 0;

    let end = index;
    while (end < ordered.length && (wins.get(ordered[end]) ?? 0) === record) {
      end += 1;
    }

    const position = index + 1;
    const count = end - index;

    for (let at = index; at < end; at++) {
      const id = ordered[at];
      standings.push({
        id,
        position,
        count,
        tied: count > 1,
        wins: record,
        eliminatedInRound: exits.has(id) ? exits.get(id) : null,
      });
    }

    index = end;
  }

  return standings;
}

/** "1st", "2nd", "3rd", "11th", "21st" — plain English ordinals. */
export function ordinal(position) {
  if (!Number.isInteger(position) || position < 1) return String(position);

  const lastTwo = position % 100;
  if (lastTwo >= 11 && lastTwo <= 13) return `${position}th`;

  switch (position % 10) {
    case 1:
      return `${position}st`;
    case 2:
      return `${position}nd`;
    case 3:
      return `${position}rd`;
    default:
      return `${position}th`;
  }
}

/**
 * How a shared position reads: "3rd" alone, "3rd–4th" when it is shared.
 *
 * `separator` is there for the share image, whose font is not guaranteed to
 * carry an en dash.
 */
export function formatPosition(position, count, separator = "–") {
  if (!Number.isInteger(count) || count <= 1) return ordinal(position);
  return `${ordinal(position)}${separator}${ordinal(position + count - 1)}`;
}

/**
 * The round a whole group went out in, or null when its members did not share
 * one — which byes make possible, and which is exactly when a round name would
 * be a lie.
 */
export function sharedExitRound(group) {
  if (!Array.isArray(group) || group.length === 0) return null;

  const first = group[0].eliminatedInRound;
  if (first === null || first === undefined) return null;

  return group.every((entry) => entry.eliminatedInRound === first)
    ? first
    : null;
}

/** Splits standings into their shared-position groups, in display order. */
export function groupStandings(standings) {
  const groups = [];
  let current = null;

  for (const entry of standings) {
    if (!current || current[0].position !== entry.position) {
      current = [];
      groups.push(current);
    }
    current.push(entry);
  }

  return groups;
}
