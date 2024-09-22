import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@src/hooks";
import { ITheme } from "@styles/theme";
import CsText from "@components/CsText";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "@styles/spacing";

const ChatScreen: React.FC = () => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons
            name="construct-outline"
            size={60}
            color={theme.primary}
            style={styles.icon}
          />
          <Ionicons
            name="chatbubbles-outline"
            size={80}
            color={theme.primary}
            style={styles.icon}
          />
        </View>
        <CsText variant="h2" style={styles.title}>
          En cours de développement
        </CsText>
        <CsText variant="body" style={styles.description}>
          Nous travaillons actuellement sur cette fonctionnalité de chat pour
          vous offrir une meilleure expérience. Revenez bientôt pour découvrir
          les nouvelles fonctionnalités !
        </CsText>
        <View style={styles.additionalInfo}>
          <Ionicons
            name="time-outline"
            size={24}
            color={theme.textLight}
            style={styles.infoIcon}
          />
          <CsText variant="caption" style={styles.infoText}>
            Lancement prévu : Bientôt
          </CsText>
        </View>
      </View>
    </View>
  );
};

const useStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.lg,
    },
    content: {
      alignItems: "center",
      maxWidth: 300,
    },
    iconContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.xl,
    },
    icon: {
      marginHorizontal: spacing.sm,
    },
    title: {
      color: theme.primary,
      marginBottom: spacing.md,
      textAlign: "center",
    },
    description: {
      color: theme.textLight,
      textAlign: "center",
      marginBottom: spacing.xl,
    },
    additionalInfo: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      padding: spacing.sm,
      borderRadius: 8,
    },
    infoIcon: {
      marginRight: spacing.xs,
    },
    infoText: {
      color: theme.textLight,
    },
  });

export default ChatScreen;
