import { CLASS_TABLE_ID, supabase } from "@src/lib/supabase";
import { IClassDTO, IStudentDTO } from "@modules/app/types/ILoginDTO";

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
      students (
        id,
        first_name,
        last_name,
        id_number
      )
    `
      )
      .eq("teacher_class_assignments.teacher_id", teacherId)
      .eq("school_id", schoolId);

    if (error) {
      console.error("Error getting classes records:", error);
      throw new Error(`Failed to fetch classes: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    const classMap = new Map<string, IClassDTO>();

    data.forEach((classData) => {
      const classId = classData.id;
      if (!classMap.has(classId)) {
        classMap.set(classId, {
          id: classId,
          name: classData.name,
          gradeId: classData.grades.id,
          gradeName: classData.grades.name,
          subjects: [],
          students: classData.students.map(
            (student): IStudentDTO => ({
              id: student.id,
              firstName: student.first_name,
              lastName: student.last_name,
              idNumber: student.id_number,
            })
          ),
        });
      }

      const classDTO = classMap.get(classId)!;
      classData.teacher_class_assignments.forEach((assignment) => {
        const subject = assignment.subjects;
        if (subject && !classDTO.subjects.some((s) => s.id === subject.id)) {
          classDTO.subjects.push({
            id: subject.id,
            name: subject.name,
          });
        }
      });
    });

    return Array.from(classMap.values());
  },
};
