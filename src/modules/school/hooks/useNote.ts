import { useCallback, useState } from "react";
import { INoteDTO, ISubjectDTO } from "@modules/app/types/ILoginDTO";
import { notes } from "@modules/school/services/noteService";

interface UseNoteReturn {
  loading: boolean;
  error: string | null;
  publishNote: (teacherId: string, classId: string, noteId: string) => Promise<boolean>;
  saveNote: (noteData: INoteDTO) => Promise<boolean>;
  removeNote: (teacherId: string, classId: string, noteId: string) => Promise<boolean>;
  updateNote: (noteId: string, noteData: Partial<INoteDTO>) => Promise<boolean>;
  updateNoteDetails: (noteId: string, details: INoteDTO['noteDetails']) => Promise<boolean>;
  teachedSubjects: (classId: string, teacherId: string) => Promise<ISubjectDTO[]>;
  getNotes: (
    classId: string,
    teacherId: string,
    schoolYearId: number,
    page?: number,
    limit?: number
  ) => Promise<{ notes: INoteDTO[]; totalCount: number } | null>;
}

export const useNote = (): UseNoteReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getNotes = useCallback(async (
    classId: string,
    teacherId: string,
    schoolYearId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{ notes: INoteDTO[]; totalCount: number } | null> => {
    setLoading(true);
    setError(null);
    try {
      // Fixed: Add teacherId as first parameter
      const localNotes = await notes.getAllSavedNotesLocally(teacherId, classId, page, limit);
      const remoteNotes = await notes.getNotes(teacherId, classId, schoolYearId);

      return {
        notes: [...localNotes.notes, ...remoteNotes],
        totalCount: localNotes.totalCount + remoteNotes.length
      };
    } catch (err) {
      setError("Failed to get notes records.");
      console.error("[E_GET_NOTES]:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveNote = useCallback(async (noteData: INoteDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Fixed: Remove manual ID generation and parameters
      await notes.saveNoteLocally(noteData);
      // Fixed: Add schoolYearId to getNotes call
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

  const updateNote = useCallback(async (noteId: string, noteData: Partial<INoteDTO>): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const id = parseInt(noteId);
      if (isNaN(id)) {
        throw new Error('Invalid Note ID');
      }

      await notes.updateNoteLocally(id, noteData);
      
      // Refresh notes list if needed
      if (noteData.classId && noteData.teacherId && noteData.schoolYearId) {
        await notes.getNotes(
          noteData.classId,
          noteData.teacherId,
          noteData.schoolYearId
        );
      }
      
      return true;
    } catch (err) {
      setError("Failed to update note.");
      console.error("[E_UPDATE_NOTE]:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNoteDetails = useCallback(async (noteId: string, details: INoteDTO['noteDetails']): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const id = parseInt(noteId);
      if (isNaN(id)) {
        throw new Error('Invalid Note ID');
      }

      if (!details || details.length === 0) {
        throw new Error('No details provided for update');
      }

      await notes.updateNoteDetailsLocally(id, details);
      return true;
    } catch (err) {
      setError("Failed to update note details");
      console.error("[E_UPDATE_NOTE_DETAILS]:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeNote = useCallback(async (teacherId: string, classId: string, noteId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Fixed: Add teacherId parameter
      await notes.removeSavedNoteLocally(teacherId, classId, noteId);
      return true;
    } catch (err) {
      setError("Failed to remove saved notes locally.");
      console.error("[E_REMOVE_SAVED_NOTES_LOCALLY]:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const publishNote = useCallback(async (teacherId: string, classId: string, noteId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      // Fixed: Add teacherId parameter
      const note = await notes.getSavedNoteLocally(teacherId, classId, Number(noteId));
      if (!note) {
        setError("Note not found.");
        return false;
      }

      await Promise.all([
        notes.saveNoteRemotely(note),
        notes.removeSavedNoteLocally(teacherId, classId, noteId),
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
    updateNote,
    removeNote,
    publishNote,
    teachedSubjects,
    updateNoteDetails,
  };
};
