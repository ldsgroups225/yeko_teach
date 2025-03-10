// src/components/CsPicker/index.tsx

import type { ITheme } from '@styles/theme'
import CsText from '@components/CsText'
import { useTheme, useThemedStyles } from '@hooks/index'
import { Picker } from '@react-native-picker/picker'
import { borderRadius } from '@styles/index'
import { spacing } from '@styles/spacing'
import React from 'react'
import { Platform, StyleSheet, View } from 'react-native'

interface CsPickerProps {
  label: string
  selectedValue: string
  onValueChange: (itemValue: string) => void
  items: { label: string, value: string }[]
}

function styles(theme: ITheme) {
  return StyleSheet.create({
    pickerContainer: {
      marginBottom: spacing.md,
    },
    pickerLabel: {
      marginBottom: spacing.xs,
    },
    picker: {
      backgroundColor: theme.card,
      borderRadius: borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text,
    },
  })
}

const CsPicker: React.FC<CsPickerProps> = ({
  label,
  selectedValue,
  onValueChange,
  items,
}) => {
  const theme = useTheme()
  const themedStyles = useThemedStyles<typeof styles>(styles)

  return (
    <View style={themedStyles.pickerContainer}>
      <CsText variant="body" style={themedStyles.pickerLabel}>
        {label}
      </CsText>
      <Picker
        selectedValue={selectedValue}
        onValueChange={onValueChange}
        style={[
          themedStyles.picker,
          Platform.OS === 'android' && { height: 40 },
        ]} // Adjust height for Android
        dropdownIconColor={theme.text}
      >
        {items.map(item => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  )
}

export default CsPicker
