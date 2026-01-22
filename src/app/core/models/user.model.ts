import { Timestamp } from '@angular/fire/firestore';

/**
 * User model representing the authenticated user
 */
export interface User {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
  photoURL?: string | null;
  roles: UserRole[];
  permissions: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

/**
 * User profile stored in Firestore
 */
export interface UserProfile {
  email: string;
  displayName: string;
  photoURL?: string | null;
  roles: UserRole[];
  permissions: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
}

/**
 * Available user roles in the application
 */
export type UserRole = 'admin' | 'user' | 'moderator' | 'guest';

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}
