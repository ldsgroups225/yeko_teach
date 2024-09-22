/**
 * @author Ali Burhan Keskin <alikeskin@milvasoft.com>
 */
import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { enableScreens } from "react-native-screens";
import { useTheme } from "@src/hooks";
import Routes, { ChatStackParams } from "@utils/Routes";
import translate from "@helpers/localization";
import { ScreenOptions } from "@utils/ScreenOptions";
import ChatScreen from "@modules/chat/screens/chat";

enableScreens();

const Stack = createStackNavigator<ChatStackParams>();

function ChatStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      initialRouteName={Routes.Chat}
      screenOptions={{ ...ScreenOptions, headerTintColor: theme.primary }}
    >
      <Stack.Screen
        name={Routes.Chat}
        component={ChatScreen}
        options={{
          headerTitle: translate("navigation.profile"),
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default React.memo(ChatStack);
