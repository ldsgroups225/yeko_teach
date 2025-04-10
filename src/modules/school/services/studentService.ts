// src/modules/school/services/studentService.ts

import { supabase } from '@src/lib/supabase'

export const students = {
  async getClassStudents(classId: string) {
    const { data, error } = await supabase
      .from('student_school_class')
      .select(`
        student_id,
        students (
          id,
          first_name,
          last_name
        )
      `)
      .eq('class_id', classId)
      .eq('is_active', true)
      .order('last_name', { ascending: true, referencedTable: 'students' })
      .order('first_name', { ascending: true, referencedTable: 'students' })

    if (error) {
      console.error('Error getting students:', error)
      throw new Error('Erreur lors de la récupération des élèves de cette classe')
    }

    if (!data || data.length === 0) {
      throw new Error('Aucun élève trouvé dans cette classe')
    }

    return data.map(student => ({
      id: student.student_id,
      firstName: student.students.first_name,
      lastName: student.students.last_name,
    }))
  },
}
