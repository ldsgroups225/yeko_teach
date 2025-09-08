// src/components/AuthStatus/index.tsx

import CsText from '@components/CsText'
import { useThemedStyles } from '@hooks/index'
import { useAuth } from '@hooks/useAuth'
import { useAppSelector } from '@src/store'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import type React from 'react'
import { StyleSheet, View } from 'react-native'

interface AuthStatusProps {
  visible?: boolean
}

/**
 * Auth status component for debugging authentication state
 * Only visible in development mode
 */
const AuthStatus: React.FC<AuthStatusProps> = ({ visible = __DEV__ }) => {
  const themedStyles = useThemedStyles<typeof styles>(styles)
  const { loading } = useAuth()
  const user = useAppSelector(state => state.AppReducer?.user)

  if (!visible) return null

  return (
    <View style={themedStyles.container}>
      <CsText variant='caption' style={themedStyles.title}>
        Auth Status (Dev)
      </CsText>

      <View style={themedStyles.row}>
        <CsText variant='caption' style={themedStyles.label}>
          Loading:
        </CsText>
        <CsText
          variant='caption'
          style={StyleSheet.flatten([
            themedStyles.value,
            loading ? themedStyles.loading : themedStyles.idle
          ])}
        >
          {loading ? 'Yes' : 'No'}
        </CsText>
      </View>

      <View style={themedStyles.row}>
        <CsText variant='caption' style={themedStyles.label}>
          User:
        </CsText>
        <CsText
          variant='caption'
          style={StyleSheet.flatten([
            themedStyles.value,
            user ? themedStyles.authenticated : themedStyles.unauthenticated
          ])}
        >
          {user ? 'Authenticated' : 'Not authenticated'}
        </CsText>
      </View>

      {user && (
        <>
          <View style={themedStyles.row}>
            <CsText variant='caption' style={themedStyles.label}>
              Email:
            </CsText>
            <CsText variant='caption' style={themedStyles.value}>
              {user.email}
            </CsText>
          </View>

          <View style={themedStyles.row}>
            <CsText variant='caption' style={themedStyles.label}>
              Name:
            </CsText>
            <CsText variant='caption' style={themedStyles.value}>
              {user.firstName && user.lastName
                ? `${user.firstName} ${user.lastName}`
                : 'Not set'}
            </CsText>
          </View>

          <View style={themedStyles.row}>
            <CsText variant='caption' style={themedStyles.label}>
              Phone:
            </CsText>
            <CsText variant='caption' style={themedStyles.value}>
              {user.phone || 'Not set'}
            </CsText>
          </View>
        </>
      )}
    </View>
  )
}

function styles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      position: 'absolute',
      top: 50,
      right: 10,
      backgroundColor: theme.background,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 8,
      padding: spacing.sm,
      minWidth: 200,
      opacity: 0.9,
      zIndex: 1000
    },
    title: {
      fontWeight: 'bold',
      marginBottom: spacing.xs,
      color: theme.primary
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs
    },
    label: {
      color: theme.textLight,
      fontWeight: '500'
    },
    value: {
      color: theme.text,
      flex: 1,
      textAlign: 'right'
    },
    loading: {
      color: theme.warning
    },
    idle: {
      color: theme.success
    },
    authenticated: {
      color: theme.success
    },
    unauthenticated: {
      color: theme.error
    }
  })
}

export default AuthStatus
