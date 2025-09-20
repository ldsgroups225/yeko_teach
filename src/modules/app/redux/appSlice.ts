import type { IStudentDTO, IUserDTO } from '@modules/app/types/ILoginDTO'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { ColorSchemeName } from 'react-native'
import type { IAppState, ISemester, ProfileCompletion } from './IAppState'

/**
 * Initial state for the app slice.
 */
const initialState: IAppState = {
  isSignedIn: false,
  userColorScheme: 'light',
  isLoading: false,
  user: undefined,
  schoolYear: undefined,
  semesters: [],
  selectedStudent: undefined,
  authToken: undefined,
  expoToken: undefined,
  profileCompletion: {
    currentStep: 0,
    theme: 'auto',
    language: 'english',
    avatar: '',
    gender: '',
    country: '',
    city: '',
    grade: '',
    referral: ''
  }
}

/**
 * A slice of the Redux store that manages app-related state.
 */
const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    /**
     * Set the sign-in status of the user.
     * @param state - The current state.
     * @param action - Action containing the sign-in status.
     */
    setIsSignedIn(state: IAppState, action: PayloadAction<boolean>) {
      state.isSignedIn = action.payload
    },

    /**
     * Set the user's color scheme (light or dark mode).
     * @param state - The current state.
     * @param action - Action containing the color scheme.
     */
    setUserColorScheme(
      state: IAppState,
      action: PayloadAction<ColorSchemeName>
    ) {
      state.userColorScheme = action.payload
    },

    /**
     * Set the loading state of the application.
     * @param state - The current state.
     * @param action - Action containing the loading status.
     */
    setIsLoading(state: IAppState, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },

    /**
     * Set the user object and mark the user as signed in.
     * @param state - The current state.
     * @param action - Action containing the user object.
     */
    setUser(state: IAppState, action: PayloadAction<unknown>) {
      state.user = action.payload as IUserDTO
      state.isSignedIn = true
    },

    /**
     * Set the current selected student object.
     * @param state - The current state.
     * @param action - Action containing the user object.
     */
    setSelectedStudent(state: IAppState, action: PayloadAction<unknown>) {
      state.selectedStudent = action.payload as IStudentDTO
    },

    /**
     * Log out the user by resetting the relevant state properties.
     * @param state - The current state.
     */
    loggedOut(state: IAppState) {
      state.isSignedIn = false
      state.authToken = undefined
      state.expoToken = undefined
      state.selectedStudent = undefined
      // state.user = undefined;
      state.schoolYear = undefined
      state.semesters = []
    },

    /**
     * Set the authentication token.
     * @param state - The current state.
     * @param action - Action containing the authentication token.
     */
    setAuthToken(state: IAppState, action: PayloadAction<string | undefined>) {
      state.authToken = action.payload
    },

    /**
     * Set the Expo push notification token.
     * @param state - The current state.
     * @param action - Action containing the Expo token.
     */
    setExpoToken(state: IAppState, action: PayloadAction<string | undefined>) {
      state.expoToken = action.payload
    },

    /**
     * Update the profile completion state with partial updates.
     * @param state - The current state.
     * @param action - Action containing the profile completion details.
     */
    setProfileCompletion(
      state: IAppState,
      action: PayloadAction<Partial<ProfileCompletion>>
    ) {
      state.profileCompletion = {
        ...state.profileCompletion,
        ...action.payload
      }
    },

    /**
     * Set the current school year.
     * @param state - The current state.
     * @param action - Action containing the school year.
     */
    setSchoolYear(
      state: IAppState,
      action: PayloadAction<{ id: number; name: string }>
    ) {
      state.schoolYear = action.payload
    },

    /**
     * Set the semesters.
     * @param state - The current state.
     * @param action - Action containing the semesters.
     */
    setSemesters(state: IAppState, action: PayloadAction<ISemester[]>) {
      state.semesters = action.payload
    }
  }
})

export const {
  setIsSignedIn,
  setUserColorScheme,
  setIsLoading,
  setUser,
  setSelectedStudent,
  loggedOut,
  setAuthToken,
  setExpoToken,
  setProfileCompletion,
  setSchoolYear,
  setSemesters
} = appSlice.actions

export default appSlice.reducer
