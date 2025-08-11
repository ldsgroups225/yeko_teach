// src/hooks/useAuth.ts

import type { IUserDTO } from '@modules/app/types/ILoginDTO'
import { useCallback, useEffect } from 'react'
import { useAuthCheck } from './useAuthCheck'
import { useAuthLogin } from './useAuthLogin'
import { useAuthLogout } from './useAuthLogout'
import { useLoading } from './useLoading'

interface UseAuthReturn {
  loading: boolean
  login: (email: string, password: string) => Promise<IUserDTO | null>
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
  }, [])

  const wrappedLogin = (email: string, password: string) =>
    withLoading(() => login(email, password))

  const wrappedLogout = () => withLoading(logout)

  return {
    loading,
    login: wrappedLogin,
    logout: wrappedLogout,
    checkAuth,
  }
}
