import { useCallback, useState } from "react";
import { INoteDTO } from "@modules/app/types/ILoginDTO";
import { notes } from "@modules/school/services/noteService";

interface UseNoteReturn {
  getNotes: (subjectId: string, classId: string) => Promise<INoteDTO[] | null>;
  saveNotes: (noteData: INoteDTO[]) => Promise<boolean>;
  publishNotes: (date: Date) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to manage note operations (fetching, saving, and publishing).
 * @returns {UseNoteReturn} An object containing note-related functions and states.
 */
export const useNote = (): UseNoteReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches notes for a given subject and class.
   * @param {string} subjectId - The ID of the subject.
   * @param {string} classId - The ID of the class.
   * @returns {Promise<INoteDTO[] | null>} A promise that resolves to an array of note objects or null on error.
   */
  const getNotes = useCallback(
    async (subjectId: string, classId: string): Promise<INoteDTO[] | null> => {
      setLoading(true);
      setError(null);
      try {
        return await notes.getNotes(subjectId, classId);
      } catch (err) {
        setError("Failed to get notes records.");
        console.error("[E_GET_NOTES]:", err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Saves new notes to the database.
   * @param {INoteDTO[]} noteData - An array of note objects to be saved.
   * @returns {Promise<boolean>} A promise that resolves to true if the notes were saved successfully, false otherwise.
   */
  const saveNotes = useCallback(
    async (noteData: INoteDTO[]): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        await notes.saveNotes(noteData);
        return true;
      } catch (err) {
        setError("Failed to save note.");
        console.error("[E_SAVE_NOTES]:", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Publishes notes for a specific date.
   * @param {Date} date - The date for which to publish notes.
   * @returns {Promise<boolean>} A promise that resolves to true if the notes were published successfully, false otherwise.
   */
  const publishNotes = useCallback(async (date: Date): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await notes.publishNotes(date);
      return true;
    } catch (err) {
      setError("Failed to publish notes.");
      console.error("[E_PUBLISH_NOTES]:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getNotes,
    saveNotes,
    publishNotes,
    loading,
    error,
  };
};
