// src/routers/SchoolStack.tsx

import translate from '@helpers/localization'
import ClassNotesScreen from '@modules/school/screens/ClassNotesScreen' // Import the new screen
import SchoolClassDetails from '@modules/school/screens/class'
import SchoolDetailsScreen from '@modules/school/screens/details'
import SchoolScreen from '@modules/school/screens/school'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '@src/hooks'
import type { SchoolStackParams } from '@utils/Routes'
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
          headerShown: false
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

      {/* Add the new screen for Class Notes */}
      <Stack.Screen
        name={Routes.SchoolClassNotes}
        component={ClassNotesScreen}
        options={{
          title: 'Les notes de la classe'
          // Add other options if needed, e.g., headerShown: true
        }}
      />
    </Stack.Navigator>
  )
}

export default React.memo(SchoolStack)
