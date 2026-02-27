import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoModule } from '@jsverse/transloco';
import { Subject, takeUntil } from 'rxjs';
import { IExternalProvider, IRemoteContent } from '../../Models/external-providers.interface';
import { ExternalProviderService } from '../../Services/common/external-providers/external-provider.service';
import { ExternalContentPreviewComponent } from './components/external-content-preview.component';
import { ExternalProviderListComponent } from './components/external-provider-list.component';
import { ExternalUrlInputComponent } from './components/external-url-input.component';
import { ExternalLinkDialogData, ExternalLinkDialogResult, UrlValidationState } from './external-link.model';

/**
 * Dialog component for adding external links
 * Provides URL validation, provider detection, and content preview
 */
@Component({
  selector: 'tc-external-link-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslocoModule,
    ExternalProviderListComponent,
    ExternalUrlInputComponent,
    ExternalContentPreviewComponent
  ],
  templateUrl: './external-link-dialog.component.html',
  styleUrl: './external-link-dialog.component.scss',
})
export class ExternalLinkDialogComponent implements OnInit, OnDestroy {

  validationState: UrlValidationState = {
    isValid: false,
    isValidating: false
  };
  remoteContent?: IRemoteContent;
  currentProvider?: IExternalProvider;
  currentUrl?: string;

  private destroy$ = new Subject<void>();

  constructor(
    private dialogRef: MatDialogRef<ExternalLinkDialogComponent>,
    private externalProviderService: ExternalProviderService,
    @Inject(MAT_DIALOG_DATA) public data: ExternalLinkDialogData
  ) {
    // Set initial URL if provided
    if (data.initialUrl) {
      this.currentUrl = data.initialUrl;
    }
  }

  ngOnInit(): void {
    // In readonly mode, use provided remote content and skip validation
    if (this.data.readonly && this.data.remoteContent) {
      this.remoteContent = this.data.remoteContent;
      this.currentProvider = this.data.remoteContent.provider;
      this.validationState = {
        isValid: true,
        isValidating: false,
        providerName: this.data.remoteContent.provider.name,
        supportsEmbed: this.data.remoteContent.provider.embedSupport
      };
      return;
    }

    // Validate initial URL if provided
    if (this.data.initialUrl) {
      this.validateUrl(this.data.initialUrl);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Validate URL against external providers
   */
  validateUrl(url: string): void {
    if (!url) {
      this.resetValidation();
      return;
    }

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      this.validationState = {
        isValid: false,
        isValidating: false,
        error: 'Invalid URL format'
      };
      return;
    }

    this.validationState = {
      isValid: false,
      isValidating: true,
      error: undefined
    };

    // Check if URL is supported
    const provider = this.externalProviderService.validateProviderUrl(url);

    if (!provider) {
      this.currentProvider = undefined;
      this.validationState = {
        isValid: false,
        isValidating: false,
        error: 'Provider not supported. Only YouTube and Vimeo are currently supported.'
      };
      return;
    }

    // Set current provider from configuration
    this.currentProvider = provider;

    // Extract metadata
    this.externalProviderService.extractMetadata(url).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (remoteContent) => {
        this.remoteContent = remoteContent;
        this.validationState = {
          isValid: true,
          isValidating: false,
          providerName: provider.name,
          supportsEmbed: provider.embedSupport
        };
      },
      error: (error) => {
        this.validationState = {
          isValid: false,
          isValidating: false,
          error: 'Failed to validate URL. Please check the link and try again.'
        };
      }
    });
  }

  /**
   * Handle URL change from the input component
   */
  onUrlChange(url: string): void {
    this.currentUrl = url;
  }

  /**
   * Reset validation state
   */
  private resetValidation(): void {
    this.validationState = {
      isValid: false,
      isValidating: false
    };
    this.remoteContent = undefined;
    this.currentProvider = undefined;
  }

  /**
   * Get list of supported providers
   */
  getSupportedProviders(): IExternalProvider[] {
    return this.externalProviderService.getAvailableProviders();
  }

  /**
   * Check if form can be submitted
   */
  canSubmit(): boolean {
    return !!this.currentUrl &&
      this.validationState.isValid &&
      !this.validationState.isValidating;
  }

  /**
   * Handle form submission
   */
  onSubmit(): void {
    // Don't submit in readonly mode
    if (this.data.readonly) {
      return;
    }

    if (!this.canSubmit()) {
      return;
    }

    const result: ExternalLinkDialogResult = {
      confirmed: true,
      url: this.currentUrl,
      remoteContent: this.remoteContent
    };

    this.dialogRef.close(result);
  }

  /**
   * Handle dialog cancellation
   */
  onCancel(): void {
    const result: ExternalLinkDialogResult = {
      confirmed: false
    };

    this.dialogRef.close(result);
  }
}
