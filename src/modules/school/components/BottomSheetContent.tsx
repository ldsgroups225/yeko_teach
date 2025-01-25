// import React from "react";
// import {
//   ActivityIndicator,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
//   View,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Picker } from "@react-native-picker/picker";
// import { format } from "date-fns";
// import { ITheme } from "@styles/theme";
// import { useTheme } from "@src/hooks";
// import CsText from "@components/CsText";
// import { INoteDTO, ISubjectDTO } from "@modules/app/types/ILoginDTO";
// import { spacing } from "@src/styles";

// interface BottomSheetContentProps {
//   isAssigningGrade: boolean;
//   toggleGradeAssignment: () => void;
//   handleRemotelySaveNotes: () => Promise<void>;
//   currentSubject: ISubjectDTO | null;
//   setCurrentSubject: (subject: ISubjectDTO) => void;
//   classItem: any; // Replace 'any' with the correct type
//   savedNotes: INoteDTO[];
//   isNoteSubmitting: boolean;
// }

// /**
//  * BottomSheetContent component renders the content for the bottom sheet in SchoolClassDetails.
//  */
// const BottomSheetContent: React.FC<BottomSheetContentProps> = ({
//   isAssigningGrade,
//   toggleGradeAssignment,
//   handleRemotelySaveNotes,
//   currentSubject,
//   setCurrentSubject,
//   classItem,
//   savedNotes,
//   isNoteSubmitting,
// }) => {
//   const theme = useTheme();
//   const styles = useStyles(theme);

//   const renderSavedNoteItem = ({ item }: { item: INoteDTO }) => (
//     <View style={styles.savedNoteItem}>
//       <View>
//         <CsText variant="body" style={styles.savedNoteDate}>
//           {format(new Date(item.date), "dd/MM/yyyy")}
//         </CsText>
//         <CsText variant="caption" style={styles.savedNoteId}>
//           ID: {item.id?.slice(0, 8)}...
//         </CsText>
//       </View>
//       {item.isPublished ? (
//         <View style={styles.publishedContainer}>
//           <Ionicons name="checkmark-circle" size={20} color={theme.success} />
//           <CsText variant="caption" style={styles.publishedText}>
//             {item.publishDate
//               ? format(new Date(item.publishDate), "dd/MM/yyyy HH:mm")
//               : "Published"}
//           </CsText>
//         </View>
//       ) : (
//         <TouchableOpacity
//           style={styles.publishButton}
//           onPress={() => handlePublishNote(item.id!)}
//         >
//           <CsText variant="caption" style={styles.publishButtonText}>
//             Publish
//           </CsText>
//         </TouchableOpacity>
//       )}
//     </View>
//   );

//   const handlePublishNote = async (noteId: string) => {
//     // TODO: Implement note publishing logic
//     console.log("Publishing note:", noteId);
//   };

//   return (
//     <View style={styles.bottomSheetContent}>
//       <TouchableOpacity
//         style={styles.bottomSheetButton}
//         onPress={toggleGradeAssignment}
//       >
//         <Ionicons
//           name={isAssigningGrade ? "save-outline" : "create-outline"}
//           size={24}
//           color={theme.background}
//         />
//         <CsText variant="body" style={styles.bottomSheetButtonText}>
//           {isAssigningGrade ? "Sauvegarder" : "Attribuer notes"}
//         </CsText>
//       </TouchableOpacity>

//       {!isAssigningGrade && (
//         <TouchableOpacity
//           style={styles.bottomSheetButton}
//           onPress={handleRemotelySaveNotes}
//         >
//           <Ionicons name="share-outline" size={24} color={theme.background} />
//           <CsText variant="body" style={styles.bottomSheetButtonText}>
//             Partager les notes
//           </CsText>
//         </TouchableOpacity>
//       )}

//       <View style={styles.subjectPickerContainer}>
//         <CsText variant="h3" style={styles.bottomSheetSectionTitle}>
//           Matières
//         </CsText>
//         {classItem && classItem.subjects && (
//           <Picker
//             selectedValue={currentSubject?.id}
//             style={styles.subjectPicker}
//             onValueChange={(itemValue) => {
//               const newSubject = classItem.subjects.find(
//                 (s: ISubjectDTO) => s.id === itemValue
//               );
//               if (newSubject) {
//                 setCurrentSubject(newSubject);
//               }
//             }}
//           >
//             {classItem.subjects.map((subject: ISubjectDTO) => (
//               <Picker.Item
//                 key={subject.id}
//                 label={subject.name}
//                 value={subject.id}
//               />
//             ))}
//           </Picker>
//         )}
//       </View>

//       <CsText variant="h3" style={styles.bottomSheetSectionTitle}>
//         Notes sauvegardées
//       </CsText>
//       {isNoteSubmitting ? (
//         <ActivityIndicator size="small" color={theme.primary} />
//       ) : savedNotes.length > 0 ? (
//         <FlatList
//           data={savedNotes}
//           renderItem={renderSavedNoteItem}
//           keyExtractor={(item) => item.id!}
//           style={styles.savedNotesList}
//         />
//       ) : (
//         <CsText variant="body" style={styles.noSavedNotesText}>
//           Aucune note sauvegardée pour cette matière
//         </CsText>
//       )}
//     </View>
//   );
// };

// const useStyles = (theme: ITheme) =>
//   StyleSheet.create({
//     bottomSheetContent: {
//       flex: 1,
//       backgroundColor: theme.background,
//       padding: spacing.md,
//     },
//     bottomSheetButton: {
//       flexDirection: "row",
//       alignItems: "center",
//       backgroundColor: theme.primary,
//       padding: spacing.md,
//       borderRadius: 8,
//       marginBottom: spacing.sm,
//     },
//     bottomSheetButtonText: {
//       color: theme.background,
//       marginLeft: spacing.sm,
//       fontWeight: "bold",
//     },
//     subjectPickerContainer: {
//       marginBottom: spacing.md,
//     },
//     subjectPicker: {
//       backgroundColor: theme.card,
//       borderRadius: 8,
//       marginTop: spacing.xs,
//     },
//     bottomSheetSectionTitle: {
//       color: theme.text,
//       marginTop: spacing.md,
//       marginBottom: spacing.sm,
//     },
//     savedNotesList: {
//       maxHeight: 200,
//     },
//     savedNoteItem: {
//       flexDirection: "row",
//       justifyContent: "space-between",
//       alignItems: "center",
//       backgroundColor: theme.card,
//       padding: spacing.sm,
//       borderRadius: 8,
//       marginBottom: spacing.xs,
//     },
//     savedNoteDate: {
//       color: theme.text,
//     },
//     savedNoteId: {
//       color: theme.textLight,
//     },
//     publishedContainer: {
//       flexDirection: "row",
//       alignItems: "center",
//     },
//     publishedText: {
//       color: theme.success,
//       marginLeft: spacing.xs,
//     },
//     publishButton: {
//       backgroundColor: theme.primary,
//       paddingVertical: spacing.xs,
//       paddingHorizontal: spacing.sm,
//       borderRadius: 4,
//     },
//     publishButtonText: {
//       color: theme.background,
//     },
//     noSavedNotesText: {
//       color: theme.textLight,
//       textAlign: "center",
//       marginTop: spacing.sm,
//     },
//   });

// export default BottomSheetContent;
