// src/styles/styles.d.ts

import type { ImageStyle, TextStyle, ViewStyle } from 'react-native'
import type { ITheme } from './theme'

declare global {
  type Theme = ITheme

  type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle }

  type StylesOf<
    T extends NamedStyles<T> | NamedStyles<Record<string, unknown>>
  > = {
    [P in keyof T]: T[P] extends ViewStyle | TextStyle | ImageStyle
      ? T[P]
      : StylesOf<T[P]>
  }

  interface StyleSheetType {
    create: <T extends NamedStyles<T> | NamedStyles<Record<string, unknown>>>(
      styles: T | NamedStyles<T>
    ) => StylesOf<T>
  }
}
