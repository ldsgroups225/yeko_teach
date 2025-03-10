// src/routers/ScheduleStack.tsx

import type { ScheduleStackParams } from '@utils/Routes'
import translate from '@helpers/localization'
import ScheduleScreen from '@modules/schedule/screens/schedule'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '@src/hooks'
import Routes from '@utils/Routes'
import { ScreenOptions } from '@utils/ScreenOptions'
import * as React from 'react'
import { enableScreens } from 'react-native-screens'

enableScreens()

const Stack = createStackNavigator<ScheduleStackParams>()

function ChatStack() {
  const theme = useTheme()
  return (
    <Stack.Navigator
      initialRouteName={Routes.Schedule}
      screenOptions={{ ...ScreenOptions, headerTintColor: theme.primary }}
    >
      <Stack.Screen
        name={Routes.Schedule}
        component={ScheduleScreen}
        options={{
          headerTitle: translate('navigation.profile'),
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}

export default React.memo(ChatStack)
