// src/network/index.ts

import { loggedOut, setAuthToken } from '@modules/app/redux/appSlice'
import type { BaseQueryFn } from '@reduxjs/toolkit/query'
import { fetchBaseQuery } from '@reduxjs/toolkit/query'
import type {
  FetchArgs,
  FetchBaseQueryArgs as FetchBaseQueryArgx,
  FetchBaseQueryError
} from '@reduxjs/toolkit/query/react'
import type { RootState } from '@src/store'

/**
 * Configuration object for the base query used in network requests.
 */
const FetchBaseQueryArgs: FetchBaseQueryArgx = {
  baseUrl: '/',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).AppReducer.authToken
    // If we have a token set in state, let's assume that we should be passing it.
    if (token) {
      headers.set('authorization', `Bearer ${token}`)
    }
    return headers
  },
  responseHandler: response => {
    if (!response.ok) {
      throw new Error(response.statusText)
    }
    return response.json()
  }
}

/**
 * A function that represents the base query for network requests.
 *
 * @param args - The arguments for the base query.
 * @returns The result of the base query.
 */
export const baseQuery = fetchBaseQuery(FetchBaseQueryArgs)

/**
 * A custom base query function that automatically handles re-authentication.
 *
 * @param args - The query arguments.
 * @param api - The API object provided by RTK Query.
 * @param extraOptions - Extra options for the base query.
 * @returns The result of the base query.
 */
export const baseQueryWithReAuth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // try to get a new token
    const refreshResult = await baseQuery('/refreshToken', api, extraOptions)
    if (refreshResult.data) {
      // store the new token
      api.dispatch(setAuthToken(refreshResult.data as never))
      // retry the initial query
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(loggedOut())
    }
  }
  return result
}
