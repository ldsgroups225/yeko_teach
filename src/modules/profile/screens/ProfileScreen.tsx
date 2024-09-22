import React, { useCallback, useMemo, useRef, useState } from "react";
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
import BottomSheet, { BottomSheetBackdrop } from "@gorhom/bottom-sheet";
import QRCode from "react-native-qrcode-svg";
import { removeStoreDataAsync } from "@helpers/storage";
import { StoreEnum } from "@helpers/storage/storeEnum";
import { ToastColorEnum } from "@components/ToastMessage/ToastColorEnum";

const ProfileScreen: React.FC = () => {
  const themedStyles = useThemedStyles<typeof styles>(styles);
  const user = useAppSelector((s) => s?.AppReducer?.user);

  const dispatch = useDispatch();

  const { logout, loading } = useAuth();

  const bottomSheetRef = useRef<BottomSheet>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await logout();
      if (response) {
        dispatch(loggedOut());
        await removeStoreDataAsync(StoreEnum.User);
        await removeStoreDataAsync(StoreEnum.CacheDuration);
        await removeStoreDataAsync(StoreEnum.Classes);
        await removeStoreDataAsync(StoreEnum.Notes);
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
      showToast("Sera disponible très bientôt", ToastColorEnum.Warning);
    }, 300);
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    await removeStoreDataAsync(StoreEnum.User);
    await removeStoreDataAsync(StoreEnum.CacheDuration);
    await removeStoreDataAsync(StoreEnum.Classes);
    await removeStoreDataAsync(StoreEnum.Notes);
    setIsClearingCache(false);

    showToast(
      "Les nouvelles données vous seront transmises.",
      ToastColorEnum.Success
    );
  };

  const qrValue = useMemo(() => `YEKO_teacher|---|${user?.id}`, [user?.id]);

  const handleGenerateQRCode = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    []
  );

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
          onPress={handleGenerateQRCode}
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
            {isClearingCache ? "En cours..." : "Nouvelle données"}
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

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={["53%"]}
        index={-1}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
      >
        <View style={themedStyles.qrCodeContainer}>
          <QRCode value={qrValue} size={200} />
          <CsText style={themedStyles.qrText}>QR Code de jonction</CsText>
          <CsText variant="caption" style={themedStyles.qrText}>
            Utilisez ce Qr Code pour joindre une nouvelle école.
          </CsText>
        </View>
      </BottomSheet>
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
    qrCodeContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.lg,
    },
    qrText: {
      marginTop: spacing.md,
      textAlign: "center",
      color: theme.text,
    },
  });

export default ProfileScreen;
