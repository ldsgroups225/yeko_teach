// src/modules/profile/styles.ts

import { borderRadius, spacing } from '@styles/index'
import type { ITheme } from '@styles/theme'
import { StyleSheet } from 'react-native'

export function styles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    header: {
      alignItems: 'center',
      padding: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: theme.border
    },
    avatar: {
      color: theme.primary
    },
    userName: {
      color: theme.text,
      fontWeight: 'bold',
      marginTop: spacing.md
    },
    userEmail: {
      color: theme.textLight,
      marginTop: spacing.xs
    },
    section: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border
    },
    button: {
      marginBottom: spacing.sm
    },
    infoText: {
      color: theme.textLight,
      textAlign: 'center',
      marginTop: spacing.xs
    },
    clearCacheButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
      backgroundColor: theme.card,
      borderRadius: borderRadius.medium,
      color: theme.text
    },
    clearCacheButtonText: {
      marginLeft: spacing.sm,
      color: theme.text
    },
    logoutButton: {
      margin: spacing.lg,
      backgroundColor: theme.error
    },
    otpFormContainer: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border
    }
  })
}
