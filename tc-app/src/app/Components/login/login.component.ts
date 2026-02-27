import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthService } from '../../Services/api/auth.service';
import { GoogleAuthService } from '../../Services/common/google-auth.service';
import { SnackbarService } from '../../Services/common/snackbar.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    TranslocoDirective
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  hidePassword: boolean = true;

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  constructor(
    private authService: AuthService,
    private googleAuthService: GoogleAuthService,
    private router: Router,
    private snackBarService: SnackbarService
  ) { }

  ngOnInit(): void {
    // Initialize Google Sign-In on component load
    this.googleAuthService.initialize().subscribe();
    /*
    this.loginForm.setValue({
      "email": "john.doe@example.com",
      "password": "Password123!"
    });
    */
  }

  /**
   * Handle standard email/password login
   */
  submit(): void {
    if (this.loginForm.invalid) {
      // Mark form controls as touched to show validation errors
      this.loginForm.markAllAsTouched();
      return;
    }

    const email = this.loginForm.get('email')?.value || '';
    const password = this.loginForm.get('password')?.value || '';

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.snackBarService.success('Login successful!');
        this.router.navigate(['/dashboard']);
      }
    });
  }

  /**
   * Trigger Google Sign-In flow
   */
  triggerGoogleLogin(): void {
    this.googleAuthService.triggerLogin().subscribe();
  }

  /**
   * Navigate to forgot password page
   */
  navigateToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }

  /**
   * Navigate to register page
   */
  navigateToRegister(): void {
    this.router.navigate(['/register']);
  }
}