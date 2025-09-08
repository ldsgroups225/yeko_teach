import type {
  ISchoolDTO,
  ISubjectDTO,
  ITeacherDataRawDTO,
  IUserDTO
} from '@modules/app/types/ILoginDTO'

export function transformUserData(data: ITeacherDataRawDTO): IUserDTO {
  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    email: data.email,
    schools: data.schools.map(
      (school): ISchoolDTO => ({
        id: school.id,
        name: school.name,
        code: school.code,
        imageUrl: school.imageUrl,
        subjectsTeach: school.subjectsTeach.map(
          (subject): ISubjectDTO => ({
            id: subject.id,
            name: subject.name
          })
        )
      })
    )
  }
}
