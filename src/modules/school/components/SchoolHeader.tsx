// src/modules/school/components/SchoolHeader.tsx

import type { ISchoolDTO } from '@modules/app/types/ILoginDTO'
import type { ITheme } from '@styles/theme'
import CsText from '@components/CsText'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '@src/hooks'
import { spacing } from '@styles/spacing'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

interface SchoolHeaderProps {
  school: ISchoolDTO
  onGenerateQRCode: () => void
  onBackPress: () => void
}

const SchoolHeader: React.FC<SchoolHeaderProps> = ({
  school,
  onGenerateQRCode,
  onBackPress,
}) => {
  const theme = useTheme()
  const styles = useStyles(theme)

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={24} color={theme.background} />
        </TouchableOpacity>
        <CsText
          variant="h2"
          style={styles.schoolName}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {school.name}
        </CsText>
      </View>
      <View style={styles.bottomRow}>
        <CsText variant="body" style={styles.schoolCode}>
          {school.code}
        </CsText>
        <TouchableOpacity style={styles.qrButton} onPress={onGenerateQRCode}>
          <Ionicons name="qr-code" size={20} color={theme.text} />
          <CsText variant="caption" style={styles.qrButtonText}>
            Générer QR
          </CsText>
        </TouchableOpacity>
      </View>
    </View>
  )
}

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.primary,
      padding: spacing.md,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    backButton: {
      marginRight: spacing.sm,
    },
    schoolName: {
      flex: 1,
      color: theme.background,
      fontSize: 20,
      fontWeight: 'bold',
    },
    bottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    schoolCode: {
      color: theme.background + 80,
    },
    qrButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.secondary,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      borderRadius: 8,
    },
    qrButtonText: {
      color: theme.text,
      marginLeft: spacing.xs,
    },
  })
}

export default SchoolHeader
