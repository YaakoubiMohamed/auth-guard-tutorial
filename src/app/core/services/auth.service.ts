import { Injectable, inject, signal, computed, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import {
  Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from '@angular/fire/firestore';
import { User, UserRole, UserProfile } from '../models/user.model';

/**
 * Authentication service using Firebase Auth and Firestore
 * Uses signals for reactive state management (Angular 20 best practice)
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  private readonly auth = inject(Auth);
  private readonly firestore = inject(Firestore);
  private readonly router = inject(Router);

  // Private writable signals
  private readonly currentUser = signal<User | null>(null);
  private readonly firebaseUser = signal<FirebaseUser | null>(null);
  private readonly loading = signal<boolean>(true);
  private readonly authError = signal<string | null>(null);

  // Auth state listener cleanup
  private readonly unsubscribeAuth: () => void;

  // Public readonly computed values
  readonly user = this.currentUser.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly error = this.authError.asReadonly();
  readonly isAuthenticated = computed(() => !!this.currentUser() && !!this.firebaseUser());
  readonly userRoles = computed(() => this.currentUser()?.roles ?? []);
  readonly userPermissions = computed(() => this.currentUser()?.permissions ?? []);
  readonly isEmailVerified = computed(() => this.firebaseUser()?.emailVerified ?? false);

  constructor() {
    // Listen to Firebase auth state changes
    this.unsubscribeAuth = onAuthStateChanged(this.auth, async (firebaseUser) => {
      this.firebaseUser.set(firebaseUser);

      if (firebaseUser) {
        try {
          const userProfile = await this.getUserProfile(firebaseUser.uid, firebaseUser.emailVerified);
          if (userProfile) {
            this.currentUser.set(userProfile);
          } else {
            // Create profile if it doesn't exist (first login)
            const newProfile = await this.createUserProfile(firebaseUser);
            this.currentUser.set(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          this.currentUser.set(null);
        }
      } else {
        this.currentUser.set(null);
      }

      this.loading.set(false);
    });
  }

  ngOnDestroy(): void {
    // Clean up auth state listener
    this.unsubscribeAuth();
  }

  /**
   * Sign in with email and password
   */
  login(email: string, password: string): Observable<User> {
    this.loading.set(true);
    this.authError.set(null);

    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap((credential) => this.handleAuthSuccess(credential)),
      tap(() => this.loading.set(false)),
      catchError((error) => this.handleAuthError(error))
    );
  }

  /**
   * Sign in with Google
   */
  loginWithGoogle(): Observable<User> {
    this.loading.set(true);
    this.authError.set(null);

    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    return from(signInWithPopup(this.auth, provider)).pipe(
      switchMap((credential) => this.handleAuthSuccess(credential)),
      tap(() => this.loading.set(false)),
      catchError((error) => this.handleAuthError(error))
    );
  }

  /**
   * Register a new user with email and password
   */
  register(email: string, password: string, displayName: string): Observable<User> {
    this.loading.set(true);
    this.authError.set(null);

    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      switchMap(async (credential) => {
        // Update display name
        await updateProfile(credential.user, { displayName });

        // Send email verification
        await sendEmailVerification(credential.user);

        // Create user profile in Firestore
        const userProfile = await this.createUserProfile(credential.user, displayName);
        this.currentUser.set(userProfile);

        return userProfile;
      }),
      tap(() => this.loading.set(false)),
      catchError((error) => this.handleAuthError(error))
    );
  }

  /**
   * Sign out the current user
   */
  logout(): Observable<void> {
    return from(signOut(this.auth)).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.firebaseUser.set(null);
        this.router.navigate(['/login']);
      }),
      catchError((error) => {
        console.error('Logout error:', error);
        return of(void 0);
      })
    );
  }

  /**
   * Send password reset email
   */
  resetPassword(email: string): Observable<void> {
    this.loading.set(true);
    this.authError.set(null);

    return from(sendPasswordResetEmail(this.auth, email)).pipe(
      tap(() => this.loading.set(false)),
      catchError((error) => this.handleAuthError(error))
    );
  }

  /**
   * Resend email verification
   */
  resendVerificationEmail(): Observable<void> {
    const user = this.firebaseUser();
    if (!user) {
      return throwError(() => new Error('No user logged in'));
    }

    return from(sendEmailVerification(user)).pipe(
      catchError((error) => this.handleAuthError(error))
    );
  }

  /**
   * Check if the current user has a specific role
   */
  hasRole(role: UserRole): boolean {
    return this.userRoles().includes(role);
  }

  /**
   * Check if the current user has any of the specified roles
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some((role) => this.hasRole(role));
  }

  /**
   * Check if the current user has all specified roles
   */
  hasAllRoles(roles: UserRole[]): boolean {
    return roles.every((role) => this.hasRole(role));
  }

  /**
   * Check if the current user has a specific permission
   */
  hasPermission(permission: string): boolean {
    return this.userPermissions().includes(permission);
  }

  /**
   * Check if the current user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(permission));
  }

  /**
   * Update user roles (admin only operation)
   */
  async updateUserRoles(uid: string, roles: UserRole[]): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);
    await updateDoc(userRef, {
      roles,
      updatedAt: serverTimestamp(),
    });

    // Update local state if it's the current user
    if (this.currentUser()?.uid === uid) {
      this.currentUser.update((user) => (user ? { ...user, roles } : null));
    }
  }

  /**
   * Update user permissions (admin only operation)
   */
  async updateUserPermissions(uid: string, permissions: string[]): Promise<void> {
    const userRef = doc(this.firestore, 'users', uid);
    await updateDoc(userRef, {
      permissions,
      updatedAt: serverTimestamp(),
    });

    // Update local state if it's the current user
    if (this.currentUser()?.uid === uid) {
      this.currentUser.update((user) => (user ? { ...user, permissions } : null));
    }
  }

  /**
   * Get user profile from Firestore
   */
  private async getUserProfile(uid: string, emailVerified = false): Promise<User | null> {
    const userRef = doc(this.firestore, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      return {
        uid: userSnap.id,
        email: data.email,
        emailVerified,
        displayName: data.displayName,
        photoURL: data.photoURL,
        roles: data.roles ?? ['user'],
        permissions: data.permissions ?? ['read'],
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    }

    return null;
  }

  /**
   * Create user profile in Firestore
   */
  private async createUserProfile(
    firebaseUser: FirebaseUser,
    displayName?: string
  ): Promise<User> {
    const userRef = doc(this.firestore, 'users', firebaseUser.uid);

    const userProfile: UserProfile = {
      email: firebaseUser.email ?? '',
      displayName: displayName ?? firebaseUser.displayName ?? 'User',
      photoURL: firebaseUser.photoURL ?? null,
      roles: ['user'], // Default role
      permissions: ['read'], // Default permission
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(userRef, userProfile);

    return {
      uid: firebaseUser.uid,
      emailVerified: firebaseUser.emailVerified,
      ...userProfile,
    };
  }

  /**
   * Handle successful authentication
   */
  private async handleAuthSuccess(credential: UserCredential): Promise<User> {
    const firebaseUser = credential.user;
    let userProfile = await this.getUserProfile(firebaseUser.uid, firebaseUser.emailVerified);

    if (!userProfile) {
      userProfile = await this.createUserProfile(firebaseUser);
    } else {
      // Update last login
      const userRef = doc(this.firestore, 'users', firebaseUser.uid);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    this.currentUser.set(userProfile);
    return userProfile;
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: any): Observable<never> {
    this.loading.set(false);

    let message: string;
    switch (error.code) {
      case 'auth/user-not-found':
        message = 'No account found with this email address.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-credential':
        message = 'Invalid email or password. Please try again.';
        break;
      case 'auth/email-already-in-use':
        message = 'An account with this email already exists.';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Sign-in popup was closed. Please try again.';
        break;
      default:
        message = error.message || 'An error occurred. Please try again.';
    }

    this.authError.set(message);
    return throwError(() => new Error(message));
  }
}
