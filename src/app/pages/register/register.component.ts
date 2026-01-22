import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core';

/**
 * Registration component with Firebase Authentication
 */
@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected displayName = '';
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected successMessage = signal<string>('');

  protected onSubmit(): void {
    this.successMessage.set('');

    this.authService.register(this.email, this.password, this.displayName).subscribe({
      next: () => {
        this.successMessage.set('Account created! Please check your email to verify your account.');
        // Optionally redirect after a delay
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
    });
  }

  protected onGoogleSignUp(): void {
    this.successMessage.set('');

    this.authService.loginWithGoogle().subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
    });
  }
}
