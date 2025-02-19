import type { ChatStackParams } from '@utils/Routes'
import translate from '@helpers/localization'
import ChatScreen from '@modules/chat/screens/chat'
import ChatDetailScreen from '@modules/chat/screens/chatDetails'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '@src/hooks'
import Routes from '@utils/Routes'
import { ScreenOptions } from '@utils/ScreenOptions'
import * as React from 'react'
import { enableScreens } from 'react-native-screens'

enableScreens()

const Stack = createStackNavigator<ChatStackParams>()

function ChatStack() {
  const theme = useTheme()
  return (
    <Stack.Navigator
      initialRouteName={Routes.Chat}
      screenOptions={{ ...ScreenOptions, headerTintColor: theme.primary }}
    >
      <Stack.Screen
        name={Routes.Chat}
        component={ChatScreen}
        options={{
          headerTitle: translate('navigation.profile'),
          headerShown: false,
        }}
      />

      <Stack.Screen
        name={Routes.ChatDetails}
        component={ChatDetailScreen}
        options={{
          headerTitle: translate('navigation.chatDetails'),
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  )
}

export default React.memo(ChatStack)
