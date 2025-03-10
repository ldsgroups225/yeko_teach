// src/hooks/useDataFetching.ts

import { useCallback, useEffect, useRef, useState } from 'react'

interface UseDataFetchingResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refreshing: boolean
  refetch: () => void
}

interface UseDataFetchingOptions {
  lazy?: boolean
}

function useDataFetching<T>(
  fetchFunction: () => Promise<T>,
  initialData: T | null = null,
  options: UseDataFetchingOptions = {},
): UseDataFetchingResult<T> {
  const { lazy = false } = options
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState<boolean>(!lazy)
  const [error, setError] = useState<Error | null>(null)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  // Prevent state updates if component unmounts
  const isMountedRef = useRef(true)
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchData = useCallback(async () => {
    // When not refreshing, set loading (for initial fetch)
    if (!refreshing) {
      setLoading(true)
    }
    setError(null)
    try {
      const result = await fetchFunction()
      if (isMountedRef.current) {
        setData(result)
      }
    }
    catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      }
    }
    finally {
      if (isMountedRef.current) {
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [fetchFunction, refreshing])

  // Auto-fetch on mount unless lazy is true
  useEffect(() => {
    if (!lazy) {
      fetchData()
    }
  }, [fetchData, lazy])

  // Expose a refetch function for manual fetching
  const refetch = useCallback(() => {
    setRefreshing(true)
    fetchData()
  }, [fetchData])

  return { data, loading, error, refreshing, refetch }
}

export default useDataFetching
