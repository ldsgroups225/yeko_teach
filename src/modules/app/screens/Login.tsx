import type { ITheme } from '@styles/theme'
import type { IUserDTO } from '../types/ILoginDTO'
// Components
import CsButton from '@components/CsButton'
import CsText from '@components/CsText'
import CsTextField from '@components/CsTextField'

import { Ionicons } from '@expo/vector-icons'
// Helpers
import translate from '@helpers/localization'

import { showToast } from '@helpers/toast/showToast'
// Hooks
import { useTheme, useThemedStyles } from '@hooks/index'
import { useAuth } from '@hooks/useAuth'

import { useClearCache } from '@hooks/useClearCache'
// Utils

// Styles
import { spacing } from '@styles/spacing'

/**
 * @author Ali Burhan Keskin <alikeskin@milvasoft.com>
 */
import React, { useCallback, useState } from 'react'

import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { useDispatch } from 'react-redux'
// Redux
import { setUser } from '../redux/appSlice'

export default function Login() {
  // Hooks
  const dispatch = useDispatch()
  const { login, loading } = useAuth()
  const { clearCache } = useClearCache({ showSuccesToast: false })
  const theme = useTheme()
  const themedStyles = useThemedStyles<typeof styles>(styles)

  // States
  const [email, setEmail] = useState('kassidarius@gmail.com')
  const [password, setPassword] = useState('Aazzeerrtt88')
  const [showPassword, setShowPassword] = useState(false)

  // Navigation Callbacks
  const goHomePage = useCallback(
    (user: IUserDTO) => {
      showToast(translate('welcome'))
      dispatch(setUser(user))
      clearForm()
    },
    [login],
  )

  // Auth Callbacks
  const handleLogin = async () => {
    try {
      if (email === '' || password === '')
        return

      const user = await login(email, password)
      if (!user)
        return showToast(translate('invalidCredentials'))

      await clearCache()
      goHomePage(user)
    }
    catch (error) {
      showToast(error.message)
    }
  }

  const handleGoogleLogin = useCallback(() => {
    // TODO: Implement Google OAuth login
    showToast(translate('googleLoginNotImplemented'))
  }, [translate])

  const handleForgotPassword = useCallback(() => {
    // TODO: Navigate to forgot password screen
    showToast(translate('forgotPasswordNotImplemented'))
  }, [translate])

  // Helper Methods
  function clearForm() {
    setEmail('')
    setPassword('')
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
          <CsText variant="h3" style={themedStyles.textCenter}>
            Mon professeur,
            {' '}
          </CsText>
          <CsText variant="h1" style={themedStyles.title}>
            {translate('welcomeBack')}
          </CsText>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(300).duration(1000).springify()}
        >
          <CsTextField
            label={translate('email')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={
              <Ionicons name="mail-outline" size={24} color={theme.text} />
            }
            style={themedStyles.input}
          />
        </Animated.View>

        <Animated.View
          entering={FadeInUp.delay(400).duration(1000).springify()}
        >
          <CsTextField
            label={translate('password')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={(
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={theme.text}
              />
            )}
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
            <CsText variant="caption">{translate('forgotPassword')}</CsText>
          </TouchableOpacity>

          <CsButton
            title={translate('login')}
            onPress={handleLogin}
            style={themedStyles.button}
            loading={loading}
          />

          <View style={themedStyles.divider}>
            <View style={themedStyles.dividerLine} />
            <CsText variant="caption" style={themedStyles.dividerText}>
              {translate('or')}
            </CsText>
            <View style={themedStyles.dividerLine} />
          </View>

          <CsButton
            title={translate('loginWithGoogle')}
            onPress={handleGoogleLogin}
            variant="secondary"
            icon={
              <Ionicons name="logo-google" size={24} color={theme.primary} />
            }
            style={themedStyles.button}
          />
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
      backgroundColor: theme.background,
    },
    logo: {
      width: 150,
      height: 200,
      alignSelf: 'center',
      marginTop: 30,
      objectFit: 'contain',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: spacing.sm,
    },
    title: {
      marginBottom: spacing.xxl,
      textAlign: 'center',
    },
    input: {
      marginBottom: spacing.lg,
    },
    button: {
      marginVertical: spacing.md,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: spacing.md,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.border,
    },
    dividerText: {
      marginHorizontal: spacing.md,
      color: theme.textLight,
    },
    textCenter: {
      textAlign: 'center',
    },
  })
}
