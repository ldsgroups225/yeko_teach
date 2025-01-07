import { useCallback, useState } from "react";
import { INoteDTO, INoteDetailDTO, INoteDetailRawToSaveDTO } from "@modules/app/types/ILoginDTO";
import { notes } from "@modules/school/services/noteService";

interface UseNoteReturn {
  getNotes: (classId: string, teacherId: string, schoolYearId: number) => Promise<INoteDTO[] | null>;
  saveNotes: (noteData: INoteDTO) => Promise<boolean>;
  publishNotes: (noteId: string) => Promise<boolean>;
  activateNotes: (noteId: string) => Promise<boolean>;
  saveNoteDetails: (noteDetail: INoteDetailRawToSaveDTO) => Promise<boolean>;
  loading: boolean;
  error: string | null;
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

  const saveNotes = useCallback(async (noteData: INoteDTO): Promise<boolean> => {
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
  }, []);

  const publishNotes = useCallback(async (noteId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await notes.publishNotes(noteId);
      return true;
    } catch (err) {
      setError("Failed to publish notes.");
      console.error("[E_PUBLISH_NOTES]:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateNotes = useCallback(async (noteId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await notes.activateNotes(noteId);
      return true;
    } catch (err) {
      setError("Failed to activate notes.");
      console.error("[E_ACTIVATE_NOTES]:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveNoteDetails = useCallback(async (noteDetail: INoteDetailRawToSaveDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await notes.saveNoteDetail(noteDetail);
      return true;
    } catch (err) {
      setError("Failed to save note details.");
      console.error("[E_SAVE_NOTE_DETAILS]:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    error,
    loading,
    getNotes,
    saveNotes,
    publishNotes,
    activateNotes,
    saveNoteDetails,
  };
};
