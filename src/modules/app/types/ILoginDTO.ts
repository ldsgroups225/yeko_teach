import type { NOTE_TYPE } from '../constants/noteTypes'

export interface ISubjectDTO {
  id: string
  name: string
}

export interface IStudentDTO {
  id: string
  firstName: string
  lastName: string
  idNumber: string
  note?: number
}

export interface INoteDetailDTO {
  id?: string
  noteId: string
  studentId: string
  note?: number
  gradedAt?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface INoteDTO {
  id?: string
  classId: string
  schoolId: string
  subjectId: string
  teacherId: string
  semesterId: number
  schoolYearId: number
  noteType: NOTE_TYPE
  title?: string
  description?: string | null
  totalPoints: number
  weight: number
  isGraded: boolean
  createdAt?: Date
  publishedAt?: Date
  dueDate?: Date
  isPublished: boolean
  isActive?: boolean
  noteDetails?: INoteDetailDTO[]
}

export interface ISchoolDTO {
  id: string
  name: string
  code: string
  imageUrl: string
  subjectsTeach: ISubjectDTO[]
}

export interface IClassDTO {
  id: string
  name: string
  gradeId: number
  gradeName: string
  subjects: ISubjectDTO[]
  students: IStudentDTO[]
}

export interface IUserDTO {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  schools: ISchoolDTO[]
}

export interface ILoginDTO {
  email: string
  password: string
}

export enum ERole {
  TEACHER = 2
}

export enum EState {
  ACTIVE = 1
}

export interface ITeacherDataRawDTO {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string
  schools: {
    id: string
    name: string
    code: string
    imageUrl: string
    subjectsTeach: {
      id: string
      name: string
    }[]
  }[]
}

export interface INoteDetailRawToSaveDTO {
  noteId: string
  studentId: string
  note: number
}
