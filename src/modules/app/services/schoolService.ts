// src/modules/app/services/schoolService.ts

import { supabase } from '@src/lib/supabase'
import type { PostgrestError } from '@supabase/supabase-js'

export interface ISchool {
  id: string
  name: string
  address?: string | null
  phone?: string | null
  email?: string | null
  code?: string | null
  logo_url?: string | null
  created_at: string | null
  updated_at: string | null
  city?: string
  cycle_id?: string
  image_url?: string | null
  is_technical_education?: boolean | null
  created_by?: string | null
  updated_by?: string | null
}

export interface ISchoolTeacher {
  id?: string
  teacher_id: string
  school_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string | null
  updated_at: string | null
  created_by?: string | null
  updated_by?: string | null
  school: ISchool
}

export interface SchoolServiceResponse<T> {
  data: T | null
  error: PostgrestError | null
}

/**
 * School service for managing school-related operations
 */
export const schoolService = {
  /**
   * Get all available schools
   */
  async getSchools(): Promise<SchoolServiceResponse<ISchool[]>> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .order('name', { ascending: true })

      return { data: data as ISchool[] | null, error }
    } catch (error) {
      console.error('Error fetching schools:', error)
      return { data: null, error: error as PostgrestError }
    }
  },

  /**
   * Get a specific school by ID
   */
  async getSchoolById(
    schoolId: string
  ): Promise<SchoolServiceResponse<ISchool>> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single()

      return { data: data as ISchool | null, error }
    } catch (error) {
      console.error('Error fetching school:', error)
      return { data: null, error: error as PostgrestError }
    }
  },

  /**
   * Get teacher's school relationships
   */
  async getTeacherSchools(
    _teacherId: string
  ): Promise<SchoolServiceResponse<ISchoolTeacher[]>> {
    try {
      // Note: This is a simplified version that may need adjustment based on actual schema
      console.warn(
        'getTeacherSchools: Using simplified implementation due to schema constraints'
      )

      return {
        data: [],
        error: null
      }
    } catch (error) {
      console.error('Error fetching teacher schools:', error)
      return { data: null, error: error as PostgrestError }
    }
  },

  /**
   * Join a school using OTP code
   * Note: Temporarily simplified due to schema mismatch
   */
  async joinSchoolWithOTP(
    _teacherId: string,
    _otpCode: string
  ): Promise<SchoolServiceResponse<ISchoolTeacher>> {
    try {
      // TODO: Implement proper OTP verification once schema is fixed
      console.warn(
        'OTP school joining temporarily disabled due to schema mismatch'
      )

      return {
        data: null,
        error: {
          message: 'Fonctionnalité temporairement indisponible',
          details: 'Schema mismatch - school_otp_codes table not found',
          hint: '',
          code: 'FEATURE_DISABLED'
        } as PostgrestError
      }
    } catch (error) {
      console.error('Error joining school with OTP:', error)
      return { data: null, error: error as PostgrestError }
    }
  },

  /**
   * Request to join a school (without OTP)
   */
  async requestToJoinSchool(
    _teacherId: string,
    _schoolId: string
  ): Promise<SchoolServiceResponse<ISchoolTeacher>> {
    try {
      // TODO: Implement school join request once schema is clarified
      console.warn(
        'School join request temporarily disabled due to schema mismatch'
      )

      return {
        data: null,
        error: {
          message: 'Fonctionnalité temporairement indisponible',
          details: 'Schema mismatch - schools_teachers table structure unclear',
          hint: '',
          code: 'FEATURE_DISABLED'
        } as PostgrestError
      }
    } catch (error) {
      console.error('Error requesting to join school:', error)
      return { data: null, error: error as PostgrestError }
    }
  },

  /**
   * Search schools by name or code
   */
  async searchSchools(
    query: string
  ): Promise<SchoolServiceResponse<ISchool[]>> {
    try {
      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .or(`name.ilike.%${query}%,code.ilike.%${query}%`)
        .order('name', { ascending: true })
        .limit(20)

      return { data: data as ISchool[] | null, error }
    } catch (error) {
      console.error('Error searching schools:', error)
      return { data: null, error: error as PostgrestError }
    }
  }
}
