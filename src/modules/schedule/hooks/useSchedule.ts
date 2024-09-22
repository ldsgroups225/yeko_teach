import { useCallback, useState } from "react";
import { IScheduleDTO } from "@modules/app/types/IScheduleDTO";
import { addStoreDataAsync, getStoreDataAsync } from "@helpers/storage";
import { StoreEnum } from "@helpers/storage/storeEnum";
import { schedules } from "@modules/schedule/services/scheduleService";

interface UseScheduleReturn {
  getSchedules: (teacherId: string) => Promise<IScheduleDTO[] | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to manage schedule operations with caching.
 * @returns {UseScheduleReturn} An object containing schedule-related functions and states.
 */
export const useSchedule = (): UseScheduleReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSchedules = useCallback(
    async (teacherId: string): Promise<IScheduleDTO[] | null> => {
      setLoading(true);
      setError(null);
      try {
        const cachedSchedulesData = await getStoreDataAsync<IScheduleDTO[]>(
          StoreEnum.Schedules
        );
        if (cachedSchedulesData) return cachedSchedulesData;

        const schedulesData = await schedules.getSchedules(teacherId);
        await addStoreDataAsync(StoreEnum.Schedules, schedulesData);

        return schedulesData;
      } catch (err) {
        setError("Failed to get schedule records.");
        console.error("[E_GET_SCHEDULES]:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    getSchedules,
    loading,
    error,
  };
};
