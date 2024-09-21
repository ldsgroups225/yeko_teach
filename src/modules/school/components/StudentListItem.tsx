import React from "react";
import { Animated, StyleSheet, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import CsText from "@components/CsText";
import { useTheme } from "@src/hooks";
import { spacing } from "@styles/spacing";
import { ITheme } from "@styles/theme";
import { IStudentDTO } from "@modules/app/types/ILoginDTO";

interface StudentListItemProps {
  student: IStudentDTO;
  isAssigningGrade: boolean;
  onNoteChange: (id: string, note: number | null) => void;
}

const StudentListItem: React.FC<StudentListItemProps> = ({
  student,
  isAssigningGrade,
  onNoteChange,
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);
  const [fadeAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleNoteChange = (text: string) => {
    const note =
      text === "" ? null : Math.min(Math.max(parseInt(text) || 0, 0), 40);
    onNoteChange(student.id, note);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <CsText variant="h3" style={styles.avatarText}>
            {getInitials(student.firstName, student.lastName)}
          </CsText>
        </View>
      </View>
      <View style={styles.infoContainer}>
        <CsText variant="h3" style={styles.name}>
          {`${student.lastName} ${student.firstName}`}
        </CsText>
        <View style={styles.idNumberContainer}>
          <Ionicons name="id-card-outline" size={14} color={theme.textLight} />
          <CsText variant="caption" style={styles.idNumber}>
            {student.idNumber}
          </CsText>
        </View>
      </View>
      <View style={styles.noteContainer}>
        {isAssigningGrade ? (
          <TextInput
            style={styles.noteInput}
            keyboardType="numeric"
            value={student.note?.toString() || ""}
            onChangeText={handleNoteChange}
            maxLength={2}
            placeholder="0-40"
            placeholderTextColor={theme.textLight}
          />
        ) : (
          <View
            style={[
              styles.noteDisplay,
              student.note !== undefined && styles.noteDisplayFilled,
            ]}
          >
            <CsText variant="body" style={styles.noteText}>
              {student.note !== undefined ? student.note : "-"}
            </CsText>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const useStyles = (theme: ITheme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.card,
    },
    avatarContainer: {
      marginRight: spacing.md,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: theme.background,
      fontSize: 16,
      fontWeight: "bold",
    },
    infoContainer: {
      flex: 1,
    },
    name: {
      color: theme.text,
      fontWeight: "bold",
    },
    idNumberContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: spacing.xs,
    },
    idNumber: {
      color: theme.textLight,
      marginLeft: spacing.xs,
    },
    noteContainer: {
      width: 60,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    noteInput: {
      width: "100%",
      height: "100%",
      borderWidth: 1,
      borderColor: theme.primary,
      borderRadius: 8,
      textAlign: "center",
      color: theme.text,
      fontSize: 16,
      backgroundColor: theme.background,
    },
    noteDisplay: {
      width: "100%",
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
      borderRadius: 8,
    },
    noteDisplayFilled: {
      backgroundColor: theme.success + "20",
    },
    noteText: {
      color: theme.text,
      fontWeight: "bold",
      fontSize: 16,
    },
  });

export default StudentListItem;
