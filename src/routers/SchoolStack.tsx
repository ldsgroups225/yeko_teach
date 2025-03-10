// src/routers/SchoolStack.tsx

import type { SchoolStackParams } from '@utils/Routes'
import translate from '@helpers/localization'
import SchoolClassDetails from '@modules/school/screens/class'
import SchoolDetailsScreen from '@modules/school/screens/details'
import SchoolScreen from '@modules/school/screens/school'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '@src/hooks'
import Routes from '@utils/Routes'
import { ScreenOptions } from '@utils/ScreenOptions'
import * as React from 'react'
import { enableScreens } from 'react-native-screens'

enableScreens()

const Stack = createStackNavigator<SchoolStackParams>()

function SchoolStack() {
  const theme = useTheme()
  return (
    <Stack.Navigator
      initialRouteName={Routes.School}
      screenOptions={{ ...ScreenOptions, headerTintColor: theme.primary }}
    >
      <Stack.Screen
        name={Routes.School}
        component={SchoolScreen}
        options={{
          headerTitle: translate('navigation.profile'),
          headerShown: false,
        }}
      />

      <Stack.Screen
        name={Routes.SchoolDetails}
        component={SchoolDetailsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name={Routes.SchoolClassDetails}
        component={SchoolClassDetails}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  )
}

export default React.memo(SchoolStack)
