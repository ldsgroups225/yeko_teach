import React, { useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useDispatch } from "react-redux";
import CsButton from "@components/CsButton";
import CsText from "@components/CsText";
import { useThemedStyles } from "@hooks/index";
import { useAuth } from "@hooks/useAuth";
import { loggedOut } from "@modules/app/redux/appSlice";
import { ITheme } from "@styles/theme";
import { showToast } from "@helpers/toast/showToast";
import { borderRadius, spacing } from "@styles/index";
import { Ionicons } from "@expo/vector-icons";
import { formatFullName } from "@utils/Formatting";
import { useAppSelector } from "@src/store";

const ProfileScreen: React.FC = () => {
  const themedStyles = useThemedStyles<typeof styles>(styles);
  const user = useAppSelector((s) => s?.AppReducer?.user);

  const dispatch = useDispatch();

  const { logout, loading } = useAuth();

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response) {
        dispatch(loggedOut());
      }
    } catch (_) {
      showToast("Un problème rencontré lors de la déconnexion, réessayer");
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    // TODO: Implement profile update logic
    setTimeout(() => {
      setIsUpdatingProfile(false);
      showToast("Profil mis à jour avec succès");
    }, 2000);
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    // TODO: Implement cache clearing logic
    setTimeout(() => {
      setIsClearingCache(false);
      showToast("Cache effacé avec succès");
    }, 1500);
  };

  const handleGenerateQR = () => {
    setIsGeneratingQR(true);
    // TODO: Implement QR code generation logic
    setTimeout(() => {
      setIsGeneratingQR(false);
      showToast("QR Code généré avec succès");
    }, 1500);
  };

  return (
    <ScrollView style={themedStyles.container}>
      <View style={themedStyles.header}>
        <Ionicons
          name="person-circle-outline"
          size={100}
          color={themedStyles.avatar.color}
        />
        <CsText variant="h1" style={themedStyles.userName}>
          {formatFullName(user?.firstName || "", user?.lastName || "")}
        </CsText>
        <CsText variant="body" style={themedStyles.userEmail}>
          {user?.email || ""}
        </CsText>
      </View>

      <View style={themedStyles.section}>
        <CsButton
          title="Mettre à jour le profil"
          onPress={handleUpdateProfile}
          disabled={isUpdatingProfile}
          loading={isUpdatingProfile}
          style={themedStyles.button}
        />
        <CsText variant="caption" style={themedStyles.infoText}>
          ℹ️ Modifier votre nom et photo
        </CsText>
      </View>

      <View style={themedStyles.section}>
        <CsButton
          title="Générer un QR Code"
          onPress={handleGenerateQR}
          disabled={isGeneratingQR}
          loading={isGeneratingQR}
          style={themedStyles.button}
        />
        <CsText variant="caption" style={themedStyles.infoText}>
          Pour lier votre profil à une nouvelle école
        </CsText>
      </View>

      <View style={themedStyles.section}>
        <TouchableOpacity
          style={themedStyles.clearCacheButton}
          onPress={handleClearCache}
          disabled={isClearingCache}
        >
          <Ionicons
            name="refresh"
            size={24}
            color={themedStyles.clearCacheButton.color}
          />
          <CsText variant="body" style={themedStyles.clearCacheButtonText}>
            {isClearingCache ? "En cours..." : "Nouvelle donnée"}
          </CsText>
        </TouchableOpacity>
        <CsText variant="caption" style={themedStyles.infoText}>
          ℹ️ L'obtention des nouvelle donnée ralentira vos interaction prochaine
        </CsText>
      </View>

      <CsButton
        title="Déconnexion"
        onPress={handleLogout}
        disabled={loading}
        loading={loading}
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
    header: {
      alignItems: "center",
      padding: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    avatar: {
      color: theme.primary,
    },
    userName: {
      color: theme.text,
      fontWeight: "bold",
      marginTop: spacing.md,
    },
    userEmail: {
      color: theme.textLight,
      marginTop: spacing.xs,
    },
    section: {
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    button: {
      marginBottom: spacing.sm,
    },
    infoText: {
      color: theme.textLight,
      textAlign: "center",
      marginTop: spacing.xs,
    },
    clearCacheButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.md,
      backgroundColor: theme.card,
      borderRadius: borderRadius.medium,
      color: theme.text,
    },
    clearCacheButtonText: {
      marginLeft: spacing.sm,
      color: theme.text,
    },
    logoutButton: {
      margin: spacing.lg,
      backgroundColor: theme.error,
    },
  });

export default ProfileScreen;
