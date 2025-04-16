// src/modules/school/components/CreateNoteModal.tsx

import type { INoteDTO, ISubjectDTO, IUserDTO } from '@modules/app/types/ILoginDTO'
import type { ITheme } from '@styles/theme'
import CsButton from '@components/CsButton'
import CsText from '@components/CsText'
import CsTextField from '@components/CsTextField'
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { showToast } from '@helpers/toast/showToast'
import { NOTE_OPTIONS, NOTE_TYPE } from '@modules/app/constants/noteTypes'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Picker } from '@react-native-picker/picker'
import { useTheme } from '@src/hooks'
import { useAppSelector } from '@store/index'
import { spacing } from '@styles/spacing'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { z } from 'zod'

interface CreateNoteModalProps {
  isVisible: boolean
  onClose: () => void
  onSubmit: (noteData: Partial<INoteDTO>) => Promise<void>
  schoolId: string
  classId: string
  user?: IUserDTO
  subjects: ISubjectDTO[]
  schoolYear?: {
    id: number
    name: string
  }
}

const $black50 = '#00000050'

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
  const theme = useTheme()
  const styles = useStyles(theme)

  const semesters = useAppSelector(s => s.AppReducer?.semesters ?? [])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [totalPoints, setTotalPoints] = useState('20')
  const [subject, setSubject] = useState('')
  const [weight, setWeight] = useState('1')
  const [noteType, setNoteType] = useState(NOTE_OPTIONS[0].value)
  const [dueDate, setDueDate] = useState<Date>(new Date())
  const [isGraded, setIsGraded] = useState(true)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [semester, setSemester] = useState(semesters.find(s => s.isCurrent === true)?.id.toString() ?? '0')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const NoteFormSchema = z.object({
    title: z.string().min(1, 'Le titre est requis'),
    description: z.string().optional(),
    totalPoints: z.preprocess(
      val => Number.parseFloat(String(val)),
      z.number().positive({ message: 'Les points totaux doivent être un nombre positif' }),
    ),
    weight: z.preprocess(
      val => Number.parseFloat(String(val)),
      z.number().positive({ message: 'Le coefficient doit être un nombre positif' }),
    ),
    subject: z.string()
      .min(1, 'La matière est requise')
      .refine(val => subjects.some(sub => sub.id === val), {
        message: 'Matière invalide',
      }),
    noteType: z.nativeEnum(NOTE_TYPE),
    semester: z.preprocess(
      val => Number.parseInt(String(val), 10),
      z.number().refine(num => semesters.some(sm => sm.id === num), {
        message: 'Semestre invalide',
      }),
    ),
    dueDate: z.date().refine(date => date instanceof Date && !Number.isNaN(date.getTime()), {
      message: 'Date invalide',
    }),
  })

  useEffect(() => {
    if (subjects.length === 0) {
      showToast('Vous n’êtes pas enseignant de cette classe', ToastColorEnum.Warning)
      return onClose()
    }

    setSubject(subjects[0].id)
  }, [])

  const handleSubmit = async () => {
    const formData = {
      title: title.trim(),
      description: description.trim(),
      totalPoints,
      weight,
      subject,
      noteType,
      semester,
      dueDate,
    }

    const validationResult = NoteFormSchema.safeParse(formData)

    if (!validationResult.success) {
      const newErrors: Record<string, string> = {}
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0]
        if (path) {
          newErrors[path] = issue.message
        }
      })
      setErrors(newErrors)
      return
    }

    setErrors({})

    const noteData: Partial<INoteDTO> = {
      classId,
      dueDate: validationResult.data.dueDate,
      schoolId,
      noteType: validationResult.data.noteType,
      isGraded,
      subjectId: validationResult.data.subject,
      teacherId: user?.id,
      title: validationResult.data.title,
      weight: validationResult.data.weight,
      schoolYearId: schoolYear?.id,
      semesterId: validationResult.data.semester,
      description: validationResult.data.description,
      totalPoints: validationResult.data.totalPoints,
    }

    await onSubmit(noteData)
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setTotalPoints('20')
    setWeight('1')
    setNoteType(NOTE_OPTIONS[0].value)
    setDueDate(new Date())
    setIsGraded(true)
    setErrors({})
  }

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
                {semesters?.length === 2 ? 'Semestre' : semesters?.length === 3 ? 'Trimestre' : ''}
              </CsText>
              <Picker
                selectedValue={semester}
                onValueChange={(value) => {
                  setSemester(value)
                  if (errors.semester)
                    setErrors(prev => ({ ...prev, semester: '' }))
                }}
                style={styles.picker}
              >
                {semesters.map(sm => (
                  <Picker.Item key={sm.id.toString()} label={sm.name} value={sm.id.toString()} />
                ))}
              </Picker>
              {errors.semester && <CsText variant="error" style={styles.errorText}>{errors.semester}</CsText>}
            </View>

            {subjects.length > 1 && (
              <View style={styles.inputContainer}>
                <CsText variant="body">Matière</CsText>
                <Picker
                  selectedValue={subject}
                  onValueChange={(value) => {
                    setSubject(value)
                    if (errors.subject)
                      setErrors(prev => ({ ...prev, subject: '' }))
                  }}
                  style={styles.picker}
                >
                  {subjects.map(sub => (
                    <Picker.Item key={sub.id} label={sub.name} value={sub.id} />
                  ))}
                </Picker>
                {errors.subject && <CsText variant="error" style={styles.errorText}>{errors.subject}</CsText>}
              </View>
            )}

            <View style={styles.inputContainer}>
              <CsText variant="body">Type d'évaluation</CsText>
              <Picker
                selectedValue={noteType}
                onValueChange={(value) => {
                  setNoteType(value)
                  if (errors.noteType)
                    setErrors(prev => ({ ...prev, noteType: '' }))
                }}
                style={styles.picker}
              >
                {NOTE_OPTIONS.map(type => (
                  <Picker.Item key={type.value} label={type.label} value={type.value} />
                ))}
              </Picker>
              {errors.noteType && <CsText variant="error" style={styles.errorText}>{errors.noteType}</CsText>}
            </View>

            <View style={styles.inputContainer}>
              <CsText variant="body">Titre</CsText>
              <CsTextField
                value={title}
                onChangeText={(text) => {
                  setTitle(text)
                  if (errors.title)
                    setErrors(prev => ({ ...prev, title: '' }))
                }}
                label="Titre"
                placeholder="Titre de l'évaluation"
                autoCapitalize="words"
                error={errors.title}
              />
            </View>

            <View style={styles.inputContainer}>
              <CsText variant="body">Description</CsText>
              <CsTextField
                value={description}
                onChangeText={(text) => {
                  setDescription(text)
                  if (errors.description)
                    setErrors(prev => ({ ...prev, description: '' }))
                }}
                label="Description"
                placeholder="Description de l'évaluation"
                autoCapitalize="words"
                multiline
                numberOfLines={3}
                error={errors.description}
              />
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputHalf}>
                <CsText variant="body">Points totaux</CsText>
                <CsTextField
                  value={totalPoints}
                  onChangeText={(text) => {
                    setTotalPoints(text)
                    if (errors.totalPoints)
                      setErrors(prev => ({ ...prev, totalPoints: '' }))
                  }}
                  keyboardType="numeric"
                  label="Points totaux"
                  placeholder="20"
                  error={errors.totalPoints}
                />
              </View>
              <View style={styles.inputHalf}>
                <CsText variant="body">Coefficient</CsText>
                <CsTextField
                  value={weight}
                  onChangeText={(text) => {
                    setWeight(text)
                    if (errors.weight)
                      setErrors(prev => ({ ...prev, weight: '' }))
                  }}
                  keyboardType="numeric"
                  label="Coefficient"
                  placeholder="1"
                  error={errors.weight}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <CsText variant="body">
                Date limite:
                {format(dueDate, 'dd/MM/yyyy')}
              </CsText>
            </TouchableOpacity>
            {errors.dueDate && <CsText variant="error" style={styles.errorText}>{errors.dueDate}</CsText>}

            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false)
                  if (selectedDate) {
                    setDueDate(selectedDate)
                    if (errors.dueDate)
                      setErrors(prev => ({ ...prev, dueDate: '' }))
                  }
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
                  resetForm()
                  onClose()
                }}
                variant="secondary"
              />
              <CsButton
                title="Créer"
                onPress={handleSubmit}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: $black50,
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
    errorText: {
      color: theme.error,
      fontSize: 12,
      marginTop: spacing.xs,
    },
  })
}

export default CreateNoteModal
