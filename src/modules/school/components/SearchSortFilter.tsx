// src/modules/school/components/SearchSortFilter.tsx

import type { ISelectOptions } from '@modules/app/types/ISelectOptions'
import type { ITheme } from '@styles/theme'
import CsText from '@components/CsText'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@src/hooks'
import { spacing } from '@styles/spacing'
import React from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'

interface SearchSortFilterProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedGrade: number | null
  setSelectedGrade: (grade: number | null) => void
  sortOrder: 'asc' | 'desc'
  setSortOrder: (order: 'asc' | 'desc') => void
  grades: ISelectOptions[]
}

const $white = '#FFF'

const SearchSortFilter: React.FC<SearchSortFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedGrade,
  setSelectedGrade,
  sortOrder,
  setSortOrder,
  grades,
}) => {
  const theme = useTheme()
  const styles = useStyles(theme)

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={theme.textLight}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Rechercher des classes..."
          placeholderTextColor={theme.textLight}
        />
      </View>
      <View style={styles.filterContainer}>
        <CsText variant="caption" style={styles.filterLabel}>
          Niveau:
        </CsText>
        <View style={styles.gradeButtons}>
          <TouchableOpacity
            style={[styles.gradeButton, !selectedGrade && styles.selectedGrade]}
            onPress={() => setSelectedGrade(null)}
          >
            <CsText
              variant="caption"
              style={
                selectedGrade === null
                  ? { color: $white }
                  : styles.gradeButtonText
              }
            >
              Tout
            </CsText>
          </TouchableOpacity>
          {grades.map(grade => (
            <TouchableOpacity
              key={grade.value}
              style={[
                styles.gradeButton,
                selectedGrade?.toString() === grade.value
                && styles.selectedGrade,
              ]}
              onPress={() => setSelectedGrade(Number(grade.value))}
            >
              <CsText
                variant="caption"
                style={
                  selectedGrade?.toString() === grade.value
                    ? { color: $white }
                    : styles.gradeButtonText
                }
              >
                {grade.label}
              </CsText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
      >
        <Ionicons
          name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'}
          size={20}
          color={theme.text}
        />
        <CsText variant="caption" style={styles.sortButtonText}>
          Sort
          {' '}
          {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
        </CsText>
      </TouchableOpacity>
    </View>
  )
}

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      padding: spacing.md,
      backgroundColor: theme.card,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: 8,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    searchInput: {
      flex: 1,
      color: theme.text,
      fontSize: 16,
    },
    filterContainer: {
      marginBottom: spacing.sm,
    },
    filterLabel: {
      color: theme.textLight,
      marginBottom: spacing.xs,
    },
    gradeButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    gradeButton: {
      backgroundColor: theme.background,
      borderRadius: 16,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    },
    selectedGrade: {
      backgroundColor: theme.primary,
    },
    gradeButtonText: {
      color: theme.text,
    },
    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
    },
    sortButtonText: {
      color: theme.text,
      marginLeft: spacing.xs,
    },
  })
}

export default SearchSortFilter
