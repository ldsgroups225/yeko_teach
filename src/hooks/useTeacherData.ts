// src/hooks/useTeacherData.ts

import type { ITeacherDataRawDTO, IUserDTO } from '@modules/app/types/ILoginDTO'
import { transformUserData } from '@modules/app/utils/dataTransformUtils'
import { supabase } from '@src/lib/supabase'
import { useCallback } from 'react'

export function useTeacherData() {
  const fetchTeacherData = useCallback(
    async (userId: string): Promise<IUserDTO | null> => {
      const { data: userData, error } = await supabase
        .rpc('get_teacher_data', { user_id: userId })
        .single()

      if (error) {
        console.error('[E_FETCH_TEACHER_DATA]:', error)
        return null
      }

      if (!userData) {
        throw new Error("Données de l'enseignant non disponibles.")
      }

      if (userData && typeof userData === 'object' && 'id' in userData) {
        return transformUserData(userData as unknown as ITeacherDataRawDTO)
      }

      console.error('[E_FETCH_TEACHER_DATA]: Invalid data structure')
      return {
        id: userId,
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        schools: []
      }
    },
    []
  )

  return { fetchTeacherData }
}
