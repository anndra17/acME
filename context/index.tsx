
/**
 * Authentication context module providing global auth state and methods.
 * @module
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import {
  login,
  logout,
  register,
} from "../lib/firebase-service";
import { auth } from "../lib/firebase-config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { addUserToFirestore } from "../lib/firebase-service";

// ============================================================================
// Types & Interfaces
// ============================================================================

/**
 * Authentication context interface defining available methods and state
 * for managing user authentication throughout the application.
 * @interface
 */

const USER_STORAGE_KEY = "@user"; // A constant for the storage key

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
}

// ============================================================================
// Context Creation
// ============================================================================

/**
 * Authentication context instance
 * @type {React.Context<AuthContextType>}
 */
const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ============================================================================
// Hook
// ============================================================================

/**
 * Custom hook to access authentication context
 * @returns {AuthContextType} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export function useSession(): AuthContextType {
  const value = useContext(AuthContext);

  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

// ============================================================================
// Provider Component
// ============================================================================

/**
 * SessionProvider component that manages authentication state
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export function SessionProvider(props: { children: React.ReactNode }) {
  // ============================================================================
  // State & Hooks
  // ============================================================================

  /**
   * Current authenticated user state
   * @type {[User | null, React.Dispatch<React.SetStateAction<User | null>>]}
   */
  const [user, setUser] = useState<User | null>(null);

  /**
   * Loading state for authentication operations
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isLoading, setIsLoading] = useState(true);

  // ============================================================================
  // Effects
  // ============================================================================

  /**
   * Sets up Firebase authentication state listener
   * Automatically updates user state on auth changes
   */

  // Load user from AsyncStorage on component mount
  useEffect(() => {
    const loadUserFromStorage = async () => {
      setIsLoading(true); // Set loading true while we fetch
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
          // Important: AsyncStorage stores strings so i need to parse it
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading user from AsyncStoage: ", error);
        // Handle error ( e.g. show a message, clear potentially corrupted data)
        await AsyncStorage.removeItem(USER_STORAGE_KEY); // Clear bad data
      } finally {
        setIsLoading(false); // Set loading to false after fetching (succes or failure)
      }
    };

    loadUserFromStorage();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Store the user in AsyncStorage
        try {
          await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(firebaseUser));
        } catch (error){
          console.error("Error storing user in AsyncStorage: ", error);
          // Handle error (e.g. Show message to the user)
        }
      } else {
        setUser(null);
        // Remove the user from AsyncStorage on logout
        try {
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
        } catch (error) {
          console.error("Error removing user from AsyncStorage: ", error);
          // Handle error
        }
      }
       if (isLoading) {
        // Only set isLoading to false, the first time
          setIsLoading(false);
       }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isLoading]);

  // ============================================================================
  // Handlers
  // ============================================================================

  /**
   * Handles user sign-in process
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<User | undefined>} Authenticated user or undefined
   */
  const handleSignIn = async (email: string, password: string) => {
    try {
      const response = await login(email, password);
      return response?.user;
    } catch (error) {
      console.error("[handleSignIn error] ==>", error);
      return undefined;
    }
  };

  /**
   * Handles new user registration process
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} [name] - Optional user's display name
   * @returns {Promise<User | undefined>} Created user or undefined
   */
  const handleSignUp = async (
    email: string,
    password: string,
    name?: string,
    username?: string,
    dateOfBirth?: string
  ) => {
    try {
      const response = await register(email, password, name, username, dateOfBirth);
          if(response?.user) {
             await addUserToFirestore(response.user.uid, name || '', username || '', dateOfBirth || '');
          }
          return response?.user;
    } catch (error) {
      console.error("[handleSignUp error] ==>", error);
      return undefined;
    }
  };

  /**
   * Handles user sign-out process
   * Clears local user state after successful logout
   */
  const handleSignOut = async () => {
    try {
      await logout();
      setUser(null);
    } catch (error) {
      console.error("[handleSignOut error] ==>", error);
    }
  };

   /**
   * Reloads the user from local storage and updates the state
   */

   const reloadUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error reloading user from AsyncStorage:", error);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <AuthContext.Provider
      value={{
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
        user,
        isLoading,
        reloadUser // Expose the reload function
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}