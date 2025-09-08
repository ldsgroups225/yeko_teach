// src/helpers/storage/index.ts

import { isObjectLike } from '@helpers/global'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { StoreEnum } from './storeEnum'

/**
 * Adds data to the storage with the specified key.
 * If the value is an object, it will be converted to a JSON string before storing.
 *
 * @param key - The key to associate with the data.
 * @param value - The value to store.
 * @returns A Promise that resolves when the data is successfully stored, or rejects if there was an error.
 */
export async function addStoreDataAsync(
  key: StoreEnum,
  value: unknown
): Promise<void> {
  try {
    if (isObjectLike(value)) {
      value = JSON.stringify(value)
    }

    await AsyncStorage.setItem(key.toString(), value as string)
  } catch (e) {
    // saving error
    console.error('Error saving data:', e)
  }
}

/**
 * Retrieves data from AsyncStorage based on the provided key.
 *
 * @param key - The key to retrieve the data from AsyncStorage.
 * @returns A promise that resolves to the retrieved data, or an empty string if the data is not found or an error occurs.
 */
export async function getStoreDataAsync<T>(key: StoreEnum): Promise<T | null> {
  try {
    const value = await AsyncStorage.getItem(key.toString())
    if (value !== null) {
      return JSON.parse(value) as T
    }
    return null
  } catch {
    return null
  }
}

/**
 * Retrieves a string value from the storage based on the provided key.
 * @param key - The key used to retrieve the value from the storage.
 * @returns A promise that resolves to the retrieved string value, or an empty string if the value is not found or an error occurs.
 */
export async function getStoreStringAsync(key: StoreEnum): Promise<string> {
  try {
    const value = await AsyncStorage.getItem(key.toString())
    if (value !== null) {
      return value
    }
    return ''
  } catch {
    return ''
  }
}

/**
 * Removes the data associated with the specified key from the storage.
 *
 * @param key - The key of the data to be removed.
 * @returns A Promise that resolves when the data is successfully removed.
 */
export async function removeStoreDataAsync(key: StoreEnum): Promise<void> {
  try {
    await AsyncStorage.removeItem(key.toString())
  } catch {
    console.error('error')
  }
}
