import { Post } from './Post';

export type UserRole = 'user' | 'doctor' | 'moderator';

export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  joinedAt: string;
  name?: string;
  surname?: string;
  dateOfBirth?: string;
  profileImage?: string;
  coverImage?: string;
  role: UserRole;
  posts: Post[];
  friends: string[];    // user IDs
  friendRequestsSent: string[]; // userIds cărora le-a trimis cerere
  friendRequestsReceived: string[]; // userIds de la care a primit cerere
  bio?: string;
  
  // Doar pentru doctori
  assignedPatients?: string[];  // user IDs
  licenseNumber?: string; // to do: verificare regex format corespunzator

  // Extra
  permissions?: string[]; // ex: ['canPrescribe', 'canAccessPrivatePhotos']
}

export type DoctorSpecialization = 'specialist' | 'primar' | 'rezident';

export interface Doctor extends User {
  licenseNumber: string; // CUIM
  experience: number; // ani de experiență
  medicalSchool: string; // facultatea de medicină absolvită
  specialization: DoctorSpecialization;
  clinics: string[]; // clinicile la care lucrează
  hasCAS: boolean; // dacă are contract cu CAS
  specialties?: string[]; // specialitățile medicale
  education?: {
    university: string;
    graduationYear: number;
    specialization: string;
  }[];
  certifications?: {
    name: string;
    year: number;
    issuer: string;
  }[];
}
