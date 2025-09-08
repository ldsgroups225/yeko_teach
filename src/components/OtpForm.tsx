// src/components/OtpForm.tsx

import CsButton from '@components/CsButton'
import CsText from '@components/CsText'
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { showToast } from '@helpers/toast/showToast'
import { useThemedStyles } from '@hooks/index'
import { borderRadius, spacing } from '@styles/index'
import type { ITheme } from '@styles/theme'
import type React from 'react'
import { useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { OtpInput } from 'react-native-otp-entry'

interface OtpFormProps {
  /** Callback function to be called when a valid OTP is submitted */
  onComplete: (code: string) => void
  /** Optional callback function to be called when the user cancels the OTP input */
  onCancel?: () => void
  /** Indicates whether the form is in a loading state */
  loading?: boolean
  /** Indicates whether the cancel button should be shown */
}

/**
 * OtpForm component for inputting and submitting a 6-digit OTP code.
 *
 * @param {OtpFormProps} props - The props for the OtpForm component
 * @returns {React.ReactElement} The rendered OtpForm component
 */
export const OtpForm: React.FC<OtpFormProps> = ({
  onComplete,
  onCancel,
  loading = false
}) => {
  const themedStyles = useThemedStyles<typeof styles>(styles)
  const [otpValue, setOtpValue] = useState('')

  /**
   * Handles the submission of the OTP code
   */
  const handleOtpSubmit = useCallback(
    (otp?: string) => {
      if (otp) {
        if (otp.length === 6) {
          onComplete(otp)
        } else {
          showToast('Veillez entrer un OTP valide à 6 chiffres')
        }
      } else {
        if (otpValue.length === 6) {
          onComplete(otpValue)
        } else {
          showToast('Veillez entrer un OTP valide', ToastColorEnum.Warning)
        }
      }
    },
    [otpValue, onComplete]
  )

  return (
    <View style={themedStyles.container}>
      <CsText style={themedStyles.otpTitle}>Entrez le code OTP</CsText>
      <OtpInput
        numberOfDigits={6}
        onTextChange={setOtpValue}
        onFilled={val => handleOtpSubmit(val)}
        theme={{
          containerStyle: themedStyles.otpInputContainer,
          pinCodeContainerStyle: themedStyles.otpInputField,
          pinCodeTextStyle: themedStyles.otpInputText,
          focusStickStyle: themedStyles.otpFocusStick,
          focusedPinCodeContainerStyle: themedStyles.otpInputFieldFocused
        }}
        disabled={loading}
      />
      <CsButton
        title="Joindre l'école"
        onPress={handleOtpSubmit}
        style={themedStyles.otpSubmitButton}
        disabled={loading || otpValue.length !== 6}
        loading={loading}
      />
      <CsText variant='caption' style={themedStyles.otpInfo}>
        Ce code vous a été fourni par l'administrateur de l'école.
      </CsText>
      {onCancel && (
        <CsButton
          title='Cancel'
          onPress={onCancel}
          style={themedStyles.cancelButton}
          disabled={loading}
        />
      )}
    </View>
  )
}

function styles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center'
    },
    otpTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: spacing.md,
      color: theme.text
    },
    otpInputContainer: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md
    },
    otpInputField: {
      width: 45,
      height: 45,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.small,
      justifyContent: 'center',
      alignItems: 'center'
    },
    otpInputFieldFocused: {
      borderColor: theme.primary
    },
    otpInputText: {
      fontSize: 24,
      color: theme.text
    },
    otpFocusStick: {
      backgroundColor: theme.primary,
      height: 2
    },
    otpSubmitButton: {
      marginTop: spacing.md,
      width: '100%'
    },
    cancelButton: {
      marginTop: spacing.md,
      width: '100%',
      backgroundColor: theme.error
    },
    otpInfo: {
      marginTop: spacing.md,
      textAlign: 'center',
      color: theme.textLight
    }
  })
}
