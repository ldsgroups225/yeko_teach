// src/modules/profile/screens/ProfileScreen.tsx

import CsButton from '@components/CsButton'
import { OtpForm } from '@components/OtpForm'
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { showToast } from '@helpers/toast/showToast'
import { useThemedStyles } from '@hooks/index'
import { useAuth } from '@hooks/useAuth'
import { useClearCache } from '@hooks/useClearCache'
import { useSchoolJoin } from '@hooks/useSchoolJoin'
import { loggedOut } from '@modules/app/redux/appSlice'
import { useAppSelector } from '@src/store'
import { spacing } from '@styles/index'
import type { ITheme } from '@styles/theme'
import type React from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Modal, ScrollView, StyleSheet, View } from 'react-native'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'
import { useDispatch } from 'react-redux'
import { ClearCacheSection, ProfileHeader, ProfileSection } from '../components'

const PROFILE_UPDATE_DELAY = 300

const $black = '#000'
const $black50 = '#00000050'

const ProfileScreen: React.FC = () => {
  const themedStyles = useThemedStyles<typeof createStyles>(createStyles)
  const user = useAppSelector(state => state?.AppReducer?.user)
  const {
    joinSchool,
    loading: isJoiningSchool,
    error: joinSchoolError
  } = useSchoolJoin(user?.id || '')

  const dispatch = useDispatch()
  const { logout, loading: isLoggingOut } = useAuth()
  const { clearCache, isClearing } = useClearCache()

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [showOtpForm, setShowOtpForm] = useState(false)

  // Create a shared value for the fade animation.
  const fade = useSharedValue(0)

  // Define an animated style that drives the opacity based on the shared value.
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fade.value
  }))

  useEffect(() => {
    if (joinSchoolError) {
      showToast(joinSchoolError, ToastColorEnum.Error)
    }
  }, [joinSchoolError])

  const handleLogout = useCallback(async () => {
    try {
      const response = await logout()
      if (response) {
        dispatch(loggedOut())
        await clearCache()
      }
    } catch {
      showToast('Un problème rencontré lors de la déconnexion, réessayer')
    }
  }, [dispatch, logout, clearCache])

  const handleUpdateProfile = useCallback(async () => {
    setIsUpdatingProfile(true)
    // TODO: Implement profile update logic
    setTimeout(() => {
      setIsUpdatingProfile(false)
      showToast('Sera disponible très bientôt', ToastColorEnum.Warning)
    }, PROFILE_UPDATE_DELAY)
  }, [])

  const handleJoinNewSchool = useCallback(() => {
    setShowOtpForm(true)
    // Fade in the OTP form.
    fade.value = withTiming(1, { duration: 300 })
  }, [fade])

  const handleOtpComplete = useCallback(
    async (code: string) => {
      const joined = await joinSchool(code)
      if (joined) {
        await clearCache()
        // Fade out the OTP form then hide it.
        fade.value = withTiming(0, { duration: 300 }, () => {
          runOnJS(setShowOtpForm)(false)
        })
      }
    },
    [fade, joinSchool, clearCache]
  )

  const handleOtpCancel = useCallback(() => {
    // Fade out the OTP form then hide it.
    fade.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(setShowOtpForm)(false)
    })
  }, [fade])

  if (!user) return null

  return (
    <ScrollView style={themedStyles.container}>
      <ProfileHeader user={user} />

      <ProfileSection
        title='Mettre à jour le profil'
        onPress={handleUpdateProfile}
        disabled={isUpdatingProfile || showOtpForm || isJoiningSchool}
        loading={isUpdatingProfile}
        infoText='ℹ️ Modifier votre nom et photo'
      />

      <ProfileSection
        title='Joindre une nouvelle école'
        onPress={handleJoinNewSchool}
        disabled={showOtpForm || isJoiningSchool}
        infoText='Entrez le code OTP pour lier votre profil à une nouvelle école'
      />

      <Modal
        animationType='slide'
        transparent
        visible={showOtpForm}
        onRequestClose={() => setShowOtpForm(false)}
      >
        <View style={themedStyles.centeredView}>
          {/* Use Animated.View with the fadeStyle for the fade animation */}
          <Animated.View style={[themedStyles.modalView, fadeStyle]}>
            <OtpForm
              onComplete={handleOtpComplete}
              onCancel={handleOtpCancel}
              loading={isJoiningSchool}
            />
          </Animated.View>
        </View>
      </Modal>

      <ClearCacheSection
        onPress={clearCache}
        disabled={isClearing || showOtpForm || isJoiningSchool}
        loading={isClearing}
      />

      <CsButton
        title='Déconnexion'
        onPress={handleLogout}
        disabled={isLoggingOut || showOtpForm || isJoiningSchool}
        loading={isLoggingOut}
        style={themedStyles.logoutButton}
      />
    </ScrollView>
  )
}

function createStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: $black50
    },
    modalView: {
      margin: 20,
      backgroundColor: theme.background,
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: $black,
      shadowOffset: {
        width: 0,
        height: 2
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width: '90%'
    },
    otpFormContainer: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border
    },
    logoutButton: {
      margin: spacing.lg,
      backgroundColor: theme.error
    }
  })
}

export default ProfileScreen
