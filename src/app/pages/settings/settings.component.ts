import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core';

/**
 * Settings component - requires 'write' permission
 */
@Component({
  selector: 'app-settings',
  imports: [RouterLink],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
  protected readonly authService = inject(AuthService);

  protected readonly guardCode = `// Permission-based access control
{
  path: 'settings',
  component: SettingsComponent,
  canActivate: [authGuard, permissionGuard],
  data: { permissions: ['write'] }
}

// Using factory function
{
  path: 'settings',
  component: SettingsComponent,
  canActivate: [requirePermissions('write')]
}`;
}
