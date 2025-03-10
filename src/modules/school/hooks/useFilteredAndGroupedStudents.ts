// src/modules/school/hooks/useFilteredAndGroupedStudents.ts

import type { IStudentDTO } from '@modules/app/types/ILoginDTO'
import { useMemo } from 'react'

/**
 * Custom hook to filter, sort, and group students.
 * @param students - The list of students.
 * @param searchQuery - The search term to filter students.
 * @param sortOrder - The order in which to sort students.
 * @returns Filtered and grouped students.
 */
export function useFilteredAndGroupedStudents(students: IStudentDTO[], searchQuery: string, sortOrder: 'asc' | 'desc') {
  const filteredAndSortedStudents = useMemo(() => {
    return students
      .filter(
        student =>
          student.firstName.toLowerCase().includes(searchQuery.toLowerCase())
          || student.lastName.toLowerCase().includes(searchQuery.toLowerCase())
          || student.idNumber.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        const compareResult = a.lastName.localeCompare(b.lastName)
        return sortOrder === 'asc' ? compareResult : -compareResult
      })
  }, [students, searchQuery, sortOrder])

  const groupedStudents = useMemo(() => {
    const grouped = filteredAndSortedStudents.reduce((acc, student) => {
      const firstLetter = student.lastName[0].toUpperCase()
      if (!acc[firstLetter]) {
        acc[firstLetter] = []
      }
      acc[firstLetter].push(student)
      return acc
    }, {} as Record<string, IStudentDTO[]>)

    return Object.entries(grouped).map(([letter, students]) => ({
      title: letter,
      data: students,
    }))
  }, [filteredAndSortedStudents])

  return groupedStudents
}
