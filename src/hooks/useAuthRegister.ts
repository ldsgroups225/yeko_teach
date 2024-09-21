import { useCallback } from "react";
import { auth } from "@modules/app/services/appService";

export const useAuthRegister = () => {
  return useCallback(
    async (
      email: string,
      password: string,
      firstName?: string,
      lastName?: string,
      phone?: string
    ): Promise<boolean> => {
      try {
        const { error } = await auth.createAccount(
          email,
          password,
          firstName,
          lastName,
          phone
        );
        if (error) {
          console.error("[E_AUTH_REGISTER]:", error);
          return false;
        }
        return true;
      } catch (err) {
        console.error("[E_AUTH_REGISTER]:", err);
        return false;
      }
    },
    []
  );
};
