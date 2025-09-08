// src/modules/app/screens/ResetPassword.tsx

import CsButton from '@components/CsButton'
import CsText from '@components/CsText'
import PasswordField from '@components/PasswordField'
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { Ionicons } from '@expo/vector-icons'
import { showToast } from '@helpers/toast/showToast'
import { useTheme, useThemedStyles } from '@hooks/index'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { supabase } from '@src/lib/supabase/config'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import type { RootStackParams } from '@utils/Routes'
import Routes from '@utils/Routes'
import {
  resetPasswordSchema,
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

type ResetPasswordNavigationProp = StackNavigationProp<RootStackParams>

export default function ResetPassword() {
  // Hooks
  const navigation = useNavigation<ResetPasswordNavigationProp>()
  const route = useRoute()
  const theme = useTheme()
  const themedStyles = useThemedStyles<typeof styles>(styles)

  // Get access token from route params (from deep link)
  const { accessToken } = (route.params as { accessToken?: string }) || {}

  // States
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
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
    const validation = validateForm(resetPasswordSchema, formData)

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

  // Handle password reset
  const handleResetPassword = async () => {
    if (isSubmitting) return

    // Check if we have access token
    if (!accessToken) {
      showToast('Lien de réinitialisation invalide', ToastColorEnum.Error)
      navigation.navigate(Routes.ForgotPassword)
      return
    }

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
      // Set the session with the access token
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: '' // Not needed for password reset
      })

      if (sessionError) {
        showToast(
          'Lien de réinitialisation invalide ou expiré',
          ToastColorEnum.Error
        )
        navigation.navigate(Routes.ForgotPassword)
        return
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.password
      })

      if (updateError) {
        let errorMessage = 'Erreur lors de la réinitialisation du mot de passe'
        if (updateError.message?.includes('Password should be at least')) {
          errorMessage = 'Le mot de passe doit contenir au moins 6 caractères'
        }
        showToast(errorMessage, ToastColorEnum.Error)
        return
      }

      // Success
      showToast(
        'Mot de passe réinitialisé avec succès !',
        ToastColorEnum.Success
      )

      // Sign out to force fresh login
      await supabase.auth.signOut()

      // Navigate to login
      navigation.navigate(Routes.Login)
    } catch (error: any) {
      console.error('Reset password error:', error)
      showToast(
        'Une erreur est survenue lors de la réinitialisation',
        ToastColorEnum.Error
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Navigate back to login
  const handleBackToLogin = useCallback(() => {
    navigation.navigate(Routes.Login)
  }, [navigation])

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

      <ScrollView
        contentContainerStyle={themedStyles.scrollContent}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(1000).springify()}>
          <CsText variant='h2' style={themedStyles.title}>
            Nouveau mot de passe
          </CsText>
          <CsText variant='body' style={themedStyles.subtitle}>
            Choisissez un nouveau mot de passe sécurisé pour votre compte.
          </CsText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(1000).springify()}
          style={themedStyles.formContainer}
        >
          <PasswordField
            label='Nouveau mot de passe'
            value={formData.password}
            onChangeText={text => updateField('password', text)}
            error={errors.password}
            required
            showStrengthIndicator
            leftIcon={
              <Ionicons
                name='lock-closed-outline'
                size={24}
                color={theme.textLight}
              />
            }
            placeholder='Votre nouveau mot de passe'
            helperText='Au moins 8 caractères avec majuscules, minuscules, chiffres et caractères spéciaux'
          />

          <PasswordField
            label='Confirmer le mot de passe'
            value={formData.confirmPassword}
            onChangeText={text => updateField('confirmPassword', text)}
            error={errors.confirmPassword}
            required
            leftIcon={
              <Ionicons
                name='lock-closed-outline'
                size={24}
                color={theme.textLight}
              />
            }
            placeholder='Confirmez votre nouveau mot de passe'
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).duration(1000).springify()}
        >
          <CsButton
            title={
              isSubmitting
                ? 'Réinitialisation...'
                : 'Réinitialiser le mot de passe'
            }
            onPress={handleResetPassword}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={themedStyles.resetButton}
          />

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
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl
    },
    title: {
      textAlign: 'center',
      marginBottom: spacing.sm,
      color: theme.text
    },
    subtitle: {
      textAlign: 'center',
      marginBottom: spacing.xl,
      color: theme.textLight,
      lineHeight: 22
    },
    formContainer: {
      marginBottom: spacing.lg
    },
    resetButton: {
      marginBottom: spacing.lg
    },
    backToLogin: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md
    },
    backToLoginText: {
      color: theme.primary,
      marginLeft: spacing.xs,
      fontWeight: '500'
    }
  })
}
