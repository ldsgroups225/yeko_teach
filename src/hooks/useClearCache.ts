// src/hooks/useClearCache.ts

import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { removeStoreDataAsync } from '@helpers/storage'
import { StoreEnum } from '@helpers/storage/storeEnum'
import { showToast } from '@helpers/toast/showToast'
import { useCallback, useState } from 'react'

interface ClearCacheProps {
  showSuccesToast?: boolean
  showErrorToast?: boolean
}

/**
 * A custom hook for clearing the app's cache.
 * @returns {object} An object containing the clearing function and loading state.
 */
export function useClearCache({ showSuccesToast = true, showErrorToast = true }: ClearCacheProps = {}) {
  const [isClearing, setIsClearing] = useState(false)

  const clearCache = useCallback(async () => {
    setIsClearing(true)
    try {
      await Promise.all([
        removeStoreDataAsync(StoreEnum.User),
        removeStoreDataAsync(StoreEnum.CacheDuration),
        removeStoreDataAsync(StoreEnum.Classes),
        removeStoreDataAsync(StoreEnum.Notes),
      ])
      if (showSuccesToast) {
        showToast(
          'Les nouvelles données vous seront transmises.',
          ToastColorEnum.Success,
        )
      }
    }
    catch (error) {
      console.error('Error clearing cache:', error)
      if (showErrorToast) {
        showToast(
          'Une erreur s\'est produite lors du nettoyage du cache.',
          ToastColorEnum.Error,
        )
      }
    }
    finally {
      setIsClearing(false)
    }
  }, [])

  return { clearCache, isClearing }
}
