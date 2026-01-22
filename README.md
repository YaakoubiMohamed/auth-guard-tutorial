# 🔐 Angular 20 Authentication Guard Tutorial

A comprehensive Angular 20 application demonstrating **best practices** for implementing authentication guards with **Firebase Authentication**, **Firestore**, and modern Angular patterns including **functional guards**, **signals**, and **zoneless change detection**.

## 📋 Table of Contents

- [Features](#-features)
- [Technologies](#-technologies)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Firebase Setup](#-firebase-setup)
- [Running the Application](#-running-the-application)
- [Implementation Guide](#-implementation-guide)
- [Authentication Flow](#-authentication-flow)
- [Guard Types](#-guard-types)
- [Best Practices](#-best-practices)
- [Additional Resources](#-additional-resources)

## ✨ Features

### Authentication
- ✅ Email/Password authentication with Firebase
- ✅ Google OAuth sign-in
- ✅ User registration with email verification
- ✅ Password reset functionality
- ✅ Session persistence
- ✅ Automatic token refresh

### Authorization
- ✅ **Functional route guards** (CanActivate, CanMatch)
- ✅ **Role-based access control** (Admin, Moderator, User)
- ✅ **Permission-based access control** (Read, Write, Delete)
- ✅ Route protection with redirect to login
- ✅ Unauthorized access handling

### Modern Angular Patterns
- ✅ **Angular Signals** for reactive state management
- ✅ **Zoneless change detection** for better performance
- ✅ **Standalone components** (no modules)
- ✅ **Functional guards** with `inject()` function
- ✅ **Computed signals** for derived state
- ✅ **View transitions** for smooth navigation

### UI/UX
- ✅ Responsive design
- ✅ Loading states and spinners
- ✅ Error handling with user-friendly messages
- ✅ Form validation
- ✅ Protected route indicators

## 🛠️ Technologies

- **Angular 20.3.8** - Latest Angular with standalone components
- **Firebase 11.1.0** - Backend-as-a-Service for auth and database
- **@angular/fire 18.0.1** - Official Angular library for Firebase
- **TypeScript 5.7** - Type-safe JavaScript
- **RxJS 7.8** - Reactive programming
- **Zoneless Change Detection** - Improved performance

## 📁 Project Structure

```
auth-guard-tutorial/
├── src/
│   ├── app/
│   │   ├── core/                    # Core application features
│   │   │   ├── guards/              # Authentication & authorization guards
│   │   │   │   ├── auth.guard.ts    # Auth guards (authGuard, noAuthGuard)
│   │   │   │   ├── role.guard.ts    # Role-based guards
│   │   │   │   └── permission.guard.ts # Permission-based guards
│   │   │   ├── models/              # TypeScript interfaces
│   │   │   │   └── user.model.ts    # User, UserProfile, LoginCredentials
│   │   │   ├── services/            # Business logic services
│   │   │   │   ├── auth.service.ts  # Firebase authentication service
│   │   │   │   └── firestore.service.ts # Firestore CRUD operations
│   │   │   └── index.ts             # Barrel exports
│   │   ├── pages/                   # Feature pages (components)
│   │   │   ├── home/                # Public landing page
│   │   │   ├── login/               # Login page
│   │   │   ├── register/            # Registration page
│   │   │   ├── dashboard/           # Protected dashboard
│   │   │   ├── profile/             # User profile page
│   │   │   ├── admin/               # Admin-only page
│   │   │   ├── moderator/           # Moderator page
│   │   │   ├── settings/            # Settings page
│   │   │   └── unauthorized/        # 403 Forbidden page
│   │   ├── app.config.ts            # Application configuration
│   │   ├── app.routes.ts            # Route definitions with guards
│   │   └── app.ts                   # Root component
│   ├── environments/
│   │   └── environment.ts           # Firebase configuration
│   ├── index.html                   # Main HTML file
│   ├── main.ts                      # Application bootstrap
│   └── styles.css                   # Global styles
├── angular.json                     # Angular CLI configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json                     # Dependencies
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** (v9 or higher) - Comes with Node.js
- **Angular CLI** (v20 or higher):
  ```bash
  npm install -g @angular/cli
  ```
- **Firebase Account** - [Sign up](https://firebase.google.com/)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd auth-guard-tutorial
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Angular core packages
- Firebase and @angular/fire
- RxJS for reactive programming
- TypeScript

## 🔥 Firebase Setup

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., "auth-guard-tutorial")
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Step 2: Register Your Web App

1. In Firebase Console, click the **Web icon** (`</>`)
2. Register app with a nickname (e.g., "Angular Auth App")
3. Copy the Firebase configuration object

### Step 3: Configure Firebase in Your App

Update `src/environments/environment.ts` with your Firebase config:

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  }
};
```

### Step 4: Enable Authentication Methods

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle "Enable"
   - Save
3. Enable **Google** sign-in:
   - Click on "Google"
   - Toggle "Enable"
   - Select a support email
   - Save

### Step 5: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **"Create database"**
3. Select **"Start in test mode"** (for development)
4. Choose a location
5. Click **"Enable"**

### Step 6: Configure Firestore Security Rules

Replace the default rules with these (for development):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read their own profile
      allow read: if request.auth != null && request.auth.uid == userId;
      // Users can update their own profile (except roles/permissions)
      allow update: if request.auth != null 
        && request.auth.uid == userId
        && !request.resource.data.diff(resource.data).affectedKeys().hasAny(['roles', 'permissions']);
      // Only authenticated users can create profiles (via auth service)
      allow create: if request.auth != null;
    }
  }
}
```

## 🎮 Running the Application

### Development Server

Start the development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The app will automatically reload when you modify source files.

### Build for Production

```bash
ng build
```

Build artifacts will be stored in the `dist/` directory.

### Run Tests

```bash
ng test
```

## 📖 Implementation Guide

### Step 1: Set Up Firebase Authentication Service

The `AuthService` (`src/app/core/services/auth.service.ts`) handles all authentication operations:

**Key Features:**
- Firebase auth state listener with cleanup
- User profile management in Firestore
- Signal-based reactive state
- Error handling with user-friendly messages

**Core Methods:**
```typescript
login(email: string, password: string): Observable<User>
loginWithGoogle(): Observable<User>
register(email: string, password: string, displayName: string): Observable<User>
logout(): Observable<void>
resetPassword(email: string): Observable<void>
```

**Signals:**
```typescript
user = signal<User | null>(null)           // Current user
isLoading = signal<boolean>(true)          // Loading state
error = signal<string | null>(null)        // Error messages
isAuthenticated = computed(...)            // Derived auth state
```

### Step 2: Create Authentication Guards

#### Auth Guard (Protected Routes)

`src/app/core/guards/auth.guard.ts`

**Purpose:** Protect routes that require authentication

```typescript
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth initialization
  while (authService.isLoading()) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], { 
      queryParams: { returnUrl: state.url } 
    });
    return false;
  }

  return true;
};
```

#### No Auth Guard (Public Routes)

**Purpose:** Prevent authenticated users from accessing login/register pages

```typescript
export const noAuthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
```

### Step 3: Implement Role-Based Guards

`src/app/core/guards/role.guard.ts`

```typescript
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const requiredRoles = route.data['roles'] as UserRole[];

  if (!authService.hasAnyRole(requiredRoles)) {
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};

// Factory function for cleaner usage
export function requireRoles(...roles: UserRole[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.hasAnyRole(roles)) {
      router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  };
}
```

### Step 4: Configure Routes with Guards

`src/app/app.routes.ts`

```typescript
export const routes: Routes = [
  // Public routes
  { 
    path: '', 
    component: HomeComponent 
  },

  // Auth routes (no auth required, redirects if logged in)
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [noAuthGuard] 
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [noAuthGuard] 
  },

  // Protected routes (authentication required)
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard] 
  },
  { 
    path: 'profile', 
    component: ProfileComponent,
    canActivate: [authGuard] 
  },

  // Role-based routes
  { 
    path: 'admin', 
    component: AdminComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  { 
    path: 'moderator', 
    component: ModeratorComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'moderator'] }
  },

  // Permission-based routes
  { 
    path: 'settings', 
    component: SettingsComponent,
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['write'] }
  },

  // Unauthorized page
  { 
    path: 'unauthorized', 
    component: UnauthorizedComponent 
  },

  // Catch-all redirect
  { 
    path: '**', 
    redirectTo: '' 
  }
];
```

### Step 5: Configure Application Providers

`src/app/app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions()
    ),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ],
};
```

### Step 6: Create User Models

`src/app/core/models/user.model.ts`

```typescript
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

