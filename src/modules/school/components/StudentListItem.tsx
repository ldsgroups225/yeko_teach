// src/modules/school/components/StudentListItem.tsx

import type { IStudentDTO } from '@modules/app/types/ILoginDTO'
import type { ITheme } from '@styles/theme'
import CsText from '@components/CsText'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@src/hooks'
import { spacing } from '@styles/spacing'
import React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

interface StudentListItemProps {
  student: IStudentDTO
  isAssigningGrade: boolean
  onNoteChange: (id: string, note: number | null) => void
  isReadOnly: boolean
  maxPoints: number
}

const StudentListItem: React.FC<StudentListItemProps> = ({
  student,
  isAssigningGrade,
  onNoteChange,
  isReadOnly,
  maxPoints,
}) => {
  const theme = useTheme()
  const styles = useStyles(theme)

  // Create a shared value for the fade animation.
  const fade = useSharedValue(0)

  // Create an animated style that drives the opacity.
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fade.value,
  }))

  React.useEffect(() => {
    fade.value = withTiming(1, { duration: 300 })
  }, [fade])

  const handleNoteChange = (text: string) => {
    const note
      = text === '' ? null : Math.min(Math.max(Number.parseInt(text) || 0, 0), maxPoints)
    onNoteChange(student.id, note)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Animated.View style={[styles.container, fadeStyle]}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <CsText variant="h3" style={styles.avatarText}>
            {getInitials(student.firstName, student.lastName)}
          </CsText>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <CsText variant="h3" style={styles.name}>
          {`${student.lastName} ${student.firstName}`}
        </CsText>
        <View style={styles.idNumberContainer}>
          <Ionicons name="id-card-outline" size={14} color={theme.textLight} />
          <CsText variant="caption" style={styles.idNumber}>
            {student.idNumber}
          </CsText>
        </View>
      </View>
      <View style={styles.noteContainer}>
        {isAssigningGrade
          ? (
              <TextInput
                style={[styles.noteInput, isReadOnly && styles.readOnlyInput]}
                keyboardType="numeric"
                value={student.note?.toString() || ''}
                onChangeText={handleNoteChange}
                maxLength={2}
                placeholder={`/${maxPoints}`}
                placeholderTextColor={theme.textLight}
                editable={!isReadOnly}
              />
            )
          : (
              <View
                style={[
                  styles.noteDisplay,
                  student.note !== undefined && styles.noteDisplayFilled,
                ]}
              >
                <CsText variant="body" style={styles.noteText}>
                  {student.note !== undefined ? student.note : '-'}
                </CsText>
              </View>
            )}
      </View>
    </Animated.View>
  )
}

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.card,
    },
    avatarContainer: {
      marginRight: spacing.md,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: theme.background,
      fontSize: 16,
      fontWeight: 'bold',
    },
    infoContainer: {
      flex: 1,
    },
    name: {
      color: theme.text,
      fontWeight: 'bold',
    },
    idNumberContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    idNumber: {
      color: theme.textLight,
      marginLeft: spacing.xs,
    },
    noteContainer: {
      width: 60,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noteInput: {
      width: '100%',
      height: '100%',
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 8,
      textAlign: 'center',
      color: theme.text,
      fontSize: 16,
      backgroundColor: theme.background,
    },
    noteDisplay: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
      borderRadius: 8,
    },
    noteDisplayFilled: {
      backgroundColor: `${theme.success}20`,
    },
    noteText: {
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 16,
    },
    readOnlyInput: {
      backgroundColor: `${theme.background}40`,
      borderColor: theme.border,
    },
  })
}

export default StudentListItem
