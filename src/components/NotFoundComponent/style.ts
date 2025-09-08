// src/components/NotFoundComponent/style.ts

import { spacing } from '@styles/index'
import { StyleSheet } from 'react-native'

const $orange = '#F27A1A'

export const styles = StyleSheet.create({
  root: {
    marginTop: spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20,
    color: $orange
  }
})
