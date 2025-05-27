import { Post } from './Post';

export type UserRole = 'user' | 'doctor' | 'moderator';

export type DoctorSpecialization = 'specialist' | 'primar' | 'rezident';

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
  friends: string[];
  friendRequestsSent: string[];
  friendRequestsReceived: string[];
  bio?: string;

  // Doar pentru doctori (toate opționale pentru compatibilitate universală)
  assignedPatients?: string[];
  licenseNumber?: string; // CUIM
  specializationType?: DoctorSpecialization;
  institutions?: string[]; // clinici/spitale
  experienceYears?: number;
  studies?: string;
  biography?: string;
  hasCAS?: boolean;
  specialties?: string[];
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