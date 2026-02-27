import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-email-verification-notice',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    TranslocoDirective
  ],
  template: `
    <div *transloco="let t; read: 'emailVerification'" class="email-verification-container">
      <div class="verification-card">
        <div class="icon-container">
          <mat-icon color="primary">mail_outline</mat-icon>
        </div>
        <h1>{{ t('checkEmail') }}</h1>
        <p>{{ t('verificationSent') }}</p>
        <p class="note">{{ t('checkSpam') }}</p>
        <a mat-raised-button color="primary" routerLink="login">
          {{ t('backToLogin') }}
        </a>
      </div>
    </div>
  `,
  styles: [`
    .email-verification-container {
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
    
    .icon-container {
      margin-bottom: 1rem;
    }
    
    .icon-container mat-icon {
      font-size: 4rem;
      height: 4rem;
      width: 4rem;
      color: #3f51b5;
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
    
    .note {
      font-size: 0.9rem;
      color: #777;
      font-style: italic;
    }
    
    a {
      margin-top: 1rem;
    }
  `]
})
export class EmailVerificationNoticeComponent {}