// src/modules/school/services/schoolJoinService.ts

import { supabase } from '@src/lib/supabase'

interface JoinSchoolResponse {
  success: boolean
  message: string
  error?: unknown
}

/**
 * Service for handling the process of joining a school using an OTP.
 */
export const schoolJoinService = {
  /**
   * Verifies the OTP and links the teacher to the school if valid.
   *
   * @param {string} otp - The OTP provided by the teacher.
   * @param {string} teacherId - The ID of the teacher trying to join.
   * @returns {Promise<JoinSchoolResponse>} - The response containing the result of the join attempt.
   */
  async joinSchoolWithOtp(
    otp: string,
    teacherId: string
  ): Promise<JoinSchoolResponse> {
    try {
      // First, check if the OTP is valid and not expired
      const { data, error } = await supabase
        .from('invite_to_school')
        .select('id, school_id')
        .eq('otp', otp)
        .eq('is_used', false)
        .gte('expired_at', new Date().toISOString())
        .single()

      if (error || !data) {
        return {
          success: false,
          message: 'Invalid or expired OTP',
          error
        }
      }

      // If OTP is valid, update the record
      const { error: teacherApplingToSchoolError } = await supabase
        .from('schools_teachers')
        .insert({
          school_id: data.school_id,
          teacher_id: teacherId
        })
        .eq('id', data.id)

      if (teacherApplingToSchoolError) {
        const isDuplicationError = teacherApplingToSchoolError.code === '23505'

        if (!isDuplicationError) {
          return {
            success: false,
            message: 'Failed to join school',
            error: teacherApplingToSchoolError
          }
        }
      }

      // If success join
      const { error: updateError } = await supabase
        .from('invite_to_school')
        .update({
          is_used: true
        })
        .eq('id', data.id)

      if (updateError) {
        return {
          success: false,
          message: 'Failed to join school',
          error: updateError
        }
      }
      return {
        success: true,
        message: 'Successfully joined school'
      }
    } catch (error) {
      console.error('Error joining school:', error)
      return {
        success: false,
        message: 'An unexpected error occurred',
        error
      }
    }
  }
}
