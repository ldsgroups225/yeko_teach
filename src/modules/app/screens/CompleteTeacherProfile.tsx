import CsButton from '@components/CsButton'
import CsText from '@components/CsText'
import FormField from '@components/FormField'
import { OtpForm } from '@components/OtpForm'
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { Ionicons } from '@expo/vector-icons'
import { showToast } from '@helpers/toast/showToast'
import { useTheme, useThemedStyles } from '@hooks/index'
import { useAuth } from '@hooks/useAuth'
import { setUser } from '@modules/app/redux/appSlice'
import type { ISchool } from '@modules/app/services/schoolService'
import { schoolService } from '@modules/app/services/schoolService'
import { Picker } from '@react-native-picker/picker'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useAppSelector } from '@src/store'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import type { RootStackParams } from '@utils/Routes'
import Routes from '@utils/Routes'
import {
  completeProfileSchema,
  sanitizeInput,
  validateForm
} from '@utils/validation'
import React, { useCallback, useEffect, useState } from 'react'
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { useDispatch } from 'react-redux'

type CompleteTeacherProfileNavigationProp = StackNavigationProp<RootStackParams>

interface ProfileStep {
  id: 'basic' | 'school'
  title: string
  subtitle: string
}

const PROFILE_STEPS: ProfileStep[] = [
  {
    id: 'basic',
    title: 'Informations personnelles',
    subtitle: 'Complétez vos informations de base'
  },
  {
    id: 'school',
    title: 'École',
    subtitle: 'Rejoignez votre établissement scolaire'
  }
]

