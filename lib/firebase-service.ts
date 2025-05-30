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
  }

  export interface Moderator {
    id: string;
    username: string;
    email: string;
    forums: string[];
    createdAt: string;
  }
  
  export interface AppUser {
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

export const searchUsers = async (searchTerm: string): Promise<AppUser[]> => {
  try {
    const usersRef = collection(firestore, "users");
    const snapshot = await getDocs(usersRef);
    const users: AppUser[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const user = {
        id: doc.id,
        ...data,
        userRoles: data.userRoles || ['user'],
      } as AppUser;

      // Căutăm în email și username
      if (
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        users.push(user);
      }
    });

    return users;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
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
  try {
    const userRef = doc(firestore, "users", userId);
    await updateDoc(userRef, {
      userRoles: arrayUnion("doctor"),
      role: "doctor",
      ...doctorData, 
    });
    await AsyncStorage.setItem('userRole', 'doctor'); 

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

    // Pentru forumuri, vom returna 0 pentru moment
    // TODO: Implementează logica pentru forumuri când vor fi adăugate
    const totalForums = 0;

    return {
      totalUsers,
      totalPosts,
      totalForums,
      totalDoctors
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