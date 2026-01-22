import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

/**
 * Route data interface for role-based access control
 */
export interface RoleRouteData {
  roles?: UserRole[];
  permissions?: string[];
  requireAll?: boolean; // If true, user must have ALL roles/permissions
}

/**
 * Role-based access guard
 * Checks if the authenticated user has the required roles to access a route
 *
 * Usage in routes:
 * {
 *   path: 'admin',
 *   component: AdminComponent,
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: ['admin'] }
 * }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if user is authenticated
  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const routeData = route.data as RoleRouteData;
  const requiredRoles = routeData.roles ?? [];
  const requireAll = routeData.requireAll ?? false;

  // If no roles are specified, allow access
  if (requiredRoles.length === 0) {
    return true;
  }

  // Check roles based on requireAll flag
  const hasAccess = requireAll
    ? authService.hasAllRoles(requiredRoles)
    : authService.hasAnyRole(requiredRoles);

  if (hasAccess) {
    return true;
  }

  // User doesn't have required roles, redirect to unauthorized page
  return router.createUrlTree(['/unauthorized']);
};

/**
 * Permission-based access guard
 * Checks if the authenticated user has the required permissions
 *
 * Usage in routes:
 * {
 *   path: 'settings',
 *   component: SettingsComponent,
 *   canActivate: [authGuard, permissionGuard],
 *   data: { permissions: ['settings.read', 'settings.write'], requireAll: true }
 * }
 */
export const permissionGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const routeData = route.data as RoleRouteData;
  const requiredPermissions = routeData.permissions ?? [];
  const requireAll = routeData.requireAll ?? false;

  if (requiredPermissions.length === 0) {
    return true;
  }

  const hasAccess = requireAll
    ? requiredPermissions.every((p) => authService.hasPermission(p))
    : authService.hasAnyPermission(requiredPermissions);

  if (hasAccess) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};

/**
 * Factory function to create a role guard with specific roles
 * Useful for cleaner route configuration
 *
 * Usage in routes:
 * { path: 'admin', component: AdminComponent, canActivate: [requireRoles('admin', 'moderator')] }
 */
export function requireRoles(...roles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    if (authService.hasAnyRole(roles)) {
      return true;
    }

    return router.createUrlTree(['/unauthorized']);
  };
}

/**
 * Factory function to create a permission guard with specific permissions
 *
 * Usage in routes:
 * { path: 'reports', component: ReportsComponent, canActivate: [requirePermissions('reports.view')] }
 */
export function requirePermissions(...permissions: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    if (authService.hasAnyPermission(permissions)) {
      return true;
    }

    return router.createUrlTree(['/unauthorized']);
  };
}
