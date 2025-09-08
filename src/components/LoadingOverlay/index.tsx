// src/components/LoadingOverlay/index.tsx

import CsText from '@components/CsText'
import { useThemedStyles } from '@hooks/index'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import type React from 'react'
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native'

interface LoadingOverlayProps {
  visible: boolean
  message?: string
  transparent?: boolean
}

/**
 * Loading overlay component for blocking UI during async operations
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message = 'Chargement...',
  transparent = false
}) => {
  const themedStyles = useThemedStyles<typeof styles>(styles)

  if (!visible) return null

  return (
    <Modal
      transparent
      visible={visible}
      animationType='fade'
      statusBarTranslucent
    >
      <View
        style={[
          themedStyles.overlay,
          transparent && themedStyles.overlayTransparent
        ]}
      >
        <View style={themedStyles.container}>
          <ActivityIndicator
            size='large'
            color={themedStyles.spinner.color}
            style={themedStyles.spinner}
          />
          {message && (
            <CsText variant='body' style={themedStyles.message}>
              {message}
            </CsText>
          )}
        </View>
      </View>
    </Modal>
  )
}

function styles(theme: ITheme) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center'
    },
    overlayTransparent: {
      backgroundColor: theme.overlayLight
    },
    container: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: spacing.xl,
      alignItems: 'center',
      minWidth: 120,
      shadowColor: theme.gray800,
      shadowOffset: {
        width: 0,
        height: 4
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8
    },
    spinner: {
      color: theme.primary,
      marginBottom: spacing.md
    },
    message: {
      textAlign: 'center',
      color: theme.text
    }
  })
}

export default LoadingOverlay
