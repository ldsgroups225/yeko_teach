// src/modules/school/components/ClassListItem.tsx

import type { IClassDTO } from '@modules/app/types/ILoginDTO'
import type { ITheme } from '@styles/theme'
import CsText from '@components/CsText'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@src/hooks'
import { spacing } from '@styles/spacing'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

interface ClassListItemProps {
  classItem: IClassDTO
  onPress: () => void
}

const ClassListItem: React.FC<ClassListItemProps> = ({
  classItem,
  onPress,
}) => {
  const theme = useTheme()
  const styles = useStyles(theme)

  // Function to generate a color based on the class name
  const getClassColor = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
    const index = name.charCodeAt(0) % colors.length
    return colors[index]
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.colorIndicator,
          { backgroundColor: getClassColor(classItem.name) },
        ]}
      />
      <View style={styles.contentContainer}>
        <View style={styles.infoContainer}>
          <CsText variant="h3" style={styles.className}>
            {classItem.name}
          </CsText>
          <CsText variant="caption" style={styles.gradeName}>
            {classItem.gradeName}
          </CsText>
        </View>
        <View style={styles.statsContainer}>
          <View style={styles.studentsCountContainer}>
            <Ionicons
              name="people"
              size={16}
              color={theme.primary}
              style={styles.icon}
            />
            <CsText variant="body" style={styles.studentsCount}>
              {classItem.students.length <= 1
                ? `${classItem.students.length} élève`
                : `${classItem.students.length} élèves`}
            </CsText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.primary} />
        </View>
      </View>
    </TouchableOpacity>
  )
}

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.card,
      borderRadius: 12,
      marginBottom: spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: 'hidden',
    },
    colorIndicator: {
      width: 8,
      backgroundColor: theme.primary,
    },
    contentContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
    },
    infoContainer: {
      flex: 1,
    },
    className: {
      color: theme.text,
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: spacing.xs,
    },
    gradeName: {
      color: theme.textLight,
      fontSize: 14,
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    studentsCountContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.background + 80,
      borderRadius: 20,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      marginRight: spacing.sm,
    },
    icon: {
      marginRight: spacing.xs,
    },
    studentsCount: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: '600',
    },
  })
}

export default ClassListItem
