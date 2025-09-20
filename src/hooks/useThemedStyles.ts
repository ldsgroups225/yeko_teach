// src/hooks/useThemedStyles.ts

import useTheme from './useTheme'

/**
 * Custom hook that applies themed styles to a component.
 *
 * @template T - The type of the styles function.
 * @param {T} styles - The styles function that accepts the theme as an argument.
 * @returns {ReturnType<T>} - The result of applying the styles function to the current theme.
 */
function useThemedStyles<T extends (...args: unknown[]) => unknown>(
  styles: T
): ReturnType<T> {
  return styles(useTheme()) as ReturnType<T>
}

export default useThemedStyles
