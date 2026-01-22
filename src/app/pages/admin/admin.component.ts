import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core';

/**
 * Admin panel component - only accessible to users with 'admin' role
 */
@Component({
  selector: 'app-admin',
  imports: [RouterLink],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  protected readonly authService = inject(AuthService);

  protected readonly guardCode = `// Route configuration
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['admin'] }
}

// Alternative using factory function
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [requireRoles('admin')]
}`;
}
