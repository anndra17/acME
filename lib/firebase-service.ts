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
  import { setDoc, doc, getDocs, collection, query, Query, DocumentData, where, addDoc, Timestamp, getDoc, getCountFromServer, updateDoc, deleteDoc, deleteField, arrayUnion, serverTimestamp, onSnapshot } from 'firebase/firestore';
  import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Post, SkinCondition } from '../types/Post';
import { BlogPost, BlogCategory } from '../types/BlogPost';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ForumThread } from '../types/ForumThread';
import { ConnectionRequest } from '../types/ConnectionRequest'; // Importă tipul ConnectionRequest
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { omitBy, isUndefined } from 'lodash';



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
  
  /**
   * Interfață pentru statisticile admin-ului
   */
  export interface AdminStats {
    totalUsers: number;
    totalPosts: number;
    totalForums: number;
    totalDoctors: number;
    totalModerators: number; // Adăugat pentru a ține evidența moderatorilor
  }

  export interface Moderator {
    id: string;
    username: string;
    email: string;
    forums: string[];
    createdAt: string;
  }
  
  export interface AppUser {
    createdAt: string;
    id: string;
    username: string;
    email: string;
    role: 'user' | 'admin' | 'moderator' | 'doctor';
    userRoles: string[];
    joinedAt: string;
    name?: string;
    dateOfBirth?: string;
    profileImage?: string;
    coverImage?: string;
    specializationType?: 'rezident' | 'specialist' | 'primar';
    institutions?: string[];
    experienceYears?: number;
    biography?: string;
    studies?: string;
    cuim?: string;
    reviews?: any[]; // sau tipul tău pentru review-uri
    firstName?: string;
    lastName?: string;
    city?: string;
    hasCAS?: boolean; // dacă are CAS (Card de Asigurări Sociale)
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
        await addUserToFirestore(user.uid, name || '', username || '', dateOfBirth || '', email || '');
        
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
export const addUserToFirestore = async (userId: string, name: string, username: string, dateOfBirth: string, email: string) => {
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
      role: 'user',
      userRoles: ['user'],
      email,
    });
    
    console.log('User successfully added to Firestore');
  } catch (error) {
    console.error('Error adding user to Firestore:', error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<AppUser[]> => {
  try {
    const usersRef = collection(firestore, "users");
    const snapshot = await getDocs(usersRef);
    const users: AppUser[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      users.push({
        id: doc.id,
        ...data,
        userRoles: data.userRoles || ['user'],
      } as AppUser);
    });

    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const searchUsers = async (searchTerm: string, filter: "username" | "name" | "email"): Promise<AppUser[]> => {
  if (!searchTerm) return [];
  const usersRef = collection(firestore, "users");
  const q = query(
    usersRef,
    where(filter, ">=", searchTerm),
    where(filter, "<=", searchTerm + "\uf8ff")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
};

export const addModeratorRole = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, {
      userRoles: arrayUnion("moderator"),
      role: "moderator",
    });
    await AsyncStorage.setItem('userRole', 'moderator'); 
  } catch (error) {
    console.error("Error adding moderator role:", error);
    throw error;
  }
};

export const removeModeratorRole = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    if (userData && userData.userRoles) {
      const updatedUserRoles = userData.userRoles.filter((role: string) => role !== "moderator");
      await updateDoc(userRef, {
        userRoles: updatedUserRoles,
        role: "user"
      });
      await AsyncStorage.setItem('userRole', 'user');

    }
  } catch (error) {
    console.error("Error removing moderator role:", error);
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

export const updatePostReview = async (
  userId: string,
  postId: string,
  data: { reviewed: boolean; feedback?: string, feedbackTimestamp?: string } 
) => {
  const postRef = doc(firestore, "posts", postId); 
  await updateDoc(postRef, data);
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

export const uploadUserImage = async (
  uri: string,
  userId: string,
  type: 'profileImage' | 'coverImage'
): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();

    const filename = `userData/${userId}/${type}.jpg`;
    const storageRef = ref(storage, filename);

    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    // Actualizează Firestore
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, {
      [type]: downloadURL,
    });

    console.log(`${type} updated successfully`);
    return downloadURL;
  } catch (error) {
    console.error(`Error uploading ${type}:`, error);
    throw error;
  }
};

/**
 * Șterge o postare și imaginea asociată (dacă există)
 * @param postId - ID-ul postării
 * @param imageUrl - URL-ul imaginii (dacă există)
 */
