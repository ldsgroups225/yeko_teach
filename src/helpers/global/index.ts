// src/helpers/global/index.ts

export function isValidJSON(str: unknown) {
  try {
    JSON.parse(String(str))
    return true
  } catch {
    return false
  }
}

/**
 * Checks if a value is object-like.
 *
 * @param val - The value to check.
 * @returns Returns `true` if the value is object-like, else `false`.
 */
export function isObjectLike(val: unknown): boolean {
  return val !== null && typeof val === 'object'
}
