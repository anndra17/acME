/**
 * Authentication context interface defining available methods and state
 * for managing user authentication throughout the application.
 * @interface
 */
import { User } from "firebase/auth";


interface AuthContextType {
  /**
   * Authenticates an existing user with their credentials
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<User | undefined>} Authenticated user or undefined
   */
  signIn: (email: string, password: string) => Promise<User | undefined>;

  /**
   * Creates and authenticates a new user account
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} [name] - Optional user's display name
   * @returns {Promise<User | undefined>} Created user or undefined
   */
  signUp: (
    email: string,
    password: string,
    name?: string,
    username?: string,
    dateOfBirth?: string
  ) => Promise<User | undefined>;

  /**
   * Logs out the current user and clears session
   * @returns {void}
   */
  signOut: () => void;

  /** Currently authenticated user */
  user: User | null;
  /** Loading state for authentication operations */
  isLoading: boolean;
  reloadUser: () => Promise<void>; // Add a function to reload from storage
  userRole: 'user' | 'admin' | 'moderator' | 'doctor' | null;
  userRoles: string[]; 
}

export type { AuthContextType };