export const deletePostAndImage = async (postId: string, imageUrl?: string) => {
  // 1. Șterge documentul postării din Firestore
  await deleteDoc(doc(firestore, "posts", postId));

  // 2. Șterge imaginea din Storage dacă există
  if (imageUrl) {
    try {
      // Extrage path-ul relativ din URL
      // Exemplu: https://firebasestorage.googleapis.com/v0/b/BUCKET/o/users%2Fuid%2Fimg.jpg?alt=media...
      const matches = decodeURIComponent(imageUrl).match(/\/o\/(.+)\?/);
      if (matches && matches[1]) {
        const storagePath = matches[1];
        const imageRef = ref(storage, storagePath);
        await deleteObject(imageRef);
      }
    } catch (e) {
      // Poți loga, dar nu opri procesul dacă imaginea nu există
      console.warn("Nu am putut șterge imaginea din storage:", e);
    }
  }
};

/**
 * Creează un user cu rol de doctor și date suplimentare
 */
export const promoteUserToDoctor = async (
  userId: string,
  doctorData: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;

    cuim: string;
    specializationType: "rezident" | "specialist" | "primar";
    
    reviews: any[]; // sau tipul tău pentru review-uri
    approved: boolean;
    
    studies?: string;
    institutions?: string[];
    biography?: string;
    city?: string;
    experienceYears?: number;
    hasCAS?: boolean; 
    profileImage?: string;
  }
): Promise<void> => {
  console.log('[promoteUserToDoctor] called with:', userId, doctorData);

  try {
    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, {
      userRoles: arrayUnion("doctor"),
      role: "doctor",
      ...doctorData, 
    });
    await AsyncStorage.setItem('userRole', 'doctor'); 
    console.log('[promoteUserToDoctor] user promoted:', userId);


  } catch (error) {
    console.error("Error promoting user to doctor:", error);
    throw error;
  }
};

export const getAllDoctors = async (): Promise<AppUser[]> => {
  const allUsers = await getAllUsers();
  return allUsers.filter(
    user => user.role === 'doctor' || user.userRoles?.includes('doctor')
  );
};

export const getDoctorsCount = async (): Promise<number> => {
  // Caută useri care au rolul principal doctor SAU userRoles conține doctor
  const q = query(
    collection(firestore, "users"),
    where("userRoles", "array-contains", "doctor")
  );
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

export const updateDoctor = async (userId: string, doctorData: Partial<AppUser>) => {
  const userRef = doc(firestore, "users", userId);
  await updateDoc(userRef, doctorData);
};

export const removeDoctorRole = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(firestore, "users", userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();

    // 1. Șterge conexiunea cu pacienții
    if (userData && Array.isArray(userData.patients)) {
      for (const patientId of userData.patients) {
        try {
          const patientRef = doc(firestore, "users", patientId);
          const patientDoc = await getDoc(patientRef);
          if (patientDoc.exists()) {
            const patientData = patientDoc.data();
            if (Array.isArray(patientData.doctorIds)) {
              const updatedDoctorIds = patientData.doctorIds.filter((id: string) => id !== userId);
              await updateDoc(patientRef, { doctorIds: updatedDoctorIds });
            }
          }
        } catch (e) {
          console.warn(`Nu am putut actualiza pacientul ${patientId}:`, e);
        }
      }
    }

    // 2. Șterge rolul de doctor și datele asociate
    if (userData && userData.userRoles) {
      const updatedUserRoles = userData.userRoles.filter((role: string) => role !== "doctor");
      await updateDoc(userRef, {
        role: "user",
        userRoles: updatedUserRoles,
        specializationType: deleteField(),
        institutions: deleteField(),
        experienceYears: deleteField(),
        biography: deleteField(),
        studies: deleteField(),
        cuim: deleteField(),
        reviews: deleteField(),
        approved: deleteField(),
        hasCAS: deleteField(),
        firstName: deleteField(),
        lastName: deleteField(),
        city: deleteField(),
        patients: deleteField(), // Șterge și lista de pacienți
      });
      await AsyncStorage.setItem('userRole', 'user'); 
    }
  } catch (error) {
    console.error("Error removing doctor role:", error);
    throw error;
  }
};

/**
 * Obține statisticile pentru dashboard-ul admin-ului
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    // Obține numărul total de utilizatori
    const usersSnapshot = await getCountFromServer(collection(firestore, 'users'));
    const totalUsers = usersSnapshot.data().count;

    // Obține numărul total de postări
    const postsSnapshot = await getCountFromServer(collection(firestore, 'posts'));
    const totalPosts = postsSnapshot.data().count;

    // Obține numărul total de doctori
    const doctorsQuery = query(
      collection(firestore, 'users'),
      where('role', '==', 'doctor')
    );
    const doctorsSnapshot = await getCountFromServer(doctorsQuery);
    const totalDoctors = doctorsSnapshot.data().count;

    // Obține numărul total de forumuri
    const forumsSnapshot = await getCountFromServer(collection(firestore, 'forumThreads'));
    const totalForums = forumsSnapshot.data().count;

    // Obține numărul total de moderatori
    const moderatorsSnap = await getCountFromServer(
      query(collection(firestore, "users"), where("role", "==", "moderator"))
    );
    const totalModerators = moderatorsSnap.data().count;

    return {
      totalUsers,
      totalPosts,
      totalForums,
      totalDoctors,
      totalModerators
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

/**
 * Actualizează datele unui utilizator
 * @param userId ID-ul utilizatorului
 * @param userData Datele actualizate ale utilizatorului
 */
