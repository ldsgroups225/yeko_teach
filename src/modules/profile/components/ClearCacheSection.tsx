// src/modules/profile/components/ClearCacheSection.tsx

import CsText from '@components/CsText'
import { Ionicons } from '@expo/vector-icons'
import { useThemedStyles } from '@hooks/index'
import { borderRadius, spacing } from '@styles/index'
import type { ITheme } from '@styles/theme'
import type React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

interface ClearCacheSectionProps {
  onPress: () => void
  disabled: boolean
  loading: boolean
}

/**
 * ClearCacheSection component provides a button to clear the app's cache.
 * @param {ClearCacheSectionProps} props - The props for the ClearCacheSection component.
 * @returns {React.ReactElement} A React element representing the clear cache section.
 */
export const ClearCacheSection: React.FC<ClearCacheSectionProps> = ({
  onPress,
  disabled,
  loading
}) => {
  const themedStyles = useThemedStyles<typeof styles>(styles)

  return (
    <View style={themedStyles.section}>
      <TouchableOpacity
        style={themedStyles.clearCacheButton}
        onPress={onPress}
        disabled={disabled}
      >
        <Ionicons
          name='refresh'
          size={24}
          color={themedStyles.clearCacheButton.color}
        />
        <CsText variant='body' style={themedStyles.clearCacheButtonText}>
          {loading ? 'En cours...' : 'Nouvelle données'}
        </CsText>
      </TouchableOpacity>
      <CsText variant='caption' style={themedStyles.infoText}>
        ℹ️ L'obtention des nouvelle donnée ralentira vos interaction prochaine
      </CsText>
    </View>
  )
}

function styles(theme: ITheme) {
  return StyleSheet.create({
    section: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border
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
    infoText: {
      color: theme.textLight,
      textAlign: 'center',
      marginTop: spacing.xs
    }
  })
}
