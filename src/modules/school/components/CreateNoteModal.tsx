import React, { useEffect, useState } from 'react';
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { format } from 'date-fns';
import CsText from '@components/CsText';
import { useTheme } from '@src/hooks';
import { spacing } from '@styles/spacing';
import DateTimePicker from '@react-native-community/datetimepicker';
import { INoteDTO, ISubjectDTO, IUserDTO } from '@modules/app/types/ILoginDTO';
import CsButton from '@components/CsButton';
import { Picker } from '@react-native-picker/picker';
import { ITheme } from '@styles/theme';
import CsTextField from '@components/CsTextField';
import { useAppSelector } from '@store/index';
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum';
import { showToast } from '@helpers/toast/showToast';
import { NOTE_OPTIONS } from '@modules/app/constants/noteTypes';

interface CreateNoteModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (noteData: Partial<INoteDTO>) => Promise<void>;
  schoolId: string;
  classId: string;
  user?: IUserDTO;
  subjects: ISubjectDTO[];
  schoolYear?: {
    id: number;
    name: string;
  };
}

export const CreateNoteModal: React.FC<CreateNoteModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  schoolId,
  classId,
  user,
  schoolYear,
  subjects,
}) => {
  const theme = useTheme();
  const styles = useStyles(theme);

  const semesters = useAppSelector((s) => s.AppReducer?.semesters ?? []);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalPoints, setTotalPoints] = useState('20');
  const [subject, setSubject] = useState('');
  const [weight, setWeight] = useState('1');
  const [noteType, setNoteType] = useState(NOTE_OPTIONS[0].value);
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [isGraded, setIsGraded] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [semester, setSemester] = useState(semesters.find(s => s.isCurrent === true)?.id.toString() ?? '0');


  useEffect(() => {
    if (subjects.length === 0) {
      showToast("Vous n’êtes pas enseignant de cette classe", ToastColorEnum.Warning);
      return onClose();
    }
    
    setSubject(subjects[0].id)
  }, [])

  const handleSubmit = async () => {
    const noteData: Partial<INoteDTO> = {
      classId,
      dueDate,
      schoolId,
      noteType,
      isGraded,
      subjectId: subject,
      teacherId: user?.id,
      title: title.trim(),
      weight: parseFloat(weight),
      schoolYearId: schoolYear?.id,
      semesterId: parseInt(semester),
      description: description.trim(),
      totalPoints: parseFloat(totalPoints),
    };

    await onSubmit(noteData);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTotalPoints('20');
    setWeight('1');
    setNoteType(NOTE_OPTIONS[0].value);
    setDueDate(new Date());
    setIsGraded(true);
  };

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView>
            <CsText variant="h2" style={styles.modalTitle}>
              Nouvelle Évaluation
            </CsText>

            <View style={styles.inputContainer}>
              <CsText variant="body">
                {
                  semesters?.length === 2
                  ? 'Semestre'
                  : semesters?.length === 3
                    ? 'Trimestre'
                    : ''
                }
              </CsText>
              <Picker
                selectedValue={semester}
                onValueChange={setSemester}
                style={styles.picker}
              >
                {semesters.map((sm) => (
                  <Picker.Item key={sm.id.toString()} label={sm.name} value={sm.id.toString()} />
                ))}
              </Picker>
            </View>

            {subjects.length > 1 && (
              <View style={styles.inputContainer}>
                <CsText variant="body">Matière</CsText>
                <Picker
                  selectedValue={subject}
                  onValueChange={setSubject}
                  style={styles.picker}
                >
                  {subjects.map((sub) => (
                    <Picker.Item key={sub.id} label={sub.name} value={sub.id} />
                  ))}
                </Picker>
              </View>
          )}

            <View style={styles.inputContainer}>
              <CsText variant="body">Type d'évaluation</CsText>
              <Picker
                selectedValue={noteType}
                onValueChange={setNoteType}
                style={styles.picker}
              >
                {NOTE_OPTIONS.map((type) => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <CsText variant="body">Titre</CsText>
              <CsTextField
                value={title}
                onChangeText={setTitle}
                label='Titre'
                placeholder="Titre de l'évaluation"
              />
            </View>

            <View style={styles.inputContainer}>
              <CsText variant="body">Description</CsText>
              <CsTextField
                value={description}
                onChangeText={setDescription}
                label='Description'
                placeholder="Description de l'évaluation"
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <CsText variant="body">Points totaux</CsText>
                <CsTextField
                  value={totalPoints}
                  onChangeText={setTotalPoints}
                  keyboardType="numeric"
                  label='Points totaux'
                  placeholder="20"
                />
              </View>
              <View style={styles.inputHalf}>
                <CsText variant="body">Coefficient</CsText>
                <CsTextField
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  label='Coefficient'
                  placeholder="1"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <CsText variant="body">Date limite: {format(dueDate, 'dd/MM/yyyy')}</CsText>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDueDate(selectedDate);
                }}
              />
            )}

            <TouchableOpacity
              style={styles.gradedToggle}
              onPress={() => setIsGraded(!isGraded)}
            >
              <View style={[styles.checkbox, isGraded && styles.checkboxChecked]} />
              <CsText variant="body">Noter l'évaluation</CsText>
            </TouchableOpacity>

            <View style={styles.buttonContainer}>
              <CsButton
                title="Annuler"
                onPress={() => {
                  resetForm();
                  onClose();
                }}
                variant="secondary"
              />
              <CsButton
                title="Créer"
                onPress={handleSubmit}
                disabled={!title || !totalPoints || !weight}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const useStyles = (theme: ITheme) =>
  StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    modalContent: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: spacing.lg,
      maxHeight: '80%',
    },
    modalTitle: {
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: spacing.md,
    },
    picker: {
      backgroundColor: theme.card,
      borderRadius: 8,
    },
    inputRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    inputHalf: {
      width: '48%',
    },
    dateButton: {
      backgroundColor: theme.card,
      padding: spacing.sm,
      borderRadius: 8,
      marginBottom: spacing.md,
    },
    gradedToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: theme.text,
      marginRight: spacing.sm,
    },
    checkboxChecked: {
      backgroundColor: theme.primary,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });

export default CreateNoteModal;
