// src/store/rootReducer.ts

import AppReducer from '@modules/app/redux/appSlice'
import { combineReducers } from 'redux'

/**
 * Root reducer function that combines all the reducers.
 * @returns The combined reducer object.
 */
export default combineReducers({
  AppReducer,
})
