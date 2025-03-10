// src/modules/school/components/LoadingView.tsx

import type { ITheme } from '@styles/theme'
import CsText from '@components/CsText'
import { useTheme } from '@src/hooks'
import { spacing } from '@styles/spacing'
import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

interface LoadingViewProps {
  message?: string
}

/**
 * LoadingView component displays a loading indicator with an optional message.
 */
const LoadingView: React.FC<LoadingViewProps> = ({
  message = 'Loading...',
}) => {
  const theme = useTheme()
  const styles = useStyles(theme)

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.primary} />
      <CsText style={styles.loadingText}>{message}</CsText>
    </View>
  )
}

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: spacing.md,
      color: theme.text,
    },
  })
}

export default LoadingView
