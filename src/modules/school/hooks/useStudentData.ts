// src/modules/school/hooks/useStudentData.ts

import type { IStudentDTO } from '@modules/app/types/ILoginDTO'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useState } from 'react'
import { Alert } from 'react-native'

/**
 * Custom hook to handle loading and saving student data.
 * @param classId - The ID of the class.
 * @param subjectId - The ID of the subject.
 * @param initialData - Mock data to use if no data is found in AsyncStorage.
 * @returns An array of students and functions to update or reset them.
 */
export function useStudentData(classId: string, subjectId: string, initialData: IStudentDTO[]) {
  const [students, setStudents] = useState<IStudentDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const storedStudents = await AsyncStorage.getItem(
          `class_${classId}_subject_${subjectId}_students`,
        )
        if (storedStudents) {
          setStudents(JSON.parse(storedStudents))
        }
        else {
          setStudents(initialData)
        }
      }
      catch (error) {
        console.error('Failed to load students:', error)
        Alert.alert('Error', 'Failed to load student data. Please try again.')
      }
      finally {
        setIsLoading(false)
      }
    }

    loadStudents().then(r => r)
  }, [classId, initialData])

  const saveStudents = async (updatedStudents: IStudentDTO[]) => {
    try {
      await AsyncStorage.setItem(
        `class_${classId}_subject_${subjectId}_students`,
        JSON.stringify(updatedStudents),
      )
    }
    catch (error) {
      console.error('Failed to save students:', error)
      Alert.alert('Error', 'Failed to save student data. Please try again.')
    }
  }

  return { students, setStudents, saveStudents, isLoading }
}
