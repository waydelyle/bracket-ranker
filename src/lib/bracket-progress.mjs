/**
 * Snapshot format for an in-progress bracket.
 *
 * A saved run records only the seeded entrant order and the winner of each
 * completed matchup, rather than the whole `BracketState`. Two reasons:
 *
 * 1. Size. The full state nests every entrant object once per round, so a
 *    half-played 64-entrant bracket serialises to ~35KB and is rewritten on
 *    every pick. The replay form is ~1.5KB.
 * 2. Verifiability. Entrant lists change — artwork gets replaced, duplicates
 *    get removed. A snapshot that carries its own copies of the entrants will
 *    happily restore ones the bracket no longer has, and the run then fails
 *    server-side validation at the very end. Storing ids means the saved run
 *    can be checked against the live pool before a single matchup is shown.
 *
 * Kept as plain ESM (matching `serialization.mjs`) so `node --test` can
 * exercise it directly. The reducer is passed in rather than imported to keep
 * this module free of any dependency on the TypeScript engine.
 */

/**
 * Bumped from the shape that stored a whole `BracketState`, so those saves are
 * rejected by the version check and evicted rather than misread.
 */
export const PROGRESS_VERSION = 2;

/** A part-finished bracket is only worth resuming for a day. */
export const PROGRESS_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Field sizes a run can have used. Any whole number in range: a field is no
 * longer rounded down to a power of two, so a 24-entrant bracket saves as 24.
 *
 * Kept as a range check rather than a list so that saves written before byes
 * existed — always 8, 16, 32 or 64 — still validate and still resume.
 */
const MIN_SIZE = 8;
const MAX_SIZE = 64;

function isValidSize(size) {
  return Number.isInteger(size) && size >= MIN_SIZE && size <= MAX_SIZE;
}

export function progressStorageKey(id) {
  return `bracketranker:progress:${id}`;
}

/**
 * True when a live state holds a run worth saving.
 *
 * A bracket that has been seeded but not yet played is deliberately not
 * resumable: there is nothing to resume to, and treating it as such is what
 * would let a freshly started bracket keep the previous run's save alive.
 */
export function hasResumableRun(state) {
  return Boolean(
    state &&
      state.phase === "playing" &&
      Array.isArray(state.matchupHistory) &&
      state.matchupHistory.length > 0 &&
      Array.isArray(state.items) &&
      state.items.length === state.bracketSize,
  );
}

/**
 * Captures a playable state, or null when there is nothing worth saving —
 * not mid-play, or no picks made yet.
 */
export function serializeProgress(state, id, now = Date.now()) {
  if (!id || !hasResumableRun(state)) return null;

  return {
    v: PROGRESS_VERSION,
    id,
    size: state.bracketSize,
    itemIds: state.items.map((item) => item.id),
    picks: state.matchupHistory.map((matchup) => matchup.winner),
    savedAt: now,
  };
}

/** Narrows parsed JSON to a structurally sound snapshot. */
export function isValidProgress(value) {
  if (typeof value !== "object" || value === null) return false;

  if (value.v !== PROGRESS_VERSION) return false;
  if (typeof value.id !== "string" || value.id.length === 0) return false;
  if (typeof value.savedAt !== "number" || !Number.isFinite(value.savedAt)) {
    return false;
  }
  if (!isValidSize(value.size)) return false;

  const { itemIds, picks } = value;
  if (!Array.isArray(itemIds) || itemIds.length !== value.size) return false;
  if (!itemIds.every((entry) => typeof entry === "string" && entry)) return false;
  if (new Set(itemIds).size !== itemIds.length) return false;

  if (!Array.isArray(picks)) return false;
  if (!picks.every((entry) => typeof entry === "string" && entry)) return false;
  // No picks yet is nothing to resume; a full set means the run finished and
  // belongs on its results page instead.
  if (picks.length === 0 || picks.length >= value.size - 1) return false;

  return true;
}

/**
 * Parses a stored entry for `id`. Pure: safe to call while rendering, and
 * returns null for anything expired, malformed, or written by another bracket.
 */
export function parseProgress(raw, id, now = Date.now()) {
  if (typeof raw !== "string" || raw.length === 0) return null;

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (!isValidProgress(parsed)) return null;
  if (parsed.id !== id) return null;
  if (now - parsed.savedAt > PROGRESS_TTL_MS) return null;

  return parsed;
}

/**
 * True when every entrant the snapshot references is still in `items`.
 *
 * This is the check that keeps a stale save from resurrecting entrants that
 * have since been renamed or dropped. Without it the run only fails at the
 * finish, where `saveResult` rejects a ranking full of unknown ids.
 */
