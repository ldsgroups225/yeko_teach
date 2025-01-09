import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { format } from 'date-fns';
import CsText from '@components/CsText';
import { useTheme } from '@src/hooks';
import { spacing } from '@styles/spacing';
import { INoteDTO } from '@modules/app/types/ILoginDTO';
import EmptyListComponent from '@components/EmptyListComponent';
import { NOTE_TYPES } from '@modules/app/constants/noteTypes';
import { ITheme } from '@styles/theme';

interface NoteHistoryViewProps {
  notes: INoteDTO[];
  onPressNote: (note: INoteDTO) => void;
  onPressActivate: (noteId: string, isActive: boolean) => void;
}

export const NoteHistoryView: React.FC<NoteHistoryViewProps> = ({
  notes,
  onPressNote,
  onPressActivate,
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const renderNoteItem = ({ item }: { item: INoteDTO }) => (
    <TouchableOpacity
      style={[styles.noteItem, item.isActive && styles.disabledNoteItem]}
      onPress={() => !item.isActive && onPressNote(item)}
      disabled={item.isActive}
    >
      <View style={styles.noteHeader}>
        <CsText variant="h3">{item.title}</CsText>
        <CsText variant="caption" style={styles.noteType}>
          {NOTE_TYPES.find((t) => t.value === item.noteType)?.label}
        </CsText>
      </View>

      <View style={styles.noteDetails}>
        <View style={styles.detailRow}>
          <CsText variant="body">Notée sur: {item.totalPoints}</CsText>
          <CsText variant="body">Coeff: {item.weight}</CsText>
        </View>

        <View style={styles.detailRow}>
          {item.dueDate && (
            <CsText variant="caption">
              Évaluation du {format(new Date(item.dueDate), 'dd/MM/yyyy')}
            </CsText>
          )}

<View style={styles.noteStatus}>
        {item.isPublished ? (
          <View style={styles.publishedBadge}>
            <CsText variant="caption" style={styles.publishedBadgeText}>
              Publié
            </CsText>
          </View>
        ) : item.isActive ? (
          <View style={styles.activeBadge}>
            <CsText variant="caption" style={styles.activeBadgeText}>
              Distribué
            </CsText>
          </View>
        ) : (
          <View style={styles.draftBadge}>
            <CsText variant="caption" style={styles.draftBadgeText}>
              Brouillon
            </CsText>
          </View>
        )}
      </View>
        </View>


        {!item.isActive && (
            <TouchableOpacity style={styles.sendButton} onPress={() => onPressActivate(item.id!, item.isActive)}>
              <Text style={styles.sendButtonText}>Envoyer</Text>
            </TouchableOpacity>
          )}
      </View>

      
    </TouchableOpacity>
  );

  return (
    <FlatList
      data={notes}
      renderItem={renderNoteItem}
      keyExtractor={(item) => item.id!}
      style={styles.notesList}
      ListEmptyComponent={
        <EmptyListComponent message="Aucune évaluation enregistrée" />
      }
    />
  );
};

const useStyles = (theme: ITheme) =>
  StyleSheet.create({
    noteItem: {
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: spacing.md,
      marginBottom: spacing.sm,
    },
    disabledNoteItem: {
      opacity: 0.6,
    },
    noteHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    noteType: {
      color: theme.textLight,
    },
    noteDetails: {
      marginBottom: spacing.sm,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    noteStatus: {
      alignItems: 'flex-end',
    },
    publishedBadge: {
      backgroundColor: theme.success,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 4,
    },
    activeBadge: {
      backgroundColor: theme.secondary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 4,
    },
    draftBadge: {
      backgroundColor: theme.error,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 4,
    },
    publishedBadgeText: {
      color: theme.text,
    },
    activeBadgeText: {
      color: theme.text,
    },
    draftBadgeText: {
      color: theme.background,
    },
    notesList: {
      flex: 1,
    },
    sendButton: {
      backgroundColor: theme.primary,
      borderRadius: 4,
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
      marginTop: spacing.lg,
      alignItems: 'center',
    },
    sendButtonText: {
      color: theme.background,
    },
  });

export default NoteHistoryView;
