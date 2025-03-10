// src/providers/index.tsx

import React from 'react'
import AppLoadingProvider from './AppLoadingProvider'
import NetworkInfoContainer from './NetworkInfoContainer'
import ThemeListener from './ThemeListener'
import ThemeProvider from './ThemeProvider'
import Toast from './Toast'
import './Localization'

interface Props {
  children: React.ReactNode
}

/**
 * Providers for `global` transactions.
 * The `CustomProvider` is used to `monitor` and take action at every moment of the application.
 */
function CustomProvider({ children }: Props) {
  return (
    <AppLoadingProvider>
      <NetworkInfoContainer>
        <ThemeProvider>
          <Toast />

          {/* <PushNotificationSetup /> */}

          {children}

          <ThemeListener />
        </ThemeProvider>
      </NetworkInfoContainer>
    </AppLoadingProvider>
  )
}

export default CustomProvider
