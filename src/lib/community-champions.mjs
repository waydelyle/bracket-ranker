/**
 * Entrants with the most bracket titles, independently of the win-rate order
 * used by community standings. An empty set means no titles were recorded.
 *
 * @template {{ championCount: number }} Entry
 * @param {Entry[]} entries
 * @returns {Entry[]}
 */
export function getChampionLeaders(entries) {
  let highestCount = 0;
  /** @type {Entry[]} */
  let leaders = [];

  for (const entry of entries) {
    if (entry.championCount > highestCount) {
      highestCount = entry.championCount;
      leaders = [entry];
    } else if (highestCount > 0 && entry.championCount === highestCount) {
      leaders.push(entry);
    }
  }

  return leaders;
}
