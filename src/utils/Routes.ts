// src/utils/Routes.ts

import type { IClassDTO, ISchoolDTO } from '@modules/app/types/ILoginDTO'
import type { ParamListBase } from '@react-navigation/native'

/**
 * Enum representing the available routes in the application.
 */
export enum Routes {
  Core = 'Core',
  Login = 'Login',
  User = 'User',
  School = 'School',
  SchoolDetails = 'SchoolDetails',
  SchoolClassDetails = 'SchoolClassDetails',
  Chat = 'Chat',
  ChatDetails = 'ChatDetails',
  Schedule = 'Schedule',
  SchoolClassNotes = 'SchoolClassNotes',
}

/**
 * Represents the parameter types for the root stack navigation.
 */
export interface RootStackParams {
  [Routes.Core]: undefined
  [Routes.Login]: undefined
}

/**
 * Represents the parameter types for the schedule stack routes.
 */
export interface ScheduleStackParams {
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
