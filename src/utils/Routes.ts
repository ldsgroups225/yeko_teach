// src/utils/Routes.ts

import type { IClassDTO, ISchoolDTO } from '@modules/app/types/ILoginDTO'
import type { ParamListBase } from '@react-navigation/native'

/**
 * Enum representing the available routes in the application.
 */
export enum Routes {
  Core = 'Core',
  Login = 'Login',
  TeacherSignUp = 'TeacherSignUp',
  EmailConfirmation = 'EmailConfirmation',
  CompleteTeacherProfile = 'CompleteTeacherProfile',
  ForgotPassword = 'ForgotPassword',
  ResetPassword = 'ResetPassword',
  User = 'User',
  School = 'School',
  SchoolDetails = 'SchoolDetails',
  SchoolClassDetails = 'SchoolClassDetails',
  Chat = 'Chat',
  ChatDetails = 'ChatDetails',
  Schedule = 'Schedule',
  SchoolClassNotes = 'SchoolClassNotes'
}

/**
 * Represents the parameter types for the root stack navigation.
 */
export interface RootStackParams extends ParamListBase {
  [Routes.Core]: undefined
  [Routes.Login]: undefined
  [Routes.TeacherSignUp]: undefined
  [Routes.EmailConfirmation]: { email: string }
  [Routes.CompleteTeacherProfile]: undefined
  [Routes.ForgotPassword]: undefined
  [Routes.ResetPassword]: { accessToken: string }
}

/**
 * Represents the parameter types for the schedule stack routes.
 */
export interface ScheduleStackParams extends ParamListBase {
  [Routes.Schedule]: undefined
}

/**
 * Represents the parameter types for the school stack routes.
 */
export interface SchoolStackParams extends ParamListBase {
  [Routes.School]: undefined
  [Routes.SchoolDetails]: ISchoolDTO
  [Routes.SchoolClassDetails]: {
    school: ISchoolDTO
    classItem: IClassDTO
  }
}

/**
 * Represents the parameter types for the chat stack routes.
 */
export interface ChatStackParams extends ParamListBase {
  [Routes.Chat]: undefined
  [Routes.ChatDetails]: {
    chatId: string
  }
}

/**
 * Represents the parameter types for the profile stack routes.
 */
export interface ProfileStackParams extends ParamListBase {
  [Routes.User]: undefined
}

/**
 * Represents the parameter types for the school class notes stack routes.
 */
export interface SchoolClassNotesStackParams extends ParamListBase {
  [Routes.SchoolClassNotes]: {
    classId: string
  }
}

/**
 * Represents the navigation parameters for the root stack.
 */
export type NavigationParams = RootStackParams

export default Routes
