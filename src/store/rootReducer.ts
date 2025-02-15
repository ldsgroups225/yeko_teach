import AppReducer from '@modules/app/redux/appSlice'
/**
 * @author Ali Burhan Keskin <alikeskin@milvasoft.com>
 */
import { combineReducers } from 'redux'

/**
 * Root reducer function that combines all the reducers.
 * @returns The combined reducer object.
 */
export default combineReducers({
  AppReducer,
})
