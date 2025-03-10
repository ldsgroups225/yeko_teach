// src/modules/profile/components/ProfileHeader.tsx

import type { IUserDTO } from '@modules/app/types/ILoginDTO'
import type { ITheme } from '@styles/theme'
import CsText from '@components/CsText'
import { useThemedStyles } from '@hooks/index'
import { spacing } from '@styles/index'
import { formatFullName } from '@utils/Formatting'
import React from 'react'
import { StyleSheet, View } from 'react-native'

interface ProfileHeaderProps {
  user: IUserDTO
}

/**
 * ProfileHeader component displays the user's name and email.
 * @param {ProfileHeaderProps} props - The props for the ProfileHeader component.
 * @returns {React.ReactElement} A React element representing the profile header.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
  const themedStyles = useThemedStyles<typeof styles>(styles)

  return (
    <View style={themedStyles.header}>
      <CsText variant="h1" style={themedStyles.userName}>
        {formatFullName(user?.firstName || '', user?.lastName || '')}
      </CsText>
      <CsText variant="body" style={themedStyles.userEmail}>
        {user?.email || ''}
      </CsText>
    </View>
  )
}

function styles(theme: ITheme) {
  return StyleSheet.create({
    header: {
      alignItems: 'center',
      padding: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    userName: {
      color: theme.text,
      fontWeight: 'bold',
      marginBottom: spacing.sm,
    },
    userEmail: {
      color: theme.textLight,
    },
  })
}