export function entrantsStillExist(progress, items) {
  if (!progress || !Array.isArray(items)) return false;

  const pool = new Set(items.map((item) => item?.id));
  return progress.itemIds.every((entrantId) => pool.has(entrantId));
}

/**
 * True when a live run was seeded from `items`.
 *
 * Guards the write side: if a component instance is reused across a change of
 * bracket, the outgoing run must not be written under the incoming bracket's
 * key.
 */
export function stateBelongsTo(state, items) {
  if (!state || !Array.isArray(state.items) || !Array.isArray(items)) return false;

  const pool = new Set(items.map((item) => item?.id));
  return state.items.every((item) => pool.has(item?.id));
}

/**
 * What a stored entry is worth to the bracket now being played.
 *
 * - `none`     nothing stored.
 * - `usable`   a run that can be offered and replayed; `progress` is set.
 * - `unusable` something is stored but cannot be resumed here — malformed,
 *              written by an older schema, expired, belonging to another
 *              bracket, or referring to entrants that no longer exist.
 *
 * `unusable` entries would otherwise sit in storage forever: they never render
 * a resume prompt, so nothing ever reads them again, and the key is only
 * reused if the same bracket is played to a first pick. Separating the two
 * lets the caller evict exactly those without touching a valid save.
 *
 * @param items The live entrant pool. Omit to skip the entrant check when the
 *   pool is not known.
 */
export function classifySavedRun(raw, id, items, now = Date.now()) {
  if (typeof raw !== "string" || raw.length === 0) {
    return { status: "none", progress: null };
  }

  const progress = parseProgress(raw, id, now);
  if (!progress) return { status: "unusable", progress: null };

  if (items !== undefined && !entrantsStillExist(progress, items)) {
    return { status: "unusable", progress: null };
  }

  return { status: "usable", progress };
}

/**
 * What should happen to the stored save for a given live state.
 *
 * - `write` a resumable run to persist.
 * - `clear` nothing under this key is worth keeping.
 * - `keep`  leave whatever is stored alone.
 *
 * The `clear` on a pick-less run is what stops a fresh bracket from reviving
 * the previous one: `serializeProgress` has nothing to write until the first
 * pick, so without it, starting a new bracket — or undoing back to no picks —
 * would leave the old save in place to be offered again on the next load.
 */
export function saveActionFor(state, items) {
  // The intro is the one screen where a stored run is still on offer, so it
  // must not be touched there.
  if (!state || state.phase === "intro") return "keep";

  if (state.phase !== "playing") return "clear";

  // Persistence needs the live pool: it is what proves this run belongs to the
  // bracket on screen, rather than one a reused component was playing before.
  if (!items || !stateBelongsTo(state, items)) return "keep";

  return hasResumableRun(state) ? "write" : "clear";
}

/**
 * Progress description for the resume prompt.
 *
 * Deliberately says nothing about rounds: how a field divides into rounds
 * depends on where its byes fall, which is the engine's business. The caller
 * pairs `completed` with the engine's own round lookup.
 */
export function summarizeProgress(progress) {
  const total = progress.size - 1;
  const completed = progress.picks.length;

  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
    savedAt: progress.savedAt,
  };
}

/**
 * Replays a snapshot into live bracket state.
 *
 * Every pick is fed back through the real reducer, so a snapshot only restores
 * if it describes a run the engine agrees is legal. Anything else — a changed
 * entrant pool, a pick that does not belong to the matchup it lands on, a size
 * the pool can no longer fill — returns null so the player starts fresh rather
 * than resuming something incoherent.
 *
 * @param engine `{ bracketReducer, createInitialState }` from the engine.
 */
export function restoreProgress(progress, id, items, engine) {
  if (!progress || progress.id !== id) return null;
  if (!entrantsStillExist(progress, items)) return null;

  const byId = new Map(items.map((item) => [item.id, item]));
  const seeded = progress.itemIds.map((entrantId) => byId.get(entrantId));

  const { bracketReducer, createInitialState } = engine;

  let state = bracketReducer(createInitialState(), {
    type: "SEED",
    items: seeded,
    size: progress.size,
    shuffleItems: false,
  });

  if (state.phase !== "playing" || state.bracketSize !== progress.size) {
    return null;
  }

  for (const winnerId of progress.picks) {
    const next = bracketReducer(state, { type: "PICK_WINNER", winnerId });
    // The reducer returns the same state when a pick is not valid here.
    if (next.completedMatchups !== state.completedMatchups + 1) return null;
    state = next;
  }

  // A snapshot should never replay to a finished bracket; if it does, the
  // stored pick count and the engine disagree and it is not safe to resume.
  if (state.phase !== "playing") return null;

  return state;
}
