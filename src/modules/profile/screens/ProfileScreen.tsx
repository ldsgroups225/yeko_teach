/**
 * @author Ali Burhan Keskin <alikeskin@milvasoft.com>
 */
import React from "react";
import { StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import CsButton from "@components/CsButton";
import { useThemedStyles } from "@hooks/index";
import { useAuth } from "@hooks/useAuth";
import { loggedOut } from "@modules/app/redux/appSlice";
import { ITheme } from "@styles/theme";
import translate from "@helpers/localization";
import { showToast } from "@helpers/toast/showToast";
import { borderRadius, spacing } from "@styles/index";

const ProfileScreen: React.FC = () => {
  const themedStyles = useThemedStyles<typeof styles>(styles);
  const dispatch = useDispatch();
  const { logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      const response = await logout();

      if (response) dispatch(loggedOut());
    } catch (_) {
      showToast("Un problème rencontré lors de la déconnexion, réessayer");
    }
  };

  return (
    <View style={themedStyles.container}>
      <CsButton
        title={translate("logout")}
        onPress={handleLogout}
        disabled={loading}
        loading={loading}
        style={themedStyles.logoutButton}
      />
    </View>
  );
};

// Styles
const styles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: spacing.md,
    },
    profileCard: {
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    profileHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.lg,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      marginRight: spacing.md,
    },
    userName: {
      color: theme.text,
    },
    logoutButton: {
      marginTop: spacing.md,
    },
    pickerContainer: {
      marginBottom: spacing.md,
    },
    pickerLabel: {
      marginBottom: spacing.xs,
    },
    picker: {
      backgroundColor: theme.card,
      borderRadius: borderRadius.medium,
      borderWidth: 1,
      borderColor: theme.border,
      color: theme.text,
    },
  });

export default ProfileScreen;
