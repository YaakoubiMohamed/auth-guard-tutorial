import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core';

/**
 * Profile component - protected route
 */
@Component({
  selector: 'app-profile',
  imports: [RouterLink],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  protected readonly authService = inject(AuthService);
  protected readonly user = this.authService.user;

  protected getInitials(): string {
    const name = this.user()?.displayName || this.user()?.email || '';
    const parts = name.split(/[\s@]+/);
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return name.charAt(0).toUpperCase() || '?';
  }
}
