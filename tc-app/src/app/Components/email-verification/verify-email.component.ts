import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthService } from '../../Services/api/auth.service';
import { SnackbarService } from '../../Services/common/snackbar.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslocoDirective
  ],
  template: `
    <div *transloco="let t; read: 'emailVerification'" class="verification-container">
      <div class="verification-card">
        <div *ngIf="isLoading" class="loading-state">
          <mat-spinner diameter="50"></mat-spinner>
          <p>{{ t('verifying') }}</p>
        </div>
        
        <div *ngIf="!isLoading && isVerified" class="success-state">
          <mat-icon class="success-icon">check_circle</mat-icon>
          <h1>{{ t('verificationSuccess') }}</h1>
          <p>{{ t('accountVerified') }}</p>
          <button mat-raised-button color="primary" (click)="navigateToLogin()">
            {{ t('proceedToLogin') }}
          </button>
        </div>
        
        <div *ngIf="!isLoading && !isVerified" class="error-state">
          <mat-icon class="error-icon">error</mat-icon>
          <h1>{{ t('verificationFailed') }}</h1>
          <p>{{ errorMessage }}</p>
          <button mat-raised-button color="primary" (click)="resendVerification()" *ngIf="canResend">
            {{ t('resendVerification') }}
          </button>
          <button mat-stroked-button (click)="navigateToLogin()" class="login-button">
            {{ t('backToLogin') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verification-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
    }
    
    .verification-card {
      width: 100%;
      max-width: 500px;
      padding: 3rem 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    
    .loading-state, .success-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .success-icon, .error-icon {
      font-size: 4rem;
      height: 4rem;
      width: 4rem;
      margin-bottom: 1rem;
    }
    
    .success-icon {
      color: #4caf50;
    }
    
    .error-icon {
      color: #f44336;
    }
    
    h1 {
      margin-bottom: 1rem;
      color: #333;
    }
    
    p {
      margin-bottom: 1.5rem;
      font-size: 1rem;
      color: #555;
    }
    
    button {
      margin-top: 0.5rem;
    }
    
    .login-button {
      margin-top: 1rem;
    }
  `]
})
export class VerifyEmailComponent implements OnInit {
  isLoading = true;
  isVerified = false;
  canResend = false;
  errorMessage = '';
  private token = '';
  private email = '';
  
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBarService: SnackbarService,
    private router: Router
  ) {}
  
  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
      this.email = params['email'];
      
      if (!this.token) {
        this.isLoading = false;
        this.errorMessage = 'Missing verification token. Please check your email link.';
        return;
      }
      
      this.verifyEmail();
    });
  }
  
  verifyEmail() {
    this.authService.verifyEmail(this.token).subscribe({
      next: () => {
        this.isLoading = false;
        this.isVerified = true;
      },
      error: (error) => {
        this.isLoading = false;
        this.isVerified = false;
        this.canResend = !!this.email;
        
        if (error.status === 410) {
          this.errorMessage = 'Verification link expired. Please request a new one.';
        } else if (error.status === 404) {
          this.errorMessage = 'Invalid verification token. Please check your email link.';
        } else {
          this.errorMessage = 'Failed to verify email. Please try again later.';
        }
      }
    });
  }
  
  resendVerification() {
    if (!this.email) {
      this.snackBarService.error('Email address is missing. Please request verification from the login page.');
      return;
    }
    
    this.authService.resendVerificationEmail(this.email).subscribe({
      next: () => {
        this.snackBarService.success('Verification email sent. Please check your inbox.');
        this.router.navigate(['/email-verification-notice']);
      }
    });
  }
  
  navigateToLogin() {
    this.router.navigate(['/login']);
  }
}