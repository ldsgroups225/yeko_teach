// src/utils/authErrors.ts

import type { AuthError } from '@supabase/supabase-js'

/**
 * Auth error types
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_NOT_CONFIRMED = 'EMAIL_NOT_CONFIRMED',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

/**
 * Auth error messages in French
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorType, string> = {
  [AuthErrorType.INVALID_CREDENTIALS]: 'Email ou mot de passe incorrect',
  [AuthErrorType.EMAIL_NOT_CONFIRMED]:
    'Veuillez confirmer votre email avant de vous connecter',
  [AuthErrorType.EMAIL_ALREADY_EXISTS]: 'Cette adresse email est déjà utilisée',
  [AuthErrorType.WEAK_PASSWORD]:
    'Le mot de passe doit contenir au moins 6 caractères',
  [AuthErrorType.INVALID_EMAIL]: "Format d'email invalide",
  [AuthErrorType.RATE_LIMIT]:
    'Trop de tentatives. Veuillez réessayer plus tard.',
  [AuthErrorType.NETWORK_ERROR]:
    'Erreur de connexion. Vérifiez votre connexion internet.',
  [AuthErrorType.UNKNOWN_ERROR]: "Une erreur inattendue s'est produite"
}

/**
 * Parse Supabase auth error and return appropriate error type and message
 */
export function parseAuthError(error: AuthError | Error | unknown): {
  type: AuthErrorType
  message: string
} {
  if (!error) {
    return {
      type: AuthErrorType.UNKNOWN_ERROR,
      message: AUTH_ERROR_MESSAGES[AuthErrorType.UNKNOWN_ERROR]
    }
  }

  const errorMessage = (error as Error).message?.toLowerCase() || ''

  // Invalid login credentials
  if (
    errorMessage.includes('invalid login credentials') ||
    errorMessage.includes('invalid credentials')
  ) {
    return {
      type: AuthErrorType.INVALID_CREDENTIALS,
      message: AUTH_ERROR_MESSAGES[AuthErrorType.INVALID_CREDENTIALS]
    }
  }

  // Email not confirmed
  if (
    errorMessage.includes('email not confirmed') ||
    errorMessage.includes('confirm your email')
  ) {
    return {
      type: AuthErrorType.EMAIL_NOT_CONFIRMED,
      message: AUTH_ERROR_MESSAGES[AuthErrorType.EMAIL_NOT_CONFIRMED]
    }
  }

  // Email already exists
  if (
    errorMessage.includes('already registered') ||
    errorMessage.includes('email already exists')
  ) {
    return {
      type: AuthErrorType.EMAIL_ALREADY_EXISTS,
      message: AUTH_ERROR_MESSAGES[AuthErrorType.EMAIL_ALREADY_EXISTS]
    }
  }

  // Weak password
  if (
    errorMessage.includes('password should be at least') ||
    errorMessage.includes('weak password')
  ) {
    return {
      type: AuthErrorType.WEAK_PASSWORD,
      message: AUTH_ERROR_MESSAGES[AuthErrorType.WEAK_PASSWORD]
    }
  }

  // Invalid email
  if (
    errorMessage.includes('invalid email') ||
    errorMessage.includes('email format')
  ) {
    return {
      type: AuthErrorType.INVALID_EMAIL,
      message: AUTH_ERROR_MESSAGES[AuthErrorType.INVALID_EMAIL]
    }
  }

  // Rate limit
  if (
    errorMessage.includes('rate limit') ||
    errorMessage.includes('too many requests')
  ) {
    return {
      type: AuthErrorType.RATE_LIMIT,
      message: AUTH_ERROR_MESSAGES[AuthErrorType.RATE_LIMIT]
    }
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout')
  ) {
    return {
      type: AuthErrorType.NETWORK_ERROR,
      message: AUTH_ERROR_MESSAGES[AuthErrorType.NETWORK_ERROR]
    }
  }

  // Default to unknown error
  return {
    type: AuthErrorType.UNKNOWN_ERROR,
    message:
      (error as Error).message ||
      AUTH_ERROR_MESSAGES[AuthErrorType.UNKNOWN_ERROR]
  }
}

/**
 * Get user-friendly error message from auth error
 */
export function getAuthErrorMessage(
  error: AuthError | Error | unknown
): string {
  const { message } = parseAuthError(error)
  return message
}

/**
 * Check if error is recoverable (user can retry)
 */
export function isRecoverableAuthError(
  error: AuthError | Error | unknown
): boolean {
  const { type } = parseAuthError(error)

  // These errors are recoverable - user can fix them
  const recoverableErrors = [
    AuthErrorType.INVALID_CREDENTIALS,
    AuthErrorType.WEAK_PASSWORD,
    AuthErrorType.INVALID_EMAIL,
    AuthErrorType.NETWORK_ERROR
  ]

  return recoverableErrors.includes(type)
}

/**
 * Check if error requires email confirmation
 */
export function requiresEmailConfirmation(
  error: AuthError | Error | unknown
): boolean {
  const { type } = parseAuthError(error)
  return type === AuthErrorType.EMAIL_NOT_CONFIRMED
}

/**
 * Check if error is due to rate limiting
 */
export function isRateLimitError(error: AuthError | Error | unknown): boolean {
  const { type } = parseAuthError(error)
  return type === AuthErrorType.RATE_LIMIT
}

/**
 * Get suggested action for auth error
 */
export function getAuthErrorAction(error: AuthError | Error | unknown): string {
  const { type } = parseAuthError(error)

  switch (type) {
    case AuthErrorType.INVALID_CREDENTIALS:
      return 'Vérifiez votre email et mot de passe'
    case AuthErrorType.EMAIL_NOT_CONFIRMED:
      return 'Vérifiez votre boîte email et cliquez sur le lien de confirmation'
    case AuthErrorType.EMAIL_ALREADY_EXISTS:
      return 'Utilisez une autre adresse email ou connectez-vous'
    case AuthErrorType.WEAK_PASSWORD:
      return 'Utilisez un mot de passe plus fort'
    case AuthErrorType.INVALID_EMAIL:
      return 'Vérifiez le format de votre adresse email'
    case AuthErrorType.RATE_LIMIT:
      return 'Attendez quelques minutes avant de réessayer'
    case AuthErrorType.NETWORK_ERROR:
      return 'Vérifiez votre connexion internet'
    default:
      return 'Réessayez ou contactez le support'
  }
}
