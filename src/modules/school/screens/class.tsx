import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useTheme } from "@src/hooks";
import CsText from "@components/CsText";
import { spacing } from "@styles/spacing";
import { ITheme } from "@styles/theme";
import { INoteDTO, IStudentDTO } from "@modules/app/types/ILoginDTO";
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
import { Picker } from "@react-native-picker/picker";
import { format } from "date-fns";

const SchoolClassDetails: React.FC = () => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const route =
    useRoute<RouteProp<SchoolStackParams, Routes.SchoolClassDetails>>();
  const { classItem, school } = route.params;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isAssigningGrade, setIsAssigningGrade] = useState(false);
  const [currentSubject, setCurrentSubject] = useState(classItem.subjects[0]);
  const [savedNotes, setSavedNotes] = useState<INoteDTO[]>([]);

  const {
    getNotes,
    saveNotes,
    publishNotes,
    loading: isNoteSubmitting,
  } = useNote();

  const { students, setStudents, saveStudents, isLoading } = useStudentData(
    classItem.id,
    currentSubject.id,
    classItem.students
  );

  const groupedStudents = useFilteredAndGroupedStudents(
    students,
    searchQuery,
    sortOrder
  );

  useEffect(() => {
    fetchSavedNotes();
  }, [currentSubject]);

  const fetchSavedNotes = async () => {
    const notes = await getNotes(currentSubject.id, classItem.id);
    if (notes) {
      setSavedNotes(notes);
    }
  };

  const handleNoteChange = (id: string, note: number) => {
    const updatedStudents = students.map((student) =>
      student.id === id ? { ...student, note } : student
    );
    setStudents(updatedStudents);
    saveStudents(updatedStudents).then((r) => r);
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

  const handlePublishNote = async (noteDate: Date) => {
    try {
      const isSuccess = await publishNotes(noteDate);
      if (isSuccess) {
        showToast("Notes publiées avec succès", ToastColorEnum.Success);
        fetchSavedNotes();
      } else {
        showToast(
          "Erreur lors de la publication des notes",
          ToastColorEnum.Error
        );
      }
    } catch (error) {
      console.error("Failed to publish notes:", error);
      Alert.alert("Error", "Failed to publish notes. Please try again.");
    }
  };

  const handleRemotelySaveNotes = async () => {
    if (!allNotesAssigned) {
      showToast(
        "Tout les élèves doivent avoir une note",
        ToastColorEnum.Warning
      );
      return;
    }

    try {
      const now = new Date();

      const noteToSave: INoteDTO[] = students.map((s) => ({
        date: now,
        note: s.note!,
        subjectId: currentSubject.id,
        studentId: s.id,
        classId: classItem.id,
      }));

      const isSuccess = await saveNotes(noteToSave);

      if (!isSuccess) {
        showToast(
          "Erreur lors de la sauvegarde des notes",
          ToastColorEnum.Error,
          4000
        );
        return;
      }

      const clearedStudents = students.map((student) => ({
        ...student,
        note: undefined,
      }));
      setStudents(clearedStudents);
      await saveStudents(clearedStudents);

      showToast("Les notes ont été sauvegardées", ToastColorEnum.Success);
      setIsAssigningGrade(false);
      fetchSavedNotes();
    } catch (error) {
      console.error("Failed to share grades:", error);
      Alert.alert("Error", "Failed to share grades. Please try again.");
    }
  };

  const renderStudentItem = ({ item }: { item: IStudentDTO }) => (
    <StudentListItem
      student={item}
      isAssigningGrade={isAssigningGrade}
      onNoteChange={handleNoteChange}
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

  const renderSavedNoteItem = ({ item }: { item: INoteDTO }) => (
    <View style={styles.savedNoteItem}>
      <View>
        <CsText variant="body" style={styles.savedNoteDate}>
          {format(new Date(item.date), "dd/MM/yyyy")}
        </CsText>
        <CsText variant="caption" style={styles.savedNoteId}>
          ID: {item.id?.slice(0, 8)}...
        </CsText>
      </View>
      {item.isPublished ? (
        <View style={styles.publishedContainer}>
          <Ionicons name="checkmark-circle" size={20} color={theme.success} />
          <CsText variant="caption" style={styles.publishedText}>
            {item.publishDate
              ? format(new Date(item.publishDate), "dd/MM/yyyy HH:mm")
              : "Déja Publié"}
          </CsText>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.publishButton}
          onPress={() => handlePublishNote(item.date)}
        >
          <CsText variant="caption" style={styles.publishButtonText}>
            Publier
          </CsText>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderBottomSheetContent = () => (
    <View style={styles.bottomSheetContent}>
      <TouchableOpacity
        style={styles.bottomSheetButton}
        onPress={() => {
          toggleGradeAssignment();
          bottomSheetRef.current?.close();
        }}
      >
        <Ionicons
          name={isAssigningGrade ? "save-outline" : "create-outline"}
          size={24}
          color={theme.background}
        />
        <CsText variant="body" style={styles.bottomSheetButtonText}>
          {isAssigningGrade
            ? "Sauvegarder"
            : hasExistingNotes
            ? "Modifier notes"
            : "Attribuer notes"}
        </CsText>
      </TouchableOpacity>

      {!isAssigningGrade && hasExistingNotes && allNotesAssigned && (
        <TouchableOpacity
          style={styles.bottomSheetButton}
          onPress={() => {
            handleRemotelySaveNotes();
            bottomSheetRef.current?.close();
          }}
        >
          <Ionicons name="share-outline" size={24} color={theme.background} />
          <CsText variant="body" style={styles.bottomSheetButtonText}>
            Partager les notes
          </CsText>
        </TouchableOpacity>
      )}

      <View style={styles.subjectPickerContainer}>
        <CsText variant="h3" style={styles.bottomSheetSectionTitle}>
          Matières
        </CsText>
        <Picker
          selectedValue={currentSubject.id}
          style={styles.subjectPicker}
          onValueChange={(itemValue) => {
            const newSubject = classItem.subjects.find(
              (s) => s.id === itemValue
            );
            if (newSubject) {
              setCurrentSubject(newSubject);
              bottomSheetRef.current?.close();
            }
          }}
        >
          {classItem.subjects.map((subject) => (
            <Picker.Item
              key={subject.id}
              label={subject.name}
              value={subject.id}
            />
          ))}
        </Picker>
      </View>

      <CsText variant="h3" style={styles.bottomSheetSectionTitle}>
        Notes sauvegardées
      </CsText>
      {isNoteSubmitting ? (
        <ActivityIndicator size="small" color={theme.primary} />
      ) : savedNotes.length > 0 ? (
        <FlatList
          data={savedNotes}
          renderItem={renderSavedNoteItem}
          keyExtractor={(item) => item.id!}
          style={styles.savedNotesList}
        />
      ) : (
        <CsText variant="body" style={styles.noSavedNotesText}>
          Aucune note sauvegardée pour cette matière
        </CsText>
      )}
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
    noSavedNotesText: {
      color: theme.textLight,
      textAlign: "center",
      marginTop: spacing.sm,
    },
  });

export default SchoolClassDetails;
