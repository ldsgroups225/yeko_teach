// src/modules/school/components/StudentList.tsx

import CsText from '@components/CsText'
import EmptyListComponent from '@components/EmptyListComponent'
import type { IStudentDTO } from '@modules/app/types/ILoginDTO'
import StudentSearchSortFilter from '@modules/school/components/StudentSearchSortFilter'
import { useTheme } from '@src/hooks'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import type React from 'react'
import { SectionList, StyleSheet, View } from 'react-native'
import StudentListItem from './StudentListItem'

interface StudentListProps {
  groupedStudents: Array<{ title: string; data: IStudentDTO[] }>
  isAssigningGrade: boolean
  onNoteChange: (id: string, note: number | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  sortOrder: 'asc' | 'desc'
  setSortOrder: (order: 'asc' | 'desc') => void
  isReadOnly: boolean
  maxPoints: number
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
  isReadOnly,
  maxPoints
}) => {
  const theme = useTheme()
  const styles = useStyles(theme)

  const renderStudentItem = ({ item }: { item: IStudentDTO }) => (
    <StudentListItem
      student={item}
      isAssigningGrade={isAssigningGrade}
      onNoteChange={onNoteChange}
      isReadOnly={isReadOnly}
      maxPoints={maxPoints}
    />
  )

  const renderSectionHeader = ({
    section: { title }
  }: {
    section: { title: string }
  }) => (
    <View style={styles.sectionHeader}>
      <CsText variant='h3' style={styles.sectionHeaderText}>
        {title}
      </CsText>
    </View>
  )

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
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyListComponent message="Pas d'élève dans cette classe" />
        }
      />
    </>
  )
}

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    listContent: {
      padding: spacing.md
    },
    sectionHeader: {
      backgroundColor: `${theme.background}80`,
      padding: spacing.sm,
      marginTop: spacing.sm,
      borderRadius: 8
    },
    sectionHeaderText: {
      color: theme.text,
      fontWeight: 'bold'
    }
  })
}

export default StudentList
