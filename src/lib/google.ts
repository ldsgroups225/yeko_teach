import process from 'node:process'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { supabase } from '@src/lib/supabase/config'

// Role constants - TEACHER
const ERole = {
  TEACHER: 2,
  PARENT: 1
} as const

// Types
interface GoogleAuthResult {
  success: boolean
  user?: any
  error?: string
}

interface GoogleProfile {
  sub: string
  email: string
  name: string
  picture?: string
  given_name?: string
  family_name?: string
  email_verified?: boolean
}

/**
 * Configures the Google Sign-In module.
 */
export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true // Required to get the idToken
  })
}

/**
 * Sign in with Google for existing users
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  try {
    await GoogleSignin.hasPlayServices()
    const userInfo = await GoogleSignin.signIn()

    if (!userInfo.data?.idToken) {
      return { success: false, error: 'No ID token received from Google' }
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.data.idToken
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch (error: any) {
    return { success: false, error: error.message || 'Google sign-in failed' }
  }
}

/**
 * Sign up with Google for new users
 */
export async function signUpWithGoogle(): Promise<GoogleAuthResult> {
  try {
    await GoogleSignin.hasPlayServices()
    const userInfo = await GoogleSignin.signIn()

    if (!userInfo.data?.idToken) {
      return { success: false, error: 'No ID token received from Google' }
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.data.idToken
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, user: data.user }
  } catch (error: any) {
    return { success: false, error: error.message || 'Google sign-up failed' }
  }
}

/**
 * Sign out from Google
 */
export async function signOutGoogle(): Promise<void> {
  try {
    await GoogleSignin.signOut()
    await supabase.auth.signOut()
  } catch (error) {
    console.error('Error signing out from Google:', error)
    throw error
  }
}

/**
 * Ensure user has TEACHER role assigned automatically
 */
export async function ensureUserHasTeacherRole(
  userId: string,
  userEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if user already has TEACHER role
    const { data: existingRole, error: _roleCheckError } = await supabase
      .from('user_roles')
      .select('role_id')
      .eq('user_id', userId)
      .eq('role_id', ERole.TEACHER)
      .single()

    // If user already has TEACHER role, we're done
    if (existingRole) {
      return { success: true }
    }

    // Create user profile if it doesn't exist
    const { error: profileError } = await supabase.from('users').upsert({
      id: userId,
      email: userEmail,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    if (profileError) {
      console.warn('Profile creation error:', profileError)
    }

    // Create TEACHER role for the user
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: userId,
      role_id: ERole.TEACHER
    })

    if (roleError) {
      console.error('Role assignment error:', roleError)
      return { success: false, error: roleError.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error ensuring TEACHER role:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create user profile from Google OAuth data
 */
export async function createUserFromGoogleProfile(
  userId: string,
  googleProfile: GoogleProfile
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create user profile with Google data
    const { error: profileError } = await supabase.from('users').upsert({
      id: userId,
      email: googleProfile.email,
      first_name: googleProfile.given_name || googleProfile.name.split(' ')[0],
      last_name:
        googleProfile.family_name ||
        googleProfile.name.split(' ').slice(1).join(' '),
      avatar_url: googleProfile.picture,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      return { success: false, error: profileError.message }
    }

    // Assign TEACHER role
    const { error: roleError } = await supabase.from('user_roles').insert({
      user_id: userId,
      role_id: ERole.TEACHER
    })

    if (roleError) {
      console.error('Role assignment error:', roleError)
      return { success: false, error: roleError.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error creating user from Google profile:', error)
    return { success: false, error: error.message }
  }
}