export const updateUser = async (userId: string, userData: Partial<AppUser>): Promise<void> => {
  try {
    const userRef = doc(firestore, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Nu am putut actualiza datele utilizatorului.');
  }
};

/**
 * Șterge un utilizator din baza de date
 * @param userId ID-ul utilizatorului de șters
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // Ștergem utilizatorul din Authentication
    await deleteUserFromAuth(userId);
    
    // Ștergem datele utilizatorului din Firestore
    const userRef = doc(firestore, 'users', userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Nu am putut șterge utilizatorul.');
  }
};

/**
 * Șterge un utilizator din Firebase Authentication
 * @param userId ID-ul utilizatorului de șters
 */
const deleteUserFromAuth = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error('Utilizatorul nu a fost găsit.');
    }

    const userData = userDoc.data();
    if (!userData.email) {
      throw new Error('Utilizatorul nu are un email asociat.');
    }

    // Ștergem utilizatorul din Authentication
    await signOut(auth);
  } catch (error) {
    console.error('Error deleting user from auth:', error);
    throw new Error('Nu am putut șterge utilizatorul din Authentication.');
  }
};

export const createBlogPost = async (blogPost: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'forumThreadId' | 'likes' | 'views'>): Promise<string> => {
  try {
    const now = new Date().toISOString();
    const blogPostData = {
      ...blogPost,
      createdAt: now,
      updatedAt: now,
      likes: [],
      views: 0
    };

    const docRef = await addDoc(collection(firestore, 'blogPosts'), blogPostData);
    await updateDoc(docRef, { id: docRef.id });

    // Create a forum thread for discussion if needed
    if (blogPost.isPublished) {
      const forumThread: ForumThread  = {
        title: blogPost.title,
        content: blogPost.summary,
        authorId: blogPost.authorId,
        createdAt: now,
        category: 'blog-discussion',
        blogPostId: docRef.id,
        likes: [],
        replies: []
      };

      const threadRef = await addDoc(collection(firestore, 'forumThreads'), forumThread);
      await setDoc(docRef, { forumThreadId: threadRef.id }, { merge: true });
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

export const updateBlogPost = async (postId: string, updates: Partial<BlogPost>): Promise<void> => {
  try {
    const postRef = doc(firestore, 'blogPosts', postId);
    const now = new Date().toISOString();

    await updateDoc(postRef, {
      ...updates,
      updatedAt: now
    });
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw error;
  }
};

export const getBlogPost = async (postId: string): Promise<BlogPost | null> => {
  try {
    const postRef = doc(firestore, 'blogPosts', postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      return postSnap.data() as BlogPost;
    }
    return null;
  } catch (error) {
    console.error('Error getting blog post:', error);
    throw error;
  }
};

export const getBlogPosts = async (filters?: {
  category?: BlogCategory;
  authorId?: string;
  isPublished?: boolean;
}): Promise<BlogPost[]> => {
  try {
    let q: Query<DocumentData> = collection(firestore, 'blogPosts');

    if (filters) {
      const constraints = [];
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }
      if (filters.authorId) {
        constraints.push(where('authorId', '==', filters.authorId));
      }
      if (filters.isPublished !== undefined) {
        constraints.push(where('isPublished', '==', filters.isPublished));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }
    }

    const snapshot = await getDocs(q);
    const posts: BlogPost[] = [];

    snapshot.forEach((doc) => {
      posts.push(doc.data() as BlogPost);
    });

    return posts;
  } catch (error) {
    console.error('Error getting blog posts:', error);
    throw error;
  }
};

export const deleteBlogPost = async (postId: string): Promise<void> => {
  try {
    const postRef = doc(firestore, 'blogPosts', postId);
    const postSnap = await getDoc(postRef);

    if (postSnap.exists()) {
      const post = postSnap.data() as BlogPost;

      // Delete associated forum thread if exists
      if (post.forumThreadId) {
        await deleteDoc(doc(firestore, 'forumThreads', post.forumThreadId));
      }

      // Delete the blog post
      await deleteDoc(postRef);

      // Delete the featured image from storage
      if (post.featuredImage) {
        try {
          const url = decodeURIComponent(post.featuredImage);
          const matches = url.match(/\/o\/(.+)\?/);
          if (matches && matches[1]) {
            const storagePath = matches[1];
            const imageRef = ref(storage, storagePath);
            await deleteObject(imageRef);
          }
        } catch (e) {
          console.warn('Could not delete featured image:', e);
        }
      }
    }
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

export const getBlogPostById = async (id: string): Promise<BlogPost | null> => {
  try {
    const docRef = doc(firestore, 'blogPosts', id); 
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as BlogPost;
    }
    return null;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
};


export const getUserFavorites = async (userId: string): Promise<string[]> => {
  const userRef = doc(firestore, 'users', userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data().favoriteBlogPosts || [] : [];
};

export const listenToUserFavorites = (
  userId: string,
  callback: (favorites: string[]) => void
) => {
  const userRef = doc(firestore, 'users', userId);
  return onSnapshot(userRef, (docSnap) => {
    if (docSnap.exists()) {
      callback(docSnap.data().favoriteBlogPosts || []);
    }
  });
};

export const toggleFavoriteBlogPost = async (
  userId: string,
  postId: string
): Promise<string[]> => {
  const userRef = doc(firestore, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return [];

  const favorites: string[] = userSnap.data().favoriteBlogPosts || [];

  const updatedFavorites = favorites.includes(postId)
    ? favorites.filter((id) => id !== postId)
    : [...favorites, postId];

  await updateDoc(userRef, { favoriteBlogPosts: updatedFavorites });

  return updatedFavorites;
};


export const sendConnectionRequest = async (fromUserId: string, toDoctorId: string) => {
  const fromUser = await getUserProfile(fromUserId);
  console.log("fromUser", fromUser);
  const data = {
    fromUserId: fromUserId,
    toDoctorId,
    status: "pending",
    createdAt: serverTimestamp(),
    fromUserUsername: fromUser.username || "",
    fromUserName: fromUser.name || "",
    fromUserEmail: fromUser.email || "",
    fromUserProfileImage: fromUser.profileImage || "",
    fromUserAge: getAge(fromUser.dateOfBirth || "") || null,
  };
  await addDoc(collection(firestore, "connectionRequests"), data);
};

export const sendDoctorRequest = async (
  userId: string,
  adminId: string,
  formData: any // poți tipiza mai strict dacă vrei
) => {
  try {
    await addDoc(collection(firestore, 'connectionRequests'), {
      fromUserId: userId,
      toAdminId: adminId,
      type: 'doctor-request',
      status: 'pending',
      createdAt: serverTimestamp(),
      formData, // aici trimiți toate datele completate în formular
    });
  } catch (error) {
    console.error('Error sending doctor request:', error);
    throw error;
  }
};

export const hasPendingConnectionRequest = async (fromUserId: string, toDoctorId: string) => {
  const q = query(
    collection(firestore, "connectionRequests"),
    where("fromUserId", "==", fromUserId),
    where("toDoctorId", "==", toDoctorId),
    where("status", "==", "pending")
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

export const getSentConnectionRequests = async (userId: string) => {
  const q = query(
    collection(firestore, "connectionRequests"),
    where("fromUserId", "==", userId),
    where("status", "==", "pending")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPendingDoctorRequests = async (doctorId: string): Promise<ConnectionRequest[]> => {
  const q = query(
    collection(firestore, "connectionRequests"),
    where("toDoctorId", "==", doctorId),
    where("status", "==", "pending")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ConnectionRequest));
};

export const acceptConnectionRequest = async (requestId: string) => {
  console.log('[acceptConnectionRequest] called with requestId:', requestId);

  // 1. Găsește cererea
  const requestRef = doc(firestore, "connectionRequests", requestId);
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) {
    console.error('[acceptConnectionRequest] ERROR: Request not found:', requestId);
    throw new Error("Request not found");
  }
  const { fromUserId, toDoctorId } = requestSnap.data();
  console.log('[acceptConnectionRequest] fromUserId:', fromUserId, 'toDoctorId:', toDoctorId);

  // 2. Marchează cererea ca acceptată
  try {
    await updateDoc(requestRef, { status: "accepted" });
    console.log('[acceptConnectionRequest] Request status updated to accepted');
  } catch (err) {
    console.error('[acceptConnectionRequest] ERROR updating request status:', err);
    throw err;
  }

  // 3. Adaugă doctorId la user.doctorIds
  const userRef = doc(firestore, "users", fromUserId);
  try {
    await updateDoc(userRef, {
      doctorIds: arrayUnion(toDoctorId)
    });
    console.log('[acceptConnectionRequest] doctorId added to user.doctorIds:', toDoctorId, 'for user:', fromUserId);
  } catch (err) {
    console.error('[acceptConnectionRequest] ERROR adding doctorId to user:', err);
    throw err;
  }

  // 4. Adaugă userId la doctor.patients
  const doctorRef = doc(firestore, "users", toDoctorId);
  try {
    await updateDoc(doctorRef, {
      patients: arrayUnion(fromUserId)
    });
    console.log('[acceptConnectionRequest] userId added to doctor.patients:', fromUserId, 'for doctor:', toDoctorId);
  } catch (err) {
    console.error('[acceptConnectionRequest] ERROR adding userId to doctor.patients:', err);
    throw err;
  }
};

export const rejectConnectionRequest = async (requestId: string) => {
  const requestRef = doc(firestore, "connectionRequests", requestId);
  await updateDoc(requestRef, { status: "rejected" });
};

function getAge(dateOfBirth: string): number | null {
  if (!dateOfBirth) return null;
  let dob;
  if (dateOfBirth.includes(".")) {
    // Format DD.MM.YYYY
    const [day, month, year] = dateOfBirth.split(".");
    dob = new Date(`${year}-${month}-${day}`);
  } else {
    dob = new Date(dateOfBirth);
  }
  if (isNaN(dob.getTime())) return null;
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  return Math.abs(ageDt.getUTCFullYear() - 1970);
}


export const addReviewedFieldToPosts = async () => {
  try {
    const postsCollectionRef = collection(firestore, 'posts');
    const snapshot = await getDocs(postsCollectionRef);

    for (const postDoc of snapshot.docs) {
      const postData = postDoc.data();
      if (!('reviewed' in postData)) {
        const postRef = doc(firestore, 'posts', postDoc.id);
        await updateDoc(postRef, { reviewed: false });
        console.log(`Adăugat reviewed=false la postarea ${postDoc.id}`);
      }
    }
    console.log('Toate postările au fost actualizate.');
  } catch (error) {
    console.error('Eroare la actualizarea postărilor:', error);
  }
};

export const addClinic = async (clinic: {
  name: string;
  address: string;
  city: string;
  phone?: string;
  website?: string;
  doctors?: string[];
}) => {
  await addDoc(collection(firestore, 'clinics'), clinic);
};

export const addOrUpdateClinic = async (clinic: {
  name: string;
  address: string;
  city: string;
  phone?: string;
  website?: string;
  doctorId: string;
}) => {
  console.log('[firebase-service] addOrUpdateClinic called with:', clinic);

  const clinicData = Object.fromEntries(
    Object.entries(clinic).filter(([_, v]) => v !== undefined)
  );

  const q = query(
    collection(firestore, 'clinics'),
    where('name', '==', clinic.name),
    where('address', '==', clinic.address)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const clinicDoc = snapshot.docs[0];
    await updateDoc(clinicDoc.ref, {
      doctors: arrayUnion(clinic.doctorId)
    });
    console.log('[firebase-service] addOrUpdateClinic updated existing clinic:', clinicDoc.id);
    return clinicDoc.id;
  } else {
    const docRef = await addDoc(collection(firestore, 'clinics'), {
      ...clinicData,
      doctors: [clinic.doctorId]
    });
    console.log('[firebase-service] addOrUpdateClinic created new clinic:', docRef.id);
    return docRef.id;
  }
};


export const getAllConnectionRequests = async () => {
  try {
    const snapshot = await getDocs(collection(firestore, "connectionRequests"));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching connection requests:", error);
    throw error;
  }
};

/**
 * Extrage datele relevante dintr-o cerere de tip doctor-request.
 * Acceptă un obiect cerere (ex: din connectionRequests) și returnează formData-ul util.
 */
export function extractDoctorRequestFormData(request: any) {
  console.log('[extractDoctorRequestFormData] called with:', request);

  if (request?.formData) {
    return request.formData;
  }
  return request;
}

export async function acceptDoctorRequest(request: any) {
    console.log('[acceptDoctorRequest] called with:', request);

  const formData = extractDoctorRequestFormData(request);
  const userId = request.fromUserId;

  // 1. Adaugă fiecare instituție
  if (formData.institutions && Array.isArray(formData.institutions)) {
    for (const inst of formData.institutions) {
      const institutionId = inst.id || inst.name?.replace(/\s+/g, '_').toLowerCase() || (typeof inst === 'string' ? inst.replace(/\s+/g, '_').toLowerCase() : undefined);
      if (institutionId) {
        try {
                    console.log('[acceptDoctorRequest] adding/updating institution:', institutionId, inst);

          await setDoc(
            doc(firestore, 'institutions', institutionId),
            {
              ...(typeof inst === 'string' ? { name: inst } : inst),
              updatedAt: new Date(),
            },
            { merge: true }
          );
        } catch (e) {
          console.log('Eroare la adăugare instituție:', institutionId, e);
          throw e;
        }
      }
    }
  }

  // 2. Promovează userul la doctor
  try {
        console.log('[acceptDoctorRequest] promoting user to doctor:', userId, formData);

    await promoteUserToDoctor(userId, {
      ...formData,
      approved: true,
      reviews: [],
    });
  } catch (e) {
    console.log('Eroare la promovare user:', userId, e);
    throw e;
  }

  // 3. Marchează cererea ca acceptată
  try {
    console.log('[acceptDoctorRequest] updating connectionRequest status to accepted:', request.id);

    await updateDoc(doc(firestore, "connectionRequests", request.id), {
      status: "accepted",
    });
  } catch (e) {
    console.log('Eroare la update connectionRequest:', request.id, e);
    throw e;
  }
}

export async function rejectDoctorRequest(requestId: string) {
  await updateDoc(doc(firestore, "connectionRequests", requestId), {
    status: "rejected",
  });
}

export const searchUsersByUsername = async (searchTerm: string): Promise<AppUser[]> => {
  if (!searchTerm) return [];
  const usersRef = collection(firestore, "users");
  const q = query(
    usersRef,
    where("username", ">=", searchTerm),
    where("username", "<=", searchTerm + "\uf8ff")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
};


/**
 * Trimite o cerere de prietenie către un alt user.
 * @param fromUserId ID-ul userului care trimite cererea
 * @param toUserId ID-ul userului care primește cererea
 * @param message Mesaj opțional
 */
export const sendFriendRequest = async (
  fromUserId: string,
  toUserId: string,
  message?: string
) => {
  try {
    // Ia datele userului care trimite cererea
    const fromUser = await getUserProfile(fromUserId);

    await addDoc(collection(firestore, "connectionRequests"), {
      fromUserId,
      toUserId,
      status: "pending",
      createdAt: serverTimestamp(),
      message: message || "",
      type: "friend-request",
      fromUserUsername: fromUser.username || "",
      fromUserName: fromUser.name || "",
      fromUserProfileImage: fromUser.profileImage || "",
      fromUserEmail: fromUser.email || "",
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};

/**
 * Returnează numărul de cereri de prietenie cu status "pending" pentru userul autentificat.
 * @param userId ID-ul userului autentificat (Firebase Auth UID)
 * @returns Promise<number> - numărul de cereri de prietenie în așteptare
 */
export const getPendingFriendRequestsCount = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  const q = query(
    collection(firestore, "connectionRequests"),
    where("toUserId", "==", userId),
    where("status", "==", "pending"),
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
};

export const getPendingFriendRequests = async (userId: string) => {
  const q = query(
    collection(firestore, "connectionRequests"),
    where("toUserId", "==", userId),
    where("status", "==", "pending"),
    where("type", "==", "friend-request")
  );
  const snapshot = await getDocs(q);
  console.log("[Firebase] Snapshot size:", snapshot.size);
  snapshot.forEach(doc => {
    console.log("[Firebase] Cerere:", doc.id, doc.data());
  });
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const acceptFriendRequest = async (requestId: string, fromUserId: string, toUserId: string) => {
  const now = new Date().toISOString();
  try {
    // 1. Adaugă fromUserId la friends din user/{toUserId}/friends
    await setDoc(
      doc(firestore, `users/${toUserId}/friends/${fromUserId}`),
      { userId: fromUserId, since: now }
    );

    // 2. Adaugă toUserId la friends din user/{fromUserId}/friends
    await setDoc(
      doc(firestore, `users/${fromUserId}/friends/${toUserId}`),
      { userId: toUserId, since: now }
    );

    // 3. Marchează cererea ca acceptată și salvează momentul
    await updateDoc(
      doc(firestore, "connectionRequests", requestId),
      { status: "accepted", acceptedAt: now }
    );
  } catch (error) {
    console.error("Eroare la acceptFriendRequest:", error);
    throw error;
  }
};

export const denyFriendRequest = async (requestId: string) => {
  try {
    await updateDoc(
      doc(firestore, "connectionRequests", requestId),
      { status: "denied" }
    );
  } catch (error) {
    console.error("Eroare la denyFriendRequest:", error);
    throw error;
  }
};
export const getFriendsIds = async (userId: string): Promise<string[]> => {
  try {
    const friendsRef = collection(firestore, `users/${userId}/friends`);
    const snapshot = await getDocs(friendsRef);
    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error("Eroare la getFriendsIds:", error);
    return [];
  }
};

export const getFriendsCount = async (userId: string): Promise<number> => {
  try {
    const friendsCol = collection(firestore, `users/${userId}/friends`);
    const snapshot = await getCountFromServer(friendsCol);
    return snapshot.data().count || 0;
  } catch {
    return 0;
  }
};

export const getFriendsList = async (userId: string) => {
  const friendsCol = collection(firestore, `users/${userId}/friends`);
  const snapshot = await getDocs(friendsCol);
  const friends = [];
  for (const docSnap of snapshot.docs) {
    const friendId = docSnap.id;
    const userDoc = await getDoc(doc(firestore, "users", friendId));
    if (userDoc.exists()) {
      friends.push({ id: friendId, ...userDoc.data() });
    }
  }
  return friends;
};

export const getFriendsPosts = async (friendIds: string[]) => {
  try {
    if (!friendIds.length) return [];
    const chunks = [];
    for (let i = 0; i < friendIds.length; i += 10) {
      chunks.push(friendIds.slice(i, i + 10));
    }
    let posts: any[] = [];
    for (const chunk of chunks) {
      const q = query(
        collection(firestore, "posts"),
        where("userId", "in", chunk)
      );
      const snapshot = await getDocs(q);
      posts = posts.concat(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
    // Ia user info pentru fiecare postare
    const userIds = [...new Set(posts.map(p => p.userId))];
    const userDocs = await Promise.all(userIds.map(uid => getDoc(doc(firestore, "users", uid))));
    const usersMap = Object.fromEntries(
      userDocs
        .filter(d => d.exists())
        .map(d => [d.id, d.data()])
    );
    // Atașează user la fiecare postare
    posts = posts.map(post => ({
      ...post,
      user: usersMap[post.userId] || {
        username: "Anonim",
        name: "Anonim",
        email: "",
        profileImage: "https://ui-avatars.com/api/?name=Anonim"
      }
    }));

    // Afișează în consolă URL-ul fiecărei poze din postare
    posts.forEach(post => {
      // Dacă folosești imageUrl sau image ca field pentru poză, adaptează aici
      console.log("[POST IMAGE URL]", post.imageUrl || post.image || "Fără poză");
    });

    posts.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    return posts;
  } catch (error) {
    console.error("Eroare la getFriendsPosts:", error);
    return [];
  }
};
// Adaugă un like la o postare
export const likePost = async (postId: string, userId: string, postOwnerId: string) => {
  try {
    const likeRef = doc(firestore, `posts/${postId}/likes/${userId}`);
    console.log("[likePost] Inainte de setDoc likeRef:", likeRef.path, { userId });

    await setDoc(likeRef, { userId, createdAt: serverTimestamp() });
    console.log("[likePost] Dupa setDoc likeRef:", likeRef.path);

    // Notificare pentru owner
    if (userId !== postOwnerId) {
      const notifRef = collection(firestore, `users/${postOwnerId}/notifications`);
      const notifData = {
        type: "like",
        postId,
        fromUserId: userId,
        createdAt: serverTimestamp(),
        read: false,
      };
      console.log("[likePost] Inainte de addDoc notificare:", notifRef.path, notifData);

      await addDoc(notifRef, notifData);
      console.log("[likePost] Dupa addDoc notificare:", notifRef.path);
    }
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

// Șterge like-ul
export const unlikePost = async (postId: string, userId: string) => {
  try {
    const likeRef = doc(firestore, `posts/${postId}/likes/${userId}`);
    console.log("[unlikePost] Inainte de deleteDoc likeRef:", likeRef.path);

    await deleteDoc(likeRef);

    console.log("[unlikePost] Dupa deleteDoc likeRef:", likeRef.path);
  } catch (error) {
    console.error("Error unliking post:", error);
    throw error;
  }
};
// Adaugă comentariu
export const addComment = async (postId: string, userId: string, text: string, postOwnerId: string) => {
  try {
    // Ia user info pentru a salva username și profileImage
    const userDoc = await getDoc(doc(firestore, "users", userId));
    const userData = userDoc.exists() ? userDoc.data() : {};

    const commentId = uuidv4();
    const commentRef = doc(firestore, `posts/${postId}/comments/${commentId}`);
    const commentData = {
      id: commentId,
      userId,
      username: userData.username || "",
      userProfileImage: userData.profileImage || "",
      text,
      createdAt: serverTimestamp(),
    };
    console.log("[addComment] Inainte de setDoc commentRef:", commentRef.path, commentData);

    await setDoc(commentRef, commentData);
    console.log("[addComment] Dupa setDoc commentRef:", commentRef.path);

    // ...restul codului...
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Obține like-urile pentru o postare
export const getPostLikes = async (postId: string) => {
  try {
    const snapshot = await getDocs(collection(firestore, `posts/${postId}/likes`));
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting post likes:", error);
    throw error;
  }
};

export const getLikesCount = async (postId: string): Promise<number> => {
  try {
    const coll = collection(firestore, `posts/${postId}/likes`);
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count || 0;
  } catch {
    return 0;
  }
};

// Obține comentariile pentru o postare
export const getPostComments = async (postId: string) => {
  try {
    const snapshot = await getDocs(collection(firestore, `posts/${postId}/comments`));
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error("Error getting post comments:", error);
    throw error;
  }
};

export const getCommentsCount = async (postId: string): Promise<number> => {
  try {
    const coll = collection(firestore, `posts/${postId}/comments`);
    const snapshot = await getCountFromServer(coll);
    return snapshot.data().count || 0;
  } catch {
    return 0;
  }
};

export const checkIfUserLikedPost = async (postId: string, userId: string): Promise<boolean> => {
  try {
    const likeDoc = await getDoc(doc(firestore, `posts/${postId}/likes/${userId}`));
    return likeDoc.exists();
  } catch {
    return false;
  }
};

/**
 * Returnează data (timestamp) de când userId și friendId sunt prieteni.
 * @param userId ID-ul userului curent
 * @param friendId ID-ul prietenului
 * @returns Date sau null dacă nu există
 */
export const getFriendshipDate = async (userId: string, friendId: string): Promise<Date | null> => {
  try {
    const friendDocRef = doc(firestore, `users/${userId}/friends/${friendId}`);
    const friendDoc = await getDoc(friendDocRef);
    if (friendDoc.exists()) {
      const data = friendDoc.data();
      if (data.since) {
        // Dacă e Firestore Timestamp
        if (typeof data.since.toDate === "function") {
          return data.since.toDate();
        }
        // Dacă e string sau number
        return new Date(data.since);
      }
    }
    return null;
  } catch (e) {
    return null;
  }
};

/**
 * Șterge prietenia dintre doi useri din ambele subcolecții friends.
 * @param userId ID-ul userului care inițiază ștergerea
 * @param friendId ID-ul prietenului de șters
 */
export const deleteFriendship = async (userId: string, friendId: string): Promise<void> => {
  try {
    // Șterge din /users/{userId}/friends/{friendId}
    await deleteDoc(doc(firestore, `users/${userId}/friends/${friendId}`));
    // Șterge din /users/{friendId}/friends/{userId}
    await deleteDoc(doc(firestore, `users/${friendId}/friends/${userId}`));
    console.log(`Prietenia dintre ${userId} și ${friendId} a fost ștearsă cu succes.`);
  } catch (error) {
    console.error("Eroare la ștergerea prieteniei:", error);
    throw error;
  }
};

/**
 * Verifică dacă userul are un medic asociat (doctorIds nenul și are cel puțin un element)
 * @param userId ID-ul userului
 * @returns Promise<boolean>
 */
export const hasAssociatedDoctor = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return false;
    const data = userSnap.data();
    return Array.isArray(data.doctorIds) && data.doctorIds.length > 0;
  } catch (error) {
    console.error("Eroare la verificarea medicului asociat:", error);
    return false;
  }
};

/**
 * Returnează primul doctor asociat userului (sau null dacă nu există)
 */
export const getAssociatedDoctorId = async (userId: string): Promise<string | null> => {
  try {
    const userRef = doc(firestore, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return null;
    const data = userSnap.data();
    if (Array.isArray(data.doctorIds) && data.doctorIds.length > 0) {
      return data.doctorIds[0]; // Poți adapta dacă vrei să alegi alt doctor
    }
    return null;
  } catch (error) {
    console.error("Eroare la obținerea doctorului asociat:", error);
    return null;
  }
};

/**
 * Returnează datele unui doctor după ID
 */
export const getDoctorProfile = async (doctorId: string): Promise<AppUser | null> => {
  try {
    const docRef = doc(firestore, 'users', doctorId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as AppUser;
    }
    return null;
  } catch (error) {
    console.error("Eroare la obținerea profilului doctorului:", error);
    return null;
  }
};



/**
 * Adaugă un tratament în subcolecția /users/{userId}/treatments
 * @param userId - ID-ul pacientului
 * @param treatment - Obiect cu { name, instructions, notes, doctorId }
 */
export const addPatientTreatment = async (
  userId: string,
  treatment: {
    name: string;
    instructions: string;
    notes?: string;
    doctorId?: string;
  }
) => {
  try {
    console.log("[addPatientTreatment] called for user:", userId, treatment);
    const docRef = await addDoc(
      collection(firestore, `users/${userId}/treatments`),
      {
        ...treatment,
        createdAt: serverTimestamp(),
      }
    );
    console.log("[addPatientTreatment] treatment added with id:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("[addPatientTreatment] error:", error);
    throw error;
  }
};

/**
 * Obține istoricul tratamentelor pentru un pacient
 * @param userId - ID-ul pacientului
 */
export const getPatientTreatments = async (userId: string) => {
  try {
    console.log("[getPatientTreatments] called for user:", userId);
    const snapshot = await getDocs(collection(firestore, `users/${userId}/treatments`));
    const treatments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("[getPatientTreatments] found:", treatments.length);
    return treatments;
  } catch (error) {
    console.error("[getPatientTreatments] error:", error);
    throw error;
  }
};