import React from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { spacing } from "@styles/spacing";
import { ITheme } from "@styles/theme";

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  theme: ITheme;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  searchQuery,
  setSearchQuery,
  theme,
}) => (
  <View style={styles(theme).searchContainer}>
    <Ionicons
      name="search"
      size={20}
      color={theme.text}
      style={styles(theme).searchIcon}
    />
    <TextInput
      style={styles(theme).searchInput}
      placeholder="Rechercher des écoles..."
      placeholderTextColor={theme.textLight}
      value={searchQuery}
      onChangeText={setSearchQuery}
    />
  </View>
);

const styles = (theme: ITheme) =>
  StyleSheet.create({
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    searchInput: {
      flex: 1,
      color: theme.text,
      fontSize: 16,
    },
  });
