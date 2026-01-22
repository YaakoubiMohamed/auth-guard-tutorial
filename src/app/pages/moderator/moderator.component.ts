import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core';

/**
 * Moderator panel component - accessible to admin OR moderator roles
 */
@Component({
  selector: 'app-moderator',
  imports: [RouterLink],
  templateUrl: './moderator.component.html',
  styleUrls: ['./moderator.component.css'],
})
export class ModeratorComponent {
  protected readonly authService = inject(AuthService);

  protected readonly guardCode = `// Route allowing multiple roles
{
  path: 'moderator',
  component: ModeratorComponent,
  canActivate: [authGuard, roleGuard],
  data: { roles: ['admin', 'moderator'] }  // ANY of these roles
}

// Using factory function
{
  path: 'moderator',
  component: ModeratorComponent,
  canActivate: [requireRoles('admin', 'moderator')]
}`;
}
