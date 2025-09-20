// src/hooks/useAuthFlow.ts

import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { showToast } from '@helpers/toast/showToast'
import { setUser } from '@modules/app/redux/appSlice'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useAppSelector } from '@src/store'
import {
  getAuthErrorMessage,
  requiresEmailConfirmation
} from '@utils/authErrors'
import type { RootStackParams } from '@utils/Routes'
import Routes from '@utils/Routes'
import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { useAuth } from './useAuth'

/**
 * Comprehensive auth flow hook that handles all authentication scenarios
 */
export function useAuthFlow() {
  const navigation = useNavigation<StackNavigationProp<RootStackParams>>()
  const dispatch = useDispatch()
  const user = useAppSelector(state => state.AppReducer?.user)
  const {
    login,
    signUp,
    sendPasswordResetEmail,
    updateUserProfile,
    isProfileComplete,
    loading
  } = useAuth()

  /**
   * Handle login with comprehensive error handling and navigation
   */
  const handleLogin = useCallback(
    async (email: string, password: string) => {
      try {
        const user = await login(email, password)
        if (!user) {
          showToast('Échec de la connexion', ToastColorEnum.Error)
          return { success: false }
        }

        // Check if profile is complete
        const profileComplete = await isProfileComplete(user.id)

        // Navigate based on profile completion
        if (profileComplete) {
          navigation.navigate(Routes.Core as never)
        } else {
          navigation.navigate(Routes.CompleteTeacherProfile as never)
        }

        showToast(
          `Bienvenue ${user.firstName || user.email}!`,
          ToastColorEnum.Success
        )
        return { success: true, user }
      } catch (error: unknown) {
        console.error('Login error:', error)
        const errorMessage = getAuthErrorMessage(error)

        // Special handling for email confirmation
        if (requiresEmailConfirmation(error)) {
          showToast(errorMessage, ToastColorEnum.Warning, 7000)
          // Could navigate to resend confirmation screen
        } else {
          showToast(errorMessage, ToastColorEnum.Error)
        }

        return { success: false, error }
      }
    },
    [login, isProfileComplete, navigation]
  )

  /**
   * Handle sign up with email confirmation navigation
   */
  const handleSignUp = useCallback(
    async (email: string, password: string) => {
      try {
        const result = await signUp(email, password)

        if (result && typeof result === 'object' && 'error' in result) {
          const errorMessage = getAuthErrorMessage(
            (result as { error: string }).error
          )
          showToast(errorMessage, ToastColorEnum.Error)
          return { success: false, error: (result as { error: string }).error }
        }

        // Navigate to email confirmation
        navigation.navigate(Routes.EmailConfirmation, { email })
        showToast(
          'Compte créé avec succès ! Vérifiez votre email.',
          ToastColorEnum.Success
        )

        return { success: true }
      } catch (error: unknown) {
        console.error('Sign up error:', error)
        const errorMessage = getAuthErrorMessage(error)
        showToast(errorMessage, ToastColorEnum.Error)
        return { success: false, error }
      }
    },
    [signUp, navigation]
  )

  /**
   * Handle forgot password with user feedback
   */
  const handleForgotPassword = useCallback(
    async (email: string) => {
      try {
        const { error } = await sendPasswordResetEmail(email)

        if (error) {
          const errorMessage = getAuthErrorMessage(error)
          showToast(errorMessage, ToastColorEnum.Error)
          return { success: false, error }
        }

        showToast(
          'Email de réinitialisation envoyé avec succès',
          ToastColorEnum.Success
        )
        return { success: true }
      } catch (error: unknown) {
        console.error('Forgot password error:', error)
        const errorMessage = getAuthErrorMessage(error)
        showToast(errorMessage, ToastColorEnum.Error)
        return { success: false, error }
      }
    },
    [sendPasswordResetEmail]
  )

  /**
   * Handle profile completion with navigation
   */
  const handleCompleteProfile = useCallback(
    async (profileData: {
      firstName: string
      lastName: string
      phone: string
      schoolId?: string
    }) => {
      if (!user) {
        showToast('Aucun utilisateur connecté', ToastColorEnum.Error)
        return { success: false }
      }

      try {
        const { error } = await updateUserProfile(user.id, profileData)

        if (error) {
          const errorMessage = getAuthErrorMessage(error)
          showToast(errorMessage, ToastColorEnum.Error)
          return { success: false, error }
        }

        // Update Redux state
        const updatedUser = {
          ...user,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone
        }
        dispatch(setUser(updatedUser))

        showToast('Profil complété avec succès !', ToastColorEnum.Success)
        navigation.navigate(Routes.Core as never)

        return { success: true, user: updatedUser }
      } catch (error: unknown) {
        console.error('Complete profile error:', error)
        const errorMessage = getAuthErrorMessage(error)
        showToast(errorMessage, ToastColorEnum.Error)
        return { success: false, error }
      }
    },
    [user, updateUserProfile, dispatch, navigation]
  )

  /**
   * Check if user needs to complete profile
   */
  const checkProfileCompletion = useCallback(
    async (userId: string) => {
      try {
        return await isProfileComplete(userId)
      } catch (error) {
        console.error('Error checking profile completion:', error)
        return false
      }
    },
    [isProfileComplete]
  )

  /**
   * Navigate to appropriate screen based on auth state
   */
  const navigateBasedOnAuthState = useCallback(
    async (user: unknown) => {
      if (!user) {
        navigation.navigate(Routes.Login as never)
        return
      }

      const profileComplete = await checkProfileCompletion(
        (user as { id: string }).id
      )

      if (profileComplete) {
        navigation.navigate(Routes.Core as never)
      } else {
        navigation.navigate(Routes.CompleteTeacherProfile as never)
      }
    },
    [navigation, checkProfileCompletion]
  )

  return {
    // Auth actions
    handleLogin,
    handleSignUp,
    handleForgotPassword,
    handleCompleteProfile,

    // Utility functions
    checkProfileCompletion,
    navigateBasedOnAuthState,

    // State
    loading,
    user
  }
}
