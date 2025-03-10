// src/components/GeneralActivityIndicator/type.ts

import type { TextStyle, ViewStyle } from 'react-native'

export interface GeneralActivityIndicatorProps {
  text?: string
  size?: 'small' | 'large' | number
  color?: string
  containerStyle?: ViewStyle
  indicatorStyle?: ViewStyle
  textStyle?: TextStyle
  useModal?: boolean
  isVisible?: boolean
  accessibilityLabel?: string
}
