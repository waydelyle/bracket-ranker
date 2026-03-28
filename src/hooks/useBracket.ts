'use client';

import { useReducer, useMemo, useCallback } from 'react';
import type { BracketItem } from '@/data/types';
import {
  bracketReducer,
  createInitialState,
  getProgress,
  type BracketState,
} from '@/lib/bracket-engine';

export function useBracket() {
  const [state, dispatch] = useReducer(bracketReducer, undefined, createInitialState);

  const startBracket = useCallback(
    (items: BracketItem[], size: number) => {
      dispatch({ type: 'SEED', items, size });
    },
    []
  );

  const pickWinner = useCallback(
    (winnerId: string) => {
      dispatch({ type: 'PICK_WINNER', winnerId });
    },
    []
  );

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const progress = useMemo(() => getProgress(state), [state]);

  const currentMatchup = useMemo(() => {
    if (state.phase !== 'playing') return null;
    const round = state.rounds[state.currentRound];
    if (!round) return null;
    const matchup = round.matchups[state.currentMatchup];
    if (!matchup || !matchup.itemA || !matchup.itemB) return null;
    return { itemA: matchup.itemA, itemB: matchup.itemB };
  }, [state]);

  const canUndo = state.matchupHistory.length > 0;

  return {
    state,
    startBracket,
    pickWinner,
    undo,
    reset,
    progress,
    currentMatchup,
    canUndo,
  };
}
