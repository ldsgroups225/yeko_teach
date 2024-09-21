/**
 * @author Ali Burhan Keskin <alikeskin@milvasoft.com>
 */
import * as React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { enableScreens } from "react-native-screens";
import { useTheme } from "@src/hooks";
import Routes, { SchoolStackParams } from "@utils/Routes";
import translate from "@helpers/localization";
import { ScreenOptions } from "@utils/ScreenOptions";
import SchoolScreen from "@modules/school/screens/school";
import SchoolDetailsScreen from "@modules/school/screens/details";
import SchoolClassDetails from "@modules/school/screens/class";

enableScreens();

const Stack = createStackNavigator<SchoolStackParams>();

function SchoolStack() {
  const theme = useTheme();
  return (
    <Stack.Navigator
      initialRouteName={Routes.School}
      screenOptions={{ ...ScreenOptions, headerTintColor: theme.primary }}
    >
      <Stack.Screen
        name={Routes.School}
        component={SchoolScreen}
        options={{
          headerTitle: translate("navigation.profile"),
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
  );
}

export default React.memo(SchoolStack);
