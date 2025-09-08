// src/modules/school/services/teachSubjectsInClassService.ts

import { supabase } from '@src/lib/supabase'

export const subjects = {
  async getTeachSubjectsInClass(classId: string) {
    const { data, error } = await supabase
      .from('teacher_class_assignments')
      .select(`
      subject_id,
      subjects (
        name
      )
    `)
      .eq('class_id', classId)

    if (error) {
      console.error('Error getting subjects:', error)
      throw new Error(
        'Erreur lors de la récupération des matières enseignées dans cette classe'
      )
    }

    return data.map(subject => ({
      id: subject.subject_id,
      name: subject.subjects.name
    }))
  }
}
