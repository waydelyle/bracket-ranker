import type { BracketItem, Matchup } from '@/data/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BracketPhase = 'intro' | 'playing' | 'complete';

export interface Round {
  name: string; // "Round of 32", "Sweet 16", etc.
  matchups: RoundMatchup[];
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
  | { type: 'SEED'; items: BracketItem[]; size: number }
  | { type: 'PICK_WINNER'; winnerId: string }
  | { type: 'UNDO' }
  | { type: 'RESET' };

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

/** Returns the display name for a given round in a bracket of the given size. */
export function getRoundName(bracketSize: number, roundIndex: number): string {
  const names = ROUND_NAMES_BY_SIZE[bracketSize];
  if (!names || roundIndex < 0 || roundIndex >= names.length) {
    return `Round ${roundIndex + 1}`;
  }
  return names[roundIndex];
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

/** How many rounds are needed for a bracket of the given size. */
function roundCount(size: number): number {
  return Math.log2(size);
}

/** Build the full round structure. Only the first round has populated matchups. */
function buildRounds(
  items: BracketItem[],
  bracketSize: number
): Round[] {
  const numRounds = roundCount(bracketSize);
  const rounds: Round[] = [];

  for (let r = 0; r < numRounds; r++) {
    const matchupCount = bracketSize / Math.pow(2, r + 1);
    const name = getRoundName(bracketSize, r);

    if (r === 0) {
      // First round — pair items sequentially.
      const matchups: RoundMatchup[] = [];
      for (let i = 0; i < items.length; i += 2) {
        matchups.push({ itemA: items[i], itemB: items[i + 1] });
      }
      rounds.push({ name, matchups });
    } else {
      // Later rounds — create placeholder matchups with empty items.
      // These will be populated as winners advance.
      const placeholders: RoundMatchup[] = Array.from(
        { length: matchupCount },
        () => ({
          itemA: null as unknown as BracketItem,
          itemB: null as unknown as BracketItem,
        })
      );
      rounds.push({ name, matchups: placeholders });
    }
  }

  return rounds;
}

// ---------------------------------------------------------------------------
// Internal helpers for PICK_WINNER
// ---------------------------------------------------------------------------

/** Populate the next round's matchups from the current round's winners. */
function populateNextRound(rounds: Round[], currentRoundIdx: number): Round[] {
  const updatedRounds = rounds.map((r) => ({
    ...r,
    matchups: r.matchups.map((m) => ({ ...m })),
  }));

  const currentRound = updatedRounds[currentRoundIdx];
  const nextRound = updatedRounds[currentRoundIdx + 1];

  if (!nextRound) return updatedRounds;

  const winners = currentRound.matchups.map((m) => m.winner!);

  for (let i = 0; i < winners.length; i += 2) {
    const matchupIdx = i / 2;
    nextRound.matchups[matchupIdx] = {
      itemA: winners[i],
      itemB: winners[i + 1],
    };
  }

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
      const { items, size } = action;
      const validSizes = [8, 16, 32, 64];
      const bracketSize = validSizes.includes(size) ? size : 8;

      // Shuffle and pick the required number of items.
      const shuffled = shuffle(items);
      const selected = shuffled.slice(0, bracketSize);

      const rounds = buildRounds(selected, bracketSize);

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
      const matchup = round.matchups[currentMatchup];

      // Validate that the winner is one of the two items in this matchup.
      if (matchup.itemA.id !== winnerId && matchup.itemB.id !== winnerId) {
        return state;
      }

      const winner =
        matchup.itemA.id === winnerId ? matchup.itemA : matchup.itemB;
      const loser =
        matchup.itemA.id === winnerId ? matchup.itemB : matchup.itemA;

      // Deep-copy rounds and record the winner on the current matchup.
      let updatedRounds = rounds.map((r) => ({
        ...r,
        matchups: r.matchups.map((m) => ({ ...m })),
      }));
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
      const updatedRounds = state.rounds.map((r) => ({
        ...r,
        matchups: r.matchups.map((m) => ({ ...m })),
      }));

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

      // If undoing across a round boundary, clear the next round's matchups.
      if (prevRound < state.currentRound || wasComplete) {
        // Clear all matchups in the round that was being played (or would have been next).
        const roundToClear = prevRound + 1;
        if (roundToClear < updatedRounds.length) {
          updatedRounds[roundToClear] = {
            ...updatedRounds[roundToClear],
            matchups: updatedRounds[roundToClear].matchups.map(() => ({
              itemA: null as unknown as BracketItem,
              itemB: null as unknown as BracketItem,
            })),
          };
        }
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

    case 'RESET': {
      return createInitialState();
    }

    default:
      return state;
  }
}
