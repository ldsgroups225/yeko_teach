import React, { useState, useCallback, useEffect } from "react";
import { ScrollView, StyleSheet, View, Animated, Modal, Dimensions } from "react-native";
import { useDispatch } from "react-redux";
import CsButton from "@components/CsButton";
import { useThemedStyles } from "@hooks/index";
import { useAuth } from "@hooks/useAuth";
import { loggedOut } from "@modules/app/redux/appSlice";
import { ITheme } from "@styles/theme";
import { showToast } from "@helpers/toast/showToast";
import { spacing } from "@styles/index";
import { useAppSelector } from "@src/store";
import { ToastColorEnum } from "@components/ToastMessage/ToastColorEnum";
import { ProfileHeader, ProfileSection, ClearCacheSection } from "../components";
import { OtpForm } from "@components/OtpForm";
import { useClearCache } from "@hooks/useClearCache";
import { useSchoolJoin } from "@hooks/useSchoolJoin";

const PROFILE_UPDATE_DELAY = 300;

/**
 * ProfileScreen component displays user profile information and provides various actions.
 * @returns {React.ReactElement} A React element representing the profile screen.
 */
const ProfileScreen: React.FC = () => {
  const themedStyles = useThemedStyles<typeof styles>(styles);
  const user = useAppSelector((state) => state?.AppReducer?.user);
  const { joinSchool, loading: isJoiningSchool, error: joinSchoolError } = useSchoolJoin(user?.id || '');

  const dispatch = useDispatch();
  const { logout, loading: isLoggingOut } = useAuth();
  const { clearCache, isClearing } = useClearCache();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showOtpForm, setShowOtpForm] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (joinSchoolError) {
      showToast(joinSchoolError, ToastColorEnum.Error);
    }
  }, [joinSchoolError]);

  const handleLogout = useCallback(async () => {
    try {
      const response = await logout();
      if (response) {
        dispatch(loggedOut());
        await clearCache();
      }
    } catch (_) {
      showToast("Un problème rencontré lors de la déconnexion, réessayer");
    }
  }, [dispatch, logout, clearCache]);

  const handleUpdateProfile = useCallback(async () => {
    setIsUpdatingProfile(true);
    // TODO: Implement profile update logic
    setTimeout(() => {
      setIsUpdatingProfile(false);
      showToast("Sera disponible très bientôt", ToastColorEnum.Warning);
    }, PROFILE_UPDATE_DELAY);
  }, []);

  const handleJoinNewSchool = useCallback(() => {
    setShowOtpForm(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleOtpComplete = useCallback(async (code: string) => {
    const joined = await joinSchool(code);
    if (joined) {
      await clearCache();
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowOtpForm(false));
    }
  }, [fadeAnim, joinSchool, clearCache]);

  const handleOtpCancel = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setShowOtpForm(false));
  }, [fadeAnim]);

  if (!user) return null;

  return (
    <ScrollView style={themedStyles.container}>
      <ProfileHeader user={user} />
      
      <ProfileSection
        title="Mettre à jour le profil"
        onPress={handleUpdateProfile}
        disabled={isUpdatingProfile || showOtpForm || isJoiningSchool}
        loading={isUpdatingProfile}
        infoText="ℹ️ Modifier votre nom et photo"
      />

      <ProfileSection
        title="Joindre une nouvelle école"
        onPress={handleJoinNewSchool}
        disabled={showOtpForm || isJoiningSchool}
        infoText="Entrez le code OTP pour lier votre profil à une nouvelle école"
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={showOtpForm}
        onRequestClose={() => setShowOtpForm(false)}
      >
        <View style={themedStyles.centeredView}>
          <View style={themedStyles.modalView}>
            <OtpForm
              onComplete={handleOtpComplete}
              onCancel={handleOtpCancel}
              loading={isJoiningSchool}
            />
          </View>
        </View>
      </Modal>


      <ClearCacheSection
        onPress={clearCache}
        disabled={isClearing || showOtpForm || isJoiningSchool}
        loading={isClearing}
      />

      <CsButton
        title="Déconnexion"
        onPress={handleLogout}
        disabled={isLoggingOut || showOtpForm || isJoiningSchool}
        loading={isLoggingOut}
        style={themedStyles.logoutButton}
      />
    </ScrollView>
  );
};

const styles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalView: {
      margin: 20,
      backgroundColor: theme.background,
      borderRadius: 20,
      padding: 35,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
      width: '90%',
    },
    otpFormContainer: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    logoutButton: {
      margin: spacing.lg,
      backgroundColor: theme.error,
    },
  });

export default ProfileScreen;
