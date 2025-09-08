// src/utils/validation.ts

import { z } from 'zod'

/**
 * Password strength levels
 */
export enum PasswordStrength {
  WEAK = 0,
  FAIR = 1,
  GOOD = 2,
  STRONG = 3,
  VERY_STRONG = 4
}

/**
 * Validation error types
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/

/**
 * Phone number validation regex (international format)
 */
const PHONE_REGEX = /^\+?[1-9]\d{0,15}$/

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule')
  .regex(/\d/, 'Le mot de passe doit contenir au moins un chiffre')
  .regex(
    /[^a-z\d]/i,
    'Le mot de passe doit contenir au moins un caractère spécial'
  )

/**
 * Email validation schema
 */
export const emailSchema = z
  .string()
  .min(1, "L'adresse email est requise")
  .email("Format d'email invalide")
  .refine(email => EMAIL_REGEX.test(email), "Format d'email invalide")

/**
 * Name validation schema
 */
export const nameSchema = z
  .string()
  .min(2, 'Le nom doit contenir au moins 2 caractères')
  .max(50, 'Le nom ne peut pas dépasser 50 caractères')
  .regex(
    /^[a-zA-Z\u00C0-\u00FF\s'-]+$/,
    'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets'
  )

/**
 * Phone validation schema
 */
export const phoneSchema = z
  .string()
  .min(1, 'Le numéro de téléphone est requis')
  .refine(
    phone => PHONE_REGEX.test(phone),
    'Format de numéro de téléphone invalide'
  )

/**
 * Sign up form validation schema
 */
export const signUpSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'La confirmation du mot de passe est requise')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  })

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Le mot de passe est requis')
})

/**
 * Complete profile form validation schema
 */
export const completeProfileSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema
})

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema
})

/**
 * Reset password form validation schema
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z
      .string()
      .min(1, 'La confirmation du mot de passe est requise')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  })

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) return PasswordStrength.WEAK

  let score = 0

  // Length check
  if (password.length >= 8) score++
  if (password.length >= 12) score++

  // Character variety checks
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-z\d]/i.test(password)) score++

  // Bonus for very long passwords
  if (password.length >= 16) score++

  // Map score to strength levels
  if (score <= 2) return PasswordStrength.WEAK
  if (score === 3) return PasswordStrength.FAIR
  if (score === 4) return PasswordStrength.GOOD
  if (score === 5) return PasswordStrength.STRONG
  return PasswordStrength.VERY_STRONG
}

/**
 * Validate form data with Zod schema
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult {
  try {
    schema.parse(data)
    return { isValid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
      return { isValid: false, errors }
    }
    return {
      isValid: false,
      errors: [{ field: 'general', message: 'Erreur de validation' }]
    }
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  return PHONE_REGEX.test(phone)
}

/**
 * Check if password meets minimum requirements
 */
export function isPasswordValid(password: string): boolean {
  return passwordSchema.safeParse(password).success
}

/**
 * Get password strength text
 */
export function getPasswordStrengthText(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.WEAK:
      return 'Faible'
    case PasswordStrength.FAIR:
      return 'Moyen'
    case PasswordStrength.GOOD:
      return 'Bon'
    case PasswordStrength.STRONG:
      return 'Fort'
    case PasswordStrength.VERY_STRONG:
      return 'Très fort'
    default:
      return 'Faible'
  }
}

/**
 * Get password strength color
 */
export function getPasswordStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case PasswordStrength.WEAK:
      return '#FF4444'
    case PasswordStrength.FAIR:
      return '#FF8800'
    case PasswordStrength.GOOD:
      return '#FFBB33'
    case PasswordStrength.STRONG:
      return '#00C851'
    case PasswordStrength.VERY_STRONG:
      return '#007E33'
    default:
      return '#FF4444'
  }
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim() // Remove leading/trailing whitespace
}

/**
 * Validate OTP code
 */
export function isValidOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp)
}

/**
 * Generate validation error message for field
 */
export function getFieldError(
  errors: ValidationError[],
  field: string
): string | undefined {
  return errors.find(error => error.field === field)?.message
}
