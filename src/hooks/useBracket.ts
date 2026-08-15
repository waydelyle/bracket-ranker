'use client';

import {
  useReducer,
  useMemo,
  useCallback,
  useEffect,
  useSyncExternalStore,
} from 'react';
import type { BracketItem } from '@/data/types';
import {
  bracketReducer,
  createInitialState,
  getProgress,
  getRoundName,
  type BracketState,
} from '@/lib/bracket-engine';
import {
  classifySavedRun,
  parseProgress,
  progressStorageKey,
  restoreProgress,
  saveActionFor,
  serializeProgress,
  summarizeProgress,
} from '@/lib/bracket-progress.mjs';

/** What the resume prompt needs in order to describe a saved run. */
export interface SavedRunSummary {
  completed: number;
  total: number;
  percentage: number;
  roundName: string;
  savedAt: number;
}

// ---------------------------------------------------------------------------
// Storage access
//
// localStorage is an external store, so it is subscribed to rather than copied
// into state: `useSyncExternalStore` serves the server snapshot during
// hydration, which keeps the server and client HTML in agreement without an
// effect that writes state on mount.
// ---------------------------------------------------------------------------

const listeners = new Set<() => void>();

function notifyProgressChanged() {
  for (const listener of listeners) listener();
}

function subscribeToProgress(listener: () => void): () => void {
  listeners.add(listener);
  if (typeof window !== 'undefined') {
    // Picks up saves made in another tab too.
    window.addEventListener('storage', listener);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', listener);
    }
  };
}

/**
 * The stored entry, verbatim.
 *
 * Returns the raw string on purpose: `useSyncExternalStore` compares snapshots
 * by identity, and strings compare by value, so an unchanged entry can never
 * look like a change.
 */
function readRaw(id: string): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(progressStorageKey(id));
  } catch {
    // Storage access itself throws in some privacy modes.
    return null;
  }
}

function writeRaw(id: string, value: string): void {
  try {
    window.localStorage.setItem(progressStorageKey(id), value);
    notifyProgressChanged();
  } catch {
    // Quota exceeded or storage blocked — playing without a save is fine.
  }
}

function removeRaw(id: string): void {
  try {
    window.localStorage.removeItem(progressStorageKey(id));
    notifyProgressChanged();
  } catch {
    // Nothing actionable.
  }
}

/**
 * Bracket state machine, with the in-progress bracket persisted per bracket.
 *
 * Without this, a refresh or an app switch on mobile throws away every pick —
 * which on a 64-entrant sorter is 63 of them.
 *
 * A saved run is offered rather than applied silently: being dropped into the
 * middle of a bracket with no explanation, and no way back to the intro, is
 * worse than being asked.
 *
 * @param id Stable id for the bracket being played, e.g. "movies/marvel".
 *   Omit to run without persistence.
 * @param items The bracket's current entrant pool. A saved run is only offered
 *   while it still refers to entrants this bracket actually has.
 */
export function useBracket(id?: string, items?: BracketItem[]) {
  const [state, dispatch] = useReducer(bracketReducer, undefined, createInitialState);

  const rawSave = useSyncExternalStore(
    subscribeToProgress,
    () => (id ? readRaw(id) : null),
    () => null
  );

  /** Whether what is stored can be resumed here. Pure — no side effects. */
  const storedRun = useMemo(
    () => classifySavedRun(rawSave, id, items),
    [rawSave, id, items]
  );

  /**
   * A run waiting to be picked back up, or null.
   *
   * Only surfaced on the intro screen, which is the one moment it is
   * actionable.
   */
  const savedRun: SavedRunSummary | null = useMemo(() => {
    if (state.phase !== 'intro' || !storedRun.progress) return null;

    const progress = storedRun.progress;
    const summary = summarizeProgress(progress);
    return {
      completed: summary.completed,
      total: summary.total,
      percentage: summary.percentage,
      roundName: getRoundName(progress.size, summary.roundIndex),
      savedAt: summary.savedAt,
    };
  }, [storedRun, state.phase]);

  // Evict a stored run that can never be resumed here. It renders no prompt,
  // so nothing would ever read it again, and it would hold its key — up to
  // tens of KB for a save in the older whole-state format — indefinitely.
  // Done in an effect rather than while rendering, and only for entries
  // already classified unusable, so a valid save is never touched.
  useEffect(() => {
    if (!id || storedRun.status !== 'unusable') return;
    removeRaw(id);
  }, [id, storedRun.status]);

  // Mirror every pick to storage, and drop the save whenever there is nothing
  // resumable under this key.
  useEffect(() => {
    if (!id) return;

    const action = saveActionFor(state, items);
    if (action === 'write') {
      const snapshot = serializeProgress(state, id, Date.now());
      if (snapshot) writeRaw(id, JSON.stringify(snapshot));
    } else if (action === 'clear') {
      removeRaw(id);
    }
  }, [id, items, state]);

  const startBracket = useCallback(
    (seedItems: BracketItem[], size: number) => {
      // Starting fresh abandons whatever was saved for this bracket. Cleared
      // here, synchronously, because nothing is written back until the first
      // pick — a reload in between would otherwise offer the run the player
      // just walked away from.
      if (id) removeRaw(id);
      dispatch({ type: 'SEED', items: seedItems, size });
    },
    [id]
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
    if (id) removeRaw(id);
  }, [id]);

  /**
   * Replays the saved run. Returns false — and drops the save — when it cannot
   * be replayed, so the prompt never offers something that will not load.
   */
  const resumeSavedRun = useCallback(() => {
    if (!id || !items) return false;

    const progress = parseProgress(readRaw(id), id);
    const restored = progress
      ? (restoreProgress(progress, id, items, {
          bracketReducer,
          createInitialState,
        }) as BracketState | null)
      : null;

    if (!restored) {
      removeRaw(id);
      return false;
    }

    dispatch({ type: 'RESTORE', state: restored });
    return true;
  }, [id, items]);

  /** Throws the saved run away so the intro stops offering it. */
  const discardSavedRun = useCallback(() => {
    if (id) removeRaw(id);
  }, [id]);

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
    savedRun,
    resumeSavedRun,
    discardSavedRun,
  };
}