function CompleteTeacherProfile() {
  const navigation = useNavigation<CompleteTeacherProfileNavigationProp>()
  const dispatch = useDispatch()
  const theme = useTheme()
  const themedStyles = useThemedStyles<typeof styles>(styles)
  const { loading, updateUserProfile } = useAuth()
  const user = useAppSelector(state => state.AppReducer?.user)

  // Form state
  const [currentStep, setCurrentStep] = useState<'basic' | 'school'>('basic')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // School state
  const [schools, setSchools] = useState<ISchool[]>([])
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('')
  const [schoolJoinMethod, setSchoolJoinMethod] = useState<'select' | 'otp'>(
    'select'
  )
  const [isLoadingSchools, setIsLoadingSchools] = useState(false)
  const [isJoiningSchool, setIsJoiningSchool] = useState(false)

  // Prevent going back
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      e.preventDefault()
      Alert.alert(
        'Profil incomplet',
        'Veuillez compléter votre profil pour continuer.',
        [{ text: 'Continuer', style: 'cancel' }]
      )
    })

    return unsubscribe
  }, [navigation])

  const loadSchools = async () => {
    setIsLoadingSchools(true)
    try {
      const { data, error } = await schoolService.getSchools()
      if (error) {
        console.error('Error loading schools:', error)
        showToast('Erreur lors du chargement des écoles', ToastColorEnum.Error)
        return
      }
      setSchools(data || [])
    } catch (error) {
      console.error('Error loading schools:', error)
      showToast('Erreur lors du chargement des écoles', ToastColorEnum.Error)
    } finally {
      setIsLoadingSchools(false)
    }
  }

  // Load schools
  useEffect(() => {
    loadSchools()
  }, [loadSchools])

  // Update form field
  const updateField = (field: keyof typeof formData, value: string) => {
    const sanitizedValue = sanitizeInput(value)
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }))

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Validate basic info form
  const validateBasicInfo = () => {
    const validation = validateForm(completeProfileSchema, formData)

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

  // Handle basic info completion
  const handleCompleteBasicInfo = async () => {
    if (isSubmitting || loading) return

    // Validate form
    if (!validateBasicInfo()) {
      showToast(
        'Veuillez corriger les erreurs dans le formulaire',
        ToastColorEnum.Error
      )
      return
    }

    if (!user) {
      showToast('Aucun utilisateur connecté', ToastColorEnum.Error)
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await updateUserProfile(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      })

      if (error) {
        showToast(
          error.message || 'Erreur lors de la mise à jour du profil',
          ToastColorEnum.Error
        )
        return
      }

      // Update Redux state
      const updatedUser = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      }
      dispatch(setUser(updatedUser))

      // Move to school step
      setCurrentStep('school')
      showToast(
        'Informations personnelles sauvegardées',
        ToastColorEnum.Success
      )
    } catch (error: any) {
      console.error('Error updating profile:', error)
      showToast(
        'Une erreur est survenue lors de la mise à jour du profil',
        ToastColorEnum.Error
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle school selection
  const handleJoinSchoolBySelection = async () => {
    if (!selectedSchoolId) {
      showToast('Veuillez sélectionner une école', ToastColorEnum.Warning)
      return
    }

    if (!user) {
      showToast('Aucun utilisateur connecté', ToastColorEnum.Error)
      return
    }

    setIsJoiningSchool(true)

    try {
      const { data: _data, error } = await schoolService.requestToJoinSchool(
        user.id,
        selectedSchoolId
      )

      if (error) {
        showToast(
          error.message || "Erreur lors de la demande d'adhésion",
          ToastColorEnum.Error
        )
        return
      }

      showToast(
        "Demande d'adhésion envoyée avec succès",
        ToastColorEnum.Success
      )
      navigation.navigate(Routes.Core as never)
    } catch (error: any) {
      console.error('Error joining school:', error)
      showToast(
        "Une erreur est survenue lors de la demande d'adhésion",
        ToastColorEnum.Error
      )
    } finally {
      setIsJoiningSchool(false)
    }
  }

  // Handle OTP school join
  const handleJoinSchoolWithOTP = async (otpCode: string) => {
    if (!user) {
      showToast('Aucun utilisateur connecté', ToastColorEnum.Error)
      return
    }

    setIsJoiningSchool(true)

    try {
      const { data: _data, error } = await schoolService.joinSchoolWithOTP(
        user.id,
        otpCode
      )

      if (error) {
        let errorMessage = 'Code OTP invalide ou expiré'
        if (error.code === 'ALREADY_LINKED') {
          errorMessage = 'Vous êtes déjà lié à cette école'
        } else if (error.code === 'EXPIRED_OTP') {
          errorMessage = 'Code OTP expiré'
        }
        showToast(errorMessage, ToastColorEnum.Error)
        return
      }

      showToast('École rejointe avec succès !', ToastColorEnum.Success)
      navigation.navigate(Routes.Core as never)
    } catch (error: any) {
      console.error('Error joining school with OTP:', error)
      showToast(
        "Une erreur est survenue lors de l'adhésion",
        ToastColorEnum.Error
      )
    } finally {
      setIsJoiningSchool(false)
    }
  }

  // Skip school selection
  const handleSkipSchool = useCallback(() => {
    Alert.alert(
      "Ignorer l'école",
      'Vous pourrez rejoindre une école plus tard depuis votre profil.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Continuer',
          onPress: () => navigation.navigate(Routes.Core as never)
        }
      ]
    )
  }, [navigation])

  const currentStepData = PROFILE_STEPS.find(step => step.id === currentStep)

  return (
    <KeyboardAvoidingView
      style={themedStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={themedStyles.scrollContent}
        keyboardShouldPersistTaps='handled'
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(1000).springify()}>
          <View style={themedStyles.header}>
            <View style={themedStyles.stepIndicator}>
              <View
                style={[
                  themedStyles.stepDot,
                  currentStep === 'basic'
                    ? themedStyles.stepDotActive
                    : themedStyles.stepDotCompleted
                ]}
              />
              <View style={themedStyles.stepLine} />
              <View
                style={[
                  themedStyles.stepDot,
                  currentStep === 'school'
                    ? themedStyles.stepDotActive
                    : themedStyles.stepDotInactive
                ]}
              />
            </View>

            <CsText variant='h2' style={themedStyles.title}>
              {currentStepData?.title}
            </CsText>
            <CsText variant='body' style={themedStyles.subtitle}>
              {currentStepData?.subtitle}
            </CsText>
          </View>
        </Animated.View>

        {currentStep === 'basic' && (
          <Animated.View
            entering={FadeInUp.delay(200).duration(1000).springify()}
            style={themedStyles.formContainer}
          >
            <FormField
              label='Prénom'
              value={formData.firstName}
              onChangeText={text => updateField('firstName', text)}
              error={errors.firstName}
              required
              leftIcon={
                <Ionicons
                  name='person-outline'
                  size={24}
                  color={theme.textLight}
                />
              }
              placeholder='Votre prénom'
            />

            <FormField
              label='Nom de famille'
              value={formData.lastName}
              onChangeText={text => updateField('lastName', text)}
              error={errors.lastName}
              required
              leftIcon={
                <Ionicons
                  name='person-outline'
                  size={24}
                  color={theme.textLight}
                />
              }
              placeholder='Votre nom de famille'
            />

            <FormField
              label='Numéro de téléphone'
              value={formData.phone}
              onChangeText={text => updateField('phone', text)}
              keyboardType='phone-pad'
              error={errors.phone}
              required
              leftIcon={
                <Ionicons
                  name='call-outline'
                  size={24}
                  color={theme.textLight}
                />
              }
              placeholder='+33 6 12 34 56 78'
              helperText='Format international recommandé'
            />

            <CsButton
              title={isSubmitting ? 'Sauvegarde...' : 'Continuer'}
              onPress={handleCompleteBasicInfo}
              loading={isSubmitting || loading}
              disabled={isSubmitting || loading}
              style={themedStyles.button}
            />
          </Animated.View>
        )}

        {currentStep === 'school' && (
          <Animated.View
            entering={FadeInUp.delay(200).duration(1000).springify()}
            style={themedStyles.formContainer}
          >
            <View style={themedStyles.schoolMethodContainer}>
              <TouchableOpacity
                style={[
                  themedStyles.methodButton,
                  schoolJoinMethod === 'select' &&
                    themedStyles.methodButtonActive
                ]}
                onPress={() => setSchoolJoinMethod('select')}
              >
                <Ionicons
                  name='school-outline'
                  size={24}
                  color={
                    schoolJoinMethod === 'select'
                      ? theme.primary
                      : theme.textLight
                  }
                />
                <CsText
                  variant='body'
                  style={StyleSheet.flatten([
                    themedStyles.methodButtonText,
                    schoolJoinMethod === 'select'
                      ? themedStyles.methodButtonTextActive
                      : null
                  ])}
                >
                  Sélectionner une école
                </CsText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  themedStyles.methodButton,
                  schoolJoinMethod === 'otp' && themedStyles.methodButtonActive
                ]}
                onPress={() => setSchoolJoinMethod('otp')}
              >
                <Ionicons
                  name='key-outline'
                  size={24}
                  color={
                    schoolJoinMethod === 'otp' ? theme.primary : theme.textLight
                  }
                />
                <CsText
                  variant='body'
                  style={StyleSheet.flatten([
                    themedStyles.methodButtonText,
                    schoolJoinMethod === 'otp'
                      ? themedStyles.methodButtonTextActive
                      : null
                  ])}
                >
                  Code OTP
                </CsText>
              </TouchableOpacity>
            </View>

            {schoolJoinMethod === 'select' && (
              <View style={themedStyles.schoolSelectContainer}>
                <CsText variant='body' style={themedStyles.pickerLabel}>
                  École *
                </CsText>
                <View style={themedStyles.pickerContainer}>
                  <Picker
                    selectedValue={selectedSchoolId}
                    onValueChange={setSelectedSchoolId}
                    style={themedStyles.picker}
                    enabled={!isLoadingSchools}
                  >
                    <Picker.Item
                      label={
                        isLoadingSchools
                          ? 'Chargement...'
                          : 'Sélectionnez votre école'
                      }
                      value=''
                    />
                    {schools.map(school => (
                      <Picker.Item
                        key={school.id}
                        label={school.name}
                        value={school.id}
                      />
                    ))}
                  </Picker>
                </View>

                <CsButton
                  title={
                    isJoiningSchool
                      ? 'Envoi de la demande...'
                      : 'Envoyer la demande'
                  }
                  onPress={handleJoinSchoolBySelection}
                  loading={isJoiningSchool}
                  disabled={isJoiningSchool || !selectedSchoolId}
                  style={themedStyles.button}
                />
              </View>
            )}

            {schoolJoinMethod === 'otp' && (
              <View style={themedStyles.otpContainer}>
                <OtpForm
                  onComplete={handleJoinSchoolWithOTP}
                  loading={isJoiningSchool}
                />
              </View>
            )}

            <TouchableOpacity
              onPress={handleSkipSchool}
              style={themedStyles.skipButton}
            >
              <CsText variant='body' style={themedStyles.skipButtonText}>
                Ignorer pour le moment
              </CsText>
            </TouchableOpacity>
          </Animated.View>
        )}
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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.xl
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xl
    },
    stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.lg
    },
    stepDot: {
      width: 12,
      height: 12,
      borderRadius: 6
    },
    stepDotActive: {
      backgroundColor: theme.primary
    },
    stepDotCompleted: {
      backgroundColor: theme.success
    },
    stepDotInactive: {
      backgroundColor: theme.border
    },
    stepLine: {
      width: 40,
      height: 2,
      backgroundColor: theme.border,
      marginHorizontal: spacing.sm
    },
    title: {
      textAlign: 'center',
      marginBottom: spacing.sm,
      color: theme.text
    },
    subtitle: {
      textAlign: 'center',
      color: theme.textLight,
      lineHeight: 22
    },
    formContainer: {
      flex: 1
    },
    button: {
      marginTop: spacing.lg
    },
    schoolMethodContainer: {
      flexDirection: 'row',
      marginBottom: spacing.lg,
      gap: spacing.sm
    },
    methodButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.card
    },
    methodButtonActive: {
      borderColor: theme.primary,
      backgroundColor: `${theme.primary}10`
    },
    methodButtonText: {
      marginLeft: spacing.sm,
      color: theme.textLight
    },
    methodButtonTextActive: {
      color: theme.primary,
      fontWeight: '600'
    },
    schoolSelectContainer: {
      marginBottom: spacing.lg
    },
    pickerLabel: {
      fontWeight: '600',
      color: theme.text,
      marginBottom: spacing.xs
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      backgroundColor: theme.card,
      marginBottom: spacing.md
    },
    picker: {
      height: 50
    },
    otpContainer: {
      alignItems: 'center',
      marginBottom: spacing.lg
    },
    skipButton: {
      alignItems: 'center',
      padding: spacing.md
    },
    skipButtonText: {
      color: theme.textLight,
      textDecorationLine: 'underline'
    }
  })
}

export default CompleteTeacherProfile
