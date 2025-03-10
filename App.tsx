// App.tsx

import * as ScreenOrientation from 'expo-screen-orientation'
import React, { useEffect } from 'react'
import { Platform } from 'react-native'
import { enableScreens } from 'react-native-screens'
import { Provider } from 'react-redux'
import CustomProvider from './src/providers'
import ErrorBoundary from './src/providers/ErrorBoundary'
import RootNavigation from './src/routers'
import Store from './src/store'
import 'react-native-gesture-handler'

enableScreens()

function App() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      // TODO: Orientation Configuration
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      )
    }
  }, [])

  return (
    // @ts-expect-error: ErrorBoundary requires children
    <ErrorBoundary>
      <Provider store={Store}>
        <CustomProvider>
          <RootNavigation />
        </CustomProvider>
      </Provider>
    </ErrorBoundary>
  )
}

export default App
