import { useCallback, useEffect } from "react";
import { IUserDTO } from "@modules/app/types/ILoginDTO";
import { useAuthCheck } from "./useAuthCheck";
import { useAuthRegister } from "./useAuthRegister";
import { useAuthLogin } from "./useAuthLogin";
import { useAuthLogout } from "./useAuthLogout";
import { useLoading } from "./useLoading";

interface UseAuthReturn {
  loading: boolean;
  register: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    phone?: string
  ) => Promise<boolean>;
  login: (email: string, password: string) => Promise<IUserDTO | null>;
  checkAuth: () => Promise<IUserDTO | null>;
  logout: () => Promise<boolean>;
}

export const useAuth = (): UseAuthReturn => {
  const { loading, withLoading } = useLoading(true);
  const checkAuth = useAuthCheck();
  const register = useAuthRegister();
  const login = useAuthLogin(checkAuth);
  const logout = useAuthLogout();

  useEffect(() => {
    withLoading(checkAuth);
  }, [withLoading, checkAuth]);

  const wrappedRegister = useCallback(
    (
      email: string,
      password: string,
      firstName?: string,
      lastName?: string,
      phone?: string
    ) =>
      withLoading(() => register(email, password, firstName, lastName, phone)),
    [withLoading, register]
  );

  const wrappedLogin = useCallback(
    (email: string, password: string) =>
      withLoading(() => login(email, password)),
    [withLoading, login]
  );

  const wrappedLogout = useCallback(
    () => withLoading(logout),
    [withLoading, logout]
  );

  return {
    loading,
    register: wrappedRegister,
    login: wrappedLogin,
    logout: wrappedLogout,
    checkAuth,
  };
};
