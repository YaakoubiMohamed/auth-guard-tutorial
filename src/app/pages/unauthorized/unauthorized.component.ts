import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core';

/**
 * Unauthorized page - shown when user lacks required permissions
 */
@Component({
  selector: 'app-unauthorized',
  imports: [RouterLink],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['./unauthorized.component.css'],
})
export class UnauthorizedComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected goBack(): void {
    // Navigate back in history, or to dashboard if no history
    window.history.length > 1 ? window.history.back() : this.router.navigate(['/dashboard']);
  }
}
