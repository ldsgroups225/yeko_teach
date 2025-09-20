import CsButton from '@components/CsButton'
import CsText from '@components/CsText'
import FormField from '@components/FormField'
import PasswordField from '@components/PasswordField'
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { Ionicons } from '@expo/vector-icons'
import translate from '@helpers/localization'
import { showToast } from '@helpers/toast/showToast'
import { useTheme, useThemedStyles } from '@hooks/index'
import { useAuth } from '@hooks/useAuth'
import { useClearCache } from '@hooks/useClearCache'
import CsGoogleSignInButton from '@modules/app/components/CsGoogleSignInButton'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import { getAuthErrorMessage } from '@utils/authErrors'
import type { RootStackParams } from '@utils/Routes'
import Routes from '@utils/Routes'
import { loginSchema, sanitizeInput, validateForm } from '@utils/validation'
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
import { useDispatch } from 'react-redux'
import { setUser } from '../redux/appSlice'
import type { IUserDTO } from '../types/ILoginDTO'

type LoginNavigationProp = StackNavigationProp<RootStackParams>

export default function Login() {
  // Hooks
  const dispatch = useDispatch()
  const navigation = useNavigation<LoginNavigationProp>()
  const { login, loading, isProfileComplete } = useAuth()
  const { clearCache } = useClearCache({ showSuccesToast: false })
  const theme = useTheme()
  const themedStyles = useThemedStyles<typeof styles>(styles)

  // States
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [_showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Navigation Callbacks
  const goHomePage = useCallback(
    async (user: IUserDTO) => {
      showToast(translate('welcome'))
      dispatch(setUser(user))
      clearForm()

      // Check if profile is complete and navigate accordingly
      try {
        const profileComplete = await isProfileComplete(user.id)
        if (profileComplete) {
          navigation.navigate(Routes.Core)
        } else {
          navigation.navigate(Routes.CompleteTeacherProfile)
        }
      } catch {
        // console.error('Error checking profile completion:', error)
        // Default to Core if there's an error
        navigation.navigate(Routes.Core)
      }
    },
    [dispatch, isProfileComplete, navigation]
  )

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
    const validation = validateForm(loginSchema, formData)

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
  const handleLogin = async () => {
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
      const user = await login(formData.email, formData.password)
      if (!user) {
        showToast(translate('invalidCredentials'), ToastColorEnum.Error)
        return
      }

      await clearCache()
      goHomePage(user)
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage = getAuthErrorMessage(error)
      showToast(errorMessage, ToastColorEnum.Error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleAuthAttempt = useCallback((success: boolean) => {
    // The useGoogleAuth hook handles all the logic including:
    // - Role assignment (TEACHER)
    // - Profile completion check
    // - Navigation to CompleteTeacherProfile or Core
    // - User state management
    // - Error handling with toast notifications
    if (success) {
      // Success feedback is handled by the useGoogleAuth hook
      console.warn(
        'Google OAuth successful - navigation handled by useGoogleAuth hook'
      )
    } else {
      // Error feedback is handled by the useGoogleAuth hook
      console.warn(
        'Google OAuth failed - error handling done by useGoogleAuth hook'
      )
    }
  }, [])

  const handleForgotPassword = useCallback(() => {
    navigation.navigate(Routes.ForgotPassword)
  }, [navigation])

  const handleSignUp = useCallback(() => {
    navigation.navigate(Routes.TeacherSignUp)
  }, [navigation])

  // Helper Methods
  function clearForm() {
    setFormData({ email: '', password: '' })
    setShowPassword(false)
  }

  return (
    <KeyboardAvoidingView
      style={themedStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      {/* <AnimatedBackground /> */}
      <Image
        source={require('@assets/images/icon.png')}
        style={themedStyles.logo}
      />
      <ScrollView contentContainerStyle={themedStyles.scrollContent}>
        <Animated.View entering={FadeInDown.duration(1000).springify()}>
          <CsText variant='h3' style={themedStyles.textCenter}>
            Mon professeur,{' '}
          </CsText>
          <CsText variant='h1' style={themedStyles.title}>
            {translate('welcomeBack')}
          </CsText>
        </Animated.View>

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
              <Ionicons name='mail-outline' size={24} color={theme.textLight} />
            }
            placeholder='votre@email.com'
            style={themedStyles.input}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).duration(1000).springify()}
        >
          <PasswordField
            label={translate('password')}
            value={formData.password}
            onChangeText={text => updateField('password', text)}
            error={errors.password}
            required
            leftIcon={
              <Ionicons
                name='lock-closed-outline'
                size={24}
                color={theme.textLight}
              />
            }
            placeholder='Votre mot de passe'
            style={themedStyles.input}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(500).duration(1000).springify()}
        >
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={themedStyles.forgotPassword}
          >
            <CsText variant='caption'>{translate('forgotPassword')}</CsText>
          </TouchableOpacity>

          <CsButton
            title={isSubmitting ? 'Connexion...' : translate('login')}
            onPress={handleLogin}
            loading={isSubmitting || loading}
            disabled={isSubmitting || loading}
            style={themedStyles.button}
          />

          <View style={themedStyles.divider}>
            <View style={themedStyles.dividerLine} />
            <CsText variant='caption' style={themedStyles.dividerText}>
              {translate('or')}
            </CsText>
            <View style={themedStyles.dividerLine} />
          </View>

          <CsGoogleSignInButton
            mode='signin'
            size='medium'
            onAuthAttempt={handleGoogleAuthAttempt}
            style={themedStyles.button}
          />

          <View style={themedStyles.signUpContainer}>
            <CsText variant='body' style={themedStyles.signUpText}>
              Vous n'avez pas de compte?
            </CsText>
            <TouchableOpacity onPress={handleSignUp}>
              <CsText variant='body' style={themedStyles.signUpLink}>
                Créer un compte
              </CsText>
            </TouchableOpacity>
          </View>
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
      width: 150,
      height: 200,
      alignSelf: 'center',
      marginTop: 20,
      objectFit: 'contain'
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.sm
    },
    title: {
      marginBottom: spacing.sm,
      textAlign: 'center'
    },
    input: {
      marginBottom: spacing.sm
    },
    button: {
      marginVertical: spacing.sm
    },
    forgotPassword: {
      alignSelf: 'flex-end',
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
    textCenter: {
      textAlign: 'center'
    },
    signUpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center'
    },
    signUpText: {
      color: theme.textLight,
      marginRight: spacing.xs
    },
    signUpLink: {
      color: theme.primary,
      fontWeight: 'bold'
    }
  })
}
