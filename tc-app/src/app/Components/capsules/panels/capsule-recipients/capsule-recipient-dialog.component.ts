import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslocoModule } from '@jsverse/transloco';
import { IRecipient } from '../../../../Models/models.interface';

/**
 * Dialog data interface
 */
export interface RecipientDialogData {
  capsuleId: number;
  recipient?: IRecipient;  // If provided, we're in edit mode
  title: string;
}

/**
 * Dialog result interface
 */
export interface RecipientDialogResult {
  email: string;
  fullName?: string;
}

@Component({
  selector: 'tc-capsule-recipient-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    TranslocoModule
  ],
  template: `
    <div *transloco="let t; read: 'recipients'" class="recipient-dialog">
      <h2 mat-dialog-title>{{ data.title }}</h2>
      
      <form [formGroup]="recipientForm" (ngSubmit)="onSubmit()">
        <mat-dialog-content>
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ t('dialog.email') }}</mat-label>
            <input matInput formControlName="email" placeholder="example@email.com" required>
            <mat-error *ngIf="recipientForm.controls['email'].hasError('required')">
              {{ t('dialog.emailRequired') }}
            </mat-error>
            <mat-error *ngIf="recipientForm.controls['email'].hasError('email')">
              {{ t('dialog.emailInvalid') }}
            </mat-error>
          </mat-form-field>
          
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>{{ t('dialog.fullName') }}</mat-label>
            <input matInput formControlName="fullName" placeholder="{{ t('dialog.fullNamePlaceholder') }}">
          </mat-form-field>
        </mat-dialog-content>
        
        <mat-dialog-actions align="end">
          <button mat-button mat-dialog-close type="button">{{ t('dialog.cancel') }}</button>
          <button mat-raised-button color="primary" type="submit" [disabled]="recipientForm.invalid">
            {{ t('dialog.save') }}
          </button>
        </mat-dialog-actions>
      </form>
    </div>
  `,
  styles: [`
    .recipient-dialog {
      min-width: 300px;
    }
    
    .full-width {
      width: 100%;
    }
    
    mat-dialog-content {
      padding-top: 16px;
    }
  `]
})
export class CapsuleRecipientDialogComponent {
  recipientForm: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CapsuleRecipientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RecipientDialogData
  ) {
    // Initialize form with validator for email
    this.recipientForm = this.fb.group({
      email: [data.recipient?.email || '', [Validators.required, Validators.email]],
      fullName: [data.recipient?.fullName || '']
    });
  }
  
  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.recipientForm.valid) {
      this.dialogRef.close(this.recipientForm.value);
    }
  }
}
