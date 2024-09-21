import { NOTE_TABLE_ID, supabase } from "@src/lib/supabase";
import { INoteDTO } from "@modules/app/types/ILoginDTO";

export const notes = {
  /**
   * Fetches notes for a given subject and class.
   * @param {string} subjectId - The ID of the subject.
   * @param {string} classId - The ID of the class.
   * @returns {Promise<INoteDTO[]>} A promise that resolves to an array of note objects.
   * @throws {Error} If there's an issue with the database query.
   */
  async getNotes(subjectId: string, classId: string): Promise<INoteDTO[]> {
    const { data, error } = await supabase.rpc("get_unique_notes_by_date", {
      p_subject_id: subjectId,
      p_class_id: classId,
    });

    if (error) {
      console.error("Error getting notes records:", error);
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map(({ id, date, is_published, publish_date }) => ({
      id,
      date: new Date(date!),
      studentId: "",
      note: 0,
      subjectId: "",
      classId: "",
      isPublished: is_published,
      publishDate: is_published ? new Date(publish_date) : null,
    }));
  },

  /**
   * Saves new notes to the database.
   * @param {INoteDTO[]} noteData - An array of note objects to be saved.
   * @returns {Promise<void>} A promise that resolves when the notes are saved successfully.
   * @throws {Error} If there's an issue with the database insertion.
   */
  async saveNotes(noteData: INoteDTO[]): Promise<void> {
    const { error } = await supabase.from(NOTE_TABLE_ID).insert(
      noteData.map((n) => ({
        date: n.date.toISOString(),
        subject_id: n.subjectId,
        class_id: n.classId,
        student_id: n.studentId,
        note: n.note,
      }))
    );

    if (error) {
      console.error("Error saving note:", error);
      throw new Error(`Failed to save note: ${error.message}`);
    }
  },

  /**
   * Publishes notes for a specific date.
   * @param {Date} date - The date for which to publish notes.
   * @returns {Promise<void>} A promise that resolves when the notes are published successfully.
   * @throws {Error} If there's an issue with the database update.
   */
  async publishNotes(date: Date): Promise<void> {
    const { error } = await supabase.rpc("update_published_notes", {
      p_date: date.toISOString(),
    });

    if (error) {
      console.error("Error publishing notes:", error);
      throw new Error(`Failed to publish notes: ${error.message}`);
    }
  },
};
