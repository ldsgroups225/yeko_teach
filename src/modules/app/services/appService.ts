import { supabase } from "@src/lib/supabase";
import {
  AuthError,
  AuthTokenResponsePassword,
  Session,
} from "@supabase/auth-js";

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
