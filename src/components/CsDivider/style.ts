// src/components/CsDivider/style.ts

import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import { StyleSheet } from 'react-native'

export function styles(theme: ITheme) {
  return StyleSheet.create({
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.md,
      width: '100%'
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border
    },
    dividerText: {
      marginHorizontal: spacing.sm,
      color: theme.textLight
    }
  })
}
