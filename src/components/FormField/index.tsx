// src/components/FormField/index.tsx

import CsText from '@components/CsText'
import CsTextField from '@components/CsTextField'
import { useThemedStyles } from '@hooks/index'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import type React from 'react'
import type { TextInputProps, ViewStyle } from 'react-native'
import { StyleSheet, View } from 'react-native'

interface FormFieldProps extends Omit<TextInputProps, 'style'> {
  label: string
  error?: string
  required?: boolean
  style?: ViewStyle
  containerStyle?: ViewStyle
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

/**
 * Enhanced form field component with validation support
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required = false,
  style,
  containerStyle,
  helperText,
  leftIcon,
  rightIcon,
  ...textInputProps
}) => {
  const themedStyles = useThemedStyles<typeof styles>(styles)

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
        value={textInputProps.value || ''}
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
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        style={StyleSheet.flatten([
          themedStyles.input,
          error && themedStyles.inputError,
          style
        ])}
        error={error}
      />

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

export default FormField
