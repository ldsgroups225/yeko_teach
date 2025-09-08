// src/components/PasswordField/index.tsx

import CsText from '@components/CsText'
import CsTextField from '@components/CsTextField'
import PasswordStrengthIndicator from '@components/PasswordStrengthIndicator'
import { Ionicons } from '@expo/vector-icons'
import { useThemedStyles } from '@hooks/index'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import { calculatePasswordStrength } from '@utils/validation'
import type React from 'react'
import { useState } from 'react'
import type { TextInputProps, ViewStyle } from 'react-native'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

interface PasswordFieldProps
  extends Omit<TextInputProps, 'style' | 'secureTextEntry'> {
  label: string
  error?: string
  required?: boolean
  style?: ViewStyle
  containerStyle?: ViewStyle
  helperText?: string
  showStrengthIndicator?: boolean
  leftIcon?: React.ReactNode
}

/**
 * Enhanced password field component with visibility toggle and strength indicator
 */
const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  error,
  required = false,
  style,
  containerStyle,
  helperText,
  showStrengthIndicator = false,
  leftIcon,
  value = '',
  ...textInputProps
}) => {
  const themedStyles = useThemedStyles<typeof styles>(styles)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const passwordStrength = calculatePasswordStrength(value as string)

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
  }

  const rightIcon = (
    <TouchableOpacity
      onPress={togglePasswordVisibility}
      style={themedStyles.eyeIcon}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
        size={24}
        color={themedStyles.eyeIconColor.color}
      />
    </TouchableOpacity>
  )

  return (
    <View style={[themedStyles.container, containerStyle]}>
      <View style={themedStyles.labelContainer}>
        <CsText variant='body' style={themedStyles.label}>
          {label}
          {required && <CsText style={themedStyles.required}> *</CsText>}
        </CsText>
      </View>

      <CsTextField
        {...(({ returnKeyType, ...rest }) => rest)(textInputProps)}
        label={label}
        value={value}
        onChangeText={textInputProps.onChangeText || (() => {})}
        returnKeyType={
          textInputProps.returnKeyType === 'join'
            ? 'done'
            : ['default', 'go', 'next', 'search', 'send', 'done'].includes(
                  textInputProps.returnKeyType || ''
                )
              ? (textInputProps.returnKeyType as
                  | 'default'
                  | 'go'
                  | 'next'
                  | 'search'
                  | 'send'
                  | 'done')
              : 'default'
        }
        secureTextEntry={!isPasswordVisible}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        style={StyleSheet.flatten([
          themedStyles.input,
          error && themedStyles.inputError,
          style
        ])}
        error={error}
      />

      {showStrengthIndicator && value && (
        <PasswordStrengthIndicator strength={passwordStrength} />
      )}

      {error && (
        <CsText variant='caption' style={themedStyles.errorText}>
          {error}
        </CsText>
      )}

      {helperText && !error && (
        <CsText variant='caption' style={themedStyles.helperText}>
          {helperText}
        </CsText>
      )}
    </View>
  )
}

function styles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      marginBottom: spacing.md
    },
    labelContainer: {
      flexDirection: 'row',
      marginBottom: spacing.xs
    },
    label: {
      fontWeight: '600',
      color: theme.text
    },
    required: {
      color: theme.error,
      fontWeight: 'bold'
    },
    input: {
      // Base input styles handled by CsTextField
    },
    inputError: {
      borderColor: theme.error
    },
    eyeIcon: {
      padding: spacing.xs
    },
    eyeIconColor: {
      color: theme.textLight
    },
    errorText: {
      color: theme.error,
      marginTop: spacing.xs
    },
    helperText: {
      color: theme.textLight,
      marginTop: spacing.xs
    }
  })
}

export default PasswordField
