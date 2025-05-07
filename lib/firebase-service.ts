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
  import { setDoc, doc, getDocs, collection, query, where, addDoc, Timestamp, getDoc, getCountFromServer, updateDoc } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Post, SkinCondition } from '../types/Post';


const defaultImageUrl = 'https://firebasestorage.googleapis.com/v0/b/acme-e3cf3.firebasestorage.app/o/defaults%2Fdefault_profile.png?alt=media&token=9c6839ea-13a6-47de-b8c5-b0d4d6f9ec6a';
const defaultCoverUrl = 'https://firebasestorage.googleapis.com/v0/b/acme-e3cf3.firebasestorage.app/o/defaults%2Fdefault_profile.png?alt=media&token=9c6839ea-13a6-47de-b8c5-b0d4d6f9ec6a';
  
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
      // Create the user first - this authenticates them
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      try {
        // If a username was provided, check and reserve it
        if (username) {
          const usernameAvailable = await checkAndReserveUsername(username, user.uid);
          
          if (!usernameAvailable) {
            // Username is taken, clean up by deleting the user we just created
            await user.delete();
            throw new Error("Username already taken.");
          }
        }
        
        // Update the user's display name if provided
        if (name) {
          await updateProfile(user, { displayName: name });
        }
        
        // Add the user data to Firestore
        await addUserToFirestore(user.uid, name || '', username || '', dateOfBirth || '');
        
        return { user };
      } catch (innerError) {
        // If anything fails after user creation but before completion,
        // clean up by deleting the user
        console.error("[Error during user setup] ==> ", innerError);
        await user.delete();
        throw innerError;
      }
    } catch (e) {
      console.error("[error registering] ==>", e);
      throw e;
    }
  }

/**
 * Checks if a username is available and reserves it for the user
 * @param username - The username to check and reserve
 * @param userId - The Firebase Auth UID of the user
 * @returns Promise<boolean> - True if username was successfully reserved, false if already taken
 */
export const checkAndReserveUsername = async (username: string, userId: string): Promise<boolean> => {
  try {
    // Reference to the username document
    const usernameRef = doc(firestore, 'usernames', username);
    
    // Check if the username already exists
    const usernameDoc = await getDoc(usernameRef);
    
    if (usernameDoc.exists()) {
      console.log('Username already taken:', username);
      return false; // Username is taken
    }
    
    // Username is available, reserve it by creating a document
    await setDoc(usernameRef, { 
      userId, 
      reservedAt: new Date().toISOString() 
    });
    
    console.log('Username successfully reserved:', username);
    return true;
  } catch (error) {
    console.error('Error checking/reserving username:', error);
    throw error;
  }
};

  

/**
 * Adding suplimentar user's data in Firestore 
 * @param userId - Firebase Authentification user's ID 
 * @param name - user's name
 * @param username - user's username
 * @param dateOfBirth - user's date of birth
 * @param profileImage - user's profile image
 */
export const addUserToFirestore = async (userId: string, name: string, username: string, dateOfBirth: string) => {
  try {
    const userRef = doc(firestore, 'users', userId);
    
    // Format the date before saving
    const formattedDate = dateOfBirth ? new Date(dateOfBirth).toLocaleDateString('ro-RO') : '';
    const profileImage = defaultImageUrl;
    const coverImage = defaultCoverUrl;

    await setDoc(userRef, {
      name,
      username,
      dateOfBirth: formattedDate,
      createdAt: new Date().toISOString(),
      profileImage,
      coverImage,
    });
    
    console.log('User successfully added to Firestore');
  } catch (error) {
    console.error('Error adding user to Firestore:', error);
    throw error;
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

    const user = auth.currentUser;

    if (!user) throw new Error("User not authenticated");

    const filename = `users/${userId}/${Date.now()}.jpg`;
    // reference to firebase storage location where photo will be saved
    const storageRef = ref(storage, filename);

    // send the file as a blob to reference location in firestore storage
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

export const uploadPostAndSaveToFirestore = async (
  uri: string,
  userId: string,
  postData: {
    description?: string;
    stressLevel: number;
    skinConditions?: SkinCondition[];
    treatmentUsed?: string;
  }
): Promise<void> => {
  try {
    const imageUrl = await uploadImageAndSaveToFirestore(uri, userId);

    const post: Post = {
      id: '', // Temporary placeholder, will be updated after document creation
      userId,
      imageUrl, 
      createdAt: new Date().toISOString(),
      description: postData.description,
      stressLevel: postData.stressLevel,
      skinConditions: postData.skinConditions,
      treatmentUsed: postData.treatmentUsed,
      likes: [],
    };

    const docRef = await addDoc(collection(firestore, 'posts'), post);

    await setDoc(docRef, {id: docRef.id}, {merge: true});

  } catch (error) {
    console.error("Error uploading post: ", error);
    throw error;
  }
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    const q = query(
      collection(firestore, 'posts'),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const posts: Post[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data() as Post;
      posts.push({ ...data, id: doc.id });
    });

    return posts;
  } catch (error) {
    console.error('Error fetching user posts:', error);
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    if (userDoc.exists()) {
      return userDoc.data(); 
    } else {
      throw new Error('User profile not found');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};


export const getUserImageCount = async (userId: string): Promise<number> => {
  try {
    const q = query(
      collection(firestore, 'userImages'),
      where('userId', '==', userId)
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error('Error fetching image count:', error);
    throw error;
  }
};


// export const checkAndSetDefaultProfileImage = async (userId: string) => {
//   try {
//     // Fetch the user document from Firestore
//     const userRef = doc(firestore, 'users', userId);
//     const userDoc = await getDoc(userRef);

//     // Check if the document exists and retrieve the data
//     if (userDoc.exists()) {
//       const userData = userDoc.data();

//       // Verifică dacă există câmpul image și dacă nu este setat
//       if (!userData.profileImage || userData.profileImage.trim() === '') {
//         await updateDoc(userRef, {
//           profileImage: defaultImageUrl,
//         });
//         console.log('Default profile image set for user:', userId);
//         return defaultImageUrl;
//       } else {
//         return userData.profileImage;
//       }
//     } else {
//       console.error('User document not found for userId:', userId);
//       return null;
//     }
//   } catch (error) {
//     console.error('Error checking and setting default profile image:', error);
//     return null;
//   }
// };


// export const ensureUserProfileImage = async (userId: string) => {
//   try {
//     const userRef = doc(firestore, "users", userId);
//     const docSnap = await getDoc(userRef);

//     if (docSnap.exists()) {
//       const userData = docSnap.data();
//       if (!userData.profileImage) {
//         await updateDoc(userRef, {
//           profileImage: defaultImageUrl,
//         });
//         console.log("Added missing profileImage to user.");
//         return defaultImageUrl;
//       } else {
//         return userData.profileImage;
//       }
//     }
//     return null;
//   } catch (error) {
//     console.error("Error ensuring profileImage for user:", error);
//     return null;
//   }
// };

export const ensureDefaultField = async (
  userId: string,
  field: 'profileImage' | 'coverImage',
  defaultValue: string
): Promise<string | null> => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      const fieldValue = userData[field];

      if (!fieldValue || fieldValue.trim() === '') {
        await updateDoc(userRef, {
          [field]: defaultValue,
        });
        console.log(`Set default value for ${field}`);
        return defaultValue;
      }

      return fieldValue;
    }

    return null;
  } catch (error) {
    console.error(`Error ensuring default for ${field}:`, error);
    return null;
  }
};
