/**
 * Firebase authentication service module.
 * Provides methods for user authentication and session management.
 * @module
 */

import { 
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    User,
    UserCredential
  } from 'firebase/auth';
  import { auth, storage, firestore } from './firebase-config';
  import { setDoc, doc, getDocs, collection, query, where, addDoc, Timestamp } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

  
  // ============================================================================
  // Types & Interfaces
  // ============================================================================
  
  /**
   * User response structure from Firebase Authentication
   * @interface
   */
  export interface FirebaseUserResponse {
    user: User;
  }
  
  // ============================================================================
  // Authentication Services
  // ============================================================================
  
  /**
   * Retrieves the current authenticated user and their session
   * Utilizes Firebase's onAuthStateChanged to provide real-time auth state
   * @returns {Promise<{ user: User | null }>} Current user object or null
   * @throws {Error} If there's an error accessing Firebase Auth
   */
  export const getCurrentUser = async () => {
    try {
      return new Promise((resolve) => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
          unsubscribe();
          resolve(user ? { user } : null);
        });
      });
    } catch (error) {
      console.error("[error getting user] ==>", error);
      return null;
    }
  };
  
  /**
   * Authenticates a user with email and password
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<FirebaseUserResponse | undefined>} Authenticated user data
   * @throws {Error} If authentication fails
   */
  export async function login(
    email: string, 
    password: string
  ): Promise<FirebaseUserResponse | undefined> {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        auth, 
        email, 
        password
      );
      return { user: userCredential.user };
    } catch (e) {
      console.error("[error logging in] ==>", e);
      throw e;
    }
  }
  
  /**
   * Logs out the current user by terminating their session
   * @returns {Promise<void>}
   * @throws {Error} If logout fails
   */
  export async function logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("[error logging out] ==>", e);
      throw e;
    }
  }
  
  /**
   * Creates a new user account and optionally sets their display name
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} [name] - Optional user's display name
   * @returns {Promise<FirebaseUserResponse | undefined>} Created user data
   * @throws {Error} If registration fails
   */
  export async function register(
    email: string,
    password: string,
    name?: string,
    username?: string,
    dateOfBirth?: string
  ): Promise<FirebaseUserResponse | undefined> {
    try {
      const usernameUnique = await isUsernameUnique(username || "");
      if(!usernameUnique) {
        throw new Error("Username already taken.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (name) {
        await updateProfile(userCredential.user, { displayName: name });
      }
      
    
      return { user: userCredential.user };
    } catch (e) {
      console.error("[error registering] ==>", e);
      throw e;
    }
  }

  export const isUsernameUnique = async (username: string): Promise<boolean> => {
    const useRef = collection(firestore, "users");
    const q = query(useRef, where("username", "==", username));

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // true if the username is unique

  }


/**
 * Adding suplimentar user's data in Firestore 
 * @param userId - Firebase Authentification user's ID 
 * @param name - user's name
 * @param username - user's username
 * @param dateOfBirth - user's date of birth
 */
export const addUserToFirestore = async (userId: string, name: string, username: string, dateOfBirth: string) => {
  try {

    const usernameUnique = await isUsernameUnique(username);
    if(!usernameUnique) {
      throw new Error("Error: Trying to create user failed. Username is already taken.");
    }

    const userRef = doc(firestore, 'users', userId); // Create document for user
    
    // Format the date before saving
    const formattedDate = new Date(dateOfBirth).toLocaleDateString('ro-RO'); // Format as DD.MM.YYYY
    await setDoc(userRef, {
      name,
      username,
      dateOfBirth: formattedDate, // (YYYY-MM-DD)
    });
    console.log('User added to Firestore');
  } catch (error) {
    console.error('Error adding user to Firestore: ', error);
  }
};


export const uploadImageAndSaveToFirestore = async (
  uri: string,
  userId: string
): Promise<string> => {
  try {
    // http request who download the image from the uri (the place where image was saved locally on device)
    const response = await fetch(uri); 
    //BinariLargeOBject - format de date brut folosit pt fisiere binare (img, video, pdf)
    const blob = await response.blob(); // firebase poate incarca img ca blob sau ca file


    const filename = `users/${userId}/${Date.now()}.jpg`;
    // reference to firebase storage location where photo will be saved
    const storageRef = ref(storage, filename);

    // send the file as a blob to reference location
    await uploadBytes(storageRef, blob);
    // public link which we can use to view the image (temporarly)
    const downloadURL = await getDownloadURL(storageRef);

    await addDoc(collection(firestore, 'userImages'), {
      userId,
      imageUrl: downloadURL,
      createdAt: Timestamp.now()
    });

    return downloadURL;
  } catch (error) {
    console.error("Error uploading image: ", error);
    throw error;
  }
};