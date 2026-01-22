import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core';

/**
 * Login component with Firebase Authentication
 * Supports email/password and Google sign-in
 */
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected email = '';
  protected password = '';
  protected successMessage = signal<string>('');

  protected onSubmit(): void {
    this.successMessage.set('');

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
    });
  }

  protected onGoogleSignIn(): void {
    this.successMessage.set('');

    this.authService.loginWithGoogle().subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
    });
  }

  protected onForgotPassword(): void {
    if (!this.email) return;

    this.authService.resetPassword(this.email).subscribe({
      next: () => {
        this.successMessage.set('Password reset email sent! Check your inbox.');
      },
    });
  }
}
