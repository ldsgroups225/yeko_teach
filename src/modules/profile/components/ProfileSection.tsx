// src/modules/profile/components/ProfileSection.tsx

import type { ITheme } from '@styles/theme'
import CsButton from '@components/CsButton'
import CsText from '@components/CsText'
import { useThemedStyles } from '@hooks/index'
import { spacing } from '@styles/index'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface ProfileSectionProps {
  title: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  infoText: string
}

/**
 * ProfileSection component represents a section in the profile screen with a button and info text.
 * @param {ProfileSectionProps} props - The props for the ProfileSection component.
 * @returns {React.ReactElement} A React element representing a profile section.
 */
export const ProfileSection: React.FC<ProfileSectionProps> = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  infoText,
}) => {
  const themedStyles = useThemedStyles<typeof styles>(styles)

  return (
    <View style={themedStyles.section}>
      <CsButton
        title={title}
        onPress={onPress}
        disabled={disabled}
        loading={loading}
        style={themedStyles.button}
      />
      <CsText variant="caption" style={themedStyles.infoText}>
        {infoText}
      </CsText>
    </View>
  )
}

function styles(theme: ITheme) {
  return StyleSheet.create({
    section: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    button: {
      marginBottom: spacing.sm,
    },
    infoText: {
      color: theme.textLight,
      textAlign: 'center',
      marginTop: spacing.xs,
    },
  })
}
