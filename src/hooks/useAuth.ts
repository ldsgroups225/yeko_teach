// src/hooks/useAuth.ts

import { auth, type UpdateProfileData } from '@modules/app/services/appService'
import type { IUserDTO } from '@modules/app/types/ILoginDTO'
import { useEffect } from 'react'
import { useAuthCheck } from './useAuthCheck'
import { useAuthLogin } from './useAuthLogin'
import { useAuthLogout } from './useAuthLogout'
import { useLoading } from './useLoading'

interface UseAuthReturn {
  loading: boolean
  login: (email: string, password: string) => Promise<IUserDTO | null>
  signUp: (email: string, password: string) => Promise<unknown>
  updateUserProfile: (
    userId: string,
    profileData: unknown
  ) => Promise<{ error: unknown }>
  isProfileComplete: (userId: string) => Promise<boolean>
  sendPasswordResetEmail: (email: string) => Promise<{ error: unknown }>
  checkAuth: () => Promise<IUserDTO | null>
  logout: () => Promise<boolean>
}

export function useAuth(): UseAuthReturn {
  const { loading, withLoading } = useLoading(true)
  const checkAuth = useAuthCheck()
  const login = useAuthLogin(checkAuth)
  const logout = useAuthLogout()

  useEffect(() => {
    withLoading(checkAuth)
  }, [checkAuth, withLoading])

  const wrappedLogin = (email: string, password: string) =>
    withLoading(() => login(email, password))

  const wrappedSignUp = (email: string, password: string) =>
    withLoading(() => auth.signUp(email, password))

  const wrappedUpdateUserProfile = (
    userId: string,
    profileData: UpdateProfileData
  ) => withLoading(() => auth.updateUserProfile(userId, profileData))

  const wrappedIsProfileComplete = (userId: string) =>
    withLoading(() => auth.isProfileComplete(userId))

  const wrappedSendPasswordResetEmail = (email: string) =>
    withLoading(() => auth.sendPasswordResetEmail(email))

  const wrappedLogout = () => withLoading(logout)

  return {
    loading,
    login: wrappedLogin,
    signUp: wrappedSignUp,
    updateUserProfile: wrappedUpdateUserProfile,
    isProfileComplete: wrappedIsProfileComplete,
    sendPasswordResetEmail: wrappedSendPasswordResetEmail,
    logout: wrappedLogout,
    checkAuth
  }
}
