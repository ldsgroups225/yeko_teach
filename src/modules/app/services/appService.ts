import type {
  AuthError,
  AuthTokenResponsePassword,
  Session,
} from '@supabase/auth-js'
import type { PostgrestError } from '@supabase/supabase-js'
import { supabase } from '@src/lib/supabase'

interface IGetSession {
  data: {
    session: Session | null
  }
  error: AuthError | null
}

interface SchoolYear {
  id: number
  name: string | null
}

interface Semester {
  id: number
  name: string
  isCurrent: boolean
}

interface SchoolYearWithSemesters {
  schoolYear: SchoolYear | null
  semesters: Semester[]
}

/**
 * Authentication service for handling user accounts and sessions using Supabase.
 */
export const auth = {
  /**
   * Logs in a user using email and password.
   *
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<AuthTokenResponsePassword>} - The response containing the session data.
   */
  async loginWithEmailAndPassword(
    email: string,
    password: string,
  ): Promise<AuthTokenResponsePassword> {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (response.error) {
      if (response.error.message === 'Invalid login credentials')
        throw new Error('Email ou mot de passe incorrect')
      else
        throw new Error('Une erreur est survenue')
    }

    return response
  },

  /**
   * Retrieves the current session information of the authenticated user.
   *
   * @returns {Promise<IGetSession>} - An object containing session data or an error.
   */
  async getAccount(): Promise<IGetSession> {
    const response = await supabase.auth.getSession()

    if (response.error) {
      console.error('Error getting account information:', response.error)
    }

    return response
  },

  /**
   * Deletes the current user session.
   *
   * @returns {Promise<{ error: AuthError | null }>} - The result of the sign-out request, with potential errors.
   */
  async deleteSession(): Promise<{ error: AuthError | null }> {
    const response = await supabase.auth.signOut()

    if (response.error) {
      console.error('Error deleting session:', response.error)
    }

    return response
  },
}

export const schoolYear = {
  /**
   * Fetches the current school year based on the current date and its related semesters.
   * A school year is considered current if the current date falls between its start_date and end_date.
   *
   * @returns {Promise<SchoolYearWithSemesters>} The current school year and its semesters
   */
  async getCurrentSchoolYearWithSemesters(): Promise<{
    data: SchoolYearWithSemesters | null
    error: PostgrestError | null
  }> {
    try {
      // First, fetch the current school year
      const { data: schoolYearData, error: schoolYearError } = await supabase
        .from('school_years')
        .select('*')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .single()

      if (schoolYearError) {
        throw schoolYearError
      }

      if (!schoolYearData) {
        return {
          data: null,
          error: null,
        }
      }

      // Then fetch related semesters
      const { data: semestersData, error: semestersError } = await supabase
        .from('semesters')
        .select('*')
        .eq('school_year_id', schoolYearData.id)
        .order('start_date', { ascending: true })

      if (semestersError) {
        throw semestersError
      }

      return {
        data: {
          schoolYear: {
            id: schoolYearData.id,
            name: schoolYearData.academic_year_name,
          },
          semesters: semestersData.map(semester => ({
            id: semester.id,
            name: semester.semester_name,
            isCurrent: semester.is_current,
          })),
        },
        error: null,
      }
    }
    catch (error) {
      console.error('Error fetching current school year:', error)
      return {
        data: null,
        error: error as PostgrestError,
      }
    }
  },

  /**
   * Gets the current semester based on the current date.
   *
   * @returns {Promise<Semester | null>} The current semester or null if not found
   */
  async getCurrentSemester(): Promise<{
    data: Semester | null
    error: PostgrestError | null
  }> {
    try {
      const { data: semesterData, error: semesterError } = await supabase
        .from('semesters')
        .select('*')
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .single()

      if (semesterError) {
        throw semesterError
      }

      return {
        data: {
          id: semesterData.id,
          name: semesterData.semester_name,
          isCurrent: semesterData.is_current,
        },
        error: null,
      }
    }
    catch (error) {
      console.error('Error fetching current semester:', error)
      return {
        data: null,
        error: error as PostgrestError,
      }
    }
  },
}
