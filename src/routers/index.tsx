import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useAppSelector } from "@src/store";
import translate from "@helpers/localization";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "@src/hooks";
import { navigationRef } from "@helpers/router";
import Login from "@modules/app/screens/Login";
import BottomNavigation from "./BottomNavigation";
import { ScreenOptions } from "@utils/ScreenOptions";
import Routes, { RootStackParams } from "@utils/Routes";
import { useAuth } from "@hooks/useAuth";
import LoadingSpinner from "@components/LoadingSpinner";
import { useDispatch } from "react-redux";
import { setUser } from "@modules/app/redux/appSlice";

enableScreens();

const Stack = createStackNavigator<RootStackParams>();

function RootNavigation() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { checkAuth, loading } = useAuth();
  const isSignedIn = useAppSelector((s) => s.AppReducer?.isSignedIn);
  const user = useAppSelector((s) => s.AppReducer?.user);
  const userColorScheme = useAppSelector((s) => s?.AppReducer?.userColorScheme);

  const isDarkTheme = userColorScheme === "dark";
  const recheckAuthTriggered = useRef(false);

  const recheckAuth = useCallback(async () => {
    const r = await checkAuth();
    if (r) {
      dispatch(setUser(r));
    }
  }, [checkAuth, dispatch, user]);

  useEffect(() => {
    // Trigger recheckAuth only once when not signed in
    if (!isSignedIn && !recheckAuthTriggered.current) {
      recheckAuth().then((r) => r);
      recheckAuthTriggered.current = true;
    }
  }, [isSignedIn]);

  const navigationTheme = {
    dark: isDarkTheme,
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      notification: theme.notification,
    },
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <Stack.Navigator
          initialRouteName={isSignedIn ? Routes.Core : Routes.Login}
          screenOptions={{ ...ScreenOptions, headerTintColor: theme.primary }}
        >
          {isSignedIn ? (
            <>
              <Stack.Screen
                name={Routes.Core}
                component={BottomNavigation}
                options={{
                  gestureEnabled: false,
                  headerShown: false,
                  headerTitle: translate("navigation.home"),
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name={Routes.Login}
                component={Login}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default RootNavigation;
