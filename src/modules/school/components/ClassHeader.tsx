// src/modules/school/components/ClassHeader.tsx

import CsButton from '@components/CsButton'
import CsText from '@components/CsText'
import { Ionicons } from '@expo/vector-icons'
import type { IClassDTO } from '@modules/app/types/ILoginDTO'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from '@src/hooks'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import type { SchoolClassNotesStackParams } from '@utils/Routes'
import { Routes } from '@utils/Routes'
import type React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

interface ClassHeaderProps {
  classItem: IClassDTO
  schoolName: string
  onBackPress: () => void
  onOpenBottomSheet: () => void
  isEditing: boolean
  onUpdate: () => void
  onCancel: () => void
}

const ClassHeader: React.FC<ClassHeaderProps> = ({
  classItem,
  schoolName,
  onBackPress,
  onOpenBottomSheet,
  isEditing,
  onUpdate,
  onCancel
}) => {
  const theme = useTheme()
  const styles = useStyles(theme)

  const navigation =
    useNavigation<StackNavigationProp<SchoolClassNotesStackParams>>()

  const goToNotes = () => {
    navigation.navigate(Routes.SchoolClassNotes, {
      classId: classItem.id
    })
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.6}
        >
          <Ionicons name='arrow-back' size={24} color={theme.background} />
        </TouchableOpacity>

        <CsText
          variant='h2'
          style={styles.className}
          numberOfLines={1}
          ellipsizeMode='tail'
        >
          {classItem.name}
        </CsText>

        {isEditing ? (
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={onCancel}
              style={styles.actionCancelButton}
            >
              <CsText variant='body' style={styles.actionCancelText}>
                Annuler
              </CsText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onUpdate}
              style={styles.actionSaveButton}
            >
              <CsText variant='body' style={styles.actionSaveText}>
                Enreg.
              </CsText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <CsButton
              variant='secondary'
              size='small'
              onPress={goToNotes}
              title='Les notes'
              style={styles.actionButton}
            />

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onOpenBottomSheet}
              activeOpacity={0.7}
            >
              <Ionicons
                name='ellipsis-vertical'
                size={24}
                color={theme.background}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.bottomRow}>
        <CsText variant='body' style={styles.schoolName}>
          {schoolName}
        </CsText>
      </View>
    </View>
  )
}

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.primary,
      padding: spacing.md
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm
    },
    backButton: {
      padding: spacing.xs,
      marginRight: spacing.sm
    },
    className: {
      flex: 1,
      color: theme.background,
      fontSize: 20,
      fontWeight: 'bold',
      paddingHorizontal: spacing.sm
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    schoolName: {
      color: `${theme.background}80`,
      fontFamily: 'monospace'
    },
    actionCancelButton: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: 8,
      alignItems: 'center',
      borderColor: `${theme.background}80`,
      borderWidth: 1
    },
    actionButton: {
      padding: spacing.xs,
      marginLeft: spacing.sm
    },
    actionSaveButton: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: 8,
      backgroundColor: theme.background,
      alignItems: 'center'
    },
    editActions: {
      flexDirection: 'row'
    },
    actionCancelText: {
      color: theme.background,
      marginHorizontal: spacing.sm
    },
    actionSaveText: {
      color: theme.primary,
      marginHorizontal: spacing.sm
    },
    actionButtonText: {
      color: theme.background
    },
    actionButtons: {
      flexDirection: 'row',
      alignItems: 'center'
    }
  })
}

export default ClassHeader
