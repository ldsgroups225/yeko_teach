import type { IUserDTO } from '@modules/app/types/ILoginDTO'
import type { RouteProp } from '@react-navigation/native'
import type { Routes, SchoolClassNotesStackParams } from '@utils/Routes'
import type { StackScreenProps } from '@react-navigation/stack'

import CsPicker from '@components/CsPicker'
import CsText from '@components/CsText'
import ErrorComponent from '@components/ErrorComponent'
import LoadingSpinner from '@components/LoadingSpinner'
import { useAuth } from '@hooks/useAuth'
import { useTeacherData } from '@hooks/useTeacherData'
import { FROM_STRING_OPTIONS_MAP, NOTE_TYPE } from '@modules/app/constants/noteTypes'
import { useRoute } from '@react-navigation/native'
import { supabase } from '@src/lib/supabase'
import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View, ScrollView } from 'react-native'
import { students } from '../services/studentService'
import { subjects as remoteSubjects } from '../services/teachSubjectsInClassService'
import { notes } from '../services/noteService'

// Define specific types for state data
interface Subject { id: string, name: string }

// Define interfaces for database types
interface ClassStudent {
  id: string
  firstName: string
  lastName: string
}

// Define structured note types
interface StructuredNote {
  id: string
  noteType: NOTE_TYPE
  sequence: number // For I1, I2, D1, D2 etc.
  note: number | null
  createdAt: string
  title: string | null
}

interface StudentNotes {
  studentId: string
  firstName: string
  lastName: string
  notes: {
    [key: string]: StructuredNote // key will be like "I1", "D1" etc.
  }
}

// Screen Props
type Props = StackScreenProps<SchoolClassNotesStackParams, Routes.SchoolClassNotes>

// Route Prop Type
type ClassNotesRouteProp = RouteProp<SchoolClassNotesStackParams, Routes.SchoolClassNotes>

// Styles definition moved to top to avoid "used before defined" error
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f5f5f5',
  },
  pickerContainer: {
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  tableWrapper: {
    flexDirection: 'row',
  },
  fixedColumn: {
    width: 150,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    zIndex: 1,
  },
  scrollableArea: {
    flex: 1,
  },
  headerRow: {
    height: 48,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerStudent: {
    width: 150,
    paddingHorizontal: 15,
    fontWeight: '600',
    fontSize: 15,
    color: '#495057',
  },
  headerNote: {
    width: 80,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 15,
    color: '#495057',
  },
  row: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5',
  },
  rowAlternate: {
    backgroundColor: '#f8f9fa',
  },
  studentName: {
    width: 150,
    paddingHorizontal: 15,
    fontSize: 14,
    color: '#212529',
  },
  noteCell: {
    width: 80,
    textAlign: 'center',
    fontSize: 14,
    color: '#495057',
  },
  listContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    margin: 15,
    padding: 20,
  },
  errorText: {
    fontSize: 15,
    color: '#dc3545',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
  },
  subjectPickerContainer: {
    marginBottom: 8,
  },
})

/**
 * Screen to display notes for a specific class in a table format.
 * Shows students in the first column and their notes (I1, I2, D1, D2, etc.) in subsequent columns.
 */
