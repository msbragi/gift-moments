import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@jsverse/transloco';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { UrlValidationState } from '../external-link.model';
import { ExternalValidationStatusComponent } from './external-validation-status.component';

/**
 * Component for URL input with validation and status display
 * Handles URL input and real-time validation
 */
@Component({
  selector: 'tc-external-url-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    TranslocoModule,
    ExternalValidationStatusComponent
  ],
  template: `
    <div *transloco="let t; read: 'external-link'">
      <!-- URL Input -->
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>{{ t('url-label') }}</mat-label>
        <input
          matInput
          [formControl]="urlControl"
          [placeholder]="placeholder || t('url-placeholder')"
          type="url"
          autocomplete="url"
        >
        <mat-icon matSuffix>link</mat-icon>
        <mat-error *ngIf="urlControl.hasError('required')">
          {{ t('url-required') }}
        </mat-error>
        <mat-error *ngIf="urlControl.hasError('invalidUrl')">
          {{ t('url-invalid') }}
        </mat-error>
        <mat-error *ngIf="validationState.error">
          {{ validationState.error }}
        </mat-error>
      </mat-form-field>

      <!-- Validation Status -->
      <tc-external-validation-status
        [validationState]="validationState"
        [showStatus]="!!urlControl.value">
      </tc-external-validation-status>
    </div>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class ExternalUrlInputComponent implements OnInit, OnDestroy {
  /**
   * Initial URL value
   */
  @Input() initialUrl?: string;

  /**
   * Placeholder text for URL input
   */
  @Input() placeholder?: string;

  /**
   * Current validation state
   */
  @Input() validationState: UrlValidationState = {
    isValid: false,
    isValidating: false
  };

  /**
   * Event emitted when URL value changes
   */
  @Output() urlChange = new EventEmitter<string>();

  /**
   * Event emitted when URL validation is requested
   */
  @Output() validateUrl = new EventEmitter<string>();

  urlControl = new FormControl('', [Validators.required, this.urlValidator]);
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Set initial value if provided
    if (this.initialUrl) {
      this.urlControl.setValue(this.initialUrl);
    }

    // Set up URL validation
    this.urlControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(url => {
      if (url) {
        this.urlChange.emit(url);
        this.validateUrl.emit(url);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Get the current URL value
   */
  getValue(): string | null {
    return this.urlControl.value;
  }

  /**
   * Check if the form control is valid
   */
  isValid(): boolean {
    return this.urlControl.valid;
  }

  /**
   * Custom URL validator
   */
  private urlValidator(control: any) {
    if (!control.value) {
      return null;
    }

    try {
      new URL(control.value);
      return null;
    } catch {
      return { invalidUrl: true };
    }
  }
}
