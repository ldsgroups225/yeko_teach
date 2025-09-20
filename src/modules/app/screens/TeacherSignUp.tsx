import CsButton from '@components/CsButton'
import CsText from '@components/CsText'
import FormField from '@components/FormField'
import PasswordField from '@components/PasswordField'
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { Ionicons } from '@expo/vector-icons'
import { showToast } from '@helpers/toast/showToast'
import { useTheme, useThemedStyles } from '@hooks/index'
import { useAuth } from '@hooks/useAuth'
import CsGoogleSignInButton from '@modules/app/components/CsGoogleSignInButton'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import { getAuthErrorMessage } from '@utils/authErrors'
import type { RootStackParams } from '@utils/Routes'
import Routes from '@utils/Routes'
import { sanitizeInput, signUpSchema, validateForm } from '@utils/validation'
import React, { useCallback, useState } from 'react'
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'

type TeacherSignUpNavigationProp = StackNavigationProp<RootStackParams>

function TeacherSignUp() {
  const navigation = useNavigation<TeacherSignUpNavigationProp>()
  const theme = useTheme()
  const themedStyles = useThemedStyles<typeof styles>(styles)
  const { loading, signUp } = useAuth()

  // Form state
  const [formData, setFormData] = useState({
    email: '',
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
    const validation = validateForm(signUpSchema, formData)

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

  // Handle form submission
  const handleSignUp = async () => {
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
      const result = await signUp(formData.email, formData.password)

      if (result && typeof result === 'object' && 'error' in result) {
        const errorMessage = getAuthErrorMessage(
          (result as { error: string }).error
        )
        showToast(errorMessage, ToastColorEnum.Error)
        return
      }

      // Success - navigate to email confirmation
      showToast(
        'Compte créé avec succès ! Vérifiez votre email.',
        ToastColorEnum.Success
      )
      navigation.navigate(Routes.EmailConfirmation, { email: formData.email })

      // Clear form
      setFormData({ email: '', password: '', confirmPassword: '' })
    } catch (error) {
      console.error('Sign up error:', error)
      const errorMessage = getAuthErrorMessage(error)
      showToast(errorMessage, ToastColorEnum.Error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle Google OAuth
  const handleGoogleAuthAttempt = useCallback((success: boolean) => {
    if (success) {
      showToast('Inscription avec Google réussie !', ToastColorEnum.Success)
    } else {
      showToast("Échec de l'inscription avec Google", ToastColorEnum.Error)
    }
  }, [])

  // Navigate to login
  const handleNavigateToLogin = useCallback(() => {
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
            Créer un compte
          </CsText>
          <CsText variant='body' style={themedStyles.subtitle}>
            Rejoignez la communauté Yeko et commencez à gérer vos cours.
          </CsText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(200).duration(1000).springify()}
          style={themedStyles.formContainer}
        >
          <FormField
            label='Adresse e-mail'
            value={formData.email}
            onChangeText={text => updateField('email', text)}
            keyboardType='email-address'
            autoCapitalize='none'
            autoComplete='email'
            textContentType='emailAddress'
            error={errors.email}
            required
            leftIcon={
              <Ionicons name='mail-outline' size={24} color={theme.textLight} />
            }
            placeholder='votre@email.com'
          />

          <PasswordField
            label='Mot de passe'
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
            placeholder='Votre mot de passe'
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
            placeholder='Confirmez votre mot de passe'
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).duration(1000).springify()}
        >
          <CsButton
            title={isSubmitting ? 'Création du compte...' : 'Créer mon compte'}
            onPress={handleSignUp}
            loading={isSubmitting || loading}
            disabled={isSubmitting || loading}
            style={themedStyles.signUpButton}
          />

          <View style={themedStyles.divider}>
            <View style={themedStyles.dividerLine} />
            <CsText variant='caption' style={themedStyles.dividerText}>
              ou
            </CsText>
            <View style={themedStyles.dividerLine} />
          </View>

          <CsGoogleSignInButton
            mode='signup'
            size='medium'
            onAuthAttempt={handleGoogleAuthAttempt}
            style={themedStyles.googleButton}
          />

          <View style={themedStyles.loginContainer}>
            <CsText variant='body' style={themedStyles.loginText}>
              Vous avez déjà un compte ?
            </CsText>
            <TouchableOpacity onPress={handleNavigateToLogin}>
              <CsText variant='body' style={themedStyles.loginLink}>
                Se connecter
              </CsText>
            </TouchableOpacity>
          </View>
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
      marginTop: 20,
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
      marginBottom: spacing.md,
      color: theme.textLight,
      lineHeight: 18
    },
    formContainer: {
      marginBottom: spacing.sm
    },
    signUpButton: {
      marginBottom: spacing.sm
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.lg
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border
    },
    dividerText: {
      marginHorizontal: spacing.md,
      color: theme.textLight
    },
    googleButton: {
      marginBottom: spacing.sm
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing.sm
    },
    loginText: {
      color: theme.textLight,
      marginRight: spacing.xs
    },
    loginLink: {
      color: theme.primary,
      fontWeight: 'bold'
    }
  })
}

export default TeacherSignUp
