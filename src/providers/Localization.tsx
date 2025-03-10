// src/providers/Localization.tsx

import type { ReactNode } from 'react'
import i18n from '@helpers/global/i18nInstance'
import { useLocale } from '@hooks/useLocale'
import React, { createContext, useContext } from 'react'

interface LocalizationContextType {
  locale: string
  changeLocale: (newLocale: string) => void
  t: (key: string, options?: object) => string
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(
  undefined,
)

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { locale, changeLocale } = useLocale()

  const value = {
    locale,
    changeLocale,
    t: (key: string, options?: object) => i18n.t(key, options),
  }

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  )
}

export function useLocalization() {
  const context = useContext(LocalizationContext)
  if (context === undefined) {
    throw new Error(
      'useLocalization must be used within a LocalizationProvider',
    )
  }
  return context
}
