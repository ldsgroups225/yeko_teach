/**
 * @author Ali Burhan Keskin <alikeskin@milvasoft.com>
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { isObjectLike } from "@helpers/global";
import { StoreEnum } from "./storeEnum";

/**
 * Adds data to the storage with the specified key.
 * If the value is an object, it will be converted to a JSON string before storing.
 *
 * @param key - The key to associate with the data.
 * @param value - The value to store.
 * @returns A Promise that resolves when the data is successfully stored, or rejects if there was an error.
 */
export const addStoreDataAsync = async (
  key: StoreEnum,
  value: unknown
): Promise<void> => {
  try {
    if (isObjectLike(value)) {
      value = JSON.stringify(value);
    }

    await AsyncStorage.setItem(key.toString(), value as string);
  } catch (e) {
    // saving error
    console.error("Error saving data:", e);
  }
};

/**
 * Retrieves data from AsyncStorage based on the provided key.
 * The return type is dynamic, inferred from the provided generic type.
 *
 * @param key - The key to retrieve the data from AsyncStorage.
 * @returns A promise that resolves to the retrieved data, or the provided fallback value if the data is not found or an error occurs.
 */
export const getStoreDataAsync = async <T>(
  key: StoreEnum
): Promise<T | null> => {
  try {
    const value = await AsyncStorage.getItem(key.toString());

    if (value !== null) {
      return JSON.parse(value) as T;
    }

    return null;
  } catch (e) {
    console.error("Error retrieving data:", e);
    return null;
  }
};

/**
 * Retrieves a string value from the storage based on the provided key.
 * @param key - The key used to retrieve the value from the storage.
 * @returns A promise that resolves to the retrieved string value, or an empty string if the value is not found or an error occurs.
 */
export const getStoreStringAsync = async (key: StoreEnum): Promise<string> => {
  try {
    const value = await AsyncStorage.getItem(key.toString());
    if (value !== null) {
      return value;
    }

    return "";
  } catch (e) {
    console.error("Error retrieving string:", e);
    return "";
  }
};

/**
 * Removes the data associated with the specified key from the storage.
 *
 * @param key - The key of the data to be removed.
 * @returns A Promise that resolves when the data is successfully removed.
 */
export const removeStoreDataAsync = async (key: StoreEnum): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key.toString());
  } catch (exception) {
    console.error("Error removing data:", exception);
  }
};
