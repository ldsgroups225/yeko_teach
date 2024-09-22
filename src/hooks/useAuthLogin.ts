import { useCallback } from "react";
import { auth } from "@modules/app/services/appService";
import { IUserDTO } from "@modules/app/types/ILoginDTO";
import {
  getStoreDataAsync,
  getStoreStringAsync,
  removeStoreDataAsync,
} from "@helpers/storage";
import { StoreEnum } from "@helpers/storage/storeEnum";
import { isCacheTooOld } from "@utils/CacheTooOldChecker";

export const useAuthLogin = (checkAuth: () => Promise<IUserDTO | null>) => {
  return useCallback(
    async (email: string, password: string): Promise<IUserDTO | null> => {
      try {
        // Step 1: Log in the user first
        const { error, data: session } = await auth.loginWithEmailAndPassword(
          email,
          password
        );

        if (error || !session?.user) {
          console.error("[E_AUTH_LOGIN]:", error);
          return null;
        }

        // Step 2: Check cached user data after successful login
        const cachedUser = await getStoreDataAsync<IUserDTO>(StoreEnum.User);
        const cacheDuration = await getStoreStringAsync(
          StoreEnum.CacheDuration
        );

        if (cachedUser && cacheDuration) {
          const isOldCache = isCacheTooOld(cacheDuration);

          // Step 3: If cache is valid, return cached user
          if (!isOldCache && cachedUser.id === session.user.id) {
            return cachedUser;
          }

          // If cache is outdated, clear it
          await removeStoreDataAsync(StoreEnum.User);
          await removeStoreDataAsync(StoreEnum.CacheDuration);
          await removeStoreDataAsync(StoreEnum.Classes);
          await removeStoreDataAsync(StoreEnum.Notes);
        }

        // Step 4: Fetch fresh user data if cache is invalid or outdated
        return await checkAuth();
      } catch (err) {
        console.error("[E_AUTH_LOGIN]:", err);
        return null;
      }
    },
    [checkAuth]
  );
};
