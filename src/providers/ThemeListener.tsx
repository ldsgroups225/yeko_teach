// src/providers/ThemeListener.tsx

import { setUserColorScheme } from '@modules/app/redux/appSlice'
import throttle from 'lodash.throttle'
import { useEffect } from 'react'
import { Appearance } from 'react-native'
import { useDispatch } from 'react-redux'

/**
 * Listens for changes in the device's color scheme and dispatches an action to update the app's theme accordingly.
 */
export default function ThemeListener() {
  const dispatch = useDispatch()

  useEffect(() => {
    const handleColorModeChange = async (
      preferences: Appearance.AppearancePreferences
    ) => {
      dispatch(setUserColorScheme(preferences?.colorScheme))
    }

    Appearance.addChangeListener(
      throttle(handleColorModeChange, 100, { leading: false, trailing: true })
    )

    return () => {}
  }, [dispatch])

  return null
}
