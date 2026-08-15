import type { BracketItem, Matchup } from '@/data/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BracketPhase = 'intro' | 'playing' | 'complete';

export interface Round {
  name: string; // "Round of 32", "Sweet 16", etc.
  matchups: RoundMatchup[];
  /**
   * Where each matchup's winner lands in the next round, as an index into that
   * round's entrant slots (slot `s` is side `s % 2` of matchup `s / 2`).
   *
   * Only the opening round needs it. A field that is not a power of two has
   * fewer opening matchups than slots, because the entrants holding a bye
   * occupy the rest, so winner *i* does not simply feed slot *i*.
   */
  advancesTo?: number[];
}

export interface RoundMatchup {
  itemA: BracketItem;
  itemB: BracketItem;
  winner?: BracketItem;
}

export interface BracketState {
  phase: BracketPhase;
  bracketSize: number;
  items: BracketItem[]; // All items selected for this bracket
  rounds: Round[];
  currentRound: number;
  currentMatchup: number;
  matchupHistory: Matchup[]; // For undo + result generation
  ranking: string[]; // Item IDs — ranking[0] = champion, last = first eliminated
  champion: string | null;
  totalMatchups: number; // Total matchups in the bracket
  completedMatchups: number; // Matchups completed so far
}

export type BracketAction =
  | {
      type: 'SEED';
      items: BracketItem[];
      size: number;
      /**
       * Draw order. Defaults to shuffling; pass `false` to seed the items
       * exactly as given, which is how a saved run is replayed back into
       * the same bracket it was playing.
       */
      shuffleItems?: boolean;
    }
  | { type: 'PICK_WINNER'; winnerId: string }
  | { type: 'UNDO' }
  | { type: 'RESET' }
  | { type: 'RESTORE'; state: BracketState };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Below this there are not enough entrants for a bracket worth playing. */
export const MIN_FIELD_SIZE = 8;

/** Above this a run is longer than anyone finishes. */
export const MAX_FIELD_SIZE = 64;

