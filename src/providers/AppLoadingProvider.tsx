import React, { ReactElement, useCallback } from "react";
import { View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import MontserratFont from "@assets/font";
import migrations from '@src/drizzle/migrations';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { drizzleDb } from "@src/db/config";


SplashScreen.preventAutoHideAsync().then((r) => r);

type Props = {
  children: React.ReactNode;
};

/**
 * Provides an app loading screen that preloads fonts and hides the splash screen
 * once the app is ready to render.
 *
 * @param {Props} props - The component props.
 * @param {ReactNode} props.children - The child components to render.
 * @returns {ReactElement | null} The rendered component.
 */
function AppLoadingProvider({ children }: Props): ReactElement | null {
  const [fontsLoaded, fontError] = useFonts(MontserratFont);
  const { success: dbMigrated, error: dbError } = useMigrations(drizzleDb, migrations);

  useDrizzleStudio(drizzleDb);

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if ((!fontsLoaded && !fontError) || (!dbMigrated && !dbError)) {
    return null;
  }

  return (
    <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
      {children}
    </View>
  );
}

export default AppLoadingProvider;
