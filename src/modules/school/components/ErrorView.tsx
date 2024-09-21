import React from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@src/hooks";
import { ITheme } from "@styles/theme";
import CsText from "@components/CsText";
import { spacing } from "@styles/spacing";

interface ErrorViewProps {
  message: string;
}

/**
 * ErrorView component displays an error message.
 */
const ErrorView: React.FC<ErrorViewProps> = ({ message }) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <View style={styles.container}>
      <CsText style={styles.errorText}>{message}</CsText>
    </View>
  );
};

const useStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
    },
    errorText: {
      color: theme.error,
      textAlign: "center",
      padding: spacing.md,
    },
  });

export default ErrorView;