export type UserRole = 'admin' | 'user' | 'moderator' | 'guest';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  displayName: string;
}
```

### Step 7: Implement Login Component

`src/app/pages/login/login.component.ts`

**Features:**
- Email/password authentication
- Google OAuth sign-in
- Password reset functionality
- Form validation
- Loading states
- Error handling

```typescript
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected email = '';
  protected password = '';

  protected onSubmit(): void {
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      }
    });
  }

  protected onGoogleSignIn(): void {
    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      }
    });
  }
}
```

### Step 8: Create Protected Dashboard

`src/app/pages/dashboard/dashboard.component.ts`

**Features:**
- Displays user information
- Shows accessible routes based on roles
- Navigation to other protected pages
- Logout functionality

```typescript
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  protected readonly authService = inject(AuthService);
  protected readonly user = this.authService.user;
}
```

## 🔄 Authentication Flow

### Registration Flow

1. User fills registration form
2. `AuthService.register()` creates Firebase user
3. Email verification sent automatically
4. User profile created in Firestore `users` collection
5. Default role 'user' and permission 'read' assigned
6. User redirected to dashboard

### Login Flow

1. User enters credentials
2. `AuthService.login()` authenticates with Firebase
3. `onAuthStateChanged` listener triggered
4. User profile fetched from Firestore
5. User state updated via signals
6. User redirected to dashboard or returnUrl

### Google OAuth Flow

1. User clicks "Sign in with Google"
2. Google OAuth popup appears
3. User selects Google account
4. Firebase creates/retrieves user
5. User profile created/updated in Firestore
6. User redirected to dashboard

### Logout Flow

1. User clicks logout
2. `AuthService.logout()` called
3. Firebase signs out user
4. `onAuthStateChanged` triggered with null
5. User state cleared
6. Redirected to home page

## 🛡️ Guard Types

### 1. Authentication Guard (`authGuard`)
**Purpose:** Ensures user is logged in
**Use Case:** Protected routes like dashboard, profile
**Behavior:** Redirects to login if not authenticated

### 2. No Auth Guard (`noAuthGuard`)
**Purpose:** Prevents authenticated users from accessing auth pages
**Use Case:** Login, registration pages
**Behavior:** Redirects to dashboard if already logged in

### 3. Role Guard (`roleGuard`)
**Purpose:** Checks user has required role(s)
**Use Case:** Admin panel, moderator tools
**Behavior:** Redirects to unauthorized if insufficient role

### 4. Permission Guard (`permissionGuard`)
**Purpose:** Checks user has required permission(s)
**Use Case:** Settings, delete operations
**Behavior:** Redirects to unauthorized if insufficient permissions

### 5. Match Guard (`authMatchGuard`)
**Purpose:** Lazy loading with authentication check
**Use Case:** Preventing module download for unauthorized users
**Behavior:** Same as authGuard but for `canMatch`

## ✅ Best Practices

### 1. Use Functional Guards
✅ **Do:** Use functional guards with `inject()`
```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  return authService.isAuthenticated();
};
```

❌ **Don't:** Use class-based guards (deprecated)

### 2. Leverage Angular Signals
✅ **Do:** Use signals for reactive state
```typescript
private currentUser = signal<User | null>(null);
readonly user = this.currentUser.asReadonly();
readonly isAuthenticated = computed(() => !!this.currentUser());
```

### 3. Handle Async Auth State
✅ **Do:** Wait for auth initialization
```typescript
while (authService.isLoading()) {
  await new Promise(resolve => setTimeout(resolve, 100));
}
```

### 4. Store Sensitive Data Securely
✅ **Do:** Use Firebase Auth tokens (automatic)
✅ **Do:** Store user metadata in Firestore
❌ **Don't:** Store tokens in localStorage manually

### 5. Implement Proper Error Handling
✅ **Do:** Provide user-friendly error messages
```typescript
private handleAuthError(error: any): Observable<never> {
  let message: string;
  switch (error.code) {
    case 'auth/user-not-found':
      message = 'No account found with this email.';
      break;
    case 'auth/wrong-password':
      message = 'Incorrect password.';
      break;
    default:
      message = 'An error occurred. Please try again.';
  }
  this.authError.set(message);
  return throwError(() => new Error(message));
}
```

### 6. Clean Up Subscriptions
✅ **Do:** Unsubscribe from Firebase listeners
```typescript
ngOnDestroy(): void {
  this.unsubscribeAuth?.();
}
```

### 7. Use TypeScript Interfaces
✅ **Do:** Define strong types for user data
```typescript
export interface User {
  uid: string;
  email: string;
  roles: UserRole[];
}
```

### 8. Separate Concerns
✅ **Do:** Use services for business logic
✅ **Do:** Use guards only for route protection
✅ **Do:** Keep components focused on presentation

## 📚 Additional Resources

### Angular Documentation
- [Angular Guards](https://angular.dev/guide/guards)
- [Angular Signals](https://angular.dev/guide/signals)
- [Standalone Components](https://angular.dev/guide/components/importing)

### Firebase Documentation
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Firestore](https://firebase.google.com/docs/firestore)
- [@angular/fire](https://github.com/angular/angularfire)

### Angular CLI Commands

```bash
# Generate new component
ng generate component pages/new-page

# Generate new service
ng generate service core/services/new-service

# Generate new guard
ng generate guard core/guards/new-guard

# Serve with specific port
ng serve --port 4201

# Build for production
ng build --configuration production

# Run tests
ng test

# Run linter
ng lint
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

Created as an educational resource for learning Angular authentication and authorization patterns.

---

**Happy Coding! 🚀**
