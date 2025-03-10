// src/utils/ScreenOptions.ts

import type {
  StackNavigationOptions,
} from '@react-navigation/stack'
import {
  CardStyleInterpolators,
} from '@react-navigation/stack'
import { Dimensions } from 'react-native'

/**
 * Options for configuring the screen behavior and appearance.
 */
export const ScreenOptions: StackNavigationOptions = {
  gestureEnabled: false,
  gestureResponseDistance: Dimensions.get('screen').width,
  headerShown: true,
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  headerStyle: { backgroundColor: '#FFF' },
  headerTitleStyle: { fontFamily: 'Bold' },
  headerTitleAlign: 'center',
}
