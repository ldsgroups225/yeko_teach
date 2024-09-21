// components/StudentList.tsx
import React from "react";
import { SectionList, StyleSheet, View } from "react-native";
import { IStudentDTO } from "@modules/app/types/ILoginDTO";
import { ITheme } from "@styles/theme";
import { useTheme } from "@src/hooks";
import CsText from "@components/CsText";
import { spacing } from "@styles/spacing";
import StudentListItem from "./StudentListItem";
import StudentSearchSortFilter from "@modules/school/components/StudentSearchSortFilter";
import EmptyListComponent from "@components/EmptyListComponent";

interface StudentListProps {
  groupedStudents: Array<{ title: string; data: IStudentDTO[] }>;
  isAssigningGrade: boolean;
  onNoteChange: (id: string, note: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
}

/**
 * StudentList component renders a list of students with search and sort functionality.
 */
const StudentList: React.FC<StudentListProps> = ({
  groupedStudents,
  isAssigningGrade,
  onNoteChange,
  searchQuery,
  setSearchQuery,
  sortOrder,
  setSortOrder,
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const renderStudentItem = ({ item }: { item: IStudentDTO }) => (
    <StudentListItem
      student={item}
      isAssigningGrade={isAssigningGrade}
      onNoteChange={onNoteChange}
    />
  );

  const renderSectionHeader = ({
    section: { title },
  }: {
    section: { title: string };
  }) => (
    <View style={styles.sectionHeader}>
      <CsText variant="h3" style={styles.sectionHeaderText}>
        {title}
      </CsText>
    </View>
  );

  return (
    <>
      <StudentSearchSortFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
      <SectionList
        sections={groupedStudents}
        renderItem={renderStudentItem}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyListComponent message="Pas d'élève dans cette classe" />
        }
      />
    </>
  );
};

const useStyles = (theme: ITheme) =>
  StyleSheet.create({
    listContent: {
      padding: spacing.md,
    },
    sectionHeader: {
      backgroundColor: theme.background + "80",
      padding: spacing.sm,
      marginTop: spacing.sm,
      borderRadius: 8,
    },
    sectionHeaderText: {
      color: theme.text,
      fontWeight: "bold",
    },
  });

export default StudentList;
