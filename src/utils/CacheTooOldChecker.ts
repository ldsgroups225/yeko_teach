/**
 * Checks if the given cache date is older than 7 days.
 *
 * @param {string} cacheDate - The cache date in ISO string format (e.g., "2023-09-15T10:00:00.000Z").
 * @returns {boolean} - Returns `true` if the cache is older than 7 days, otherwise `false`.
 *
 * @example
 * const cacheDate = "2023-09-15T10:00:00.000Z";
 * const isTooOld = isCacheTooOld(cacheDate);
 * console.log(isTooOld ? "Cache is too old" : "Cache is still valid");
 */
export function isCacheTooOld(cacheDate: string): boolean {
  const cacheTimestamp = new Date(cacheDate).getTime(); // Convert cacheDate to timestamp
  const nowTimestamp = new Date().getTime(); // Current date in timestamp
  const sevenDaysInMilliseconds = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  return nowTimestamp - cacheTimestamp > sevenDaysInMilliseconds;
}
