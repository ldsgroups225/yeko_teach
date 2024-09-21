import { useCallback } from "react";
import { supabase } from "@src/lib/supabase";
import { ITeacherDataRawDTO, IUserDTO } from "@modules/app/types/ILoginDTO";
import { transformUserData } from "@modules/app/utils/dataTransformUtils";

export const useTeacherData = () => {
  const fetchTeacherData = useCallback(
    async (userId: string): Promise<IUserDTO | null> => {
      const { data: userData, error } = await supabase
        .rpc("get_teacher_data", { user_id: userId })
        .single();

      if (error) {
        console.error("[E_FETCH_TEACHER_DATA]:", error);
        return null;
      }

      if (userData && typeof userData === "object" && "id" in userData) {
        return transformUserData(userData as unknown as ITeacherDataRawDTO);
      }

      console.error("[E_FETCH_TEACHER_DATA]: Invalid data structure");
      return null;
    },
    []
  );

  return { fetchTeacherData };
};
