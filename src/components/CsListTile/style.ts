// src/components/CsListTile/style.ts

import borderRadius from '@styles/borderRadius'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import { typography } from '@styles/typography'
import { StyleSheet } from 'react-native'

export function styles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: theme.card,
      borderRadius: borderRadius.medium
    },
    contentContainer: {
      flex: 1,
      marginLeft: spacing.md
    },
    title: {
      ...typography.body,
      color: theme.text,
      marginBottom: spacing.xs
    },
    subtitle: {
      ...typography.caption,
      color: theme.textLight
    },
    trailing: {
      marginLeft: spacing.md
    },
    dense: {
      paddingVertical: spacing.sm
    },
    pressable: {
      opacity: 0.7
    }
  })
}
