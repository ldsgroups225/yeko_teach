// src/components/ErrorComponent/style.ts

import padding from '@styles/padding'
import { StyleSheet } from 'react-native'

const $white = '#FFF'
const $orange = '#F27A1A'

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    marginVertical: padding.MEDIUM,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: $orange,
    paddingVertical: padding.SMALL,
    paddingHorizontal: padding.MEDIUM,
    borderRadius: 5,
    marginTop: padding.MEDIUM,
  },
  buttonText: {
    color: $white,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})
