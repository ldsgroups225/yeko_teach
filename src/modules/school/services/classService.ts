// src/modules/school/services/classService.ts

import type { IClassDTO, IStudentDTO } from '@modules/app/types/ILoginDTO'
import type { Database } from '@src/lib/supabase/types'
import { CLASS_TABLE_ID, supabase } from '@src/lib/supabase'

type ClassRecord = Database['public']['Tables']['classes']['Row']
type Student = Database['public']['Tables']['students']['Row']

interface ClassQueryResult extends ClassRecord {
  grades: {
    id: number
    name: string
  }
  teacher_class_assignments: Array<{
    subject_id: string
    subjects: {
      id: string
      name: string
    } | null
  }>
  student_school_class: Array<{
    student: Student | null
  }>
}

export const classes = {
  /**
   * Fetches classes for a given school from the database.
   *
   * @async
   * @function getClasses
   * @param {string} teacherId - The ID of the teacher for which to fetch classes.
   * @param {string} schoolId - The ID of the school for which to fetch classes.
   * @returns {Promise<IClassDTO[]>} - A promise that resolves to an array of class objects (IClassDTO).
   * @throws {Error} - Throws an error if there's an issue with the database query.
   *
   * @example
   * // Example usage
   * const classList = await classes.getClasses("school123");
   * console.log(classList);
   */
  async getClasses(teacherId: string, schoolId: string): Promise<IClassDTO[]> {
    const { data, error } = await supabase
      .from(CLASS_TABLE_ID)
      .select(
        `
      id,
      name,
      grades!inner (
        id,
        name
      ),
      teacher_class_assignments!inner (
        subject_id,
        subjects (
          id,
          name
        )
      ),
      student_school_class (
        student:students (
          id,
          first_name,
          last_name,
          id_number
        )
      )
    `,
      )
      .eq('teacher_class_assignments.teacher_id', teacherId)
      .eq('school_id', schoolId)
      .eq('student_school_class.is_active', true)
      .eq('student_school_class.enrollment_status', 'accepted')

    if (error) {
      console.error('Error getting classes records:', error)
      throw new Error(`Failed to fetch classes: ${error.message}`)
    }

    if (!data) {
      return []
    }

    const classMap = new Map<string, IClassDTO>()

    ;(data as ClassQueryResult[]).forEach((classData) => {
      const classId = classData.id
      if (!classMap.has(classId)) {
        // Get unique students from student_school_class
        const students = classData.student_school_class
          .filter((enrollment): enrollment is { student: Student } =>
            enrollment.student !== null,
          )
          .map(enrollment => enrollment.student)
          .filter((student, index, self) =>
            index === self.findIndex(s => s.id === student.id),
          )

        classMap.set(classId, {
          id: classId,
          name: classData.name,
          gradeId: classData.grades.id,
          gradeName: classData.grades.name,
          subjects: [],
          students: students.map(
            (student): IStudentDTO => ({
              id: student.id,
              firstName: student.first_name,
              lastName: student.last_name,
              idNumber: student.id_number,
            }),
          ),
        })
      }

      const classDTO = classMap.get(classId)!
      classData.teacher_class_assignments.forEach((assignment) => {
        const subject = assignment.subjects
        if (subject && !classDTO.subjects.some(s => s.id === subject.id)) {
          classDTO.subjects.push({
            id: subject.id,
            name: subject.name,
          })
        }
      })
    })

    return Array.from(classMap.values())
  },
}
