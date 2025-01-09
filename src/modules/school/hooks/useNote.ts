import { useCallback, useState } from "react";
import { INoteDTO, ISubjectDTO } from "@modules/app/types/ILoginDTO";
import { notes } from "@modules/school/services/noteService";
import { LOCAL_NOTE_KEY } from "@modules/app/constants/keys";

interface UseNoteReturn {
  loading: boolean;
  error: string | null;
  publishNote: (noteId: string) => Promise<boolean>;
  saveNote: (noteData: INoteDTO, noteId?: string) => Promise<boolean>;
  removeNote: (noteId: string) => Promise<boolean>;
  teachedSubjects: (classId: string, teacherId: string) => Promise<ISubjectDTO[]>;
  getNotes: (classId: string, teacherId: string, schoolYearId: number) => Promise<INoteDTO[] | null>;
}

export const useNote = (): UseNoteReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNotes = useCallback(async (classId: string, teacherId: string, schoolYearId: number): Promise<INoteDTO[] | null> => {
    setLoading(true);
    setError(null);
    try {
      return await notes.getNotes(classId, teacherId, schoolYearId);
    } catch (err) {
      setError("Failed to get notes records.");
      console.error("[E_GET_NOTES]:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveNote = useCallback(async (noteData: INoteDTO, noteId?: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const _id = `${LOCAL_NOTE_KEY}${noteData.schoolId}_${noteData.classId}_${noteData.teacherId}_${Math.random().toString(36).substring(7)}`;
      await notes.saveNoteLocally(noteData, noteId ?? _id);
      await notes.getNotes(noteData.classId, noteData.teacherId, noteData.schoolYearId);
      return true;
    } catch (err) {
      setError("Failed to save note.");
      console.error("[E_SAVE_NOTES]:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeNote = useCallback(async (noteId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await notes.removeSavedNoteLocally(noteId);
      return true
    } catch (err) {
      setError("Failed to remove saved notes locally.");
      console.error("[E_REMOVE_SAVED_NOTES_LOCALLY]:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const publishNote = useCallback(async (noteId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const note = await notes.getSavedNoteLocally(noteId);
      if (!note) {
        setError("Note not found.");
        return false;
      }
      
      await Promise.all([
        notes.saveNoteRemotely(note),
        notes.removeSavedNoteLocally(noteId),
      ]);

      return true;
    } catch (err) {
      setError("Failed to publish notes.");
      console.error("[E_PUBLISH_NOTES]:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const teachedSubjects = useCallback(async (classId: string, teacherId: string): Promise<ISubjectDTO[]> => {
    setLoading(true);
    setError(null);
    try {
      return await notes.teachedSubjects(classId, teacherId);
    } catch (err) {
      setError("Failed to get teached subjects.");
      console.error("[E_GET_TEACHED_SUBJECTS]:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    error,
    loading,
    getNotes,
    saveNote,
    removeNote,
    publishNote,
    teachedSubjects,
  };
};
