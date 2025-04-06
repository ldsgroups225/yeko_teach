// src/modules/school/screens/school.tsx

import type { SchoolSortOption, SchoolSortOrder } from '@modules/app/constants/sortAndFilter'
import type { ISchoolDTO } from '@modules/app/types/ILoginDTO'
import type { ITheme } from '@styles/theme'

import CsText from '@components/CsText'
import EmptyListComponent from '@components/EmptyListComponent'
import LoadingSpinner from '@components/LoadingSpinner'

import useDataFetching from '@hooks/useDataFetching'
import { SchoolItem } from '@modules/school/components/SchoolItem'
import { SearchHeader } from '@modules/school/components/SearchHeader'
import { SortControls } from '@modules/school/components/SortControls'

import MasonryList from '@react-native-seoul/masonry-list'
import { useTheme, useThemedStyles } from '@src/hooks'
import { useAppSelector } from '@src/store'

import { spacing } from '@styles/spacing'
import React, { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

// Create a wrapper component for MasonryList to handle type issues
function TypeSafeMasonryList({
  renderItem,
  ...props
}: {
  renderItem: (info: { item: ISchoolDTO, index: number }) => React.ReactElement
} & Omit<React.ComponentProps<typeof MasonryList>, 'renderItem'>) {
  return (
    <MasonryList
      renderItem={({ item, i }: { item: unknown, i: number }) =>
        renderItem({ item: item as ISchoolDTO, index: i })}
      {...props}
    />
  )
}

const SchoolScreen: React.FC = () => {
  const theme = useTheme()
  const themedStyles = useThemedStyles<typeof styles>(styles)
  const user = useAppSelector(s => s?.AppReducer?.user)

  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState<SchoolSortOption>('name')
  const [sortOrder, setSortOrder] = useState<SchoolSortOrder>('asc')

  const fetchSchools = useCallback(async () => {
    return Promise.resolve(user?.schools ?? [])
  }, [user?.schools])

  const {
    data: schools,
    loading,
    refreshing,
    refetch: refetchData,
  } = useDataFetching<ISchoolDTO[]>(fetchSchools, [])

  const filteredAndSortedSchools = useMemo(() => {
    return filterAndSortSchools(
      schools || [],
      searchQuery,
      sortOption,
      sortOrder,
    )
  }, [schools, searchQuery, sortOption, sortOrder])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <View style={themedStyles.container}>
      <View style={themedStyles.header}>
        <CsText variant="h2" style={themedStyles.title}>
          Ecoles où vous enseigné
        </CsText>
        <SearchHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          theme={theme}
        />
        <SortControls
          sortOption={sortOption}
          setSortOption={setSortOption}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          theme={theme}
        />
      </View>

      <View style={themedStyles.body}>
        <TypeSafeMasonryList
          data={filteredAndSortedSchools}
          keyExtractor={(item: ISchoolDTO) => item.id}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <SchoolItem
              item={item}
              index={index}
              totalItems={filteredAndSortedSchools.length}
              theme={theme}
            />
          )}
          refreshing={refreshing}
          onRefresh={refetchData}
          contentContainerStyle={themedStyles.listContent}
          ListEmptyComponent={
            <EmptyListComponent message="Vous n'êtes inscrit dans aucune école" />
          }
        />
      </View>
    </View>
  )
}

function filterAndSortSchools(schools: ISchoolDTO[], searchQuery: string, sortOption: SchoolSortOption, sortOrder: SchoolSortOrder): ISchoolDTO[] {
  let result = schools

  if (searchQuery) {
    result = result.filter(
      school =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase())
        || school.code.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }

  result.sort((a, b) => {
    const compareResult
      = sortOption === 'name'
        ? a.name.localeCompare(b.name)
        : a.code.localeCompare(b.code)
    return sortOrder === 'asc' ? compareResult : -compareResult
  })

  return result
}

function styles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.primary,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
    },
    body: {
      flex: 1,
      padding: spacing.md,
    },
    title: {
      marginBottom: spacing.md,
      color: theme.background,
    },
    listContent: {
      paddingBottom: spacing.xl,
    },
    emptyText: {
      textAlign: 'center',
      marginTop: spacing.xl,
      color: theme.textLight,
    },
  })
}

export default SchoolScreen
