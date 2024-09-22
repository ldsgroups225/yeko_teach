import { useCallback, useState } from "react";
import { IClassDTO } from "@modules/app/types/ILoginDTO";
import { classes } from "@modules/school/services/classService";
import { addStoreDataAsync, getStoreDataAsync } from "@helpers/storage";
import { StoreEnum } from "@helpers/storage/storeEnum";

interface UseClassReturn {
  getClasses: (
    teacherId: string,
    schoolId: string
  ) => Promise<IClassDTO[] | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to manage class operations with caching.
 * @returns {UseClassReturn} An object containing class-related functions and states.
 */
export const useClass = (): UseClassReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getClasses = useCallback(
    async (
      teacherId: string,
      schoolId: string
    ): Promise<IClassDTO[] | null> => {
      setLoading(true);
      setError(null);
      try {
        const cachedClassesData = await getStoreDataAsync<IClassDTO[]>(
          StoreEnum.Classes
        );
        if (cachedClassesData) return cachedClassesData;

        const classesData = await classes.getClasses(teacherId, schoolId);
        await addStoreDataAsync(StoreEnum.Classes, classesData);

        return classesData;
      } catch (err) {
        setError("Failed to get classes records.");
        console.error("[E_GET_CLASSES]:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    getClasses,
    loading,
    error,
  };
};
