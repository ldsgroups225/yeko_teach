import { supabase } from "@src/lib/supabase";
import {
  AuthError,
  AuthResponse,
  AuthTokenResponsePassword,
  Session,
} from "@supabase/auth-js";
import { ERole } from "@modules/app/types/ILoginDTO";

interface IGetSession {
  data: {
    session: Session | null;
  };
  error: AuthError | null;
}

/**
 * Authentication service for handling user accounts and sessions using Supabase.
 */
export const auth = {
  /**
   * Creates a new user account and assigns a role.
   *
   * @param {string} email - The email address of the user.
   * @param {string} password - The password for the new account.
   * @param {string} [firstName] - The user's first name (optional).
   * @param {string} [lastName] - The user's last name (optional).
   * @param {string} [phone] - The user's phone number (optional).
   * @returns {Promise<AuthResponse>} - The response from the Supabase sign-up request.
   */
  async createAccount(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    phone?: string
  ): Promise<AuthResponse> {
    const newAccountResponse = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone: phone,
        },
      },
    });

    if (newAccountResponse.error) {
      console.error("Error creating account:", newAccountResponse.error);
      return newAccountResponse;
    }

    const newRoleResponse = await supabase.from("user_roles").insert({
      user_id: newAccountResponse.data.user!.id,
      role_id: ERole.TEACHER,
    });

    if (newRoleResponse.error) {
      console.error("Error assigning role:", newRoleResponse.error);
    }

    return newAccountResponse;
  },

  /**
   * Logs in a user using email and password.
   *
   * @param {string} email - The user's email address.
   * @param {string} password - The user's password.
   * @returns {Promise<AuthTokenResponsePassword>} - The response containing the session data.
   */
  async loginWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<AuthTokenResponsePassword> {
    const response = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (response.error) {
      console.error("Error creating session:", response.error);
    }

    return response;
  },

  /**
   * Retrieves the current session information of the authenticated user.
   *
   * @returns {Promise<IGetSession>} - An object containing session data or an error.
   */
  async getAccount(): Promise<IGetSession> {
    const response = await supabase.auth.getSession();

    if (response.error) {
      console.error("Error getting account information:", response.error);
    }

    return response;
  },

  /**
   * Deletes the current user session.
   *
   * @returns {Promise<{ error: AuthError | null }>} - The result of the sign-out request, with potential errors.
   */
  async deleteSession(): Promise<{ error: AuthError | null }> {
    const response = await supabase.auth.signOut();

    if (response.error) {
      console.error("Error deleting session:", response.error);
    }

    return response;
  },
};
