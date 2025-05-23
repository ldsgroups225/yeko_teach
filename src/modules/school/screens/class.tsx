import type { ISemester } from '@modules/app/redux/IAppState'
import type { INoteDTO, IStudentDTO, ISubjectDTO } from '@modules/app/types/ILoginDTO'
import type { RouteProp } from '@react-navigation/native'
import type { ITheme } from '@styles/theme'
import type { SchoolStackParams } from '@utils/Routes'
import type Routes from '@utils/Routes'
import CsText from '@components/CsText'
import EmptyListComponent from '@components/EmptyListComponent'
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { Ionicons } from '@expo/vector-icons'
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet'
import { navigationRef } from '@helpers/router'
import { showToast } from '@helpers/toast/showToast'
import StudentSearchSortFilter from '@modules/school/components/StudentSearchSortFilter'
import { useFilteredAndGroupedStudents } from '@modules/school/hooks/useFilteredAndGroupedStudents'
import { useNote } from '@modules/school/hooks/useNote'
import { useStudentData } from '@modules/school/hooks/useStudentData'
import { useRoute } from '@react-navigation/native'
import { useTheme } from '@src/hooks'
import { useAppSelector } from '@store/index'
import { spacing } from '@styles/spacing'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, Pressable, SectionList, StyleSheet, TouchableOpacity, View } from 'react-native'
import ClassHeader from '../components/ClassHeader'
import { CreateNoteModal } from '../components/CreateNoteModal'
import { NoteHistoryView } from '../components/NoteHistoryView'
import StudentListItem from '../components/StudentListItem'

