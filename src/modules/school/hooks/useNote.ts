// src/modules/school/hooks/useNote.ts

import type { INoteDTO, ISubjectDTO } from '@modules/app/types/ILoginDTO'
import { notes } from '@modules/school/services/noteService'
import { useCallback, useState } from 'react'

interface UseNoteReturn {
  loading: boolean
  error: string | null
  publishNote: (teacherId: string, classId: string, noteId: string) => Promise<boolean>
  saveNote: (noteData: INoteDTO) => Promise<boolean>
  removeNote: (teacherId: string, classId: string, noteId: string) => Promise<boolean>
  updateNote: (noteId: string, noteData: Partial<INoteDTO>) => Promise<boolean>
  updateNoteDetails: (noteId: string, details: INoteDTO['noteDetails']) => Promise<boolean>
  teachedSubjects: (classId: string, teacherId: string) => Promise<ISubjectDTO[]>
  syncNotesWithRemote: (
    teacherId: string,
    classId: string,
    schoolYearId: number,
    semesterId?: number,
  ) => Promise<{ synced: number, removed: number, errors: string[] }>
  getNotes: (
    classId: string,
    teacherId: string,
    schoolYearId: number,
    semesterId?: number,
    page?: number,
    limit?: number
  ) => Promise<{ notes: INoteDTO[], totalCount: number } | null>
}

export function useNote(): UseNoteReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getNotes = useCallback(async (
    classId: string,
    teacherId: string,
    schoolYearId: number,
    semesterId?: number,
    _page: number = 1,
    _limit: number = 10,
  ): Promise<{ notes: INoteDTO[], totalCount: number } | null> => {
    setLoading(true)
    setError(null)
    try {
      const _notes = await notes.getNotes(teacherId, classId, schoolYearId, semesterId)

      return {
        notes: _notes,
        totalCount: _notes.length,
      }
    }
    catch (err) {
      setError('Failed to get notes records.')
      console.error('[E_GET_NOTES]:', err)
      return null
    }
    finally {
      setLoading(false)
    }
  }, [])

  const saveNote = useCallback(async (noteData: INoteDTO): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      await notes.saveNoteLocally(noteData)
      await getNotes(noteData.classId, noteData.teacherId, noteData.schoolYearId, noteData.semesterId)
      return true
    }
    catch (err) {
      setError('Failed to save note.')
      console.error('[E_SAVE_NOTES]:', err)
      return false
    }
    finally {
      setLoading(false)
    }
  }, [])

  const updateNote = useCallback(async (noteId: string, noteData: Partial<INoteDTO>): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const id = Number.parseInt(noteId)
      if (Number.isNaN(id)) {
        throw new TypeError('Invalid Note ID')
      }

      await notes.updateNoteLocally(id, noteData)

      if (noteData.classId && noteData.teacherId && noteData.schoolYearId) {
        await notes.getNotes(
          noteData.classId,
          noteData.teacherId,
          noteData.schoolYearId,
        )
      }

      return true
    }
    catch (err) {
      setError('Failed to update note.')
      console.error('[E_UPDATE_NOTE]:', err)
      return false
    }
    finally {
      setLoading(false)
    }
  }, [])

  const updateNoteDetails = useCallback(async (noteId: string, details: INoteDTO['noteDetails']): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const id = Number.parseInt(noteId)
      if (Number.isNaN(id)) {
        throw new TypeError('Invalid Note ID')
      }

      if (!details || details.length === 0) {
        throw new Error('No details provided for update')
      }

      await notes.updateNoteDetailsLocally(id, details)
      return true
    }
    catch (err) {
      setError('Failed to update note details')
      console.error('[E_UPDATE_NOTE_DETAILS]:', err)
      return false
    }
    finally {
      setLoading(false)
    }
  }, [])

  const removeNote = useCallback(async (teacherId: string, classId: string, noteId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      // First try to delete remotely
      const remoteDeleted = await notes.deleteNoteRemotely(noteId)

      // Always delete locally, regardless of remote deletion success
      await notes.removeSavedNoteLocally(teacherId, classId, noteId)

      if (!remoteDeleted) {
        console.warn(`Note ${noteId} deleted locally but remote deletion failed`)
        // Don't throw error here as local deletion succeeded
      }

      return true
    }
    catch (err) {
      setError('Failed to remove saved notes.')
      console.error('[E_REMOVE_SAVED_NOTES]:', err)
      return false
    }
    finally {
      setLoading(false)
    }
  }, [])

  const publishNote = useCallback(async (teacherId: string, classId: string, noteId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const note = await notes.getSavedNoteLocally(teacherId, classId, Number(noteId))
      if (!note) {
        setError('Note not found.')
        return false
      }

      await Promise.all([
        notes.saveNoteRemotely(note),
        notes.removeSavedNoteLocally(teacherId, classId, noteId),
      ])

      return true
    }
    catch (err) {
      setError('Failed to publish notes.')
      console.error('[E_PUBLISH_NOTES]:', err)
      return false
    }
    finally {
      setLoading(false)
    }
  }, [])

  const teachedSubjects = useCallback(async (classId: string, teacherId: string): Promise<ISubjectDTO[]> => {
    setLoading(true)
    setError(null)
    try {
      return await notes.teachedSubjects(classId, teacherId)
    }
    catch (err) {
      setError('Failed to get teached subjects.')
      console.error('[E_GET_TEACHED_SUBJECTS]:', err)
      return []
    }
    finally {
      setLoading(false)
    }
  }, [])

  const syncNotesWithRemote = useCallback(async (
    teacherId: string,
    classId: string,
    schoolYearId: number,
    semesterId?: number,
  ): Promise<{ synced: number, removed: number, errors: string[] }> => {
    setLoading(true)
    setError(null)
    try {
      return await notes.syncNotesWithRemote(teacherId, classId, schoolYearId, semesterId)
    }
    catch (err) {
      setError('Failed to sync notes with remote.')
      console.error('[E_SYNC_NOTES]:', err)
      return { synced: 0, removed: 0, errors: [`Sync failed: ${err}`] }
    }
    finally {
      setLoading(false)
    }
  }, [])

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
    syncNotesWithRemote,
  }
}
