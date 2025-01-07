export interface ISubjectDTO {
  id: string;
  name: string;
}

export interface IStudentDTO {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  note?: number;
}

export interface INoteDetailDTO {
  id?: string;
  noteId: string;
  subjectId: string;
  studentId: string;
  note?: number;
  gradedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INoteDTO {
  id?: string;
  schoolId: string;
  schoolYearId: number;
  semesterId: number;
  noteType: string;
  title?: string;
  description?: string;
  totalPoints: number;
  weight?: number;
  isGraded: boolean;
  createdAt: Date;
  publishedAt?: Date;
  dueDate?: Date;
  teacherId: string;
  isPublished: boolean;
  isActive: boolean;
  classId: string;
  noteDetails?: INoteDetailDTO[];
}

export interface ISchoolDTO {
  id: string;
  name: string;
  code: string;
  imageUrl: string;
  subjectsTeach: ISubjectDTO[];
}

export interface IClassDTO {
  id: string;
  name: string;
  gradeId: number;
  gradeName: string;
  subjects: ISubjectDTO[];
  students: IStudentDTO[];
}

export interface IUserDTO {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  schools: ISchoolDTO[];
}

export interface ILoginDTO {
  email: string;
  password: string;
}

export enum ERole {
  TEACHER = 2,
}

export enum EState {
  ACTIVE = 1,
}

export interface ITeacherDataRawDTO {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  schools: {
    id: string;
    name: string;
    code: string;
    imageUrl: string;
    subjectsTeach: {
      id: string;
      name: string;
    }[];
  }[];
}

export interface INoteDetailRawToSaveDTO {
  noteId: string;
  studentId: string;
  note: number;
  subjectId: string;
}