const SchoolClassDetails: React.FC = () => {
  const theme = useTheme()
  const styles = useStyles(theme)
  const bottomSheetRef = useRef<BottomSheet>(null)

  const route = useRoute<RouteProp<SchoolStackParams, Routes.SchoolClassDetails>>()
  const { classItem, school } = route.params

  const user = useAppSelector(s => s.AppReducer?.user)
  const semesters = useAppSelector(s => s.AppReducer?.semesters)
  const schoolYear = useAppSelector(s => s.AppReducer?.schoolYear)

  const [totalNotes, setTotalNotes] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [savedNotes, setSavedNotes] = useState<INoteDTO[]>([])
  const [isAssigningGrade, setIsAssigningGrade] = useState(false)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [selectedSemester, setSelectedSemester] = useState<ISemester>()
  const [selectedNote, setSelectedNote] = useState<INoteDTO | null>(null)
  const [subjectsTeached, setSubjectsTeached] = useState<ISubjectDTO[]>([])
  const [currentSubject] = useState(classItem.subjects[0])
  const [isCreateNoteModalVisible, setIsCreateNoteModalVisible] = useState(false)

  const {
    getNotes,
    saveNote,
    removeNote,
    publishNote,
    teachedSubjects,
    updateNoteDetails,
  } = useNote()

  const { students, setStudents, isLoading } = useStudentData(
    classItem.id,
    currentSubject.id,
    classItem.students,
  )

  const groupedStudents = useFilteredAndGroupedStudents(
    students,
    searchQuery,
    sortOrder,
  )

  const fetchSavedNotes = useCallback(async (page: number = 1) => {
    const result = await getNotes(
      classItem.id,
      user?.id ?? '',
      schoolYear?.id ?? 0,
      selectedSemester?.id,
      page,
    )

    if (result) {
      if (page === 1) {
        setSavedNotes(result.notes)
      }
      else {
        setSavedNotes(prev => [...prev, ...result.notes])
      }
      setTotalNotes(result.totalCount)
    }
  }, [classItem.id, selectedSemester])

  useEffect(() => {
    setCurrentPage(1)
    fetchSavedNotes(1).then(r => r)
  }, [currentSubject, selectedSemester])

  const loadMoreNotes = async () => {
    if (isLoadingMore || savedNotes.length >= totalNotes)
      return

    setIsLoadingMore(true)
    const nextPage = currentPage + 1
    await fetchSavedNotes(nextPage)
    setCurrentPage(nextPage)
    setIsLoadingMore(false)
  }

  const handleCreateNote = async (noteData: Partial<INoteDTO>) => {
    try {
      await saveNote(noteData as INoteDTO)
      showToast('Évaluation créée avec succès', ToastColorEnum.Success)
      await fetchSavedNotes()
      setIsCreateNoteModalVisible(false)
    }
    catch (error) {
      console.error('Failed to create note:', error)
      showToast('Erreur lors de la création de l\'évaluation', ToastColorEnum.Error)
    }
  }

  const handleNotePress = async (note: INoteDTO) => {
    const updatedStudents = students.map((student) => {
      const existingStudent = students.find(s => s.id === student.id)
      const noteDetail = note.noteDetails?.find(detail => detail.studentId === student.id)

      return {
        ...student,
        ...existingStudent,
        note: noteDetail?.note ?? existingStudent?.note ?? undefined,
      }
    })

    setSelectedNote(note)
    setStudents(updatedStudents)
    setIsAssigningGrade(true)
    setIsEditing(true)

    bottomSheetRef.current?.close()
  }

  const handleNoteChange = async (studentId: string, note: number | null) => {
    if (selectedNote && selectedNote.isActive) {
      return
    }

    const updatedStudents = students.map(student =>
      student.id === studentId ? { ...student, note: note ?? undefined } : student,
    )
    setStudents(updatedStudents)

    if (selectedNote) {
      try {
        setSelectedNote({
          ...selectedNote,
          noteDetails: selectedNote.noteDetails?.map(detail =>
            detail.studentId === studentId ? { ...detail, note: note ?? 0 } : detail,
          ),
        })
      }
      catch (error) {
        console.error('Failed to update note detail:', error)
        showToast('Erreur lors de la mise à jour de la note', ToastColorEnum.Error)
      }
    }
  }

  const allNotesAssigned = useMemo(() => {
    return students.every(student => student.note !== undefined)
  }, [students])

  const handleActivateNote = async (noteId: string, isActive: boolean) => {
    if (isActive) {
      return
    }

    if (!allNotesAssigned) {
      showToast('Toutes les notes doivent être attribuées pour envoyer les notes à l\'administration', ToastColorEnum.Error, 7000)
      return
    }

    const noteToActivate = savedNotes.find(note => note.id === noteId)
    if (!noteToActivate) {
      showToast('Note introuvable', ToastColorEnum.Error)
      return
    }

    if (noteToActivate.isActive) {
      showToast('La note est déjà publiée', ToastColorEnum.Error)
      return
    }

    try {
      const isSuccess = await publishNote(user?.id ?? '', classItem.id, noteId)
      if (isSuccess) {
        showToast('Notes activées avec succès', ToastColorEnum.Success)
        await fetchSavedNotes()
      }
      else {
        showToast('Erreur lors de l\'activation des notes', ToastColorEnum.Error)
      }
    }
    catch (error) {
      console.error('Failed to activate notes:', error)
      Alert.alert('Error', 'Failed to activate notes. Please try again.')
    }
  }

  const handleUpdateLocalNoteDetails = async () => {
    try {
      const updatedNoteDetails = students.map(student => ({
        studentId: student.id,
        note: student.note,
        noteId: selectedNote?.id ?? '',
      }))

      await updateNoteDetails(selectedNote!.id!, updatedNoteDetails)

      await fetchSavedNotes()
      showToast('Note sauvegardée avec succès', ToastColorEnum.Success)
    }
    catch (error) {
      console.error('Failed to save note:', error)
      showToast('Erreur lors de la sauvegarde de la note', ToastColorEnum.Error)
    }

    setIsEditing(false)
    setIsAssigningGrade(false)
    setSelectedNote(null)
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await removeNote(user?.id ?? '', classItem.id, noteId)
      showToast('Note supprimée avec succès', ToastColorEnum.Success)
      await fetchSavedNotes()
    }
    catch (error) {
      console.error('Failed to delete note:', error)
      showToast('Erreur lors de la suppression de la note', ToastColorEnum.Error)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setIsAssigningGrade(false)
    setSelectedNote(null)
  }

  const renderStudentItem = ({ item }: { item: IStudentDTO }) => (
    <StudentListItem
      student={item}
      isAssigningGrade={isAssigningGrade}
      onNoteChange={handleNoteChange}
      isReadOnly={selectedNote?.isActive ?? false}
      maxPoints={selectedNote?.totalPoints ?? 0}
    />
  )

  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand()
  }, [])

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  )

  async function makeNoteCreationModalVisible() {
    const _subjects = await teachedSubjects(classItem.id, user!.id)
    setSubjectsTeached(_subjects)
    setIsCreateNoteModalVisible(true)
  }

  const renderBottomSheetContent = () => (
    <View style={styles.bottomSheetContent}>
      <TouchableOpacity
        style={styles.bottomSheetButton}
        onPress={makeNoteCreationModalVisible}
      >
        <Ionicons name="add-outline" size={24} color={theme.background} />
        <CsText variant="body" style={styles.bottomSheetButtonText}>
          Nouvelle Évaluation
        </CsText>
      </TouchableOpacity>

      <View>
        <CsText variant="caption" style={styles.filterText}>Filtrer par trimestre</CsText>
        <FlatList
          data={semesters}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.semesterButton,
                selectedSemester?.id === item.id && styles.selectedSemesterButton,
              ]}
              onPress={() => {
                if (selectedSemester?.id === item.id)
                  setSelectedSemester(undefined)
                else setSelectedSemester(item)
              }}
            >
              <CsText
                style={StyleSheet.flatten([
                  styles.semesterButtonText,
                  selectedSemester?.id === item.id
                  && styles.selectedSemesterButtonText,
                ])}
              >
                {item.name}
              </CsText>
            </Pressable>
          )}
        />
      </View>

      <NoteHistoryView
        notes={savedNotes}
        onPressNote={handleNotePress}
        onPressDelete={handleDeleteNote}
        onPressActivate={handleActivateNote}
        onEndReached={loadMoreNotes}
        isLoadingMore={isLoadingMore}
        hasMore={savedNotes.length < totalNotes}
      />
    </View>
  )

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <ClassHeader
        classItem={classItem}
        schoolName={school.name}
        onBackPress={navigationRef.goBack}
        onOpenBottomSheet={openBottomSheet}
        isEditing={isEditing}
        onUpdate={handleUpdateLocalNoteDetails}
        onCancel={handleCancelEdit}
      />
      <StudentSearchSortFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      <SectionList
        sections={groupedStudents}
        renderItem={renderStudentItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <CsText variant="h3" style={styles.sectionHeaderText}>
              {title}
            </CsText>
          </View>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyListComponent message="Pas d'élève dans cette classe" />
        }
      />
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['35%', '58%', '80%']}
        index={-1}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        {renderBottomSheetContent()}
      </BottomSheet>

      {isCreateNoteModalVisible && (
        <CreateNoteModal
          isVisible={isCreateNoteModalVisible}
          onClose={() => setIsCreateNoteModalVisible(false)}
          onSubmit={handleCreateNote}
          schoolId={school.id}
          classId={classItem.id}
          user={user}
          schoolYear={schoolYear}
          subjects={subjectsTeached}
        />
      )}
    </View>
  )
}

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    listContent: {
      padding: spacing.md,
    },
    sectionHeader: {
      backgroundColor: theme.background + 80,
      padding: spacing.sm,
      marginTop: spacing.sm,
      borderRadius: 8,
    },
    sectionHeaderText: {
      color: theme.text,
      fontWeight: 'bold',
    },
    bottomSheetContent: {
      flex: 1,
      backgroundColor: theme.background,
      padding: spacing.md,
    },
    bottomSheetButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary,
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.sm,
    },
    bottomSheetButtonText: {
      color: theme.background,
      marginLeft: spacing.sm,
      fontWeight: 'bold',
    },
    subjectPickerContainer: {
      marginBottom: spacing.md,
    },
    subjectPicker: {
      backgroundColor: theme.card,
      borderRadius: 8,
      marginTop: spacing.xs,
    },
    bottomSheetSectionTitle: {
      color: theme.text,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    savedNotesList: {
      maxHeight: 200,
    },
    savedNoteItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.card,
      padding: spacing.sm,
      borderRadius: 8,
      marginBottom: spacing.xs,
    },
    savedNoteDate: {
      color: theme.text,
    },
    savedNoteId: {
      color: theme.textLight,
    },
    publishedContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    publishedText: {
      color: theme.success,
      marginLeft: spacing.xs,
    },
    publishButton: {
      backgroundColor: theme.primary,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 4,
    },
    publishButtonText: {
      color: theme.background,
    },
    activateButton: {
      backgroundColor: theme.warning,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 4,
    },
    activateButtonText: {
      color: theme.background,
    },
    noSavedNotesText: {
      color: theme.textLight,
      textAlign: 'center',
      marginTop: spacing.sm,
    },
    semesterButton: {
      borderRadius: 8,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderWidth: 1,
      borderColor: theme.border,
    },
    semesterButtonText: {
      color: theme.text,
    },
    selectedSemesterButton: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
      borderRadius: 8,
    },
    selectedSemesterButtonText: {
      color: theme.background,
      fontWeight: 'semibold',
    },
    filterText: { fontSize: 14, paddingHorizontal: 20 },
    filterList: { columnGap: 10, paddingVertical: 4, paddingHorizontal: 20 },
  })
}

export default SchoolClassDetails
