// src/modules/school/components/SortControls.tsx

import type {
  SchoolSortOption,
  SchoolSortOrder,
} from '@modules/app/constants/sortAndFilter'
import type { ITheme } from '@styles/theme'
import CsText from '@components/CsText'
import { MaterialIcons } from '@expo/vector-icons'
import { spacing } from '@styles/spacing'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

interface SortControlsProps {
  sortOption: SchoolSortOption
  setSortOption: (option: SchoolSortOption) => void
  sortOrder: SchoolSortOrder
  setSortOrder: (order: SchoolSortOrder) => void
  theme: ITheme
}

export const SortControls: React.FC<SortControlsProps> = ({
  sortOption,
  setSortOption,
  sortOrder,
  setSortOrder,
  theme,
}) => (
  <View style={styles(theme).sortContainer}>
    <TouchableOpacity
      style={styles(theme).sortButton}
      onPress={() => setSortOption(sortOption === 'name' ? 'code' : 'name')}
    >
      <CsText variant="caption" style={styles(theme).sortButtonText}>
        Classer par:
        {' '}
        {sortOption === 'name' ? 'Nom' : 'Code'}
      </CsText>
    </TouchableOpacity>
    <TouchableOpacity
      style={styles(theme).sortOrderButton}
      onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
    >
      <MaterialIcons
        name={sortOrder === 'asc' ? 'sort' : 'sort-by-alpha'}
        size={20}
        color={theme.background}
      />
    </TouchableOpacity>
  </View>
)

function styles(theme: ITheme) {
  return StyleSheet.create({
    sortContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    sortButton: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: spacing.sm,
    },
    sortButtonText: {
      color: theme.text,
      fontWeight: 'bold',
    },
    sortOrderButton: {
      padding: spacing.sm,
    },
  })
}