const ROUND_NAMES_BY_SIZE: Record<number, string[]> = {
  64: [
    'Round of 64',
    'Round of 32',
    'Sweet 16',
    'Elite 8',
    'Final Four',
    'Championship',
  ],
  32: ['Round of 32', 'Sweet 16', 'Elite 8', 'Final Four', 'Championship'],
  16: ['Round of 16', 'Elite 8', 'Final Four', 'Championship'],
  8: ['Quarterfinals', 'Semifinals', 'Championship'],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Fisher-Yates shuffle (returns a new array). */
function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/** Knockout tree a field of this size is drawn into, and how deep it runs. */
function treeFor(fieldSize: number): { slots: number; rounds: number } {
  if (!Number.isInteger(fieldSize) || fieldSize < 2) {
    return { slots: 1, rounds: 0 };
  }
  let slots = 1;
  let rounds = 0;
  while (slots < fieldSize) {
    slots *= 2;
    rounds += 1;
  }
  return { slots, rounds };
}

/**
 * Slots in the knockout tree a field of `fieldSize` entrants is drawn into:
 * `fieldSize` rounded up to a power of two. The difference is the byes.
 */
export function bracketSlots(fieldSize: number): number {
  return treeFor(fieldSize).slots;
}

/** How many entrants start the bracket without an opening-round matchup. */
export function byeCount(fieldSize: number): number {
  const { slots } = treeFor(fieldSize);
  return slots > 1 ? slots - fieldSize : 0;
}

/** How many rounds a field of this size plays. */
export function roundCount(fieldSize: number): number {
  return treeFor(fieldSize).rounds;
}

/**
 * Matchups in each round, opening round first.
 *
 * The opening round is the only irregular one: with byes it holds just the
 * entrants that have to play in, so it is smaller than half the field.
 */
export function matchupsPerRound(fieldSize: number): number[] {
  const { slots, rounds } = treeFor(fieldSize);
  if (rounds < 1) return [];

  const counts = [fieldSize - slots / 2];
  for (let round = 1; round < rounds; round++) {
    counts.push(slots / Math.pow(2, round + 1));
  }
  return counts;
}

/** Which round the next pick falls in, after `completedPicks` picks. */
export function roundIndexForPick(
  fieldSize: number,
  completedPicks: number,
): number {
  const counts = matchupsPerRound(fieldSize);
  if (counts.length === 0) return 0;

  let remaining = Math.max(0, completedPicks);
  for (let round = 0; round < counts.length; round++) {
    if (remaining < counts[round]) return round;
    remaining -= counts[round];
  }
  // Every matchup is done; the last pick belonged to the final round.
  return counts.length - 1;
}

/**
 * Field sizes `itemCount` entrants can play, ascending.
 *
 * The powers of two are the short runs. The pool's own size is offered
 * alongside them whenever it is not one — a 24-entrant bracket used to be
 * capped at 16, which meant a third of the field was dropped from the draw at
 * random and never appeared in the ranking at all.
 */
export function fieldSizeOptions(itemCount: number): number[] {
  const full = Math.min(Math.floor(itemCount) || 0, MAX_FIELD_SIZE);
  if (full < MIN_FIELD_SIZE) return [];

  const sizes = [8, 16, 32, 64].filter((size) => size <= full);
  if (!sizes.includes(full)) sizes.push(full);
  return sizes;
}

/**
 * The field a request for `requested` slots actually plays, or 0 when the pool
 * is too small for a bracket. Falls back to the largest playable field that is
 * no larger than what was asked for.
 */
export function resolveFieldSize(requested: number, itemCount: number): number {
  const options = fieldSizeOptions(itemCount);
  if (options.length === 0) return 0;
  if (options.includes(requested)) return requested;

  const smaller = options.filter((size) => size <= requested);
  return smaller.length > 0 ? smaller[smaller.length - 1] : options[0];
}

/** Returns the display name for a given round in a field of the given size. */
export function getRoundName(fieldSize: number, roundIndex: number): string {
  const fallback = `Round ${roundIndex + 1}`;
  if (roundIndex < 0) return fallback;

  const names = ROUND_NAMES_BY_SIZE[fieldSize];
  if (names) return names[roundIndex] ?? fallback;

  // A field that is not a power of two opens with a partial round: the
  // entrants without a bye play in, and from there it is an ordinary bracket
  // of half the tree's slots.
  const { slots, rounds } = treeFor(fieldSize);
  if (rounds > 0 && slots !== fieldSize) {
    if (roundIndex === 0) return `Round of ${fieldSize}`;
    return ROUND_NAMES_BY_SIZE[slots / 2]?.[roundIndex - 1] ?? fallback;
  }

  return fallback;
}

export interface RankingStage {
  /** How far this group of entrants got, e.g. "Eliminated in the Sweet 16". */
  label: string;
  /** First index in `ranking` belonging to this stage. */
  start: number;
  /** Number of entrants in this stage. */
  count: number;
}

/**
 * How the final ranking breaks down by how far each entrant actually got.
 *
 * A knockout bracket only ever compares an entrant with the ones it faced, so
 * the order inside a group of same-round losers is the order their matchups
 * happened to be drawn in — not a preference. Presenting all 32 positions as a
 * strict 1-to-32 ranking claims 24 comparisons that were never made, so the
 * results are grouped by elimination round instead.
 */
export function rankingStages(fieldSize: number): RankingStage[] {
  const counts = matchupsPerRound(fieldSize);
  if (counts.length === 0) return [];

  const stages: RankingStage[] = [{ label: "Champion", start: 0, count: 1 }];

  // One entrant goes out per matchup, so a round's matchup count is also the
  // number of entrants it eliminates. Losers of the last round sit closest to
  // the champion: the final's loser is second, the previous round's two losers
  // are third and fourth, and so on.
  let start = 1;
  for (let round = counts.length - 1; round >= 0; round--) {
    const count = counts[round];
    if (count <= 0) continue;

    stages.push({
      label:
        round === counts.length - 1
          ? "Runner-up"
          : `Eliminated in the ${getRoundName(fieldSize, round)}`,
      start,
      count,
    });
    start += count;
  }

  return stages;
}

/** Returns progress through the bracket. */
export function getProgress(state: BracketState): {
  current: number;
  total: number;
  percentage: number;
} {
  const total = state.totalMatchups;
  const current = state.completedMatchups;
  return {
    current,
    total,
    percentage: total === 0 ? 0 : Math.round((current / total) * 100),
  };
}

/** Returns a fresh initial state (phase = 'intro'). */
export function createInitialState(): BracketState {
  return {
    phase: 'intro',
    bracketSize: 0,
    items: [],
    rounds: [],
    currentRound: 0,
    currentMatchup: 0,
    matchupHistory: [],
    ranking: [],
    champion: null,
    totalMatchups: 0,
    completedMatchups: 0,
  };
}

// ---------------------------------------------------------------------------
// Internal helpers for SEED
// ---------------------------------------------------------------------------

/** Calculates total number of matchups in a single-elimination bracket. */
function totalMatchupsForSize(size: number): number {
  // In a single-elimination bracket, every participant except the champion
  // loses exactly once, so total matchups = size - 1.
  return size - 1;
}

/** A slot nobody has reached yet. */
function emptyMatchup(): RoundMatchup {
  return {
    itemA: null as unknown as BracketItem,
    itemB: null as unknown as BracketItem,
  };
}

/**
 * Which opening-round slots hold a bye, spread as evenly as the tree allows.
 *
 * Handing byes out in slot order would pile them all into one corner: in a
 * 24-entrant field the first eight entrants would reach the Round of 16
 * untouched while the rest of the draw played a full round. Slots are taken in
 * bit-reversed order instead — the standard way to spread a prefix across a
 * binary tree — so every half, quarter and eighth of the draw ends up with the
 * same number of byes, give or take one.
 */
function byeSlots(slotCount: number, byes: number): Set<number> {
  const slots = new Set<number>();
  if (byes <= 0) return slots;

  let bits = 0;
  while (1 << bits < slotCount) bits += 1; // shift binds tighter than compare

  for (let index = 0; index < slotCount && slots.size < byes; index++) {
    let reversed = 0;
    for (let bit = 0; bit < bits; bit++) {
      reversed = (reversed << 1) | ((index >> bit) & 1);
    }
    slots.add(reversed);
  }

  return slots;
}

/**
 * Builds the full round structure for a field of `items`.
 *
 * The opening round holds only the entrants that have to play in; everyone on
 * a bye is placed straight into the second round, which is therefore already
 * part-filled when the bracket starts.
 */
function buildRounds(items: BracketItem[]): Round[] {
  const fieldSize = items.length;
  const { slots, rounds: numRounds } = treeFor(fieldSize);
  const openingSlots = slots / 2;
  const byes = byeSlots(openingSlots, slots - fieldSize);

  const opening: RoundMatchup[] = [];
  const advancesTo: number[] = [];
  const seeded: (BracketItem | null)[] = Array.from(
    { length: openingSlots },
    () => null,
  );

  let next = 0;
  for (let slot = 0; slot < openingSlots; slot++) {
    if (byes.has(slot)) {
      seeded[slot] = items[next++];
      continue;
    }
    advancesTo.push(slot);
    opening.push({ itemA: items[next++], itemB: items[next++] });
  }

  const rounds: Round[] = [
    { name: getRoundName(fieldSize, 0), matchups: opening, advancesTo },
  ];

  for (let r = 1; r < numRounds; r++) {
    const matchupCount = slots / Math.pow(2, r + 1);
    const matchups: RoundMatchup[] = Array.from(
      { length: matchupCount },
      (_, index) => {
        if (r > 1) return emptyMatchup();
        // Second round — byes are already standing in their slots, and the
        // remaining sides fill in as the opening round is played.
        return {
          itemA: seeded[index * 2] as BracketItem,
          itemB: seeded[index * 2 + 1] as BracketItem,
        };
      },
    );
    rounds.push({ name: getRoundName(fieldSize, r), matchups });
  }

  return rounds;
}

// ---------------------------------------------------------------------------
// Internal helpers for PICK_WINNER
// ---------------------------------------------------------------------------

/** A rounds array that can be edited without touching the previous state. */
function copyRounds(rounds: Round[]): Round[] {
  return rounds.map((round) => ({
    ...round,
    matchups: round.matchups.map((matchup) => ({ ...matchup })),
  }));
}

/**
 * Walks each matchup of a round to the entrant slot its winner takes in the
 * next round. Byes make the opening round's mapping non-trivial, so it is
 * carried on the round itself.
 */
function forEachAdvance(
  rounds: Round[],
  roundIdx: number,
  visit: (target: RoundMatchup, side: "itemA" | "itemB", from: RoundMatchup) => void,
): void {
  const round = rounds[roundIdx];
  const nextRound = rounds[roundIdx + 1];
  if (!round || !nextRound) return;

  round.matchups.forEach((matchup, index) => {
    const slot = round.advancesTo ? round.advancesTo[index] : index;
    const target = nextRound.matchups[Math.floor(slot / 2)];
    if (!target) return;
    visit(target, slot % 2 === 0 ? "itemA" : "itemB", matchup);
  });
}

/** Populate the next round's matchups from the current round's winners. */
function populateNextRound(rounds: Round[], currentRoundIdx: number): Round[] {
  const updatedRounds = copyRounds(rounds);

  forEachAdvance(updatedRounds, currentRoundIdx, (target, side, from) => {
    if (from.winner) target[side] = from.winner;
  });

  return updatedRounds;
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function bracketReducer(
  state: BracketState,
  action: BracketAction
): BracketState {
  switch (action.type) {
    case 'SEED': {
      const { items, size, shuffleItems = true } = action;
      if (!Array.isArray(items)) return state;

      // Never seed a field the item pool cannot fill: the missing entrants
      // would leave matchups that nobody can play and the bracket could never
      // finish. A field the pool fills only partly is fine — the gap becomes
      // first-round byes.
      const bracketSize = resolveFieldSize(size, items.length);
      if (bracketSize === 0) return state;

      // Shuffle and pick the required number of items.
      const ordered = shuffleItems ? shuffle(items) : items;
      const selected = ordered.slice(0, bracketSize);

      const rounds = buildRounds(selected);

      return {
        phase: 'playing',
        bracketSize,
        items: selected,
        rounds,
        currentRound: 0,
        currentMatchup: 0,
        matchupHistory: [],
        ranking: [],
        champion: null,
        totalMatchups: totalMatchupsForSize(bracketSize),
        completedMatchups: 0,
      };
    }

    case 'PICK_WINNER': {
      if (state.phase !== 'playing') return state;

      const { winnerId } = action;
      const { currentRound, currentMatchup, rounds } = state;

      const round = rounds[currentRound];
      const matchup = round?.matchups[currentMatchup];

      // Validate that the winner is one of the two items in this matchup.
      if (!matchup?.itemA || !matchup.itemB) return state;
      if (matchup.itemA.id !== winnerId && matchup.itemB.id !== winnerId) {
        return state;
      }

      const winner =
        matchup.itemA.id === winnerId ? matchup.itemA : matchup.itemB;
      const loser =
        matchup.itemA.id === winnerId ? matchup.itemB : matchup.itemA;

      // Deep-copy rounds and record the winner on the current matchup.
      let updatedRounds = copyRounds(rounds);
      updatedRounds[currentRound].matchups[currentMatchup] = {
        ...matchup,
        winner,
      };

      // Record in matchup history.
      const historyEntry: Matchup = {
        round: currentRound,
        itemA: matchup.itemA.id,
        itemB: matchup.itemB.id,
        winner: winnerId,
      };
      const newHistory = [...state.matchupHistory, historyEntry];

      // Loser is added to the front of ranking (first eliminated = last in final ranking).
      const newRanking = [loser.id, ...state.ranking];

      const completedMatchups = state.completedMatchups + 1;

      const isLastMatchupInRound = currentMatchup === round.matchups.length - 1;
      const isLastRound = currentRound === rounds.length - 1;

      // Final matchup of the entire bracket — we have a champion.
      if (isLastMatchupInRound && isLastRound) {
        // Champion goes to front of ranking.
        const finalRanking = [winner.id, ...newRanking];
        return {
          ...state,
          phase: 'complete',
          rounds: updatedRounds,
          matchupHistory: newHistory,
          ranking: finalRanking,
          champion: winner.id,
          completedMatchups,
        };
      }

      // Move to next matchup or next round.
      if (isLastMatchupInRound) {
        // Advance to next round — populate its matchups from current round winners.
        updatedRounds = populateNextRound(updatedRounds, currentRound);
        return {
          ...state,
          rounds: updatedRounds,
          currentRound: currentRound + 1,
          currentMatchup: 0,
          matchupHistory: newHistory,
          ranking: newRanking,
          completedMatchups,
        };
      }

      // Advance to next matchup within the same round.
      return {
        ...state,
        rounds: updatedRounds,
        currentMatchup: currentMatchup + 1,
        matchupHistory: newHistory,
        ranking: newRanking,
        completedMatchups,
      };
    }

    case 'UNDO': {
      if (state.matchupHistory.length === 0) return state;

      // Pop the last matchup from history.
      const newHistory = state.matchupHistory.slice(0, -1);
      const lastEntry = state.matchupHistory[state.matchupHistory.length - 1];

      // Deep-copy rounds.
      const updatedRounds = copyRounds(state.rounds);

      const wasComplete = state.phase === 'complete';

      // Determine where we need to go back to.
      const prevRound = lastEntry.round;
      const prevRoundMatchups = updatedRounds[prevRound].matchups;

      // Find which matchup in that round this was. It's the last matchup
      // that has a winner matching this history entry.
      let prevMatchupIdx = -1;
      for (let i = 0; i < prevRoundMatchups.length; i++) {
        const m = prevRoundMatchups[i];
        if (
          m.winner &&
          m.itemA.id === lastEntry.itemA &&
          m.itemB.id === lastEntry.itemB &&
          m.winner.id === lastEntry.winner
        ) {
          prevMatchupIdx = i;
        }
      }

      if (prevMatchupIdx === -1) return state; // Safety check — should never happen.

      // Clear the winner from that matchup.
      updatedRounds[prevRound].matchups[prevMatchupIdx] = {
        itemA: updatedRounds[prevRound].matchups[prevMatchupIdx].itemA,
        itemB: updatedRounds[prevRound].matchups[prevMatchupIdx].itemB,
      };

      // If undoing across a round boundary, take back the advances the round
      // just made. Only the slots its winners filled are cleared: entrants
      // standing in the next round on a bye never played for their place and
      // must keep it.
      if (prevRound < state.currentRound || wasComplete) {
        forEachAdvance(updatedRounds, prevRound, (target, side) => {
          target[side] = null as unknown as BracketItem;
        });
      }

      // Remove the loser (or champion) from ranking.
      let newRanking: string[];
      if (wasComplete) {
        // If the bracket was complete, the ranking has champion at [0] and loser at [1].
        // Remove both — the champion and the loser from the final matchup.
        newRanking = state.ranking.slice(2);
      } else {
        // Normal case — remove the loser that was at the front of ranking.
        newRanking = state.ranking.slice(1);
      }

      return {
        ...state,
        phase: 'playing',
        rounds: updatedRounds,
        currentRound: prevRound,
        currentMatchup: prevMatchupIdx,
        matchupHistory: newHistory,
        ranking: newRanking,
        champion: null,
        completedMatchups: state.completedMatchups - 1,
      };
    }

    case 'RESTORE': {
      // Only an in-progress bracket is worth restoring. A restored 'complete'
      // state would re-fire the save effect and duplicate the result and votes.
      if (action.state.phase !== 'playing') return state;
      return action.state;
    }

    case 'RESET': {
      return createInitialState();
    }

    default:
      return state;
  }
}
