import { useCallback } from "react";
import { auth } from "@modules/app/services/appService";
import { useTeacherData } from "./useTeacherData";
import { IUserDTO } from "@modules/app/types/ILoginDTO";
import {
  addStoreDataAsync,
  getStoreDataAsync,
  getStoreStringAsync,
  removeStoreDataAsync,
} from "@helpers/storage";
import { StoreEnum } from "@helpers/storage/storeEnum";
import { isCacheTooOld } from "@utils/CacheTooOldChecker";

export const useAuthCheck = () => {
  const { fetchTeacherData } = useTeacherData();

  return useCallback(async (): Promise<IUserDTO | null> => {
    try {
      // Step 1: Get current user first
      const {
        data: { session },
        error: sessionError,
      } = await auth.getAccount();

      if (sessionError) {
        console.error("[E_GET_SESSION]:", sessionError);
        return null;
      }

      if (session) {
        // Step 2: Check cached user data after successful login
        const cachedTeacherUser = await getStoreDataAsync<IUserDTO>(
          StoreEnum.User
        );
        const cacheDuration = await getStoreStringAsync(
          StoreEnum.CacheDuration
        );

        if (cachedTeacherUser && cacheDuration) {
          const isOldCache = isCacheTooOld(cacheDuration);

          // Step 3: If cache is valid, return cached user
          if (!isOldCache && cachedTeacherUser.id === session.user.id) {
            return cachedTeacherUser;
          }

          // If cache is outdated, clear it
          await removeStoreDataAsync(StoreEnum.User);
          await removeStoreDataAsync(StoreEnum.CacheDuration);
          await removeStoreDataAsync(StoreEnum.Classes);
          await removeStoreDataAsync(StoreEnum.Notes);
        }

        const teacherData = await fetchTeacherData(session.user.id);

        if (teacherData) {
          // Set cache expiration to 24 hours from now
          const newCacheDuration = new Date().toISOString();

          // Update cache with new user data and cache duration
          await addStoreDataAsync(StoreEnum.User, teacherData);
          await addStoreDataAsync(StoreEnum.CacheDuration, newCacheDuration);

          return teacherData;
        }
      }
      return null;
    } catch (err) {
      console.error("[E_AUTH_CHECK]:", err);
      return null;
    }
  }, [fetchTeacherData]);
};
