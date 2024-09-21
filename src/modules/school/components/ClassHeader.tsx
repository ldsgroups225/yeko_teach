import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CsText from "@components/CsText";
import { useTheme } from "@src/hooks";
import { spacing } from "@styles/spacing";
import { ITheme } from "@styles/theme";
import { IClassDTO } from "@modules/app/types/ILoginDTO";

interface ClassHeaderProps {
  classItem: IClassDTO;
  schoolName: string;
  onBackPress: () => void;
  onOpenBottomSheet: () => void;
}

const ClassHeader: React.FC<ClassHeaderProps> = ({
  classItem,
  schoolName,
  onBackPress,
  onOpenBottomSheet,
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.6}
        >
          <Ionicons name="arrow-back" size={24} color={theme.background} />
        </TouchableOpacity>

        <CsText
          variant="h2"
          style={styles.className}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {classItem.name}
        </CsText>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onOpenBottomSheet}
          activeOpacity={0.7}
        >
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={theme.background}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomRow}>
        <CsText variant="body" style={styles.schoolName}>
          {schoolName}
        </CsText>
      </View>
    </View>
  );
};

const useStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.primary,
      padding: spacing.md,
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    backButton: {
      padding: spacing.xs,
      marginRight: spacing.sm,
    },
    className: {
      flex: 1,
      color: theme.background,
      fontSize: 20,
      fontWeight: "bold",
      paddingHorizontal: spacing.sm,
    },
    bottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    schoolName: {
      color: theme.background + "80",
      fontFamily: "monospace",
    },
    actionButton: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
    },
  });

export default ClassHeader;
