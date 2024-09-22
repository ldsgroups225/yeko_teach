import { useCallback } from "react";
import { auth } from "@modules/app/services/appService";
import { IUserDTO } from "@modules/app/types/ILoginDTO";

export const useAuthLogin = (checkAuth: () => Promise<IUserDTO | null>) => {
  return useCallback(
    async (email: string, password: string): Promise<IUserDTO | null> => {
      try {
        const { error } = await auth.loginWithEmailAndPassword(email, password);
        if (error) {
          console.error("[E_AUTH_LOGIN]:", error);
          return null;
        }
        return await checkAuth();
      } catch (err) {
        console.error("[E_AUTH_LOGIN]:", err);
        return null;
      }
    },
    [checkAuth]
  );
};
