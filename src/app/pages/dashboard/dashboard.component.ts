import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core';

/**
 * Dashboard component - protected route
 * Only accessible to authenticated users
 */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  protected readonly authService = inject(AuthService);
  protected readonly user = this.authService.user;
}
