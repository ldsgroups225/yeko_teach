import type { ColorSchemeName } from 'react-native'
import type { IStudentDTO, IUserDTO } from '../types/ILoginDTO'

export interface ProfileCompletion {
  currentStep: number
  theme: string
  language: string
  avatar: string
  gender: string
  country: string
  city: string
  grade: string
  referral: string
}

export interface ISemester {
  id: number
  name: string
  isCurrent: boolean
}

export interface IAppState {
  isSignedIn: boolean
  userColorScheme: ColorSchemeName
  isLoading: boolean
  user?: IUserDTO
  selectedStudent?: IStudentDTO
  authToken?: string
  expoToken?: string
  profileCompletion: ProfileCompletion
  schoolYear?: {
    id: number
    name: string
  }
  semesters: ISemester[]
}