const ClassNotesScreen: React.FC<Props> = () => {
  const route = useRoute<ClassNotesRouteProp>()
  const { classId } = route.params

  // --- State Variables ---
  const [teacherData, setTeacherData] = useState<IUserDTO | null>(null)
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [structuredNotes, setStructuredNotes] = useState<StudentNotes[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined)
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([])

  // Loading States
  const { loading: loadingAuth, checkAuth } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  // Error States
  const [error, setError] = useState<string | null>(null)

  // --- Hooks ---
  const { fetchTeacherData } = useTeacherData()

  // --- Effects for Data Fetching ---

  // Fetch initial data in parallel
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Check auth first as we need the user ID
        const currentUser = await checkAuth()
        if (!currentUser?.id) {
          throw new Error('Vous n\'êtes pas authentifié.')
        }

        // Fetch teacher data, students and subjects in parallel
        const [
          teacherData,
          studentsData,
          subjectsData,
        ] = await Promise.all([
          // 1. Fetch teacher data
          fetchTeacherData(currentUser.id),

          // 2. Fetch class students
          students.getClassStudents(classId),

          // 3. Fetch subjects (will be filtered once we have teacher data)
          remoteSubjects.getTeachSubjectsInClass(classId),
        ])

        // Handle teacher data
        setTeacherData(teacherData)
        setClassStudents(studentsData)
        setSubjects(subjectsData)
        
        // Set first subject as selected by default if no subject is selected
        if (!selectedSubjectId && subjectsData.length > 0) {
          setSelectedSubjectId(subjectsData[0].id)
        }
      }
      catch (err: any) {
        console.error('Error loading initial data:', err)
        setError(err.message || 'Échec du chargement des données')
      }
      finally {
        setIsLoading(false)
      }
    }

    void loadInitialData()
  }, [checkAuth, fetchTeacherData, classId])

  // Fetch notes when subject is selected
  useEffect(() => {
    const teacherId = teacherData?.id
    if (!teacherId || !classId || !selectedSubjectId || classStudents.length === 0) {
      setStructuredNotes([])
      return
    }

    const fetchNoteDetails = async () => {
      setIsLoading(true)
      try {
        const data = await notes.getClassesNotesForRevision(teacherId, classId, selectedSubjectId)

        // Process notes to create sequence numbers for each type
        const typeSequences: { [key: string]: number } = {}
        const studentNotesMap: { [key: string]: StudentNotes } = {}

        // Initialize studentNotesMap with all class students
        classStudents.forEach(student => {
          studentNotesMap[student.id] = {
            studentId: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            notes: {},
          }
        })

        // Process each note and its details
        data?.forEach((note) => {
          const noteType = FROM_STRING_OPTIONS_MAP[note.noteType]
          const prefix = noteType === NOTE_TYPE.WRITING_QUESTION
            ? 'I'
            : noteType === NOTE_TYPE.CLASS_TEST
              ? 'D'
              : noteType === NOTE_TYPE.LEVEL_TEST ? 'DN' : null

          if (prefix) {
            typeSequences[noteType] = (typeSequences[noteType] || 0) + 1
            const sequence = typeSequences[noteType]
            const columnKey = `${prefix}${sequence}`

            note.noteDetails?.forEach((detail) => {
              if (detail.studentId && studentNotesMap[detail.studentId]) {
                studentNotesMap[detail.studentId].notes[columnKey] = {
                  id: note.id,
                  noteType,
                  sequence,
                  note: detail.note,
                  createdAt: note.createdAt,
                  title: note.title,
                }
              }
            })
          }
        })

        // Convert to array and sort by last name, then first name
        const sortedNotes = Object.values(studentNotesMap).sort((a, b) => {
          const lastNameCompare = a.lastName.localeCompare(b.lastName)
          return lastNameCompare !== 0 ? lastNameCompare : a.firstName.localeCompare(b.firstName)
        })

        setStructuredNotes(sortedNotes)
      }
      catch (err: any) {
        console.error('Error fetching note details:', err)
        setError(err.message || 'Échec du chargement des notes')
      }
      finally {
        setIsLoading(false)
      }
    }

    void fetchNoteDetails()
  }, [teacherData, classId, selectedSubjectId, classStudents])

  // --- Helper Functions ---
  const getColumnHeaders = useCallback(() => {
    if (structuredNotes.length === 0)
      return []

    const allKeys = new Set<string>()
    structuredNotes.forEach((student) => {
      Object.keys(student.notes).forEach(key => allKeys.add(key))
    })

    return Array.from(allKeys).sort((a, b) => {
      const aType = a.slice(0, -1) // 'I', 'D', or 'DN'
      const bType = b.slice(0, -1)
      const aNum = Number.parseInt(a.slice(aType.length))
      const bNum = Number.parseInt(b.slice(bType.length))

      if (aType === bType)
        return aNum - bNum
      // Order: I -> D -> DN
      if (aType === 'I')
        return -1
      if (bType === 'I')
        return 1
      if (aType === 'D')
        return -1
      return 1
    })
  }, [structuredNotes])

  // --- Render Logic ---
  if (loadingAuth || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner size="large" color="#007bff" />
        <CsText style={styles.loadingText}>Chargement des notes...</CsText>
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <CsText style={styles.errorText}>{error}</CsText>
      </View>
    )
  }

  if (!teacherData) {
    return <ErrorComponent errorMessage="Données de l'enseignant non disponibles." />
  }

  if (classStudents.length === 0) {
    return <ErrorComponent errorMessage="Aucun élève n'est inscrit dans cette classe." />
  }

  return (
    <View style={styles.container}>
      <View style={styles.pickerContainer}>
        <View style={styles.subjectPickerContainer}>
          <CsPicker
            label="Sélectionner une matière:"
            items={subjects.map(subject => ({
              label: subject.name,
              value: subject.id,
            }))}
            selectedValue={selectedSubjectId || ''}
            onValueChange={value => setSelectedSubjectId(value as string)}
          />
        </View>
      </View>

      <View style={styles.tableContainer}>
        <View style={styles.tableWrapper}>
          {/* Fixed Column */}
          <View style={styles.fixedColumn}>
            <View style={styles.headerRow}>
              <CsText style={styles.headerStudent}>Élève</CsText>
            </View>
            {structuredNotes.map((student, index) => (
              <View key={student.studentId} style={[styles.row, index % 2 !== 0 && styles.rowAlternate]}>
                <CsText style={styles.studentName}>
                  {student.firstName} {student.lastName}
                </CsText>
              </View>
            ))}
          </View>

          {/* Scrollable Area */}
          <ScrollView horizontal style={styles.scrollableArea}>
            <View>
              <View style={styles.headerRow}>
                {getColumnHeaders().map(column => (
                  <CsText key={column} style={styles.headerNote}>
                    {column}
                  </CsText>
                ))}
              </View>
              {structuredNotes.map((student, index) => (
                <View key={student.studentId} style={[styles.row, index % 2 !== 0 && styles.rowAlternate]}>
                  {getColumnHeaders().map(column => (
                    <CsText key={column} style={styles.noteCell}>
                      {student.notes[column]?.note ?? '-'}
                    </CsText>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {structuredNotes.length === 0 && (
          <View style={styles.emptyContainer}>
            <CsText style={styles.emptyText}>
              {selectedSubjectId 
                ? 'Aucune note trouvée pour les critères sélectionnés.'
                : 'Veuillez sélectionner une matière pour voir les notes.'}
            </CsText>
          </View>
        )}
      </View>
    </View>
  )
}

export default ClassNotesScreen
