// src/hooks/useLocale.ts

import type {
  SupportedLocale,
} from '@helpers/global/i18nInstance'
import type { Locale } from 'date-fns'
import i18n, {
  DEFAULT_LOCALE,
} from '@helpers/global/i18nInstance'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { setDefaultOptions } from 'date-fns'
import { enUS, fr, tr } from 'date-fns/locale'
import * as Localization from 'expo-localization'
import { useCallback, useEffect, useState } from 'react'

const localeMap: Record<SupportedLocale, Locale> = {
  en: enUS,
  fr,
  tr,
}

function updateI18nInstance(locale: SupportedLocale): void {
  i18n.locale = locale
}

export function useLocale() {
  const [locale, setLocale] = useState<SupportedLocale>(() => {
    const deviceLanguage = Localization.getLocales()?.[0]
      ?.languageCode as SupportedLocale
    return deviceLanguage in localeMap ? deviceLanguage : DEFAULT_LOCALE
  })

  useEffect(() => {
    const loadSavedLocale = async () => {
      try {
        const savedLocale = await AsyncStorage.getItem('userLocale')
        if (savedLocale && savedLocale in localeMap) {
          setLocale(savedLocale as SupportedLocale)
        }
      }
      catch (error) {
        console.error('Failed to load saved locale:', error)
      }
    }

    loadSavedLocale().then(r => r)
  }, [])

  useEffect(() => {
    setDefaultOptions({ locale: localeMap[locale] })
    updateI18nInstance(locale)

    const saveLocale = async () => {
      try {
        await AsyncStorage.setItem('userLocale', locale)
      }
      catch (error) {
        console.error('Failed to save locale:', error)
      }
    }

    saveLocale().then(r => r)
  }, [locale])

  const changeLocale = useCallback((newLocale: SupportedLocale) => {
    setLocale(newLocale)
  }, [])

  return { locale, changeLocale }
}

export default useLocale
