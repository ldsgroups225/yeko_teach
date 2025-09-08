// src/components/CsText/type.ts

import type { TextProps, TextStyle } from 'react-native'

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'caption'
  | 'overline'
  | 'error'
export type TextColor = 'primary' | 'secondary' | 'error' | 'light'

export interface CsTextProps extends TextProps {
  variant?: TextVariant
  color?: TextColor
  style?: TextStyle
}
