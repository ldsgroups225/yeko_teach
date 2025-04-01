// src/modules/school/services/noteService.ts

import type { INoteDTO, ISubjectDTO } from '@modules/app/types/ILoginDTO'
import { FROM_STRING_OPTIONS_MAP } from '@modules/app/constants/noteTypes'
import { drizzleDb } from '@src/db/config'
import { noteDetailTable, noteTable } from '@src/db/schema'
import { NOTE_DETAILS_TABLE_ID, NOTE_TABLE_ID, SCHEDULE_TABLE_ID, supabase } from '@src/lib/supabase'
import { and, count, desc, eq, lt } from 'drizzle-orm'

export const notes = {
  async getNotes(teacherId: string, classId: string, schoolYearId: number, semesterId?: number): Promise<INoteDTO[]> {
    const { notes: localData } = await this.getAllSavedNotesLocally(teacherId, classId)

    let query = supabase
      .from(NOTE_TABLE_ID)
      .select(`*, note_details: note_details (*)`)
      .eq('class_id', classId)
      .eq('teacher_id', teacherId)
      .eq('school_year_id', schoolYearId)
      .order('is_active', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(10)

    if (semesterId) {
      query = query.eq('semester_id', semesterId)
    }

    const { data: remoteData, error } = await query

    if (error) {
      console.error('Error getting notes records:', error)
      throw new Error(`Failed to fetch notes: ${error.message}`)
    }

    if (!remoteData) {
      return localData
    }

    const parsedRemoteData = remoteData.map(note => ({
      id: note.id,
      schoolId: note.school_id,
      schoolYearId: note.school_year_id,
      semesterId: note.semester_id,
      subjectId: note.subject_id,
      noteType: FROM_STRING_OPTIONS_MAP[note.note_type],
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
    }))

    // Create a map to store unique notes by ID
    const notesMap = new Map<string, INoteDTO>()

    // Add local notes to the map
    localData.forEach((note) => {
      if (note.id) {
        notesMap.set(note.id, note)
      }
    })

    // Add remote notes to the map, overwriting local ones if they exist
    parsedRemoteData.forEach((note) => {
      if (note.id) {
        notesMap.set(note.id, note)
      }
    })

    // Convert map values back to array and sort by createdAt
    return Array.from(notesMap.values()).sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
    )
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
      .single()

    if (noteError) {
      console.error('Error saving note:', noteError)
      throw new Error(`Failed to save note: ${noteError.message}`)
    }

    if (noteData.noteDetails) {
      const { error: detailError } = await supabase
        .from(NOTE_DETAILS_TABLE_ID)
        .insert(
          noteData.noteDetails.map(detail => ({
            note_id: note.id,
            student_id: detail.studentId,
            note: detail.note,
          })),
        )

      if (detailError) {
        console.error('Error saving note details:', detailError)
        throw new Error(`Failed to save note details: ${detailError.message}`)
      }
    }
  },

  async saveNoteLocally(noteData: INoteDTO): Promise<void> {
    try {
      // Validate data structure
      const requiredFields = ['title', 'description', 'noteType', 'schoolId', 'subjectId', 'teacherId', 'classId']
      for (const field of requiredFields) {
        if (!noteData[field as keyof INoteDTO]) {
          throw new Error(`Missing required field: ${field}`)
        }
      }

      const noteParent: typeof noteTable.$inferInsert = {
        schoolId: noteData.schoolId,
        subjectId: noteData.subjectId,
        schoolYearId: noteData.schoolYearId,
        semesterId: noteData.semesterId,
        teacherId: noteData.teacherId,
        classId: noteData.classId,
        noteType: noteData.noteType,
        title: noteData.title ?? '',
        description: noteData.description ?? '',
        totalPoints: noteData.totalPoints ?? 0,
        weight: noteData.weight ?? 0,
        isGraded: noteData.isGraded ? 1 : 0,
        dueDate: noteData.dueDate?.toISOString() ?? null,
        createdAt: new Date().toISOString(),
      }

      // Insert note then retrieve its ID with drizzle
      const note = await drizzleDb.insert(noteTable).values(noteParent).returning({ insertedId: noteTable.id })

      if (note.length === 0) {
        throw new Error('Failed to save note')
      }

      // Only insert note details if there are any
      if (noteData.noteDetails && noteData.noteDetails.length > 0) {
        const noteDetails: typeof noteDetailTable.$inferInsert[] = noteData.noteDetails.map(detail => ({
          noteId: note[0].insertedId,
          studentId: detail.studentId,
          note: detail.note ?? 0,
          gradedAt: null,
          createdAt: new Date().toISOString(),
        }))

        // Insert note details
        await drizzleDb.insert(noteDetailTable).values(noteDetails)
      }
    }
    catch (error) {
      console.error('Error saving notes locally:', error)
      throw new Error(`Failed to save notes locally: ${error.message}`)
    }
  },

  async updateNoteLocally(noteId: number, noteData: Partial<INoteDTO>): Promise<void> {
    try {
      // Validate existing note
      const existingNote = await drizzleDb
        .select()
        .from(noteTable)
        .where(eq(noteTable.id, noteId))
        .limit(1)

      if (!existingNote.length) {
        throw new Error('Note not found')
      }

      // Validate required fields if provided
      const requiredFields = ['title', 'description', 'noteType']
      for (const field of requiredFields) {
        if (noteData[field as keyof INoteDTO] === undefined) {
          continue // Only validate if field is present in update
        }
        if (!noteData[field as keyof INoteDTO]) {
          throw new Error(`Invalid value for required field: ${field}`)
        }
      }

      // Build update object
      const updateData: typeof noteTable.$inferInsert = {
        schoolId: noteData.schoolId ?? existingNote[0].schoolId,
        subjectId: noteData.subjectId ?? existingNote[0].subjectId,
        schoolYearId: noteData.schoolYearId ?? existingNote[0].schoolYearId,
        semesterId: noteData.semesterId ?? existingNote[0].semesterId,
        teacherId: noteData.teacherId ?? existingNote[0].teacherId,
        classId: noteData.classId ?? existingNote[0].classId,
        noteType: noteData.noteType ?? existingNote[0].noteType,
        title: noteData.title ?? existingNote[0].title,
        description: noteData.description ?? existingNote[0].description,
        totalPoints: noteData.totalPoints ?? existingNote[0].totalPoints,
        weight: noteData.weight ?? existingNote[0].weight,
        dueDate: noteData.dueDate?.toISOString() ?? existingNote[0].dueDate,
        isGraded: noteData.isGraded !== undefined ? (noteData.isGraded ? 1 : 0) : existingNote[0].isGraded,
      }

      // Start transaction
      await drizzleDb.transaction(async (tx) => {
        // Update main note
        const updatedNote = await tx
          .update(noteTable)
          .set(updateData)
          .where(eq(noteTable.id, noteId))
          .returning({ updatedId: noteTable.id })

        if (updatedNote.length === 0) {
          throw new Error('Failed to update note')
        }

        // Update note details if provided
        if (noteData.noteDetails) {
          // Delete existing details
          await tx
            .delete(noteDetailTable)
            .where(eq(noteDetailTable.noteId, noteId))

          // Insert new details
          const noteDetails: typeof noteDetailTable.$inferInsert[]
            = noteData.noteDetails.map(detail => ({
              noteId,
              studentId: detail.studentId,
              note: detail.note ?? 0,
              gradedAt: detail.gradedAt?.toISOString() || null,
            }))

          await tx
            .insert(noteDetailTable)
            .values(noteDetails)
        }
      })
    }
    catch (error) {
      console.error('Error updating note locally:', error)
      throw new Error(`Failed to update note locally: ${error.message}`)
    }
  },

  async updateNoteDetailsLocally(noteId: number, noteDetails: INoteDTO['noteDetails']): Promise<void> {
    try {
      if (!noteDetails || noteDetails.length === 0) {
        throw new Error('No note details provided')
      }

      await drizzleDb.transaction(async (tx) => {
        // Validate note exists
        const existingNote = await tx
          .select()
          .from(noteTable)
          .where(eq(noteTable.id, noteId))
          .limit(1)

        if (!existingNote.length) {
          throw new Error('Note not found')
        }

        // Delete existing details
        await tx
          .delete(noteDetailTable)
          .where(eq(noteDetailTable.noteId, noteId))

        // Insert updated details
        const formattedDetails: typeof noteDetailTable.$inferInsert[] = noteDetails.map(detail => ({
          noteId,
          studentId: detail.studentId,
          note: detail.note ?? 0,
          gradedAt: detail.gradedAt?.toISOString() || null,
        }))

        await tx
          .insert(noteDetailTable)
          .values(formattedDetails)
      })
    }
    catch (error) {
      console.error('Error updating note details:', error)
      throw new Error(`Failed to update note details: ${error.message}`)
    }
  },

  async getSavedNoteLocally(teacherId: string, classId: string, noteId: number, semesterId?: number): Promise<INoteDTO> {
    if (!noteId) {
      throw new Error('Note ID is required')
    }

    let note: typeof noteTable.$inferSelect[]

    try {
      if (semesterId) {
        note = await drizzleDb.select().from(noteTable).where(and(
          eq(noteTable.id, noteId),
          eq(noteTable.classId, classId),
          eq(noteTable.teacherId, teacherId),
          eq(noteTable.semesterId, semesterId),
        )).limit(1)
      }
      else {
        note = await drizzleDb.select().from(noteTable).where(and(
          eq(noteTable.id, noteId),
          eq(noteTable.classId, classId),
          eq(noteTable.teacherId, teacherId),
        )).limit(1)
      }

      if (!note.length) {
        throw new Error('Note not found')
      }

      const _note = note[0]

      const noteDetails = await drizzleDb.select().from(noteDetailTable).where(eq(noteDetailTable.noteId, _note.id))

      const _noteDetails = noteDetails.map(detail => ({
        ...detail,
        id: detail.id.toString(),
        noteId: detail.noteId.toString(),
        gradedAt: detail.gradedAt ? new Date(detail.gradedAt) : undefined,
      }))

      return {
        ..._note,
        isActive: false,
        isPublished: false,
        id: _note.id.toString(),
        isGraded: _note.isGraded === 1,
        noteType: FROM_STRING_OPTIONS_MAP[_note.noteType],
        dueDate: _note.dueDate ? new Date(_note.dueDate) : undefined,
        createdAt: _note.createdAt ? new Date(_note.createdAt) : undefined,

        // Add note details
        noteDetails: _noteDetails,
      }
    }
    catch (error) {
      console.error('Error getting saved notes locally:', error)
      throw new Error(`Failed to get saved notes locally: ${error.message}`)
    }
  },

  async getAllSavedNotesLocally(teacherId: string, classId: string, page: number = 1, limit: number = 10): Promise<{ notes: INoteDTO[], totalCount: number }> {
    try {
      // Clean up old notes (older than 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      await drizzleDb
        .delete(noteTable)
        .where(
          and(
            eq(noteTable.classId, classId),
            eq(noteTable.teacherId, teacherId),
            lt(noteTable.createdAt, thirtyDaysAgo.toISOString()),
          ),
        )

      // Calculate pagination
      const startIndex = (page - 1) * limit

      // Get paginated notes
      const notesResult = await drizzleDb
        .select()
        .from(noteTable)
        .where(
          and(
            eq(noteTable.classId, classId),
            eq(noteTable.teacherId, teacherId),
          ),
        )
        .orderBy(desc(noteTable.createdAt))
        .limit(limit)
        .offset(startIndex)

      // Get total count
      const totalCountResult = await drizzleDb
        .select({ count: count() })
        .from(noteTable)
        .where(
          and(
            eq(noteTable.classId, classId),
            eq(noteTable.teacherId, teacherId),
          ),
        )

      // Get note details for all fetched notes
      const notesWithDetails = await Promise.all(
        notesResult.map(async (note) => {
          const noteDetails = await drizzleDb
            .select()
            .from(noteDetailTable)
            .where(eq(noteDetailTable.noteId, note.id))

          return {
            ...note,
            isPublished: false,
            isActive: false,
            id: note.id.toString(),
            isGraded: note.isGraded === 1,
            noteType: FROM_STRING_OPTIONS_MAP[note.noteType],
            dueDate: note.dueDate ? new Date(note.dueDate) : undefined,
            createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
            noteDetails: noteDetails.map(detail => ({
              ...detail,
              id: detail.id.toString(),
              noteId: detail.noteId.toString(),
              gradedAt: detail.gradedAt ? new Date(detail.gradedAt) : undefined,
            })),
          }
        }),
      )

      return {
        notes: notesWithDetails,
        totalCount: totalCountResult[0]?.count || 0,
      }
    }
    catch (error) {
      console.error('Error getting saved notes locally:', error)
      throw new Error(`Failed to get saved notes locally: ${error.message}`)
    }
  },

  async removeSavedNoteLocally(teacherId: string, classId: string, noteId: string): Promise<void> {
    if (!noteId) {
      throw new Error('Note ID is required')
    }

    const id = Number.parseInt(noteId)
    if (Number.isNaN(id)) {
      throw new TypeError('Invalid Note ID')
    }

    try {
      await drizzleDb
        .delete(noteTable)
        .where(
          and(
            eq(noteTable.id, id),
            eq(noteTable.classId, classId),
            eq(noteTable.teacherId, teacherId),
          ),
        )
    }
    catch (error) {
      console.error('Error removing saved notes locally:', error)
      throw new Error(`Failed to remove saved notes locally: ${error.message}`)
    }
  },

  async teachedSubjects(classId: string, teacherId: string): Promise<ISubjectDTO[]> {
    const { data, error } = await supabase
      .from('teacher_class_assignments')
      .select('subjects(id, name)')
      .eq('class_id', classId)
      .eq('teacher_id', teacherId)

    if (error) {
      console.error('Error fetching subjects:', error)
      throw new Error(`Failed to fetch subjects: ${error.message}`)
    }

    if (!data || data.length === 0) {
      return []
    }

    return data.map(item => item.subjects)
  },
}
