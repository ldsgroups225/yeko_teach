import CsButton from '@components/CsButton'
import CsText from '@components/CsText'
import FormField from '@components/FormField'
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { Ionicons } from '@expo/vector-icons'
import translate from '@helpers/localization'
import { showToast } from '@helpers/toast/showToast'
import { useTheme, useThemedStyles } from '@hooks/index'
import { useAuth } from '@hooks/useAuth'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import { getAuthErrorMessage } from '@utils/authErrors'
import type { RootStackParams } from '@utils/Routes'
import Routes from '@utils/Routes'
import {
  forgotPasswordSchema,
  sanitizeInput,
  validateForm
} from '@utils/validation'
import React, { useCallback, useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity
} from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'

type ForgotPasswordNavigationProp = StackNavigationProp<RootStackParams>

export default function ForgotPassword() {
  // Hooks
  const navigation = useNavigation<ForgotPasswordNavigationProp>()
  const { sendPasswordResetEmail, loading } = useAuth()
  const theme = useTheme()
  const themedStyles = useThemedStyles<typeof styles>(styles)

  // States
  const [formData, setFormData] = useState({ email: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [emailSent, setEmailSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update form field
  const updateField = (field: keyof typeof formData, value: string) => {
    const sanitizedValue = sanitizeInput(value)
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }))

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Validate form
  const validateFormData = () => {
    const validation = validateForm(forgotPasswordSchema, formData)

    if (!validation.isValid) {
      const errorMap: Record<string, string> = {}
      validation.errors.forEach(error => {
        errorMap[error.field] = error.message
      })
      setErrors(errorMap)
      return false
    }

    setErrors({})
    return true
  }

  // Auth Callbacks
  const handleSendResetEmail = async () => {
    if (isSubmitting || loading) return

    // Validate form
    if (!validateFormData()) {
      showToast(
        'Veuillez corriger les erreurs dans le formulaire',
        ToastColorEnum.Error
      )
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await sendPasswordResetEmail(formData.email)
      if (error) {
        const errorMessage = getAuthErrorMessage(error)
        showToast(errorMessage, ToastColorEnum.Error)
        return
      }

      setEmailSent(true)
      showToast(
        'Email de réinitialisation envoyé avec succès',
        ToastColorEnum.Success
      )
    } catch (error: any) {
      console.error('Reset password error:', error)
      const errorMessage = getAuthErrorMessage(error)
      showToast(errorMessage, ToastColorEnum.Error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToLogin = useCallback(() => {
    navigation.navigate(Routes.Login)
  }, [navigation])

  const handleResendEmail = useCallback(() => {
    setEmailSent(false)
    setFormData({ email: '' })
    setErrors({})
  }, [])

  return (
    <KeyboardAvoidingView
      style={themedStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Image
        source={require('@assets/images/icon.png')}
        style={themedStyles.logo}
      />
      <ScrollView contentContainerStyle={themedStyles.scrollContent}>
        <Animated.View entering={FadeInDown.duration(1000).springify()}>
          <CsText variant='h3' style={themedStyles.textCenter}>
            Mot de passe oublié
          </CsText>
          <CsText variant='body' style={themedStyles.subtitle}>
            {emailSent
              ? 'Un email de réinitialisation a été envoyé à votre adresse email.'
              : 'Entrez votre adresse email pour recevoir un lien de réinitialisation de mot de passe.'}
          </CsText>
        </Animated.View>

        {!emailSent ? (
          <Animated.View
            entering={FadeInUp.delay(300).duration(1000).springify()}
          >
            <FormField
              label={translate('email')}
              value={formData.email}
              onChangeText={text => updateField('email', text)}
              keyboardType='email-address'
              autoCapitalize='none'
              autoComplete='email'
              textContentType='emailAddress'
              error={errors.email}
              required
              leftIcon={
                <Ionicons
                  name='mail-outline'
                  size={24}
                  color={theme.textLight}
                />
              }
              placeholder='votre@email.com'
              style={themedStyles.input}
            />

            <CsButton
              title={
                isSubmitting
                  ? 'Envoi en cours...'
                  : "Envoyer l'email de réinitialisation"
              }
              onPress={handleSendResetEmail}
              style={themedStyles.button}
              loading={isSubmitting || loading}
              disabled={isSubmitting || loading}
            />
          </Animated.View>
        ) : (
          <Animated.View
            entering={FadeInUp.delay(300).duration(1000).springify()}
          >
            <CsButton
              title="Renvoyer l'email"
              onPress={handleResendEmail}
              style={themedStyles.button}
              variant='secondary'
            />
          </Animated.View>
        )}

        <Animated.View
          entering={FadeInUp.delay(400).duration(1000).springify()}
        >
          <TouchableOpacity
            onPress={handleBackToLogin}
            style={themedStyles.backToLogin}
          >
            <Ionicons name='arrow-back' size={20} color={theme.primary} />
            <CsText variant='body' style={themedStyles.backToLoginText}>
              Retour à la connexion
            </CsText>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// Styles
function styles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    logo: {
      width: 120,
      height: 160,
      alignSelf: 'center',
      marginTop: 40,
      objectFit: 'contain'
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.sm
    },
    textCenter: {
      textAlign: 'center',
      marginBottom: spacing.md
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: spacing.xl,
      color: theme.textLight,
      lineHeight: 22
    },
    input: {
      marginBottom: spacing.lg
    },
    button: {
      marginVertical: spacing.md
    },
    backToLogin: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.lg
    },
    backToLoginText: {
      color: theme.primary,
      marginLeft: spacing.xs,
      fontWeight: '500'
    }
  })
}
