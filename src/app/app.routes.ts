import { Routes } from '@angular/router';
import {
  authGuard,
  noAuthGuard,
  roleGuard,
  permissionGuard,
  requireRoles,
  requirePermissions,
} from './core';
import {
  HomeComponent,
  LoginComponent,
  DashboardComponent,
  ProfileComponent,
  AdminComponent,
  ModeratorComponent,
  SettingsComponent,
  UnauthorizedComponent,
} from './pages';
import { RegisterComponent } from './pages/register/register.component';

/**
 * Application routes with auth guards
 *
 * Best Practices Demonstrated:
 * 1. Functional guards (authGuard, roleGuard) instead of class-based guards
 * 2. noAuthGuard to prevent authenticated users from accessing login
 * 3. Role-based access control with roleGuard
 * 4. Permission-based access control with permissionGuard
 * 5. Factory functions for cleaner guard configuration
 * 6. Centralized unauthorized route for access denied scenarios
 */
export const routes: Routes = [
  // Public routes
  {
    path: '',
    component: HomeComponent,
    title: 'Home - Auth Guard Tutorial',
  },

  // Auth routes - only accessible when NOT logged in
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard],
    title: 'Sign In',
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [noAuthGuard],
    title: 'Create Account',
  },

  // Protected routes - require authentication
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    title: 'Dashboard',
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
    title: 'Profile',
  },

  // Role-based protected routes
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    title: 'Admin Panel',
  },

  // Multiple roles allowed (admin OR moderator)
  {
    path: 'moderator',
    component: ModeratorComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin', 'moderator'] },
    title: 'Moderator Panel',
  },

  // Permission-based protected route
  {
    path: 'settings',
    component: SettingsComponent,
    canActivate: [authGuard, permissionGuard],
    data: { permissions: ['write'] },
    title: 'Settings',
  },

  // Alternative syntax using factory functions (shown as comments for reference)
  // {
  //   path: 'admin-alt',
  //   component: AdminComponent,
  //   canActivate: [requireRoles('admin')],
  //   title: 'Admin Panel',
  // },
  // {
  //   path: 'reports',
  //   component: ReportsComponent,
  //   canActivate: [requirePermissions('reports.view', 'analytics.read')],
  //   title: 'Reports',
  // },

  // Access denied page
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
    title: 'Access Denied',
  },

  // Catch-all redirect
  {
    path: '**',
    redirectTo: '',
  },
];
