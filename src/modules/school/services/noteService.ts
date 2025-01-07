import { NOTE_DETAILS_TABLE_ID, NOTE_TABLE_ID, supabase } from "@src/lib/supabase";
import { INoteDetailRawToSaveDTO, INoteDTO } from "@modules/app/types/ILoginDTO";

export const notes = {
  async getNotes(classId: string, teacherId: string, schoolYearId: number): Promise<INoteDTO[]> {
    const { data, error } = await supabase
      .from(NOTE_TABLE_ID)
      .select(`*, note_details: note_details (*)`)
      .eq('class_id', classId)
      .eq('teacher_id', teacherId)
      .eq('school_year_id', schoolYearId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error getting notes records:", error);
      throw new Error(`Failed to fetch notes: ${error.message}`);
    }

    if (!data) {
      return [];
    }

    return data.map((note) => ({
      id: note.id,
      schoolId: note.school_id,
      schoolYearId: note.school_year_id,
      semesterId: note.semester_id,
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
  },
  
  async saveNotes(noteData: INoteDTO): Promise<void> {
    const { data: note, error: noteError } = await supabase
      .from(NOTE_TABLE_ID)
      .insert({
        school_id: noteData.schoolId,
        school_year_id: noteData.schoolYearId,
        semester_id: noteData.semesterId,
        note_type: noteData.noteType,
        title: noteData.title,
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
            subject_id: detail.subjectId,
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

  async saveNoteDetail(noteDetail: INoteDetailRawToSaveDTO): Promise<void> {
    const { error } = await supabase
      .from(NOTE_DETAILS_TABLE_ID)
      .upsert({
        note_id: noteDetail.noteId,
        student_id: noteDetail.studentId,
        note: noteDetail.note,
        subject_id: noteDetail.subjectId,
        updated_at: new Date().toISOString()
      });
  
    if (error) {
      console.error("Error saving note detail:", error);
      throw new Error(`Failed to save note detail: ${error.message}`);
    }
  },

  async publishNotes(noteId: string): Promise<void> {
    const { error } = await supabase
      .from(NOTE_TABLE_ID)
      .update({ is_published: true, published_at: new Date().toISOString() })
      .eq('id', noteId);

    if (error) {
      console.error("Error publishing notes:", error);
      throw new Error(`Failed to publish notes: ${error.message}`);
    }
  },

  async activateNotes(noteId: string): Promise<void> {
    const { error } = await supabase
      .from(NOTE_TABLE_ID)
      .update({ is_active: true })
      .eq('id', noteId);

    if (error) {
      console.error("Error activating notes:", error);
      throw new Error(`Failed to activate notes: ${error.message}`);
    }
  },
};
