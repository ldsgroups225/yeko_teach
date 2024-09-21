import { useCallback } from "react";
import { auth } from "@modules/app/services/appService";
import { useTeacherData } from "./useTeacherData";
import { IUserDTO } from "@modules/app/types/ILoginDTO";

export const useAuthCheck = () => {
  const { fetchTeacherData } = useTeacherData();

  return useCallback(async (): Promise<IUserDTO | null> => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await auth.getAccount();

      if (sessionError) {
        console.error("[E_GET_SESSION]:", sessionError);
        return null;
      }

      if (session) {
        return await fetchTeacherData(session.user.id);
      }
      return null;
    } catch (err) {
      console.error("[E_AUTH_CHECK]:", err);
      return null;
    }
  }, [fetchTeacherData]);
};
