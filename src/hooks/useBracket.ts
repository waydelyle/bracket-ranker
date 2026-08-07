'use client';

import { useReducer, useMemo, useCallback, useEffect, useRef } from 'react';
import type { BracketItem } from '@/data/types';
import {
  bracketReducer,
  createInitialState,
  getProgress,
  type BracketState,
} from '@/lib/bracket-engine';

/** Bump when the persisted shape changes so old saves are ignored rather than crashing. */
const SAVE_VERSION = 1;

/** A part-finished bracket is only worth resuming for a day. */
const SAVE_TTL_MS = 24 * 60 * 60 * 1000;

interface SavedBracket {
  version: number;
  savedAt: number;
  state: BracketState;
}

function storageKeyFor(id: string) {
  return `bracketranker:progress:${id}`;
}

/** Reads a saved in-progress bracket, or null if absent, stale or unusable. */
function readSave(id: string): BracketState | null {
  try {
    const raw = window.localStorage.getItem(storageKeyFor(id));
    if (!raw) return null;

    const save = JSON.parse(raw) as SavedBracket;
    if (save.version !== SAVE_VERSION) return null;
    if (Date.now() - save.savedAt > SAVE_TTL_MS) return null;

    // A save is only coherent if it is mid-play and its round structure is
    // intact — anything else is a partial write or an older data shape.
    const state = save.state;
    if (state?.phase !== 'playing') return null;
    if (!Array.isArray(state.rounds) || state.rounds.length === 0) return null;
    if (!Array.isArray(state.items) || state.items.length === 0) return null;
    const round = state.rounds[state.currentRound];
    if (!round?.matchups?.[state.currentMatchup]) return null;

    return state;
  } catch {
    return null;
  }
}

/**
 * Bracket state machine, with the in-progress bracket persisted per bracket.
 *
 * Without this, a refresh or an app switch on mobile throws away every pick —
 * which on a 64-entrant sorter is 63 of them.
 *
 * @param id Stable id for the bracket being played, e.g. "movies/marvel".
 *   Omit to run without persistence.
 */
export function useBracket(id?: string) {
  const [state, dispatch] = useReducer(bracketReducer, undefined, createInitialState);

  // Restore after mount rather than in the reducer initialiser: reading
  // localStorage during render would make the server and client HTML disagree.
  const hasRestored = useRef(false);
  useEffect(() => {
    if (!id || hasRestored.current) return;
    hasRestored.current = true;
    const saved = readSave(id);
    if (saved) dispatch({ type: 'RESTORE', state: saved });
  }, [id]);

  // Mirror every pick to storage, and clear the save once the bracket is done
  // or abandoned so a finished run never resurrects.
  useEffect(() => {
    if (!id || !hasRestored.current) return;
    try {
      const key = storageKeyFor(id);
      if (state.phase === 'playing') {
        const save: SavedBracket = {
          version: SAVE_VERSION,
          savedAt: Date.now(),
          state,
        };
        window.localStorage.setItem(key, JSON.stringify(save));
      } else {
        window.localStorage.removeItem(key);
      }
    } catch {
      // Quota exceeded or storage blocked — playing without a save is fine.
    }
  }, [id, state]);

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

  /** The pair after the current one, so its artwork can be fetched early. */
  const nextMatchup = useMemo(() => {
    if (state.phase !== 'playing') return null;
    const round = state.rounds[state.currentRound];
    if (!round) return null;
    const matchup = round.matchups[state.currentMatchup + 1];
    if (!matchup?.itemA || !matchup?.itemB) return null;
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
    nextMatchup,
    canUndo,
  };
}
