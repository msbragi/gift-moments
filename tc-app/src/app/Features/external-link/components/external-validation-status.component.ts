import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { UrlValidationState } from '../external-link.model';

/**
 * Component for displaying URL validation status
 * Shows validation progress, success state, and error messages
 */
@Component({
  selector: 'tc-external-validation-status',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TranslocoModule
  ],
  template: `
    <div *transloco="let t; read: 'external-link'">
      <!-- Validation Status -->
      <div class="validation-status" *ngIf="showStatus">
        <div class="status-indicator" *ngIf="validationState.isValidating">
          <mat-spinner diameter="20"></mat-spinner>
          <span>{{ t('validating') }}</span>
        </div>
        
        <div class="status-indicator success" *ngIf="validationState.isValid && !validationState.isValidating">
          <mat-icon color="primary">check_circle</mat-icon>
          <span>{{ t('provider-supported', { provider: validationState.providerName }) }}</span>
          <mat-icon *ngIf="validationState.supportsEmbed" [matTooltip]="t('supports-embed')">
            play_circle
          </mat-icon>
        </div>

        <div class="status-indicator error" *ngIf="!validationState.isValid && !validationState.isValidating && validationState.error">
          <mat-icon color="warn">error</mat-icon>
          <span>{{ validationState.error }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .validation-status {
      margin-bottom: 16px;
    }

    .status-indicator {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 4px;
      font-size: 14px;

      &.success {
        background-color: rgba(76, 175, 80, 0.1);
        color: #4caf50;
      }

      &.error {
        background-color: rgba(244, 67, 54, 0.1);
        color: #f44336;
      }

      mat-spinner {
        color: #2196f3;
      }
    }
  `]
})
export class ExternalValidationStatusComponent {
  /**
   * Current validation state
   */
  @Input() validationState: UrlValidationState = {
    isValid: false,
    isValidating: false
  };

  /**
   * Whether to show the validation status
   */
  @Input() showStatus = true;

  /**
   * Additional CSS classes for customization
   */
  @Input() cssClass?: string;
}
