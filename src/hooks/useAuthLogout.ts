import { useCallback } from "react";
import { auth } from "@modules/app/services/appService";

export const useAuthLogout = () => {
  return useCallback(async (): Promise<boolean> => {
    try {
      const { error } = await auth.deleteSession();
      if (error) {
        console.error("[E_AUTH_LOGOUT]:", error);
        return false;
      }
      return true;
    } catch (err) {
      console.error("[E_AUTH_LOGOUT]:", err);
      return false;
    }
  }, []);
};
