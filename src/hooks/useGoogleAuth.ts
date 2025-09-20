import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { showToast } from '@helpers/toast/showToast'
import { setUser } from '@modules/app/redux/appSlice'
import { getUserNameFromEmail } from '@modules/app/utils/formatting'
import { useNavigation } from '@react-navigation/native'
import {
  configureGoogleSignIn,
  signInWithGoogle,
  signOutGoogle,
  signUpWithGoogle
} from '@src/lib/google'
import { supabase } from '@src/lib/supabase/config'
import Routes from '@utils/Routes'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

// Role constants - TEACHER instead of PARENT
const ERole = {
  TEACHER: 2, // Assuming TEACHER role ID is 2, adjust based on your database
  PARENT: 1
} as const

// Types
interface OAuthState {
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  user: unknown | null
}

interface GoogleOAuthResult {
  success: boolean
  user?: {
    id: string
    email: string
    user_metadata: {
      given_name: string
      family_name: string
    }
  }
  error?: string
}

/**
 * Custom hook for Google OAuth authentication
 * Adapted from your web implementation with mobile-specific enhancements
 */
export function useGoogleAuth() {
  const [state, setState] = useState<OAuthState>({
    isLoading: false,
    error: null,
    isAuthenticated: false,
    user: null
  })

  const dispatch = useDispatch()
  const navigation = useNavigation()

  // Initialize Google Sign-In configuration
  useEffect(() => {
    configureGoogleSignIn()
  }, [])

  /**
   * Ensure user has TEACHER role assigned automatically
   */
  const ensureUserHasTeacherRole = useCallback(
    async (
      userId: string,
      userEmail: string
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        // Check if user already has TEACHER role
        const { data: existingRole, error: _roleCheckError } = await supabase
          .from('user_roles')
          .select('role_id')
          .eq('user_id', userId)
          .eq('role_id', ERole.TEACHER)
          .single()

        // If user already has TEACHER role, we're done
        if (existingRole) {
          return { success: true }
        }

        // Create user profile if it doesn't exist
        const { error: profileError } = await supabase.from('users').upsert({
          id: userId,
          email: userEmail,
          first_name: '', // Will be filled during profile completion
          last_name: '', // Will be filled during profile completion
          phone: '', // Will be filled during profile completion
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

        if (profileError) {
          console.warn('Profile creation error:', profileError)
        }

        // Create TEACHER role for the user
        const { error: roleError } = await supabase.from('user_roles').insert({
          user_id: userId,
          role_id: ERole.TEACHER
        })

        if (roleError) {
          console.error('Role assignment error:', roleError)
          return { success: false, error: roleError.message }
        }

        return { success: true }
      } catch (error: unknown) {
        console.error('Error ensuring TEACHER role:', error)
        return { success: false, error: (error as { message: string }).message }
      }
    },
    []
  )

  /**
   * Clear any existing error state
   */
  const clearError = useCallback(() => {
    setState((prev: OAuthState) => ({ ...prev, error: null }))
  }, [])

  /**
   * Handle OAuth error
   */
  const handleOAuthError = useCallback((error: string) => {
    setState((prev: OAuthState) => ({
      ...prev,
      isLoading: false,
      error,
      isAuthenticated: false,
      user: null
    }))

    // Show error toast
    showToast(error, ToastColorEnum.Error, 7000)
  }, [])

  /**
   * Check if user profile is complete
   * Validates that user has provided firstName, lastName, and phone
   */
  const checkProfileComplete = useCallback(
    async (userId: string): Promise<boolean> => {
      try {
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('first_name, last_name, phone')
          .eq('id', userId)
          .single()

        if (error) {
          console.error('Error checking profile completeness:', error)
          return false
        }

        // Check if all required fields are present and not empty
        const hasFirstName = Boolean(userProfile?.first_name?.trim())
        const hasLastName = Boolean(userProfile?.last_name?.trim())
        const hasPhone = Boolean(userProfile?.phone?.trim())

        console.log('Profile completeness check:', {
          userId,
          hasFirstName,
          hasLastName,
          hasPhone,
          profile: userProfile
        })

        return hasFirstName && hasLastName && hasPhone
      } catch (error) {
        console.error('Error in checkProfileComplete:', error)
        return false
      }
    },
    []
  )

  /**
   * Handle successful OAuth result
   */
  const handleOAuthSuccess = useCallback(
    async (result: GoogleOAuthResult, isSignUp: boolean = false) => {
      if (!result.user) return

      try {
        // Ensure user has TEACHER role assigned automatically
        const roleResult = await ensureUserHasTeacherRole(
          result.user.id,
          result.user.email || ''
        )

        if (!roleResult.success) {
          console.error('Failed to assign TEACHER role:', roleResult.error)
          handleOAuthError(
            roleResult.error || "Erreur lors de l'attribution du rôle"
          )
          return
        }

        // Create user object for Redux store with complete structure
        const user = {
          id: result.user.id,
          email: result.user.email || '',
          firstName: result.user.user_metadata?.given_name || '',
          lastName: result.user.user_metadata?.family_name || '',
          phone: '', // Will be filled during profile completion
          pushToken: '',
          children: [],
          schools: [] // Initialize empty schools array to prevent undefined errors
        }

        // Update Redux state
        dispatch(setUser(user))

        // Show success toast
        const userName = user.firstName || getUserNameFromEmail(user.email)
        const message = isSignUp
          ? `Bienvenue ! ${userName}`
          : `Connexion réussie ! Bienvenue ${userName}`
        showToast(message, ToastColorEnum.Success)

        // Update local state
        setState((prev: OAuthState) => ({
          ...prev,
          isLoading: false,
          error: null,
          isAuthenticated: true,
          user: result.user
        }))

        // Check if profile completion is needed
        const profileComplete = await checkProfileComplete(user.id)

        if (!profileComplete) {
          console.log('Google OAuth - Redirecting to CompleteTeacherProfile')
          // Navigate to complete profile screen
          navigation.navigate(Routes.CompleteTeacherProfile as never)
        } else {
          console.log('Google OAuth - Profile complete, redirecting to Core')
          // Navigate to main app (Core/Tabs)
          navigation.navigate(Routes.Core as never)
        }
      } catch (error: unknown) {
        console.error('Error in handleOAuthSuccess:', error)
        handleOAuthError(
          (error as Error).message || 'Erreur lors de la connexion'
        )
      }
    },
    [
      dispatch,
      navigation,
      ensureUserHasTeacherRole,
      checkProfileComplete,
      handleOAuthError
    ]
  )

  /**
   * Google Sign-In for existing users
   */
  const googleSignIn = useCallback(async () => {
    setState((prev: OAuthState) => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await signInWithGoogle()

      if (result.success && result.user) {
        await handleOAuthSuccess(result as GoogleOAuthResult, false)
      } else {
        handleOAuthError(result.error || 'Erreur de connexion avec Google')
      }
    } catch (error: unknown) {
      handleOAuthError(
        (error as Error).message || 'Erreur de connexion avec Google'
      )
    }
  }, [handleOAuthSuccess, handleOAuthError])

  /**
   * Google Sign-Up for new users
   */
  const googleSignUp = useCallback(async () => {
    setState((prev: OAuthState) => ({ ...prev, isLoading: true, error: null }))

    try {
      const result = await signUpWithGoogle()

      if (result.success && result.user) {
        await handleOAuthSuccess(result as GoogleOAuthResult, true)
      } else {
        handleOAuthError(result.error || "Erreur d'inscription avec Google")
      }
    } catch (error: unknown) {
      handleOAuthError(
        (error as Error).message || "Erreur d'inscription avec Google"
      )
    }
  }, [handleOAuthSuccess, handleOAuthError])

  /**
   * Sign out from Google and clear state
   */
  const googleSignOut = useCallback(async () => {
    try {
      await signOutGoogle()
      setState({
        isLoading: false,
        error: null,
        isAuthenticated: false,
        user: null
      })
    } catch (error: unknown) {
      console.error('Error signing out from Google:', error)
    }
  }, [])

  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,
    user: state.user,

    // Actions
    googleSignIn,
    googleSignUp,
    googleSignOut,
    clearError
  } as const
}

/**
 * Simplified hook for basic Google OAuth operations
 * Based on your web implementation pattern
 */
export function useGoogleAuthSimple() {
  const {
    googleSignIn,
    googleSignUp,
    googleSignOut,
    isLoading,
    error,
    clearError
  } = useGoogleAuth()

  return {
    googleSignIn,
    googleSignUp,
    googleSignOut,
    isLoading,
    error,
    clearError
  } as const
}
