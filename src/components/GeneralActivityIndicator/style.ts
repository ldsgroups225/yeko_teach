// src/components/GeneralActivityIndicator/style.ts

import type { ITheme } from '@styles/theme'
import { StyleSheet } from 'react-native'

const $black30 = '#00000030'
const $black85 = '#00000085'

export function styles(theme: ITheme) {
  return StyleSheet.create({
    activityIndicator: {
      position: 'absolute',
      zIndex: 9999,
      width: '100%',
      height: '100%',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      backgroundColor: $black85,
    },

    activityIndicatorText: {
      marginTop: 2,
      fontWeight: 'bold',
      fontSize: 4,
      color: theme.primary,
    },

    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: $black30,
    },
  })
}
