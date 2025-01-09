import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, SectionList, StyleSheet, TouchableOpacity, View } from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/hooks";
import CsText from "@components/CsText";
import { spacing } from "@styles/spacing";
import { ITheme } from "@styles/theme";
import { INoteDTO, IStudentDTO, ISubjectDTO } from "@modules/app/types/ILoginDTO";
import Routes, { SchoolStackParams } from "@utils/Routes";
import ClassHeader from "../components/ClassHeader";
import StudentSearchSortFilter from "@modules/school/components/StudentSearchSortFilter";
import StudentListItem from "../components/StudentListItem";
import { navigationRef } from "@helpers/router";
import { useFilteredAndGroupedStudents } from "@modules/school/hooks/useFilteredAndGroupedStudents";
import { useStudentData } from "@modules/school/hooks/useStudentData";
import EmptyListComponent from "@components/EmptyListComponent";
import { useNote } from "@modules/school/hooks/useNote";
import { showToast } from "@helpers/toast/showToast";
import { ToastColorEnum } from "@components/ToastMessage/ToastColorEnum";
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { CreateNoteModal } from "../components/CreateNoteModal";
import { NoteHistoryView } from "../components/NoteHistoryView";
import { useAppSelector } from "@store/index";

const SchoolClassDetails: React.FC = () => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const route = useRoute<RouteProp<SchoolStackParams, Routes.SchoolClassDetails>>();
  const { classItem, school } = route.params;

  const user = useAppSelector((s) => s.AppReducer?.user);
  const schoolYear = useAppSelector((s) => s.AppReducer?.schoolYear);

  const [searchQuery, setSearchQuery] = useState("");
  const [isViewingNote, setIsViewingNote] = useState(false);
  const [savedNotes, setSavedNotes] = useState<INoteDTO[]>([]);
  const [isAssigningGrade, setIsAssigningGrade] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedNote, setSelectedNote] = useState<INoteDTO | null>(null);
  const [subjectsTeached, setSubjectsTeached] = useState<ISubjectDTO[]>([])
  const [currentSubject, setCurrentSubject] = useState(classItem.subjects[0]);
  const [isCreateNoteModalVisible, setIsCreateNoteModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
error,
    loading,
    getNotes,
    saveNote,
    removeNote,
    publishNote,
    teachedSubjects,
  } = useNote();

  const { students, setStudents, saveStudents, isLoading } = useStudentData(
    classItem.id,
    currentSubject.id,
    classItem.students
  );

  const groupedStudents = useFilteredAndGroupedStudents(
    students,
    searchQuery,
    sortOrder,
  );

  useEffect(() => {
    fetchSavedNotes();
  }, [currentSubject]);

  const fetchSavedNotes = async () => {
    const notes = await getNotes(classItem.id, user?.id ?? "", schoolYear?.id ?? 0);
    if (notes) {
      setSavedNotes(notes);
    }
  };

  const handleCreateNote = async (noteData: Partial<INoteDTO>) => {
    try {
      await saveNote(noteData as INoteDTO);
      showToast("Évaluation créée avec succès", ToastColorEnum.Success);
      fetchSavedNotes();

      setIsCreateNoteModalVisible(false);
    } catch (error) {
      console.error("Failed to create note:", error);
      showToast("Erreur lors de la création de l'évaluation", ToastColorEnum.Error);
    }
  };

  const handleNotePress = async (note: INoteDTO) => {
    setSelectedNote(note);
    setIsViewingNote(true);
    setIsAssigningGrade(true);
    setIsEditing(true);
    
    if (note.noteDetails && note.noteDetails.length > 0) {
      const updatedStudents = students.map(student => {
        const noteDetail = note!.noteDetails!.find(
          detail => detail.studentId === student.id
        );
        return {
          ...student,
          note: noteDetail?.note ?? undefined
        };
      });
      setStudents(updatedStudents);
    } else {
      const clearedStudents = students.map(student => ({
        ...student,
        note: undefined
      }));
      setStudents(clearedStudents);
    }
    
    bottomSheetRef.current?.close();
  };

  const handleNoteChange = async (studentId: string, note: number | null) => {
    if (selectedNote && selectedNote.isActive) {
      return;
    }
  
    const updatedStudents = students.map((student) =>
      student.id === studentId ? { ...student, note: note ?? undefined } : student
    );
    setStudents(updatedStudents);
  
    if (selectedNote) {
      try {
        const noteDetail = {
          noteId: selectedNote.id!,
          studentId,
          note: note ?? 0,
          subjectId: currentSubject.id,
        };
  
        //TODO: await saveNoteDetails(noteDetail);
        // TODO: update selectedNote noteDetails
        setSelectedNote({
          ...selectedNote,
          noteDetails: selectedNote.noteDetails?.map((detail) =>
            detail.studentId === studentId ? { ...detail, note: note ?? 0 } : detail
          ),
        });
      } catch (error) {
        console.error("Failed to update note detail:", error);
        showToast("Erreur lors de la mise à jour de la note", ToastColorEnum.Error);
      }
    }
  };

  const toggleGradeAssignment = () => {
    setIsAssigningGrade(!isAssigningGrade);
  };

  const hasExistingNotes = useMemo(() => {
    return students.some((student) => student.note !== undefined);
  }, [students]);

  const allNotesAssigned = useMemo(() => {
    return students.every((student) => student.note !== undefined);
  }, [students]);

  const handleActivateNote = async (noteId: string, isActive: boolean) => {
    if (isActive) {
      return;
    }

    if (!allNotesAssigned) {
      showToast("Toutes les notes doivent être attribuées pour envoyer les notes à l'administration", ToastColorEnum.Error, 7000);
      return;
    }
  
    const noteToActivate = savedNotes.find((note) => note.id === noteId);
    if (!noteToActivate) {
      showToast("Note introuvable", ToastColorEnum.Error);
      return;
    }
  
    if (noteToActivate.isActive) {
      showToast("La note est déjà publiée", ToastColorEnum.Error);
      return;
    }
  
    try {
      const isSuccess = await publishNote(noteId);
      if (isSuccess) {
        showToast("Notes activées avec succès", ToastColorEnum.Success);
        fetchSavedNotes();
      } else {
        showToast("Erreur lors de l'activation des notes", ToastColorEnum.Error);
      }
    } catch (error) {
      console.error("Failed to activate notes:", error);
      Alert.alert("Error", "Failed to activate notes. Please try again.");
    }
  };

  const handleSaveLocalNote = async () => {
    if (allNotesAssigned) {
      try {
        await saveNote(selectedNote!, selectedNote!.id);
        showToast("Note sauvegardée avec succès", ToastColorEnum.Success);
      } catch (error) {
        console.error("Failed to save note:", error);
        showToast("Erreur lors de la sauvegarde de la note", ToastColorEnum.Error);
      }
    } else {
      try {
        await saveNote(selectedNote!);
        showToast("Note sauvegardée localement", ToastColorEnum.Success);
      } catch (error) {
        console.error("Failed to save note locally:", error);
        showToast("Erreur lors de la sauvegarde locale de la note", ToastColorEnum.Error);
      }
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedNote(null);
  };

  const renderStudentItem = ({ item }: { item: IStudentDTO }) => (
    <StudentListItem
      student={item}
      isAssigningGrade={isAssigningGrade}
      onNoteChange={handleNoteChange}
      isReadOnly={selectedNote?.isActive ?? false}
      maxPoints={selectedNote?.totalPoints ?? 0}
    />
  );

  const openBottomSheet = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

  async function makeNoteCreationModalVisible() {
    const _subjects = await teachedSubjects(classItem.id, user!.id);
    setSubjectsTeached(_subjects);
    setIsCreateNoteModalVisible(true);
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

      <NoteHistoryView
        notes={savedNotes}
        onPressNote={handleNotePress}
        onPressActivate={handleActivateNote}
      />
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ClassHeader
        classItem={classItem}
        schoolName={school.name}
        onBackPress={navigationRef.goBack}
        onOpenBottomSheet={openBottomSheet}
        isEditing={isEditing}
        onSave={handleSaveLocalNote}
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyListComponent message="Pas d'élève dans cette classe" />
        }
      />
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["35%", "58%", "80%"]}
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
  );
};

const useStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
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
      fontWeight: "bold",
    },
    bottomSheetContent: {
      flex: 1,
      backgroundColor: theme.background,
      padding: spacing.md,
    },
    bottomSheetButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.primary,
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.sm,
    },
    bottomSheetButtonText: {
      color: theme.background,
      marginLeft: spacing.sm,
      fontWeight: "bold",
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
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
      flexDirection: "row",
      alignItems: "center",
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
      textAlign: "center",
      marginTop: spacing.sm,
    },
  });

export default SchoolClassDetails;
