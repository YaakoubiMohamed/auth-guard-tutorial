import { inject } from '@angular/core';
import { Router, CanActivateFn, CanMatchFn, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional auth guard to protect routes that require authentication
 * Using functional guards is the recommended approach in Angular 20
 *
 * Usage in routes:
 * { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to initialize
  if (authService.isLoading()) {
    // Return a promise that resolves when loading is complete
    return new Promise((resolve) => {
      const checkAuth = setInterval(() => {
        if (!authService.isLoading()) {
          clearInterval(checkAuth);
          if (authService.isAuthenticated()) {
            resolve(true);
          } else {
            resolve(router.createUrlTree(['/login'], {
              queryParams: { returnUrl: state.url },
            }));
          }
        }
      }, 50);
    });
  }

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  const returnUrl = state.url;

  // Redirect to login page with return URL
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl },
  });
};

/**
 * CanMatch guard - prevents loading of lazy-loaded modules if not authenticated
 * More efficient than canActivate for lazy-loaded routes as it prevents
 * the module from being downloaded at all
 *
 * Usage in routes:
 * { path: 'admin', loadChildren: () => import(...), canMatch: [authMatchGuard] }
 */
export const authMatchGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Construct the attempted URL from segments
  const returnUrl = '/' + segments.map((s) => s.path).join('/');

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl },
  });
};

/**
 * Guard to prevent authenticated users from accessing login/register pages
 * Redirects to dashboard if already logged in
 *
 * Usage in routes:
 * { path: 'login', component: LoginComponent, canActivate: [noAuthGuard] }
 */
export const noAuthGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Wait for auth to initialize
  if (authService.isLoading()) {
    return new Promise((resolve) => {
      const checkAuth = setInterval(() => {
        if (!authService.isLoading()) {
          clearInterval(checkAuth);
          if (!authService.isAuthenticated()) {
            resolve(true);
          } else {
            resolve(router.createUrlTree(['/dashboard']));
          }
        }
      }, 50);
    });
  }

  if (!authService.isAuthenticated()) {
    return true;
  }

  // User is already logged in, redirect to dashboard
  return router.createUrlTree(['/dashboard']);
};

/**
 * Guard factory to check if user can deactivate (leave) a component
 * Useful for forms with unsaved changes
 *
 * Components using this guard should implement the CanDeactivateComponent interface
 */
export interface CanDeactivateComponent {
  canDeactivate: () => boolean | UrlTree | Promise<boolean | UrlTree>;
}

export const canDeactivateGuard = (component: CanDeactivateComponent) => {
  return component.canDeactivate ? component.canDeactivate() : true;
};
