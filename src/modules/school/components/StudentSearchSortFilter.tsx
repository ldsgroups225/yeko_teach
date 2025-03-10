// src/modules/school/components/StudentSearchSortFilter.tsx

import type { ITheme } from '@styles/theme'
import CsText from '@components/CsText'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@src/hooks'
import { spacing } from '@styles/spacing'
import React from 'react'
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'

interface StudentSearchSortFilterProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  sortOrder: 'asc' | 'desc'
  setSortOrder: (order: 'asc' | 'desc') => void
}

const StudentSearchSortFilter: React.FC<StudentSearchSortFilterProps> = ({
  searchQuery,
  setSearchQuery,
  sortOrder,
  setSortOrder,
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
          placeholder="Rechercher des étudiants..."
          placeholderTextColor={theme.textLight}
        />
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
          Trier
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

export default StudentSearchSortFilter
