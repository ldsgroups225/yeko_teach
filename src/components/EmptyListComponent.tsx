import type { ITheme } from '@styles/theme'
import CsText from '@components/CsText'
import { useTheme } from '@src/hooks'
import { spacing } from '@styles/spacing'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface EmptyListComponentProps {
  message?: string
}

const EmptyListComponent: React.FC<EmptyListComponentProps> = ({
  message = 'Aucune donnée trouvé',
}) => {
  const theme = useTheme()
  const styles = useStyles(theme)

  return (
    <View style={styles.emptyContainer}>
      <CsText style={styles.emptyText}>{message}</CsText>
    </View>
  )
}

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    emptyText: {
      color: theme.textLight,
      fontSize: 16,
    },
  })
}

export default EmptyListComponent
