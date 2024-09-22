/**
 * @author Ali Burhan Keskin <alikeskin@milvasoft.com>
 */
import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { enableScreens } from "react-native-screens";
import { useTheme } from "@src/hooks";
import Routes, { ScheduleStackParams } from "@utils/Routes";
import translate from "@helpers/localization";
import { ScreenOptions } from "@utils/ScreenOptions";
import ScheduleScreen from "@modules/schedule/screens/schedule";

enableScreens();

const Stack = createStackNavigator<ScheduleStackParams>();

function ChatStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      initialRouteName={Routes.Schedule}
      screenOptions={{ ...ScreenOptions, headerTintColor: theme.primary }}
    >
      <Stack.Screen
        name={Routes.Schedule}
        component={ScheduleScreen}
        options={{
          headerTitle: translate("navigation.profile"),
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default React.memo(ChatStack);
