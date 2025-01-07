import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
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
}

export const NoteHistoryView: React.FC<NoteHistoryViewProps> = ({
  notes,
  onPressNote,
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const renderNoteItem = ({ item }: { item: INoteDTO }) => (
    <TouchableOpacity
      style={styles.noteItem}
      onPress={() => onPressNote(item)}
    >
      <View style={styles.noteHeader}>
        <CsText variant="h3">{item.title}</CsText>
        <CsText variant="caption" style={styles.noteType}>
          {NOTE_TYPES.find((t) => t.value === item.noteType)?.label}
        </CsText>
      </View>

      <View style={styles.noteDetails}>
        <View style={styles.detailRow}>
          <CsText variant="body">Points: {item.totalPoints}</CsText>
          <CsText variant="body">Coeff: {item.weight}</CsText>
        </View>

        <View style={styles.detailRow}>
          <CsText variant="caption">
            Créé le {format(new Date(item.createdAt), 'dd/MM/yyyy')}
          </CsText>
          {item.dueDate && (
            <CsText variant="caption">
              À rendre le {format(new Date(item.dueDate), 'dd/MM/yyyy')}
            </CsText>
          )}
        </View>
      </View>

      <View style={styles.noteStatus}>
        {item.isPublished ? (
          <View style={styles.publishedBadge}>
            <CsText variant="caption" style={styles.badgeText}>
              Publié
            </CsText>
          </View>
        ) : item.isActive ? (
          <View style={styles.activeBadge}>
            <CsText variant="caption" style={styles.badgeText}>
              Actif
            </CsText>
          </View>
        ) : (
          <View style={styles.draftBadge}>
            <CsText variant="caption" style={styles.badgeText}>
              Brouillon
            </CsText>
          </View>
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
      backgroundColor: theme.warning,
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
    badgeText: {
      color: theme.background,
    },
    notesList: {
      flex: 1,
    },
  });

export default NoteHistoryView;
