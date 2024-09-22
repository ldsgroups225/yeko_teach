import { supabase } from "@src/lib/supabase";
import { IScheduleDTO } from "@modules/app/types/IScheduleDTO";

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
    const { data, error } = await supabase
      .from("schedules")
      .select(
        `
        id,
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
      .eq("teacher_id", teacherId);

    if (error) {
      console.error("Error getting schedule records:", error);
      throw new Error(`Failed to fetch schedules: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map(
      (record): IScheduleDTO => ({
        id: record.id,
        className: record.classes?.name ?? "",
        schoolName: record.classes?.schools?.name ?? "",
        subjectName: record.subjects?.name ?? "",
        dayOfWeek: record.day_of_week,
        startTime: record.start_time,
        endTime: record.end_time,
      })
    );
  },
};
