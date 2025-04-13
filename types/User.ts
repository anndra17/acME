import { Post } from './Post';

export type UserRole = 'user' | 'doctor' | 'moderator';

export interface User {
  id: string;
  username: string;
  email: string;
  profileImage?: string;
  role: UserRole;
  posts: Post[];
  friends: string[];    // user IDs
  friendRequestsSent: string[]; // userIds cărora le-a trimis cerere
  friendRequestsReceived: string[]; // userIds de la care a primit cerere
  bio?: string;
  joinedAt: string;
  
  // Doar pentru doctori
  assignedPatients?: string[];  // user IDs
  licenseNumber?: string; // to do: verificare regex format corespunzator

  // Extra
  permissions?: string[]; // ex: ['canPrescribe', 'canAccessPrivatePhotos']
}
