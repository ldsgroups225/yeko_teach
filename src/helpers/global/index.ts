// src/helpers/global/index.ts

export function isValidJSON(str: any) {
  try {
    JSON.parse(str)
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
export function isObjectLike(val: any): any {
  return val !== null && typeof val === 'object'
}
