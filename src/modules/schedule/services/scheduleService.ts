// src/modules/schedule/services/scheduleService.ts

import type { IScheduleDTO } from '@modules/app/types/IScheduleDTO'
import { supabase } from '@src/lib/supabase'

export const schedules = {
  /**
   * Fetches schedules for a given teacher from the database.
   *
   * @async
   * @function getSchedules
   * @param {string} teacherId - The ID of the teacher for which to fetch schedules.
   * @returns {Promise<IScheduleDTO[]>} - A promise that resolves to an array of schedule objects (IScheduleDTO).
   * @throws {Error} - Throws an error if there's an issue with the database query.
   *
   * @example
   * // Example usage
   * const scheduleList = await schedules.getSchedules("teacher123");
   * console.log(scheduleList);
   */
  async getSchedules(teacherId: string): Promise<IScheduleDTO[]> {
    // First get the teacher's assigned classes
    const { data: teacherClasses, error: teacherError } = await supabase
      .from('teacher_class_assignments')
      .select('class_id')
      .eq('teacher_id', teacherId)

    if (teacherError) {
      console.error('Error getting teacher class assignments:', teacherError)
      throw new Error(
        `Failed to fetch teacher classes: ${teacherError.message}`
      )
    }

    if (!teacherClasses || teacherClasses.length === 0) {
      return []
    }

    const classIds = teacherClasses.map(tc => tc.class_id)

    // Then get schedules for those classes
    const { data, error } = await supabase
      .from('schedules')
      .select(
        `
        id,
        class_id,
        subject_id,
        classes (
          name,
          schools (name)
        ),
        subjects (name),
        day_of_week,
        start_time,
        end_time
      `
      )
      .in('class_id', classIds)

    if (error) {
      console.error('Error getting schedule records:', error)
      throw new Error(`Failed to fetch schedules: ${error.message}`)
    }

    if (!data) {
      return []
    }

    return data.map(
      (record): IScheduleDTO => ({
        id: record.id,
        className: record.classes?.name ?? '',
        schoolName: record.classes?.schools?.name ?? '',
        subjectName: record.subjects?.name ?? '',
        dayOfWeek: record.day_of_week,
        startTime: record.start_time,
        endTime: record.end_time
      })
    )
  }
}
