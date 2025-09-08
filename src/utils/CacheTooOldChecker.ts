// src/utils/CacheTooOldChecker.ts

/**
 * Checks if the given cache date is older than 7 days.
 * If the provided date is invalid, the function will consider the cache as expired.
 *
 * @param {string} cacheDate - The cache date in ISO string format (e.g., "2023-09-15T10:00:00.000Z").
 * @returns {boolean} - Returns `true` if the cache is older than 7 days or the date is invalid, otherwise `false`.
 *
 * @example
 * const cacheDate = "2023-09-15T10:00:00.000Z";
 * const isTooOld = isCacheTooOld(cacheDate);
 * console.log(isTooOld ? "Cache is too old" : "Cache is still valid");
 */
export function isCacheTooOld(cacheDate: string): boolean {
  const cacheTime = new Date(cacheDate).getTime()
  if (Number.isNaN(cacheTime)) {
    console.warn(
      `Invalid cache date provided: "${cacheDate}". Treating cache as expired.`
    )
    return true
  }

  const now = Date.now()
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

  return now - cacheTime > SEVEN_DAYS_MS
}
