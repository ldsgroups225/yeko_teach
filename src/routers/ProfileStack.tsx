// src/routers/ProfileStack.tsx

import translate from '@helpers/localization'
import ProfileScreen from '@modules/profile/screens/ProfileScreen'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '@src/hooks'
import type { ProfileStackParams } from '@utils/Routes'
import Routes from '@utils/Routes'
import { ScreenOptions } from '@utils/ScreenOptions'
import * as React from 'react'
import { enableScreens } from 'react-native-screens'

enableScreens()

const Stack = createStackNavigator<ProfileStackParams>()

function ProfileStack() {
  const theme = useTheme()
  return (
    <Stack.Navigator
      initialRouteName={Routes.User}
      screenOptions={{ ...ScreenOptions, headerTintColor: theme.primary }}
    >
      <Stack.Screen
        name={Routes.User}
        component={ProfileScreen}
        options={{
          headerTitle: translate('navigation.profile'),
          headerShown: false
        }}
      />
    </Stack.Navigator>
  )
}

export default React.memo(ProfileStack)
