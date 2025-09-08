// src/providers/AppLoadingProvider.tsx

import MontserratFont from '@assets/font'
import { drizzleDb } from '@src/db/config'
import migrations from '@src/drizzle/migrations'
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator'
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin'
import { useFonts } from 'expo-font'
import * as SplashScreen from 'expo-splash-screen'
import type React from 'react'
import type { ReactElement } from 'react'
import { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

SplashScreen.preventAutoHideAsync().then(r => r)

interface Props {
  children: React.ReactNode
}

const styles = StyleSheet.create({
  flex1: { flex: 1 }
})

/**
 * Provides an app loading screen that preloads fonts and hides the splash screen
 * once the app is ready to render.
 *
 * @param {Props} props - The component props.
 * @param {ReactNode} props.children - The child components to render.
 * @returns {ReactElement | null} The rendered component.
 */
function AppLoadingProvider({ children }: Props): ReactElement | null {
  const [fontsLoaded, fontError] = useFonts(MontserratFont)
  const { success: dbMigrated, error: dbError } = useMigrations(
    drizzleDb,
    migrations
  )

  useDrizzleStudio(drizzleDb.$client)

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync()
    }
  }, [fontsLoaded, fontError])

  if ((!fontsLoaded && !fontError) || (!dbMigrated && !dbError)) {
    return null
  }

  return (
    <View onLayout={onLayoutRootView} style={styles.flex1}>
      {children}
    </View>
  )
}

export default AppLoadingProvider
