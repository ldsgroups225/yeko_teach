import { NOTE_DETAILS_TABLE_ID, NOTE_TABLE_ID, SCHEDULE_TABLE_ID, supabase } from "@src/lib/supabase";
import { INoteDTO, ISubjectDTO } from "@modules/app/types/ILoginDTO";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LOCAL_NOTE_KEY } from "@modules/app/constants/keys";

export const notes = {
  async getNotes(classId: string, teacherId: string, schoolYearId: number): Promise<INoteDTO[]> {
    const localData = await this.getAllSavedNotesLocally();

    console.log("Local Data:", localData.map((note) => note.noteDetails?.length));

    const { data: remoteData, error } = await supabase
      .from(NOTE_TABLE_ID)
      .select(`*, note_details: note_details (*)`)
      .eq('class_id', classId)
      .eq('teacher_id', teacherId)
      .eq('school_year_id', schoolYearId)
      .order('is_active', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error getting notes records:", error);
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }

    if (!remoteData) {
      return localData;
    }

    const parsedRemoteData = remoteData.map((note) => ({
      id: note.id,
      schoolId: note.school_id,
      schoolYearId: note.school_year_id,
      semesterId: note.semester_id,
      subjectId: note.subject_id,
      noteType: note.note_type,
      title: note.title ?? '',
      description: note.description ?? '',
      totalPoints: note.total_points,
      weight: note.weight ?? 0,
      isGraded: note.is_graded,
      teacherId: note.teacher_id,
      isPublished: note.is_published,
      isActive: note.is_active,
      classId: note.class_id,
      createdAt: new Date(note.created_at!),
      publishedAt: note.published_at ? new Date(note.published_at) : undefined,
      dueDate: note.due_date ? new Date(note.due_date) : undefined,
      noteDetails: note.note_details.map((detail: any) => ({
        ...detail,
        gradedAt: detail.graded_at ? new Date(detail.graded_at) : undefined,
        createdAt: detail.created_at ? new Date(detail.created_at) : undefined,
        updatedAt: detail.updated_at ? new Date(detail.updated_at) : undefined,
      })),
    }));

    return [...localData, ...parsedRemoteData];
  },

  async saveNoteRemotely(noteData: INoteDTO): Promise<void> {
    const { data: note, error: noteError } = await supabase
      .from(NOTE_TABLE_ID)
      .insert({
        school_id: noteData.schoolId,
        school_year_id: noteData.schoolYearId,
        semester_id: noteData.semesterId,
        note_type: noteData.noteType,
        title: noteData.title,
        subject_id: noteData.subjectId,
        description: noteData.description,
        total_points: noteData.totalPoints,
        weight: noteData.weight,
        is_graded: noteData.isGraded,
        due_date: noteData.dueDate?.toISOString(),
        teacher_id: noteData.teacherId,
        class_id: noteData.classId,
      })
      .select()
      .single();

    if (noteError) {
      console.error("Error saving note:", noteError);
      throw new Error(`Failed to save note: ${noteError.message}`);
    }

    if (noteData.noteDetails) {
      const { error: detailError } = await supabase
        .from(NOTE_DETAILS_TABLE_ID)
        .insert(
          noteData.noteDetails.map((detail) => ({
            note_id: note.id,
            student_id: detail.studentId,
            note: detail.note,
          }))
        );

      if (detailError) {
        console.error("Error saving note details:", detailError);
        throw new Error(`Failed to save note details: ${detailError.message}`);
      }
    }
  },

  async saveNoteLocally(noteData: INoteDTO, noteId: string): Promise<void> {
    try {
      const itExist = await AsyncStorage.getItem(noteId);
      if (itExist) {
        await AsyncStorage.removeItem(noteId);
      }

      await AsyncStorage.setItem(noteId, JSON.stringify({
        ...noteData,
        id: noteId,
        createdAt: new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Error saving notes locally:", error);
      throw new Error(`Failed to save notes locally: ${error.message}`);
    }
  },

  async getSavedNoteLocally(noteId: string): Promise<INoteDTO | null> {
    try {
      const notes = await AsyncStorage.getItem(noteId);
      if (!notes) return null;

      // Validate JSON before parsing
      try {
        return JSON.parse(notes);
      } catch (parseError) {
        console.error(`Error parsing note with ID ${noteId}:`, parseError);
        await AsyncStorage.removeItem(noteId); // Remove corrupted data
        return null;
      }
    } catch (error) {
      console.error("Error getting saved notes locally:", error);
      throw new Error(`Failed to get saved notes locally: ${error.message}`);
    }
  },

  async getAllSavedNotesLocally(): Promise<INoteDTO[]> {
    try {
      const notesKeys = await AsyncStorage.getAllKeys();
      const filteredKeys = notesKeys.filter((key) => key.startsWith(LOCAL_NOTE_KEY));
      const vals = await AsyncStorage.multiGet(filteredKeys);

      console.log({filteredKeys})

      if (!filteredKeys.length) return [];

      const notes: INoteDTO[] = [];
  
      for (const [key, value] of vals) {
        if (!value) continue;
  
        try {
          const parsedNote = JSON.parse(value);
          notes.push(parsedNote);
        } catch (parseError) {
          console.error(`Error parsing note with key ${key}:`, parseError);
          await AsyncStorage.removeItem(key);
        }
      }
  
      // Sort notes by createdAt in descending order
      notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
      return notes;
    } catch (error) {
      console.error("Error getting saved notes locally:", error);
      throw new Error(`Failed to get saved notes locally: ${error.message}`);
    }
  },

  async removeSavedNoteLocally(noteId: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(noteId);
    } catch (error) {
      console.error("Error removing saved notes locally:", error);
      throw new Error(`Failed to remove saved notes locally: ${error.message}`);
    }
  },

  async teachedSubjects(classId: string, teacherId: string): Promise<ISubjectDTO[]> {
    const { data, error } = await supabase
      .from(SCHEDULE_TABLE_ID)
      .select('subjects(id, name)')
      .eq('class_id', classId)
      .eq('teacher_id', teacherId);

    if (error) {
      console.error("Error fetching subjects:", error);
      throw new Error(`Failed to fetch subjects: ${error.message}`);
    }

    return data.map((subject) => subject.subjects);
  }
};
