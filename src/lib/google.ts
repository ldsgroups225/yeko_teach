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
  user?: unknown
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
 * Configure Google Sign-In with client IDs
 * Call this once when the app starts
 */
export function configureGoogleSignIn(): void {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID
  const iosClientId = process.env.EXPO_PUBLIC_IOS_CLIENT_ID

  if (!webClientId) {
    console.warn(
      "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID introuvable dans l'environnement"
    )
    return
  }

  GoogleSignin.configure({
    webClientId, // From Google Cloud Console (Web client)
    iosClientId, // From Google Cloud Console (iOS client) - optional
    scopes: ['email', 'profile'],
    offlineAccess: true, // For refresh tokens
    forceCodeForRefreshToken: true
  })
}

/**
 * Sign in with Google for existing users
 * Adapted from your web implementation
 */
export async function signInWithGoogle(): Promise<GoogleAuthResult> {
  try {
    // Check if Google Play Services are available (Android)
    await GoogleSignin.hasPlayServices()

    // Sign in to Google
    const userInfo = await GoogleSignin.signIn()

    if (!userInfo.data?.idToken) {
      throw new Error('Erreur lors de la connexion avec Google')
    }

    // Sign in to Supabase with Google ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.data.idToken
    })

    if (error) {
      return { success: false, error: (error as { message: string }).message }
    }

    if (!data.user) {
      throw new Error('Erreur lors de la connexion avec Google')
    }

    // Ensure user has TEACHER role - create if doesn't exist
    const roleResult = await ensureUserHasTeacherRole(
      data.user.id,
      data.user.email || ''
    )
    if (!roleResult.success) {
      throw new Error(
        roleResult.error || "Oups, vous n'avez pas de compte enseignant"
      )
    }

    return { success: true, user: data.user }
  } catch (error: unknown) {
    return {
      success: false,
      error: (error as any).message || 'Erreur lors de la connexion avec Google'
    }
  }
}

/**
 * Sign up with Google for new users
 */
export async function signUpWithGoogle(): Promise<GoogleAuthResult> {
  try {
    // Check if Google Play Services are available (Android)
    await GoogleSignin.hasPlayServices()

    // Sign in to Google to get user info
    const userInfo = await GoogleSignin.signIn()

    if (!userInfo.data?.idToken) {
      throw new Error('Erreur lors de la connexion avec Google')
    }

    // Sign up to Supabase with Google ID token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: userInfo.data.idToken
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Erreur lors de la connexion avec Google')
    }

    // Ensure user has TEACHER role - create if doesn't exist
    const roleResult = await ensureUserHasTeacherRole(
      data.user.id,
      data.user.email || ''
    )
    if (!roleResult.success) {
      throw new Error(
        roleResult.error || "Oups, vous n'avez pas de compte enseignant"
      )
    }

    // Check if this is a new user (created less than 1 minute ago)
    const userCreatedAt = new Date(data.user.created_at).getTime()
    const now = Date.now()
    const isNewUser = now - userCreatedAt < 60000 // Less than 1 minute

    if (isNewUser) {
      // Create user profile from Google data
      await createUserFromGoogleProfile(data.user.id, {
        sub: data.user.id,
        email: data.user.email || '',
        name:
          data.user.user_metadata?.full_name ||
          data.user.user_metadata?.name ||
          '',
        picture:
          data.user.user_metadata?.picture ||
          data.user.user_metadata?.avatar_url,
        given_name: data.user.user_metadata?.given_name,
        family_name: data.user.user_metadata?.family_name,
        email_verified: data.user.email_confirmed_at !== null
      })
    }

    return { success: true, user: data.user }
  } catch (error: unknown) {
    return {
      success: false,
      error: (error as any).message || 'Google sign-up failed'
    }
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
  } catch (error: unknown) {
    console.error('Error ensuring TEACHER role:', error)
    return { success: false, error: (error as any).message }
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
  } catch (error: unknown) {
    console.error('Error creating user from Google profile:', error)
    return { success: false, error: (error as any).message }
  }
}
