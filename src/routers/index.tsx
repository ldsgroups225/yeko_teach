// src/routers/index.tsx

import LoadingSpinner from '@components/LoadingSpinner'
import translate from '@helpers/localization'
import { navigationRef } from '@helpers/router'
import { useAuth } from '@hooks/useAuth'
import {
  setSchoolYear,
  setSemesters,
  setUser
} from '@modules/app/redux/appSlice'
import CompleteTeacherProfile from '@modules/app/screens/CompleteTeacherProfile'
import EmailConfirmation from '@modules/app/screens/EmailConfirmation'
import ForgotPassword from '@modules/app/screens/ForgotPassword'
import Login from '@modules/app/screens/Login'
import ResetPassword from '@modules/app/screens/ResetPassword'
import TeacherSignUp from '@modules/app/screens/TeacherSignUp'
import { schoolYear } from '@modules/app/services/appService'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import { useTheme } from '@src/hooks'
import { useAppSelector } from '@src/store'
import type { RootStackParams } from '@utils/Routes'
import Routes from '@utils/Routes'
import { ScreenOptions } from '@utils/ScreenOptions'
import * as React from 'react'
import { useCallback, useEffect, useRef } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { enableScreens } from 'react-native-screens'
import { useDispatch } from 'react-redux'
import BottomNavigation from './BottomNavigation'

enableScreens()
const Stack = createStackNavigator<RootStackParams>()

function RootNavigation() {
  const theme = useTheme()
  const dispatch = useDispatch()
  const { checkAuth, loading } = useAuth()

  const isSignedIn = useAppSelector(s => s.AppReducer?.isSignedIn)
  const userColorScheme = useAppSelector(s => s?.AppReducer?.userColorScheme)
  const isDarkTheme = userColorScheme === 'dark'

  const authCheckRef = useRef(false)
  const dataFetchRef = useRef(false)

  const handleAuthentication = useCallback(async () => {
    try {
      const userData = await checkAuth()
      if (userData) {
        dispatch(setUser(userData))
        return true
      }
      return false
    } catch (error) {
      console.error('Authentication check failed:', error)
      return false
    }
  }, [checkAuth, dispatch])

  const fetchAndStoreSchoolData = useCallback(async () => {
    try {
      const { data, error } =
        await schoolYear.getCurrentSchoolYearWithSemesters()
      if (error) throw error

      if (data && data.schoolYear && data.semesters) {
        dispatch(
          setSchoolYear({
            id: data.schoolYear.id,
            name: data.schoolYear.name!
          })
        )
        dispatch(setSemesters(data.semesters))
      }
    } catch (error) {
      console.error('Failed to fetch school data:', error)
    }
  }, [dispatch])

  useEffect(() => {
    const initializeApp = async () => {
      if (!isSignedIn && !authCheckRef.current) {
        authCheckRef.current = true
        const isAuthenticated = await handleAuthentication()

        if (isAuthenticated && !dataFetchRef.current) {
          dataFetchRef.current = true
          await fetchAndStoreSchoolData()
        }
      }
    }

    initializeApp()
  }, [isSignedIn, handleAuthentication, fetchAndStoreSchoolData])

  const navigationTheme = {
    dark: isDarkTheme,
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.card,
      text: theme.text,
      border: theme.border,
      notification: theme.notification
    },
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400' as const
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500' as const
      },
      bold: {
        fontFamily: 'System',
        fontWeight: '700' as const
      },
      heavy: {
        fontFamily: 'System',
        fontWeight: '900' as const
      }
    }
  }

  if (loading) {
    return <LoadingSpinner />
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
                  headerTitle: translate('navigation.home')
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
              <Stack.Screen
                name={Routes.TeacherSignUp}
                component={TeacherSignUp}
                options={{
                  headerShown: false,
                  title: 'Créer un compte'
                  // headerBackTitle: 'Retour',
                }}
              />
              <Stack.Screen
                name={Routes.EmailConfirmation}
                component={EmailConfirmation}
                options={{
                  headerShown: true,
                  title: 'Confirmation email',
                  headerBackTitle: 'Retour'
                }}
              />
              <Stack.Screen
                name={Routes.ForgotPassword}
                component={ForgotPassword}
                options={{
                  headerShown: true,
                  title: 'Mot de passe oublié',
                  headerBackTitle: 'Retour'
                }}
              />
              <Stack.Screen
                name={Routes.ResetPassword}
                component={ResetPassword}
                options={{
                  headerShown: true,
                  title: 'Réinitialiser le mot de passe',
                  headerBackTitle: 'Retour'
                }}
              />
              <Stack.Screen
                name={Routes.CompleteTeacherProfile}
                component={CompleteTeacherProfile}
                options={{
                  headerShown: true,
                  title: 'Compléter le profil',
                  headerBackTitle: 'Retour',
                  gestureEnabled: false // Prevent going back
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default RootNavigation
