export const DEFAULT_RATING = 1500;
export const DEFAULT_K_FACTOR = 32;

/**
 * Calculates the expected score for player A against player B.
 * Returns a value between 0 and 1 representing the probability of A winning.
 */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculates new Elo ratings after a match.
 * The winner's rating increases and the loser's rating decreases.
 */
export function calculateElo(
  winnerRating: number,
  loserRating: number,
  kFactor: number = DEFAULT_K_FACTOR
): { newWinnerRating: number; newLoserRating: number } {
  const expectedWin = expectedScore(winnerRating, loserRating);
  const expectedLoss = expectedScore(loserRating, winnerRating);

  const newWinnerRating = Math.round(winnerRating + kFactor * (1 - expectedWin));
  const newLoserRating = Math.round(loserRating + kFactor * (0 - expectedLoss));

  return { newWinnerRating, newLoserRating };
}
